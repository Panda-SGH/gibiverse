import test, { after, before } from "node:test"
import assert from "node:assert/strict"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { eq } from "drizzle-orm"
import { app } from "../src/app.js"
import db from "../src/db/index.js"
import { university, department, course } from "../src/db/schema/academic.js"
import { courseMaterial } from "../src/db/schema/course-material.js"

const suffix = Date.now()
const uniId = `uni_cm_${suffix}`
const deptId = `dept_cm_${suffix}`
const courseId = `course_cm_${suffix}`
const courseCode = `CM${String(suffix).slice(-3)}`

let storageDir: string
let previousStoragePath: string | undefined
let previousStorageProvider: string | undefined
let sessionCookie: string
let studentId: string
const createdMaterialIds: string[] = []

before(async () => {
  storageDir = await mkdtemp(path.join(tmpdir(), "gibiverse-cm-upload-"))
  previousStoragePath = process.env.STORAGE_LOCAL_PATH
  previousStorageProvider = process.env.STORAGE_PROVIDER
  process.env.STORAGE_LOCAL_PATH = storageDir
  process.env.STORAGE_PROVIDER = "local"

  await db.insert(university).values({
    id: uniId,
    name: `Course Material Uni ${suffix}`,
  })
  await db.insert(department).values({
    id: deptId,
    name: `Course Material Dept ${suffix}`,
    universityId: uniId,
  })
  await db.insert(course).values({
    id: courseId,
    name: "Course Material Course",
    code: courseCode,
    departmentId: deptId,
  })

  const email = `cm_${suffix}@university.edu`
  const password = "CourseMaterialPassword123!"
  const signUpRes = await app.request("/api/auth/sign-up/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      name: `Course Material Student ${suffix}`,
    }),
  })
  assert.strictEqual(signUpRes.status, 200)

  const rawCookie = signUpRes.headers.get("set-cookie")
  assert.ok(rawCookie)
  sessionCookie = rawCookie.split(";")[0]!

  const sessionRes = await app.request("/api/auth/get-session", {
    headers: { cookie: sessionCookie },
  })
  assert.strictEqual(sessionRes.status, 200)
  const sessionBody = (await sessionRes.json()) as {
    user: { id: string }
  }
  studentId = sessionBody.user.id
})

after(async () => {
  for (const id of createdMaterialIds) {
    await db.delete(courseMaterial).where(eq(courseMaterial.id, id))
  }
  await db.delete(course).where(eq(course.id, courseId))
  await db.delete(department).where(eq(department.id, deptId))
  await db.delete(university).where(eq(university.id, uniId))

  if (previousStoragePath === undefined) delete process.env.STORAGE_LOCAL_PATH
  else process.env.STORAGE_LOCAL_PATH = previousStoragePath
  if (previousStorageProvider === undefined) delete process.env.STORAGE_PROVIDER
  else process.env.STORAGE_PROVIDER = previousStorageProvider

  await rm(storageDir, { recursive: true, force: true })
})

test("POST /api/course-materials requires authentication", async () => {
  const form = new FormData()
  form.set("title", "Midterm Exam")
  form.set("courseId", courseId)
  form.set("courseMaterialType", "exam")
  form.set("year", "2024")
  form.set("semester", "1")
  form.set(
    "file",
    new File([Buffer.from("%PDF-1.4")], "midterm.pdf", {
      type: "application/pdf",
    })
  )

  const res = await app.request("/api/course-materials", {
    method: "POST",
    body: form,
  })
  assert.strictEqual(res.status, 401)
})

test("POST /api/course-materials stores file and creates course material record", async () => {
  const form = new FormData()
  form.set("title", "CS Midterm 2024")
  form.set("courseId", courseId)
  form.set("courseMaterialType", "exam")
  form.set("year", "2024")
  form.set("semester", "1")
  form.set("description", "Practice midterm")
  form.set(
    "file",
    new File([Buffer.from("%PDF-1.4 midterm")], "cs-midterm.pdf", {
      type: "application/pdf",
    })
  )

  const res = await app.request("/api/course-materials", {
    method: "POST",
    headers: { cookie: sessionCookie },
    body: form,
  })
  assert.strictEqual(res.status, 201)
  const body = (await res.json()) as {
    id: string
    title: string
    courseId: string
    userId: string
    courseMaterialType: string
    year: number
    semester: string
    fileName: string
    mimeType: string
    fileSize: number
    filePath: string
  }

  createdMaterialIds.push(body.id)
  assert.strictEqual(body.title, "CS Midterm 2024")
  assert.strictEqual(body.courseId, courseId)
  assert.strictEqual(body.userId, studentId)
  assert.strictEqual(body.courseMaterialType, "exam")
  assert.strictEqual(body.year, 2024)
  assert.strictEqual(body.semester, "1")
  assert.strictEqual(body.fileName, "cs-midterm.pdf")
  assert.strictEqual(body.mimeType, "application/pdf")
  assert.ok(body.fileSize > 0)
  assert.ok(body.filePath.startsWith("course-materials/"))

  const [row] = await db
    .select()
    .from(courseMaterial)
    .where(eq(courseMaterial.id, body.id))
  assert.ok(row)
  assert.strictEqual(row.title, "CS Midterm 2024")
  assert.strictEqual(row.userId, studentId)
  assert.strictEqual(row.courseMaterialType, "exam")
})

test("POST /api/course-materials rejects invalid files", async () => {
  const form = new FormData()
  form.set("title", "Bad File")
  form.set("courseId", courseId)
  form.set("courseMaterialType", "other")
  form.set("year", "2024")
  form.set("semester", "2")
  form.set(
    "file",
    new File([Buffer.from("MZ")], "virus.exe", {
      type: "application/x-msdownload",
    })
  )

  const res = await app.request("/api/course-materials", {
    method: "POST",
    headers: { cookie: sessionCookie },
    body: form,
  })
  assert.strictEqual(res.status, 400)
  const body = (await res.json()) as { error: string }
  assert.match(body.error, /unsupported|invalid|format/i)
})

test("POST /api/course-materials validates inputs at route boundary with Zod", async () => {
  // Invalid year
  const formYear = new FormData()
  formYear.set("title", "Year Test")
  formYear.set("courseId", courseId)
  formYear.set("courseMaterialType", "exam")
  formYear.set("year", "1990")
  formYear.set("semester", "1")
  formYear.set(
    "file",
    new File([Buffer.from("%PDF-1.4")], "test.pdf", {
      type: "application/pdf",
    })
  )

  const resYear = await app.request("/api/course-materials", {
    method: "POST",
    headers: { cookie: sessionCookie },
    body: formYear,
  })
  assert.strictEqual(resYear.status, 400)
  const bodyYear = (await resYear.json()) as { error: string }
  assert.match(bodyYear.error, /academic year/i)

  // Invalid semester
  const formSem = new FormData()
  formSem.set("title", "Sem Test")
  formSem.set("courseId", courseId)
  formSem.set("courseMaterialType", "exam")
  formSem.set("year", "2024")
  formSem.set("semester", "spring")
  formSem.set(
    "file",
    new File([Buffer.from("%PDF-1.4")], "test.pdf", {
      type: "application/pdf",
    })
  )

  const resSem = await app.request("/api/course-materials", {
    method: "POST",
    headers: { cookie: sessionCookie },
    body: formSem,
  })
  assert.strictEqual(resSem.status, 400)
  const bodySem = (await resSem.json()) as { error: string }
  assert.match(bodySem.error, /semester/i)

  // Invalid courseMaterialType
  const formType = new FormData()
  formType.set("title", "Type Test")
  formType.set("courseId", courseId)
  formType.set("courseMaterialType", "handout")
  formType.set("year", "2024")
  formType.set("semester", "1")
  formType.set(
    "file",
    new File([Buffer.from("%PDF-1.4")], "test.pdf", {
      type: "application/pdf",
    })
  )

  const resType = await app.request("/api/course-materials", {
    method: "POST",
    headers: { cookie: sessionCookie },
    body: formType,
  })
  assert.strictEqual(resType.status, 400)
  const bodyType = (await resType.json()) as { error: string }
  assert.match(bodyType.error, /course material type/i)
})

test("GET /api/course-materials validates query parameters at route boundary with Zod", async () => {
  const res = await app.request(
    "/api/course-materials?courseMaterialType=invalid_type"
  )
  assert.strictEqual(res.status, 400)
  const body = (await res.json()) as { error: string }
  assert.match(body.error, /course material type/i)
})
