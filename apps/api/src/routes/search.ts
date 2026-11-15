import { Hono } from "hono"
import { and, desc, eq, ilike, or } from "drizzle-orm"
import db from "../db/index.js"
import { course } from "../db/schema/academic.js"
import { user as student } from "../db/schema/auth.js"
import { question } from "../db/schema/question.js"
import { resource } from "../db/schema/resource.js"

export const SEARCH_TYPES = ["all", "resources", "questions"] as const
export type SearchType = (typeof SEARCH_TYPES)[number]

export function isSearchType(value: string): value is SearchType {
  return (SEARCH_TYPES as readonly string[]).includes(value)
}

const search = new Hono().get("/", async (c) => {
  const q = c.req.query("q")?.trim() ?? ""
  const typeParam = c.req.query("type")?.trim() || "all"

  if (!isSearchType(typeParam)) {
    return c.json({ error: "Invalid search type" }, 400)
  }

  if (!q) {
    return c.json({
      query: "",
      type: typeParam,
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

  // Resources search
  const resourceConditions = or(
    ilike(resource.title, searchPattern),
    ilike(resource.description, searchPattern),
    ilike(course.code, searchPattern)
  )

  const matchedResourcesPromise = db
    .select({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      resourceType: resource.resourceType,
      year: resource.year,
      semester: resource.semester,
      createdAt: resource.createdAt,
      courseId: resource.courseId,
      courseCode: course.code,
      courseName: course.name,
      departmentId: course.departmentId,
    })
    .from(resource)
    .innerJoin(course, eq(resource.courseId, course.id))
    .where(resourceConditions)
    .orderBy(desc(resource.createdAt))

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

  const [allMatchedResources, allMatchedQuestions] = await Promise.all([
    matchedResourcesPromise,
    matchedQuestionsPromise,
  ])

  const counts = {
    all: allMatchedResources.length + allMatchedQuestions.length,
    resources: allMatchedResources.length,
    questions: allMatchedQuestions.length,
  }

  const returnedResources =
    typeParam === "questions" ? [] : allMatchedResources
  const returnedQuestions =
    typeParam === "resources" ? [] : allMatchedQuestions

  return c.json({
    query: q,
    type: typeParam,
    counts,
    resources: returnedResources,
    questions: returnedQuestions,
  })
})

export { search }
