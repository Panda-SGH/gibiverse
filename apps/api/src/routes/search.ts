import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { desc, eq, ilike, or } from "drizzle-orm"
import { searchQuerySchema, type SearchType } from "@gibiverse/shared/types"
import db from "../db/index.js"
import { course } from "../db/schema/academic.js"
import { user as student } from "../db/schema/auth.js"
import { question } from "../db/schema/question.js"
import { courseMaterial } from "../db/schema/course-material.js"

export type { SearchType }

const search = new Hono().get(
  "/",
  zValidator("query", searchQuerySchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: "Invalid search type" }, 400)
    }
  }),
  async (c) => {
    const { q, type } = c.req.valid("query")

    if (!q) {
      return c.json({
        query: "",
        type,
        counts: {
          all: 0,
          resources: 0,
          questions: 0,
        },
        resources: [],
        questions: [],
      })
    }

    const searchPattern = `%${q}%`

  // Course Materials search
  const materialConditions = or(
    ilike(courseMaterial.title, searchPattern),
    ilike(course.code, searchPattern)
  )

  const matchedMaterialsPromise = db
    .select({
      id: courseMaterial.id,
      title: courseMaterial.title,
      courseMaterialType: courseMaterial.courseMaterialType,
      resourceType: courseMaterial.courseMaterialType,
      academicPeriod: courseMaterial.academicPeriod,
      createdAt: courseMaterial.createdAt,
      courseId: courseMaterial.courseId,
      courseCode: course.code,
      courseName: course.name,
      universityId: course.universityId,
      departmentId: course.departmentId,
    })
    .from(courseMaterial)
    .innerJoin(course, eq(courseMaterial.courseId, course.id))
    .where(materialConditions)
    .orderBy(desc(courseMaterial.createdAt))

  // Questions search
  const questionConditions = or(
    ilike(question.title, searchPattern),
    ilike(question.body, searchPattern),
    ilike(course.code, searchPattern)
  )

  const matchedQuestionsPromise = db
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
    .where(questionConditions)
    .orderBy(desc(question.createdAt))

  const [allMatchedMaterials, allMatchedQuestions] = await Promise.all([
    matchedMaterialsPromise,
    matchedQuestionsPromise,
  ])

  const counts = {
    all: allMatchedMaterials.length + allMatchedQuestions.length,
    resources: allMatchedMaterials.length,
    questions: allMatchedQuestions.length,
  }

  const returnedMaterials =
    type === "questions" ? [] : allMatchedMaterials
  const returnedQuestions =
    type === "resources" ? [] : allMatchedQuestions

  return c.json({
    query: q,
    type,
    counts,
    resources: returnedMaterials,
    questions: returnedQuestions,
  })
})

export { search }
