import { randomUUID } from "node:crypto"
import { Hono, type Context } from "hono"
import { and, asc, desc, eq, sql, type SQL } from "drizzle-orm"
import db from "../db/index.js"
import { course } from "../db/schema/academic.js"
import { user as student } from "../db/schema/auth.js"
import { question, answer } from "../db/schema/question.js"
import { requireAuth } from "../middleware/auth.js"

const questions = new Hono()

const SORT_OPTIONS = ["newest", "most_voted", "unanswered"] as const
type QuestionSort = (typeof SORT_OPTIONS)[number]

function isQuestionSort(value: string): value is QuestionSort {
  return (SORT_OPTIONS as readonly string[]).includes(value)
}

async function parseJsonBody(
  c: Context
): Promise<Record<string, unknown> | null> {
  try {
    const payload = await c.req.json()
    return payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {}
  } catch {
    return null
  }
}

questions.get("/", async (c) => {
  const courseId = c.req.query("courseId")?.trim() || undefined
  const departmentId = c.req.query("departmentId")?.trim() || undefined
  const sortRaw = c.req.query("sort")?.trim() || "newest"

  if (!isQuestionSort(sortRaw)) {
    return c.json({ error: "Invalid sort" }, 400)
  }

  const filters: SQL[] = []
  if (courseId) {
    filters.push(eq(question.courseId, courseId))
  }
  if (departmentId) {
    filters.push(eq(course.departmentId, departmentId))
  }

  const orderBy =
    sortRaw === "most_voted"
      ? [desc(question.voteScore), desc(question.createdAt)]
      : sortRaw === "unanswered"
        ? [asc(question.answerCount), desc(question.createdAt)]
        : [desc(question.createdAt)]

  const base = db
    .select({
      id: question.id,
      title: question.title,
      body: question.body,
      createdAt: question.createdAt,
      courseId: question.courseId,
      courseCode: course.code,
      courseName: course.name,
      studentId: question.userId,
      studentName: student.name,
      voteScore: question.voteScore,
      answerCount: question.answerCount,
    })
    .from(question)
    .innerJoin(course, eq(question.courseId, course.id))
    .innerJoin(student, eq(question.userId, student.id))
    .orderBy(...orderBy)

  const rows =
    filters.length > 0 ? await base.where(and(...filters)) : await base

  return c.json(rows)
})

questions.get("/:id", async (c) => {
  const questionId = c.req.param("id")

  const [qRow] = await db
    .select({
      id: question.id,
      title: question.title,
      body: question.body,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      courseId: question.courseId,
      courseCode: course.code,
      courseName: course.name,
      studentId: question.userId,
      studentName: student.name,
      voteScore: question.voteScore,
      answerCount: question.answerCount,
      acceptedAnswerId: question.acceptedAnswerId,
    })
    .from(question)
    .innerJoin(course, eq(question.courseId, course.id))
    .innerJoin(student, eq(question.userId, student.id))
    .where(eq(question.id, questionId))
    .limit(1)

  if (!qRow) {
    return c.json({ error: "Question not found" }, 404)
  }

  const answers = await db
    .select({
      id: answer.id,
      body: answer.body,
      questionId: answer.questionId,
      studentId: answer.userId,
      studentName: student.name,
      voteScore: answer.voteScore,
      createdAt: answer.createdAt,
      updatedAt: answer.updatedAt,
    })
    .from(answer)
    .innerJoin(student, eq(answer.userId, student.id))
    .where(eq(answer.questionId, questionId))
    .orderBy(asc(answer.createdAt))

  const answersWithAccepted = answers.map((ans) => ({
    ...ans,
    isAccepted: qRow.acceptedAnswerId === ans.id,
  }))

  return c.json({
    ...qRow,
    answers: answersWithAccepted,
  })
})

questions.post("/", requireAuth, async (c) => {
  const user = c.get("user")
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  const raw = await parseJsonBody(c)
  if (!raw) {
    return c.json({ error: "Invalid JSON body" }, 400)
  }

  const title = typeof raw.title === "string" ? raw.title.trim() : ""
  const body = typeof raw.body === "string" ? raw.body.trim() : ""
  const courseId = typeof raw.courseId === "string" ? raw.courseId.trim() : ""

  if (!title) {
    return c.json({ error: "Title is required" }, 400)
  }
  if (!body) {
    return c.json({ error: "Body is required" }, 400)
  }
  if (!courseId) {
    return c.json({ error: "Course is required" }, 400)
  }

  const [existingCourse] = await db
    .select({ id: course.id })
    .from(course)
    .where(eq(course.id, courseId))
    .limit(1)

  if (!existingCourse) {
    return c.json({ error: "Course not found" }, 400)
  }

  const id = randomUUID()
  const [created] = await db
    .insert(question)
    .values({
      id,
      title,
      body,
      courseId,
      userId: user.id,
    })
    .returning()

  return c.json(created, 201)
})

questions.post("/:id/answers", requireAuth, async (c) => {
  const user = c.get("user")
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  const questionId = c.req.param("id")
  const [existingQuestion] = await db
    .select({ id: question.id })
    .from(question)
    .where(eq(question.id, questionId))
    .limit(1)

  if (!existingQuestion) {
    return c.json({ error: "Question not found" }, 404)
  }

  const raw = await parseJsonBody(c)
  if (!raw) {
    return c.json({ error: "Invalid JSON body" }, 400)
  }

  const body = typeof raw.body === "string" ? raw.body.trim() : ""
  if (!body) {
    return c.json({ error: "Answer body is required" }, 400)
  }

  const id = randomUUID()
  const [createdAnswer] = await db
    .insert(answer)
    .values({
      id,
      body,
      questionId,
      userId: user.id,
    })
    .returning()

  await db
    .update(question)
    .set({ answerCount: sql`${question.answerCount} + 1` })
    .where(eq(question.id, questionId))

  return c.json(
    {
      ...createdAnswer,
      studentId: user.id,
      studentName: user.name,
      isAccepted: false,
    },
    201
  )
})

questions.post("/:id/accept", requireAuth, async (c) => {
  const user = c.get("user")
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  const questionId = c.req.param("id")
  const [existingQuestion] = await db
    .select({
      id: question.id,
      userId: question.userId,
      acceptedAnswerId: question.acceptedAnswerId,
    })
    .from(question)
    .where(eq(question.id, questionId))
    .limit(1)

  if (!existingQuestion) {
    return c.json({ error: "Question not found" }, 404)
  }

  if (existingQuestion.userId !== user.id) {
    return c.json(
      { error: "Only the question author can accept an answer" },
      403
    )
  }

  const raw = await parseJsonBody(c)
  if (!raw) {
    return c.json({ error: "Invalid JSON body" }, 400)
  }

  const targetAnswerId =
    typeof raw.answerId === "string" && raw.answerId.trim().length > 0
      ? raw.answerId.trim()
      : null

  let nextAcceptedId: string | null = null
  if (targetAnswerId) {
    if (existingQuestion.acceptedAnswerId === targetAnswerId) {
      // Toggle off / unmark
      nextAcceptedId = null
    } else {
      const [targetAnswer] = await db
        .select({ id: answer.id, questionId: answer.questionId })
        .from(answer)
        .where(eq(answer.id, targetAnswerId))
        .limit(1)

      if (!targetAnswer || targetAnswer.questionId !== questionId) {
        return c.json(
          { error: "Answer does not belong to this question" },
          400
        )
      }
      nextAcceptedId = targetAnswerId
    }
  } else {
    nextAcceptedId = null
  }

  const [updated] = await db
    .update(question)
    .set({ acceptedAnswerId: nextAcceptedId })
    .where(eq(question.id, questionId))
    .returning({
      id: question.id,
      acceptedAnswerId: question.acceptedAnswerId,
    })

  return c.json(updated, 200)
})

export { questions }
