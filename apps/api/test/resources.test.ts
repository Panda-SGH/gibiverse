import test, { after, before } from "node:test"
import assert from "node:assert/strict"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { eq } from "drizzle-orm"
import { app } from "../src/app.js"
import db from "../src/db/index.js"
import { university, department, course } from "../src/db/schema/academic.js"
import { resource } from "../src/db/schema/resource.js"

const suffix = Date.now()
const uniId = `uni_res_${suffix}`
const deptId = `dept_res_${suffix}`
const courseId = `course_res_${suffix}`
const courseCode = `RS${String(suffix).slice(-3)}`

let storageDir: string
let previousStoragePath: string | undefined
let previousStorageProvider: string | undefined
let sessionCookie: string
let studentId: string
const createdResourceIds: string[] = []

before(async () => {
  storageDir = await mkdtemp(path.join(tmpdir(), "gibiverse-res-upload-"))
  previousStoragePath = process.env.STORAGE_LOCAL_PATH
  previousStorageProvider = process.env.STORAGE_PROVIDER
  process.env.STORAGE_LOCAL_PATH = storageDir
  process.env.STORAGE_PROVIDER = "local"

  await db.insert(university).values({
    id: uniId,
    name: `Resource Uni ${suffix}`,
  })
  await db.insert(department).values({
    id: deptId,
    name: `Resource Dept ${suffix}`,
    universityId: uniId,
  })
  await db.insert(course).values({
    id: courseId,
    name: "Resource Course",
    code: courseCode,
    departmentId: deptId,
  })

  const email = `resource_${suffix}@university.edu`
  const password = "ResourcePassword123!"
  const signUpRes = await app.request("/api/auth/sign-up/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "Resource Student",
      email,
      password,
    }),
  })
  assert.strictEqual(signUpRes.status, 200)
  const setCookie = signUpRes.headers.get("set-cookie")
  assert.ok(setCookie)
  sessionCookie = setCookie.split(";")[0]!

  const sessionRes = await app.request("/api/auth/get-session", {
    headers: { cookie: sessionCookie },
  })
  const sessionBody = (await sessionRes.json()) as {
    user?: { id: string }
  }
  assert.ok(sessionBody.user?.id)
  studentId = sessionBody.user.id
})

after(async () => {
  for (const id of createdResourceIds) {
    await db.delete(resource).where(eq(resource.id, id))
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

test("POST /api/resources requires authentication", async () => {
  const form = new FormData()
  form.set("title", "Midterm Exam")
  form.set("courseId", courseId)
  form.set("resourceType", "exam")
  form.set("year", "2024")
  form.set("semester", "1")
  form.set(
    "file",
    new File([Buffer.from("%PDF-1.4")], "midterm.pdf", {
      type: "application/pdf",
    })
  )

  const res = await app.request("/api/resources", {
    method: "POST",
    body: form,
  })
  assert.strictEqual(res.status, 401)
})

test("POST /api/resources stores file and creates resource record", async () => {
  const form = new FormData()
  form.set("title", "CS Midterm 2024")
  form.set("courseId", courseId)
  form.set("resourceType", "exam")
  form.set("year", "2024")
  form.set("semester", "1")
  form.set("description", "Practice midterm")
  form.set(
    "file",
    new File([Buffer.from("%PDF-1.4 midterm")], "cs-midterm.pdf", {
      type: "application/pdf",
    })
  )

  const res = await app.request("/api/resources", {
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
    resourceType: string
    year: number
    semester: string
    fileName: string
    mimeType: string
    fileSize: number
    filePath: string
  }

  createdResourceIds.push(body.id)
  assert.strictEqual(body.title, "CS Midterm 2024")
  assert.strictEqual(body.courseId, courseId)
  assert.strictEqual(body.userId, studentId)
  assert.strictEqual(body.resourceType, "exam")
  assert.strictEqual(body.year, 2024)
  assert.strictEqual(body.semester, "1")
  assert.strictEqual(body.fileName, "cs-midterm.pdf")
  assert.strictEqual(body.mimeType, "application/pdf")
  assert.ok(body.fileSize > 0)
  assert.ok(body.filePath.length > 0)

  const [row] = await db
    .select()
    .from(resource)
    .where(eq(resource.id, body.id))
  assert.ok(row)
  assert.strictEqual(row.title, "CS Midterm 2024")
  assert.strictEqual(row.userId, studentId)
})

test("POST /api/resources rejects invalid files", async () => {
  const form = new FormData()
  form.set("title", "Bad File")
  form.set("courseId", courseId)
  form.set("resourceType", "other")
  form.set("year", "2024")
  form.set("semester", "2")
  form.set(
    "file",
    new File([Buffer.from("MZ")], "virus.exe", {
      type: "application/x-msdownload",
    })
  )

  const res = await app.request("/api/resources", {
    method: "POST",
    headers: { cookie: sessionCookie },
    body: form,
  })
  assert.strictEqual(res.status, 400)
  const body = (await res.json()) as { error: string }
  assert.match(body.error, /unsupported|invalid|format/i)
})
