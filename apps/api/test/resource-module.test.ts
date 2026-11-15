import test, { after, before } from "node:test"
import assert from "node:assert/strict"
import { eq } from "drizzle-orm"
import db from "../src/db/index.js"
import { university, department, course } from "../src/db/schema/academic.js"
import { user as studentTable } from "../src/db/schema/auth.js"
import { resource } from "../src/db/schema/resource.js"
import { createResources } from "../src/resources/index.js"
import type { StorageProvider } from "../src/storage/types.js"

// ---------------------------------------------------------------------------
// In-memory StorageProvider adapter for tests
// ---------------------------------------------------------------------------

class InMemoryStorage implements StorageProvider {
  private store = new Map<string, { data: Buffer; contentType: string }>()

  async put(
    key: string,
    data: Buffer | ReadableStream<Uint8Array>,
    opts?: { contentType?: string }
  ) {
    const buffer = Buffer.isBuffer(data)
      ? data
      : await this.streamToBuffer(data)
    this.store.set(key, {
      data: buffer,
      contentType: opts?.contentType ?? "application/octet-stream",
    })
    return { key, size: buffer.byteLength }
  }

  async get(key: string) {
    const entry = this.store.get(key)
    if (!entry) return null
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(entry.data))
        controller.close()
      },
    })
    return {
      stream,
      contentType: entry.contentType,
      size: entry.data.byteLength,
    }
  }

  async delete(key: string) {
    this.store.delete(key)
  }

  async exists(key: string) {
    return this.store.has(key)
  }

  async getUrl(
    key: string,
    opts?: { expiresIn?: number; disposition?: "inline" | "attachment" }
  ) {
    return `/fake/${key}?disposition=${opts?.disposition ?? "inline"}`
  }

  has(key: string) {
    return this.store.has(key)
  }

  private async streamToBuffer(
    stream: ReadableStream<Uint8Array>
  ): Promise<Buffer> {
    const reader = stream.getReader()
    const chunks: Uint8Array[] = []
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
    return Buffer.concat(chunks.map((c) => Buffer.from(c)))
  }
}

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const suffix = Date.now()
const uniId = `uni_resmod_${suffix}`
const deptId = `dept_resmod_${suffix}`
const courseId = `course_resmod_${suffix}`
const courseCode = `RM${String(suffix).slice(-3)}`
const studentId = `stu_resmod_${suffix}`
const student = { id: studentId, name: "Resource Author" }

const storage = new InMemoryStorage()
const resources = createResources({ db, storage })
const createdResourceIds: string[] = []

function pdfFile(
  name = "midterm.pdf",
  size?: number
): {
  name: string
  size: number
  type: string
  data: Buffer
} {
  const data = Buffer.from("%PDF-1.4 test content")
  return {
    name,
    size: size ?? data.byteLength,
    type: "application/pdf",
    data,
  }
}

before(async () => {
  await db.insert(university).values({
    id: uniId,
    name: `ResModule Uni ${suffix}`,
  })
  await db.insert(department).values({
    id: deptId,
    name: `ResModule Dept ${suffix}`,
    universityId: uniId,
  })
  await db.insert(course).values({
    id: courseId,
    name: "ResModule Course",
    code: courseCode,
    departmentId: deptId,
  })
  await db.insert(studentTable).values({
    id: studentId,
    name: student.name,
    email: `resmod_${suffix}@university.edu`,
    emailVerified: true,
  })
})

after(async () => {
  for (const id of createdResourceIds) {
    await db.delete(resource).where(eq(resource.id, id))
  }
  await db.delete(studentTable).where(eq(studentTable.id, studentId))
  await db.delete(course).where(eq(course.id, courseId))
  await db.delete(department).where(eq(department.id, deptId))
  await db.delete(university).where(eq(university.id, uniId))
})

// ---------------------------------------------------------------------------
// upload
// ---------------------------------------------------------------------------

test("upload stores a Resource for a Course", async () => {
  const result = await resources.upload({
    student,
    title: "CS Midterm 2024",
    courseId,
    resourceType: "exam",
    year: 2024,
    semester: "1",
    description: "Practice exam",
    file: pdfFile(),
  })

  assert.equal(result.ok, true)
  if (!result.ok) return

  createdResourceIds.push(result.data.id)
  assert.equal(result.data.title, "CS Midterm 2024")
  assert.equal(result.data.courseId, courseId)
  assert.equal(result.data.userId, studentId)
  assert.equal(result.data.resourceType, "exam")
  assert.equal(result.data.year, 2024)
  assert.equal(result.data.semester, "1")
  assert.equal(result.data.mimeType, "application/pdf")
  assert.ok(result.data.fileSize > 0)

  // Verify file was stored
  assert.ok(await storage.exists(result.data.filePath))
})

test("upload rejects empty title", async () => {
  const result = await resources.upload({
    student,
    title: "   ",
    courseId,
    resourceType: "exam",
    year: 2024,
    semester: "1",
    description: null,
    file: pdfFile(),
  })

  assert.equal(result.ok, false)
  if (result.ok) return
  assert.equal(result.error.code, "validation")
  assert.match(result.error.message, /title/i)
})

test("upload rejects unknown Course", async () => {
  const result = await resources.upload({
    student,
    title: "Good Title",
    courseId: "missing-course-id",
    resourceType: "exam",
    year: 2024,
    semester: "1",
    description: null,
    file: pdfFile(),
  })

  assert.equal(result.ok, false)
  if (result.ok) return
  assert.equal(result.error.code, "validation")
  assert.match(result.error.message, /course not found/i)
})

test("upload rejects invalid Resource Type", async () => {
  const result = await resources.upload({
    student,
    title: "Good Title",
    courseId,
    resourceType: "invalid-type",
    year: 2024,
    semester: "1",
    description: null,
    file: pdfFile(),
  })

  assert.equal(result.ok, false)
  if (result.ok) return
  assert.equal(result.error.code, "validation")
  assert.match(result.error.message, /resource type/i)
})

test("upload rejects invalid file extension", async () => {
  const result = await resources.upload({
    student,
    title: "Good Title",
    courseId,
    resourceType: "other",
    year: 2024,
    semester: "1",
    description: null,
    file: {
      name: "virus.exe",
      size: 100,
      type: "application/x-msdownload",
      data: Buffer.from("MZ"),
    },
  })

  assert.equal(result.ok, false)
  if (result.ok) return
  assert.equal(result.error.code, "validation")
  assert.match(result.error.message, /unsupported|format/i)
})

test("upload rejects invalid academic year", async () => {
  const result = await resources.upload({
    student,
    title: "Good Title",
    courseId,
    resourceType: "exam",
    year: 1999,
    semester: "1",
    description: null,
    file: pdfFile(),
  })

  assert.equal(result.ok, false)
  if (result.ok) return
  assert.equal(result.error.code, "validation")
  assert.match(result.error.message, /year/i)
})

// ---------------------------------------------------------------------------
// list
// ---------------------------------------------------------------------------

test("list returns Resources and filters by Course", async () => {
  // Seed a Resource
  const uploaded = await resources.upload({
    student,
    title: "List Test Resource",
    courseId,
    resourceType: "notes",
    year: 2024,
    semester: "2",
    description: null,
    file: pdfFile("list-notes.pdf"),
  })
  assert.equal(uploaded.ok, true)
  if (!uploaded.ok) return
  createdResourceIds.push(uploaded.data.id)

  // List all
  const all = await resources.list()
  assert.equal(all.ok, true)
  if (!all.ok) return
  const found = all.data.find((r) => r.id === uploaded.data.id)
  assert.ok(found)
  assert.equal(found.courseCode, courseCode)

  // Filter by Course
  const byCourse = await resources.list({ courseId })
  assert.equal(byCourse.ok, true)
  if (!byCourse.ok) return
  assert.ok(byCourse.data.every((r) => r.courseId === courseId))

  // Filter by non-existent Course returns empty
  const empty = await resources.list({ courseId: "no-such-course" })
  assert.equal(empty.ok, true)
  if (!empty.ok) return
  assert.equal(empty.data.length, 0)
})

test("list rejects invalid Resource Type", async () => {
  const result = await resources.list({ resourceType: "invalid-type" })
  assert.equal(result.ok, false)
  if (result.ok) return
  assert.equal(result.error.code, "validation")
  assert.match(result.error.message, /resource type/i)
})

// ---------------------------------------------------------------------------
// get
// ---------------------------------------------------------------------------

test("get returns Resource detail with Course and Student", async () => {
  const uploaded = await resources.upload({
    student,
    title: "Detail Test Resource",
    courseId,
    resourceType: "slides",
    year: 2024,
    semester: "summer",
    description: "Lecture slides",
    file: pdfFile("slides.pdf"),
  })
  assert.equal(uploaded.ok, true)
  if (!uploaded.ok) return
  createdResourceIds.push(uploaded.data.id)

  const detail = await resources.get(uploaded.data.id)
  assert.equal(detail.ok, true)
  if (!detail.ok) return

  assert.equal(detail.data.title, "Detail Test Resource")
  assert.equal(detail.data.courseCode, courseCode)
  assert.equal(detail.data.studentName, student.name)
  assert.equal(detail.data.description, "Lecture slides")
})

test("get returns not_found for unknown Resource", async () => {
  const result = await resources.get("missing-resource-id")
  assert.equal(result.ok, false)
  if (result.ok) return
  assert.equal(result.error.code, "not_found")
})

// ---------------------------------------------------------------------------
// stream
// ---------------------------------------------------------------------------

test("stream returns file content from storage", async () => {
  const uploaded = await resources.upload({
    student,
    title: "Stream Test Resource",
    courseId,
    resourceType: "exam",
    year: 2024,
    semester: "1",
    description: null,
    file: pdfFile("stream-test.pdf"),
  })
  assert.equal(uploaded.ok, true)
  if (!uploaded.ok) return
  createdResourceIds.push(uploaded.data.id)

  const result = await resources.stream(uploaded.data.id)
  assert.equal(result.ok, true)
  if (!result.ok) return

  assert.equal(result.data.contentType, "application/pdf")
  assert.equal(result.data.fileName, "stream-test.pdf")
  assert.ok(result.data.size > 0)
  assert.ok(result.data.stream instanceof ReadableStream)
})

test("stream returns not_found for unknown Resource", async () => {
  const result = await resources.stream("missing-resource-id")
  assert.equal(result.ok, false)
  if (result.ok) return
  assert.equal(result.error.code, "not_found")
})
