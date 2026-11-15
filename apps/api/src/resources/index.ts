import { randomUUID } from "node:crypto"
import { and, desc, eq, type SQL } from "drizzle-orm"
import { course } from "../db/schema/academic.js"
import { user as studentTable } from "../db/schema/auth.js"
import { resource } from "../db/schema/resource.js"
import {
  ok,
  err,
  type Db,
  type StudentIdentity,
  type Result,
} from "../lib/result.js"
import type { StorageProvider } from "../storage/types.js"
import { isResourceType, isSemester, validateUploadFile } from "./validation.js"

export type ResourceFileInput = {
  name: string
  size: number
  type: string
  data: Buffer
}

export type UploadInput = {
  student: StudentIdentity
  title: string
  courseId: string
  resourceType: string
  year: number
  semester: string
  description: string | null
  file: ResourceFileInput
}

export type ListFilters = {
  resourceType?: string
  departmentId?: string
  courseId?: string
}

export type StreamResult = {
  stream: ReadableStream<Uint8Array>
  contentType: string
  fileName: string
  size: number
}

export function createResources(deps: { db: Db; storage: StorageProvider }) {
  const { db, storage } = deps

  async function upload(
    input: UploadInput
  ): Promise<Result<typeof resource.$inferSelect>> {
    const title = input.title.trim()
    const courseId = input.courseId.trim()
    const { resourceType, semester } = input

    if (!title) {
      return err("validation", "Title is required")
    }
    if (!courseId) {
      return err("validation", "Course is required")
    }
    if (!isResourceType(resourceType)) {
      return err("validation", "Invalid resource type")
    }
    if (!isSemester(semester)) {
      return err("validation", "Invalid semester")
    }
    if (
      !Number.isInteger(input.year) ||
      input.year < 2000 ||
      input.year > 2100
    ) {
      return err("validation", "Invalid academic year")
    }

    const fileValidation = validateUploadFile({
      name: input.file.name,
      size: input.file.size,
      type: input.file.type,
    })
    if (!fileValidation.valid) {
      return err("validation", fileValidation.error ?? "Invalid file")
    }

    const [existingCourse] = await db
      .select({ id: course.id })
      .from(course)
      .where(eq(course.id, courseId))
      .limit(1)

    if (!existingCourse) {
      return err("validation", "Course not found")
    }

    const id = randomUUID()
    const safeName = input.file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const storageKey = `resources/${id}/${safeName}`

    const putResult = await storage.put(storageKey, input.file.data, {
      contentType: input.file.type || "application/octet-stream",
    })

    try {
      const [created] = await db
        .insert(resource)
        .values({
          id,
          title,
          description: input.description,
          courseId,
          userId: input.student.id,
          resourceType,
          year: input.year,
          semester,
          filePath: putResult.key,
          fileName: input.file.name,
          mimeType: input.file.type || "application/octet-stream",
          fileSize: putResult.size,
        })
        .returning()

      return ok(created!)
    } catch (error) {
      await storage.delete(putResult.key)
      throw error
    }
  }

  async function list(filters: ListFilters = {}) {
    if (filters.resourceType && !isResourceType(filters.resourceType)) {
      return err("validation", "Invalid resource type")
    }

    const conditions: SQL[] = []
    if (filters.resourceType) {
      conditions.push(eq(resource.resourceType, filters.resourceType))
    }
    if (filters.departmentId) {
      conditions.push(eq(course.departmentId, filters.departmentId))
    }
    if (filters.courseId) {
      conditions.push(eq(resource.courseId, filters.courseId))
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
      conditions.length > 0
        ? await query.where(and(...conditions))
        : await query

    return ok(rows)
  }

  async function get(resourceId?: string): Promise<
    Result<{
      id: string
      title: string
      description: string | null
      resourceType: string
      year: number
      semester: string
      fileName: string
      mimeType: string
      fileSize: number
      createdAt: Date
      courseId: string
      courseCode: string
      courseName: string
      studentId: string
      studentName: string
    }>
  > {
    if (!resourceId) {
      return err("not_found", "Resource not found")
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
        studentName: studentTable.name,
      })
      .from(resource)
      .innerJoin(course, eq(resource.courseId, course.id))
      .innerJoin(studentTable, eq(resource.userId, studentTable.id))
      .where(eq(resource.id, resourceId))
      .limit(1)

    if (!row) {
      return err("not_found", "Resource not found")
    }

    return ok(row)
  }

  async function stream(resourceId?: string): Promise<Result<StreamResult>> {
    if (!resourceId) {
      return err("not_found", "Resource not found")
    }

    const [row] = await db
      .select({
        filePath: resource.filePath,
        fileName: resource.fileName,
        mimeType: resource.mimeType,
      })
      .from(resource)
      .where(eq(resource.id, resourceId))
      .limit(1)

    if (!row) {
      return err("not_found", "Resource not found")
    }

    const stored = await storage.get(row.filePath)
    if (!stored) {
      return err("not_found", "Resource content not found")
    }

    return ok({
      stream: stored.stream,
      contentType: row.mimeType,
      fileName: row.fileName,
      size: stored.size,
    })
  }

  return {
    upload,
    list,
    get,
    stream,
  }
}

export type Resources = ReturnType<typeof createResources>
