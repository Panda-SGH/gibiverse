import { randomUUID } from "node:crypto"
import { Hono, type Context } from "hono"
import { and, desc, eq, type SQL } from "drizzle-orm"
import db from "../db/index.js"
import { course } from "../db/schema/academic.js"
import { user as student } from "../db/schema/auth.js"
import { resource } from "../db/schema/resource.js"
import {
  isResourceType,
  isSemester,
  validateUploadFile,
} from "../lib/resource-validation.js"
import { requireAuth } from "../middleware/auth.js"
import { createStorage } from "../storage/index.js"

const resources = new Hono()

function contentDisposition(
  disposition: "inline" | "attachment",
  fileName: string
): string {
  const escaped = fileName.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
  return `${disposition}; filename="${escaped}"`
}

async function streamResourceFile(
  c: Context,
  disposition: "inline" | "attachment"
) {
  const id = c.req.param("id")
  if (!id) {
    return c.json({ error: "Resource not found" }, 404)
  }

  const [row] = await db
    .select({
      filePath: resource.filePath,
      fileName: resource.fileName,
      mimeType: resource.mimeType,
    })
    .from(resource)
    .where(eq(resource.id, id))
    .limit(1)

  if (!row) {
    return c.json({ error: "Resource not found" }, 404)
  }

  const storage = createStorage()
  const stored = await storage.get(row.filePath)
  if (!stored) {
    return c.json({ error: "Resource content not found" }, 404)
  }

  c.header("Content-Type", row.mimeType)
  c.header("Content-Disposition", contentDisposition(disposition, row.fileName))
  c.header("Content-Length", String(stored.size))
  return c.body(stored.stream)
}

resources.get("/", async (c) => {
  const resourceTypeRaw = c.req.query("resourceType")?.trim()
  const departmentId = c.req.query("departmentId")?.trim() || undefined
  const courseId = c.req.query("courseId")?.trim() || undefined

  if (resourceTypeRaw && !isResourceType(resourceTypeRaw)) {
    return c.json({ error: "Invalid resource type" }, 400)
  }

  const filters: SQL[] = []
  if (resourceTypeRaw) {
    filters.push(eq(resource.resourceType, resourceTypeRaw))
  }
  if (departmentId) {
    filters.push(eq(course.departmentId, departmentId))
  }
  if (courseId) {
    filters.push(eq(resource.courseId, courseId))
  }

  const query = db
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
      departmentId: course.departmentId,
    })
    .from(resource)
    .innerJoin(course, eq(resource.courseId, course.id))
    .orderBy(desc(resource.createdAt))

  const rows =
    filters.length > 0 ? await query.where(and(...filters)) : await query

  return c.json(rows)
})

resources.get("/:id/download", async (c) => streamResourceFile(c, "attachment"))

resources.get("/:id/preview", async (c) => streamResourceFile(c, "inline"))

resources.get("/:id", async (c) => {
  const id = c.req.param("id")
  if (!id) {
    return c.json({ error: "Resource not found" }, 404)
  }

  const [row] = await db
    .select({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      resourceType: resource.resourceType,
      year: resource.year,
      semester: resource.semester,
      fileName: resource.fileName,
      mimeType: resource.mimeType,
      fileSize: resource.fileSize,
      createdAt: resource.createdAt,
      courseId: resource.courseId,
      courseCode: course.code,
      courseName: course.name,
      studentId: resource.userId,
      studentName: student.name,
    })
    .from(resource)
    .innerJoin(course, eq(resource.courseId, course.id))
    .innerJoin(student, eq(resource.userId, student.id))
    .where(eq(resource.id, id))
    .limit(1)

  if (!row) {
    return c.json({ error: "Resource not found" }, 404)
  }

  return c.json(row)
})

resources.post("/", requireAuth, async (c) => {
  const user = c.get("user")
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  const body = await c.req.parseBody()
  const file = body["file"]
  const title = typeof body["title"] === "string" ? body["title"].trim() : ""
  const courseId =
    typeof body["courseId"] === "string" ? body["courseId"].trim() : ""
  const resourceType =
    typeof body["resourceType"] === "string" ? body["resourceType"] : ""
  const yearRaw = typeof body["year"] === "string" ? body["year"] : ""
  const semester =
    typeof body["semester"] === "string" ? body["semester"] : ""
  const description =
    typeof body["description"] === "string" && body["description"].trim()
      ? body["description"].trim()
      : null

  if (!(file instanceof File)) {
    return c.json({ error: "File is required" }, 400)
  }
  if (!title) {
    return c.json({ error: "Title is required" }, 400)
  }
  if (!courseId) {
    return c.json({ error: "Course is required" }, 400)
  }
  if (!isResourceType(resourceType)) {
    return c.json({ error: "Invalid resource type" }, 400)
  }
  if (!isSemester(semester)) {
    return c.json({ error: "Invalid semester" }, 400)
  }

  const year = Number.parseInt(yearRaw, 10)
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return c.json({ error: "Invalid academic year" }, 400)
  }

  const fileValidation = validateUploadFile({
    name: file.name,
    size: file.size,
    type: file.type,
  })
  if (!fileValidation.valid) {
    return c.json({ error: fileValidation.error ?? "Invalid file" }, 400)
  }

  const [existingCourse] = await db
    .select({ id: course.id })
    .from(course)
    .where(eq(course.id, courseId))
    .limit(1)

  if (!existingCourse) {
    return c.json({ error: "Course not found" }, 400)
  }

  const id = randomUUID()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
  const storageKey = `resources/${id}/${safeName}`
  const storage = createStorage()
  const bytes = Buffer.from(await file.arrayBuffer())

  const putResult = await storage.put(storageKey, bytes, {
    contentType: file.type || "application/octet-stream",
  })

  try {
    const [created] = await db
      .insert(resource)
      .values({
        id,
        title,
        description,
        courseId,
        userId: user.id,
        resourceType,
        year,
        semester,
        filePath: putResult.key,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        fileSize: putResult.size,
      })
      .returning()

    return c.json(created, 201)
  } catch (error) {
    await storage.delete(putResult.key)
    throw error
  }
})

export { resources }
