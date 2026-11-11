import test, { after, before } from "node:test"
import assert from "node:assert/strict"
import { eq, inArray } from "drizzle-orm"
import { app } from "../src/app.js"
import db from "../src/db/index.js"
import { university, department, course } from "../src/db/schema/academic.js"
import { resource } from "../src/db/schema/resource.js"
import { user } from "../src/db/schema/auth.js"

const suffix = Date.now()
const uniId = `uni_list_${suffix}`
const deptCsId = `dept_cs_${suffix}`
const deptMathId = `dept_math_${suffix}`
const courseCsId = `course_cs_${suffix}`
const courseMathId = `course_math_${suffix}`
const courseCsCode = `LC${String(suffix).slice(-3)}`
const courseMathCode = `LM${String(suffix).slice(-3)}`
const studentId = `user_list_${suffix}`

const examId = `res_exam_${suffix}`
const notesId = `res_notes_${suffix}`
const mathExamId = `res_math_exam_${suffix}`

type ListedResource = {
  id: string
  title: string
  resourceType: string
  year: number
  semester: string
  createdAt: string
  courseId: string
  courseCode: string
  courseName: string
  departmentId: string
}

before(async () => {
  await db.insert(university).values({
    id: uniId,
    name: `List Uni ${suffix}`,
  })
  await db.insert(department).values([
    {
      id: deptCsId,
      name: `CS ${suffix}`,
      universityId: uniId,
    },
    {
      id: deptMathId,
      name: `Math ${suffix}`,
      universityId: uniId,
    },
  ])
  await db.insert(course).values([
    {
      id: courseCsId,
      name: "Algorithms",
      code: courseCsCode,
      departmentId: deptCsId,
    },
    {
      id: courseMathId,
      name: "Linear Algebra",
      code: courseMathCode,
      departmentId: deptMathId,
    },
  ])
  await db.insert(user).values({
    id: studentId,
    name: "List Student",
    email: `list_${suffix}@university.edu`,
    emailVerified: true,
  })

  const fileMeta = {
    userId: studentId,
    filePath: `resources/${suffix}/stub.pdf`,
    fileName: "stub.pdf",
    mimeType: "application/pdf",
    fileSize: 128,
  }

  await db.insert(resource).values([
    {
      id: examId,
      title: "CS Midterm",
      courseId: courseCsId,
      resourceType: "exam",
      year: 2024,
      semester: "1",
      ...fileMeta,
    },
    {
      id: notesId,
      title: "CS Lecture Notes",
      courseId: courseCsId,
      resourceType: "notes",
      year: 2024,
      semester: "2",
      ...fileMeta,
      filePath: `resources/${suffix}/notes.pdf`,
      fileName: "notes.pdf",
    },
    {
      id: mathExamId,
      title: "Math Final",
      courseId: courseMathId,
      resourceType: "exam",
      year: 2023,
      semester: "summer",
      ...fileMeta,
      filePath: `resources/${suffix}/math.pdf`,
      fileName: "math.pdf",
    },
  ])
})

after(async () => {
  await db
    .delete(resource)
    .where(inArray(resource.id, [examId, notesId, mathExamId]))
  await db.delete(user).where(eq(user.id, studentId))
  await db.delete(course).where(inArray(course.id, [courseCsId, courseMathId]))
  await db
    .delete(department)
    .where(inArray(department.id, [deptCsId, deptMathId]))
  await db.delete(university).where(eq(university.id, uniId))
})

test("GET /api/resources lists catalog fields for each resource", async () => {
  const res = await app.request("/api/resources")
  assert.strictEqual(res.status, 200)
  const body = (await res.json()) as ListedResource[]
  assert.ok(Array.isArray(body))

  const match = body.find((row) => row.id === examId)
  assert.ok(match, "Seeded exam should appear in listing")
  assert.strictEqual(match.title, "CS Midterm")
  assert.strictEqual(match.resourceType, "exam")
  assert.strictEqual(match.year, 2024)
  assert.strictEqual(match.semester, "1")
  assert.strictEqual(match.courseId, courseCsId)
  assert.strictEqual(match.courseCode, courseCsCode)
  assert.strictEqual(match.courseName, "Algorithms")
  assert.strictEqual(match.departmentId, deptCsId)
  assert.ok(typeof match.createdAt === "string" && match.createdAt.length > 0)
})

test("GET /api/resources filters by resourceType", async () => {
  const res = await app.request("/api/resources?resourceType=notes")
  assert.strictEqual(res.status, 200)
  const body = (await res.json()) as ListedResource[]
  const ids = body.map((row) => row.id)
  assert.ok(ids.includes(notesId))
  assert.ok(!ids.includes(examId))
  assert.ok(!ids.includes(mathExamId))
  assert.ok(body.every((row) => row.resourceType === "notes"))
})

test("GET /api/resources filters by departmentId", async () => {
  const res = await app.request(
    `/api/resources?departmentId=${encodeURIComponent(deptMathId)}`
  )
  assert.strictEqual(res.status, 200)
  const body = (await res.json()) as ListedResource[]
  const ids = body.map((row) => row.id)
  assert.ok(ids.includes(mathExamId))
  assert.ok(!ids.includes(examId))
  assert.ok(!ids.includes(notesId))
  assert.ok(body.every((row) => row.departmentId === deptMathId))
})

test("GET /api/resources filters by courseId", async () => {
  const res = await app.request(
    `/api/resources?courseId=${encodeURIComponent(courseCsId)}`
  )
  assert.strictEqual(res.status, 200)
  const body = (await res.json()) as ListedResource[]
  const ids = body.map((row) => row.id)
  assert.ok(ids.includes(examId))
  assert.ok(ids.includes(notesId))
  assert.ok(!ids.includes(mathExamId))
  assert.ok(body.every((row) => row.courseId === courseCsId))
})

test("GET /api/resources returns empty list when filter combo matches nothing", async () => {
  const res = await app.request(
    `/api/resources?resourceType=exam&departmentId=${encodeURIComponent(deptCsId)}&courseId=${encodeURIComponent(courseMathId)}`
  )
  assert.strictEqual(res.status, 200)
  const body = (await res.json()) as ListedResource[]
  assert.deepStrictEqual(body, [])
})

test("GET /api/resources applies resourceType and departmentId together", async () => {
  const res = await app.request(
    `/api/resources?resourceType=exam&departmentId=${encodeURIComponent(deptCsId)}`
  )
  assert.strictEqual(res.status, 200)
  const body = (await res.json()) as ListedResource[]
  const ids = body.map((row) => row.id)
  assert.ok(ids.includes(examId))
  assert.ok(!ids.includes(notesId))
  assert.ok(!ids.includes(mathExamId))
})

test("GET /api/resources rejects invalid resourceType", async () => {
  const res = await app.request("/api/resources?resourceType=handout")
  assert.strictEqual(res.status, 400)
  const body = (await res.json()) as { error: string }
  assert.match(body.error, /resource type/i)
})
