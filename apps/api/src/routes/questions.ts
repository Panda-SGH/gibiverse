import { randomUUID } from "node:crypto"
import { Hono } from "hono"
import { and, asc, desc, eq, type SQL } from "drizzle-orm"
import db from "../db/index.js"
import { course } from "../db/schema/academic.js"
import { user as student } from "../db/schema/auth.js"
import { question } from "../db/schema/question.js"
import { requireAuth } from "../middleware/auth.js"

const questions = new Hono()

const SORT_OPTIONS = ["newest", "most_voted", "unanswered"] as const
type QuestionSort = (typeof SORT_OPTIONS)[number]

function isQuestionSort(value: string): value is QuestionSort {
  return (SORT_OPTIONS as readonly string[]).includes(value)
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

questions.post("/", requireAuth, async (c) => {
  const user = c.get("user")
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  let payload: unknown
  try {
    payload = await c.req.json()
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400)
  }

  const raw =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {}

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

export { questions }
