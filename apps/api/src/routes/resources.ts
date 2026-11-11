import { randomUUID } from "node:crypto"
import { Hono } from "hono"
import { and, desc, eq, type SQL } from "drizzle-orm"
import db from "../db/index.js"
import { course } from "../db/schema/academic.js"
import { resource } from "../db/schema/resource.js"
import {
  isResourceType,
  isSemester,
  validateUploadFile,
} from "../lib/resource-validation.js"
import { requireAuth } from "../middleware/auth.js"
import { createStorage } from "../storage/index.js"

const resources = new Hono()

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
