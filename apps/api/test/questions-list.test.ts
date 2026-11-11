import test, { after, before } from "node:test"
import assert from "node:assert/strict"
import { eq, inArray } from "drizzle-orm"
import { app } from "../src/app.js"
import db from "../src/db/index.js"
import { university, department, course } from "../src/db/schema/academic.js"
import { user } from "../src/db/schema/auth.js"
import { question } from "../src/db/schema/question.js"

const suffix = Date.now()
const uniId = `uni_ql_${suffix}`
const deptId = `dept_ql_${suffix}`
const courseCsId = `course_ql_cs_${suffix}`
const courseMathId = `course_ql_math_${suffix}`
const courseCsCode = `QC${String(suffix).slice(-3)}`
const courseMathCode = `QM${String(suffix).slice(-3)}`
const studentId = `user_ql_${suffix}`

const newestId = `q_newest_${suffix}`
const votedId = `q_voted_${suffix}`
const unansweredId = `q_unanswered_${suffix}`
const mathId = `q_math_${suffix}`

type ListedQuestion = {
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
}

before(async () => {
  await db.insert(university).values({
    id: uniId,
    name: `Question List Uni ${suffix}`,
  })
  await db.insert(department).values({
    id: deptId,
    name: `Question List Dept ${suffix}`,
    universityId: uniId,
  })
  await db.insert(course).values([
    {
      id: courseCsId,
      name: "Algorithms",
      code: courseCsCode,
      departmentId: deptId,
    },
    {
      id: courseMathId,
      name: "Linear Algebra",
      code: courseMathCode,
      departmentId: deptId,
    },
  ])
  await db.insert(user).values({
    id: studentId,
    name: "List Student",
    email: `qlist_${suffix}@university.edu`,
    emailVerified: true,
  })

  const baseTime = Date.now()
  await db.insert(question).values([
    {
      id: votedId,
      title: "Most voted question",
      body: "Has the highest vote score.",
      courseId: courseCsId,
      userId: studentId,
      voteScore: 10,
      answerCount: 2,
      createdAt: new Date(baseTime - 60_000),
    },
    {
      id: unansweredId,
      title: "Unanswered question",
      body: "No answers yet.",
      courseId: courseCsId,
      userId: studentId,
      voteScore: 1,
      answerCount: 0,
      createdAt: new Date(baseTime - 30_000),
    },
    {
      id: newestId,
      title: "Newest question",
      body: "Posted most recently.",
      courseId: courseCsId,
      userId: studentId,
      voteScore: 0,
      answerCount: 3,
      createdAt: new Date(baseTime),
    },
    {
      id: mathId,
      title: "Math question",
      body: "About eigenvalues.",
      courseId: courseMathId,
      userId: studentId,
      voteScore: 5,
      answerCount: 1,
      createdAt: new Date(baseTime - 10_000),
    },
  ])
})

after(async () => {
  await db
    .delete(question)
    .where(inArray(question.id, [newestId, votedId, unansweredId, mathId]))
  await db.delete(course).where(eq(course.id, courseCsId))
  await db.delete(course).where(eq(course.id, courseMathId))
  await db.delete(user).where(eq(user.id, studentId))
  await db.delete(department).where(eq(department.id, deptId))
  await db.delete(university).where(eq(university.id, uniId))
})

test("GET /api/questions returns catalog fields for each question", async () => {
  const res = await app.request("/api/questions")
  assert.strictEqual(res.status, 200)
  const rows = (await res.json()) as ListedQuestion[]
  const match = rows.find((row) => row.id === newestId)
  assert.ok(match)
  assert.strictEqual(match.title, "Newest question")
  assert.strictEqual(match.courseCode, courseCsCode)
  assert.strictEqual(match.courseName, "Algorithms")
  assert.strictEqual(match.studentId, studentId)
  assert.strictEqual(match.studentName, "List Student")
  assert.strictEqual(match.voteScore, 0)
  assert.strictEqual(match.answerCount, 3)
})

test("GET /api/questions sorts by newest by default", async () => {
  const res = await app.request(
    `/api/questions?courseId=${encodeURIComponent(courseCsId)}`
  )
  assert.strictEqual(res.status, 200)
  const rows = (await res.json()) as ListedQuestion[]
  assert.deepStrictEqual(
    rows.map((row) => row.id),
    [newestId, unansweredId, votedId]
  )
})

test("GET /api/questions sorts by most_voted", async () => {
  const res = await app.request(
    `/api/questions?courseId=${encodeURIComponent(courseCsId)}&sort=most_voted`
  )
  assert.strictEqual(res.status, 200)
  const rows = (await res.json()) as ListedQuestion[]
  assert.deepStrictEqual(
    rows.map((row) => row.id),
    [votedId, unansweredId, newestId]
  )
})

test("GET /api/questions sorts unanswered first", async () => {
  const res = await app.request(
    `/api/questions?courseId=${encodeURIComponent(courseCsId)}&sort=unanswered`
  )
  assert.strictEqual(res.status, 200)
  const rows = (await res.json()) as ListedQuestion[]
  assert.strictEqual(rows[0]?.id, unansweredId)
  assert.ok(rows.every((row) => row.courseId === courseCsId))
})

test("GET /api/questions filters by courseId", async () => {
  const res = await app.request(
    `/api/questions?courseId=${encodeURIComponent(courseMathId)}`
  )
  assert.strictEqual(res.status, 200)
  const rows = (await res.json()) as ListedQuestion[]
  assert.strictEqual(rows.length, 1)
  assert.strictEqual(rows[0]?.id, mathId)
  assert.strictEqual(rows[0]?.courseCode, courseMathCode)
})

test("GET /api/questions rejects invalid sort", async () => {
  const res = await app.request("/api/questions?sort=popular")
  assert.strictEqual(res.status, 400)
  const payload = (await res.json()) as { error: string }
  assert.match(payload.error, /sort/i)
})
