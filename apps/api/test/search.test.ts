import test, { after, before } from "node:test"
import assert from "node:assert/strict"
import { eq, inArray } from "drizzle-orm"
import { app } from "../src/app.js"
import db from "../src/db/index.js"
import { university, department, course } from "../src/db/schema/academic.js"
import { question } from "../src/db/schema/question.js"
import { courseMaterial } from "../src/db/schema/course-material.js"
import { user } from "../src/db/schema/auth.js"

const suffix = Date.now()
const uniId = `uni_srch_${suffix}`
const deptId = `dept_srch_${suffix}`
const courseCsId = `course_cs_srch_${suffix}`
const courseMathId = `course_math_srch_${suffix}`
const courseCsCode = `CS${String(suffix).slice(-4)}`
const courseMathCode = `MATH${String(suffix).slice(-4)}`
const studentId = `user_srch_${suffix}`

const resourceCsId = `res_cs_${suffix}`
const resourceMathId = `res_math_${suffix}`
const questionCsId = `q_cs_${suffix}`
const questionMathId = `q_math_${suffix}`

type SearchResponse = {
  query: string
  type: string
  counts: { all: number; resources: number; questions: number }
  resources: Array<{
    id: string
    title: string
    description?: string | null
    courseCode: string
  }>
  questions: Array<{
    id: string
    title: string
    body: string
    courseCode: string
  }>
}

before(async () => {
  await db.insert(university).values({
    id: uniId,
    name: `Search University ${suffix}`,
  })

  await db.insert(department).values({
    id: deptId,
    name: `Search Department ${suffix}`,
    universityId: uniId,
  })

  await db.insert(course).values([
    {
      id: courseCsId,
      name: "Quantum Systems",
      code: courseCsCode,
      departmentId: deptId,
    },
    {
      id: courseMathId,
      name: "Matrix Algebra",
      code: courseMathCode,
      departmentId: deptId,
    },
  ])

  await db.insert(user).values({
    id: studentId,
    name: "Search Student",
    email: `srch_${suffix}@university.edu`,
    emailVerified: true,
  })

  const fileMeta = {
    userId: studentId,
    filePath: `resources/${suffix}/stub.pdf`,
    fileName: "stub.pdf",
    mimeType: "application/pdf",
    fileSize: 256,
  }

  await db.insert(courseMaterial).values([
    {
      id: resourceCsId,
      title: "Quantum Computing Guide",
      description: "Comprehensive introduction to qubits",
      courseId: courseCsId,
      courseMaterialType: "notes",
      year: 2024,
      semester: "1",
      ...fileMeta,
    },
    {
      id: resourceMathId,
      title: "Matrix Decomposition Review",
      description: "Eigenvalues and spectral theorem practice",
      courseId: courseMathId,
      courseMaterialType: "exam",
      year: 2024,
      semester: "2",
      ...fileMeta,
    },
  ])

  await db.insert(question).values([
    {
      id: questionCsId,
      title: "How does quantum entanglement scale?",
      body: "Working through EPR state calculations",
      courseId: courseCsId,
      userId: studentId,
      voteScore: 4,
      answerCount: 1,
    },
    {
      id: questionMathId,
      title: "Gram-Schmidt orthogonalization confusion",
      body: "Need clarification on normalising eigenvectors",
      courseId: courseMathId,
      userId: studentId,
      voteScore: 2,
      answerCount: 0,
    },
  ])
})

after(async () => {
  await db
    .delete(question)
    .where(inArray(question.id, [questionCsId, questionMathId]))
  await db
    .delete(courseMaterial)
    .where(inArray(courseMaterial.id, [resourceCsId, resourceMathId]))
  await db.delete(user).where(eq(user.id, studentId))
  await db
    .delete(course)
    .where(inArray(course.id, [courseCsId, courseMathId]))
  await db.delete(department).where(eq(department.id, deptId))
  await db.delete(university).where(eq(university.id, uniId))
})

test("GET /api/search returns 400 for invalid type", async () => {
  const res = await app.request("/api/search?q=test&type=invalid")
  assert.equal(res.status, 400)
  const body = (await res.json()) as { error: string }
  assert.equal(body.error, "Invalid search type")
})

test("GET /api/search with empty query returns 0 counts and empty results", async () => {
  const res = await app.request("/api/search?q=")
  assert.equal(res.status, 200)
  const body = (await res.json()) as SearchResponse
  assert.equal(body.query, "")
  assert.equal(body.type, "all")
  assert.deepEqual(body.counts, { all: 0, resources: 0, questions: 0 })
  assert.deepEqual(body.resources, [])
  assert.deepEqual(body.questions, [])
})

test("GET /api/search matches resource description and question body case-insensitively", async () => {
  // "qubits" is in resourceCs description ("Comprehensive introduction to qubits")
  const resRes = await app.request("/api/search?q=QUBITS")
  assert.equal(resRes.status, 200)
  const resBody = (await resRes.json()) as SearchResponse
  assert.equal(resBody.counts.resources, 1)
  assert.equal(resBody.resources[0].id, resourceCsId)

  // "normalising" is in questionMath body ("Need clarification on normalising eigenvectors")
  const qRes = await app.request("/api/search?q=NoRmAlIsInG")
  assert.equal(qRes.status, 200)
  const qBody = (await qRes.json()) as SearchResponse
  assert.equal(qBody.counts.questions, 1)
  assert.equal(qBody.questions[0].id, questionMathId)
})

test("GET /api/search matches course code for both resources and questions", async () => {
  // CS course code matches both CS resource and CS question
  const res = await app.request(
    `/api/search?q=${courseCsCode.toLowerCase()}`
  )
  assert.equal(res.status, 200)
  const body = (await res.json()) as SearchResponse
  assert.equal(body.counts.all, 2)
  assert.equal(body.counts.resources, 1)
  assert.equal(body.counts.questions, 1)
  assert.equal(body.resources[0].id, resourceCsId)
  assert.equal(body.questions[0].id, questionCsId)
})

test("GET /api/search filters by search type: resources and questions", async () => {
  // Query for "quantum" matches 1 resource and 1 question
  const allRes = await app.request("/api/search?q=quantum&type=all")
  assert.equal(allRes.status, 200)
  const allBody = (await allRes.json()) as SearchResponse
  assert.equal(allBody.counts.resources, 1)
  assert.equal(allBody.counts.questions, 1)
  assert.equal(allBody.counts.all, 2)
  assert.equal(allBody.resources.length, 1)
  assert.equal(allBody.questions.length, 1)

  // type=resources returns resources array populated and questions empty, while keeping accurate counts
  const resRes = await app.request("/api/search?q=quantum&type=resources")
  assert.equal(resRes.status, 200)
  const resBody = (await resRes.json()) as SearchResponse
  assert.equal(resBody.type, "resources")
  assert.equal(resBody.counts.resources, 1)
  assert.equal(resBody.counts.questions, 1)
  assert.equal(resBody.counts.all, 2)
  assert.equal(resBody.resources.length, 1)
  assert.equal(resBody.resources[0].id, resourceCsId)
  assert.equal(resBody.questions.length, 0)

  // type=questions returns questions array populated and resources empty, while keeping accurate counts
  const qRes = await app.request("/api/search?q=quantum&type=questions")
  assert.equal(qRes.status, 200)
  const qBody = (await qRes.json()) as SearchResponse
  assert.equal(qBody.type, "questions")
  assert.equal(qBody.counts.resources, 1)
  assert.equal(qBody.counts.questions, 1)
  assert.equal(qBody.counts.all, 2)
  assert.equal(qBody.questions.length, 1)
  assert.equal(qBody.questions[0].id, questionCsId)
  assert.equal(qBody.resources.length, 0)
})
