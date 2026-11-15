import { Hono } from "hono"
import { count, desc, eq, sql } from "drizzle-orm"
import db from "../db/index.js"
import { course } from "../db/schema/academic.js"
import { user as student } from "../db/schema/auth.js"
import { question } from "../db/schema/question.js"
import { resource } from "../db/schema/resource.js"

const overview = new Hono().get("/", async (c) => {
  const [
    resourcesCountResult,
    questionsCountResult,
    activeCoursesResult,
    recentResources,
    recentQuestions,
  ] = await Promise.all([
    db.select({ count: count() }).from(resource),
    db.select({ count: count() }).from(question),
    db.execute<{ count: string | number }>(
      sql`SELECT COUNT(DISTINCT active.course_id)::int AS count FROM (
        SELECT ${resource.courseId} AS course_id FROM ${resource}
        UNION
        SELECT ${question.courseId} AS course_id FROM ${question}
      ) AS active`
    ),
    db
      .select({
        id: resource.id,
        title: resource.title,
        resourceType: resource.resourceType,
        year: resource.year,
        semester: resource.semester,
        createdAt: resource.createdAt,
        courseId: resource.courseId,
        courseCode: course.code,
        courseName: course.name,
      })
      .from(resource)
      .innerJoin(course, eq(resource.courseId, course.id))
      .orderBy(desc(resource.createdAt))
      .limit(6),
    db
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
      // Rank by discussion activity: answers weighted 2x + vote score, then recency
      .orderBy(
        desc(sql`${question.answerCount} * 2 + ${question.voteScore}`),
        desc(question.createdAt)
      )
      .limit(6),
  ])

  const totalResources = Number(resourcesCountResult[0]?.count ?? 0)
  const totalQuestions = Number(questionsCountResult[0]?.count ?? 0)
  const activeCoursesRaw =
    (activeCoursesResult as { rows?: Array<{ count?: string | number }> })
      .rows?.[0]?.count ??
    (activeCoursesResult as unknown as Array<{ count?: string | number }>)[0]
      ?.count
  const activeCourses = Number(activeCoursesRaw ?? 0)

  return c.json({
    stats: {
      totalResources,
      totalQuestions,
      activeCourses,
    },
    recentResources,
    recentQuestions,
  })
})

export { overview }
