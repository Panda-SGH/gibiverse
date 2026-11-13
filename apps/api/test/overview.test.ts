import test, { after, before } from "node:test"
import assert from "node:assert/strict"
import { eq, inArray } from "drizzle-orm"
import { app } from "../src/app.js"
import db from "../src/db/index.js"
import { university, department, course } from "../src/db/schema/academic.js"
import { question } from "../src/db/schema/question.js"
import { resource } from "../src/db/schema/resource.js"
import { user } from "../src/db/schema/auth.js"

const suffix = Date.now()
const uniId = `uni_ov_${suffix}`
const deptId = `dept_ov_${suffix}`
const courseActive1Id = `course_act1_${suffix}`
const courseActive2Id = `course_act2_${suffix}`
const courseInactiveId = `course_inact_${suffix}`
const studentId = `student_ov_${suffix}`

const resource1Id = `res1_ov_${suffix}`
const resource2Id = `res2_ov_${suffix}`
const question1Id = `q1_ov_${suffix}`

type OverviewResponse = {
  stats: {
    totalResources: number
    totalQuestions: number
    activeCourses: number
  }
  recentResources: Array<{
    id: string
    title: string
    resourceType: string
    year: number
    semester: string
    createdAt: string
    courseId: string
    courseCode: string
    courseName: string
  }>
  recentQuestions: Array<{
    id: string
    title: string
    body: string
    createdAt: string
    courseId: string
    courseCode: string
    courseName: string
    studentId: string
    studentName: string
    voteScore: number
    answerCount: number
  }>
}

before(async () => {
  await db.insert(university).values({
    id: uniId,
    name: `Overview University ${suffix}`,
  })

  await db.insert(department).values({
    id: deptId,
    name: `Overview Department ${suffix}`,
    universityId: uniId,
  })

  await db.insert(course).values([
    {
      id: courseActive1Id,
      name: "Algorithms and Data Structures",
      code: `CS${String(suffix).slice(-4)}A`,
      departmentId: deptId,
    },
    {
      id: courseActive2Id,
      name: "Linear Algebra",
      code: `MA${String(suffix).slice(-4)}B`,
      departmentId: deptId,
    },
    {
      id: courseInactiveId,
      name: "Empty Course",
      code: `EC${String(suffix).slice(-4)}C`,
      departmentId: deptId,
    },
  ])

  await db.insert(user).values({
    id: studentId,
    name: "Alex Learner",
    email: `learner_${suffix}@university.edu`,
    emailVerified: true,
  })
})

after(async () => {
  await db.delete(resource).where(inArray(resource.id, [resource1Id, resource2Id]))
  await db.delete(question).where(inArray(question.id, [question1Id]))
  await db.delete(course).where(inArray(course.id, [courseActive1Id, courseActive2Id, courseInactiveId]))
  await db.delete(user).where(eq(user.id, studentId))
  await db.delete(department).where(eq(department.id, deptId))
  await db.delete(university).where(eq(university.id, uniId))
})

test("GET /api/overview returns aggregated platform statistics and recent feeds", async () => {
  // Before inserting any resources or questions for this test, call overview
  const initialRes = await app.request("/api/overview")
  assert.equal(initialRes.status, 200)
  const initialData = (await initialRes.json()) as OverviewResponse

  assert.ok(typeof initialData.stats.totalResources === "number")
  assert.ok(typeof initialData.stats.totalQuestions === "number")
  assert.ok(typeof initialData.stats.activeCourses === "number")
  assert.ok(Array.isArray(initialData.recentResources))
  assert.ok(Array.isArray(initialData.recentQuestions))

  const prevResCount = initialData.stats.totalResources
  const prevQCount = initialData.stats.totalQuestions
  const prevActiveCourses = initialData.stats.activeCourses

  // Now insert 2 resources on courseActive1 and 1 question on courseActive2
  await db.insert(resource).values([
    {
      id: resource1Id,
      title: "Algorithms Midterm 2024",
      resourceType: "exam",
      year: 2024,
      semester: "1",
      fileName: "midterm.pdf",
      filePath: "uploads/midterm.pdf",
      fileSize: 1024,
      mimeType: "application/pdf",
      courseId: courseActive1Id,
      userId: studentId,
      createdAt: new Date("2026-11-10T10:00:00Z"),
    },
    {
      id: resource2Id,
      title: "Algorithms Lecture 1 Notes",
      resourceType: "notes",
      year: 2024,
      semester: "1",
      fileName: "notes.pdf",
      filePath: "uploads/notes.pdf",
      fileSize: 2048,
      mimeType: "application/pdf",
      courseId: courseActive1Id,
      userId: studentId,
      createdAt: new Date("2026-11-12T10:00:00Z"),
    },
  ])

  await db.insert(question).values([
    {
      id: question1Id,
      title: "How to diagonalize a 3x3 symmetric matrix?",
      body: "Can someone walk through finding the orthonormal basis of eigenvectors?",
      courseId: courseActive2Id,
      userId: studentId,
      createdAt: new Date("2026-11-13T09:00:00Z"),
    },
  ])

  const updatedRes = await app.request("/api/overview")
  assert.equal(updatedRes.status, 200)
  const updatedData = (await updatedRes.json()) as OverviewResponse

  // Statistics counters
  assert.equal(updatedData.stats.totalResources, prevResCount + 2)
  assert.equal(updatedData.stats.totalQuestions, prevQCount + 1)
  assert.equal(updatedData.stats.activeCourses, prevActiveCourses + 2)

  // Recent resources should include newly added resource2 first, then resource1
  const foundRes2 = updatedData.recentResources.find((r) => r.id === resource2Id)
  assert.ok(foundRes2)
  assert.equal(foundRes2.title, "Algorithms Lecture 1 Notes")
  assert.equal(foundRes2.courseCode, `CS${String(suffix).slice(-4)}A`)
  assert.equal(foundRes2.resourceType, "notes")
  assert.equal(foundRes2.year, 2024)
  assert.equal(foundRes2.semester, "1")

  // Recent questions should include question1
  const foundQ1 = updatedData.recentQuestions.find((q) => q.id === question1Id)
  assert.ok(foundQ1)
  assert.equal(foundQ1.title, "How to diagonalize a 3x3 symmetric matrix?")
  assert.equal(foundQ1.courseCode, `MA${String(suffix).slice(-4)}B`)
  assert.equal(foundQ1.studentName, "Alex Learner")
  assert.equal(foundQ1.voteScore, 0)
  assert.equal(foundQ1.answerCount, 0)
})
