import { randomUUID } from "node:crypto"
import { and, desc, eq, type SQL } from "drizzle-orm"
import { course } from "../db/schema/academic.js"
import { user as studentTable } from "../db/schema/auth.js"
import { courseMaterial } from "../db/schema/course-material.js"
import type { CourseMaterialType, Semester } from "@gibiverse/shared/types"
import {
  ok,
  err,
  type Db,
  type StudentIdentity,
  type Result,
} from "../lib/result.js"
import type { StorageProvider } from "../storage/types.js"
import {
  isCourseMaterialType,
  isSemester,
  validateUploadFile,
} from "./validation.js"

export type CourseMaterialFileInput = {
  name: string
  size: number
  type: string
  data: Buffer
}

export type UploadInput = {
  student: StudentIdentity
  title: string
  courseId: string
  courseMaterialType: CourseMaterialType | string
  year: number
  semester: Semester | string
  description: string | null
  file: CourseMaterialFileInput
}

export type ListFilters = {
  courseMaterialType?: CourseMaterialType | string
  departmentId?: string
  courseId?: string
}

export type StreamResult = {
  stream: ReadableStream<Uint8Array>
  contentType: string
  fileName: string
  size: number
}

export function createCourseMaterials(deps: {
  db: Db
  storage: StorageProvider
}) {
  const { db, storage } = deps

  async function upload(
    input: UploadInput
  ): Promise<Result<typeof courseMaterial.$inferSelect>> {
    const title = input.title.trim()
    const courseId = input.courseId.trim()
    const { courseMaterialType, semester } = input

    if (!title) {
      return err("validation", "Title is required")
    }
    if (!courseId) {
      return err("validation", "Course is required")
    }
    if (!isCourseMaterialType(courseMaterialType)) {
      return err("validation", "Invalid course material type")
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
    const storageKey = `course-materials/${id}/${safeName}`

    const putResult = await storage.put(storageKey, input.file.data, {
      contentType: input.file.type || "application/octet-stream",
    })

    try {
      const [created] = await db
        .insert(courseMaterial)
        .values({
          id,
          title,
          description: input.description,
          courseId,
          userId: input.student.id,
          courseMaterialType,
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
    if (
      filters.courseMaterialType &&
      !isCourseMaterialType(filters.courseMaterialType)
    ) {
      return err("validation", "Invalid course material type")
    }

    const conditions: SQL[] = []
    if (filters.courseMaterialType) {
      conditions.push(
        eq(courseMaterial.courseMaterialType, filters.courseMaterialType)
      )
    }
    if (filters.departmentId) {
      conditions.push(eq(course.departmentId, filters.departmentId))
    }
    if (filters.courseId) {
      conditions.push(eq(courseMaterial.courseId, filters.courseId))
    }

    const query = db
      .select({
        id: courseMaterial.id,
        title: courseMaterial.title,
        courseMaterialType: courseMaterial.courseMaterialType,
        year: courseMaterial.year,
        semester: courseMaterial.semester,
        createdAt: courseMaterial.createdAt,
        courseId: courseMaterial.courseId,
        courseCode: course.code,
        courseName: course.name,
        departmentId: course.departmentId,
      })
      .from(courseMaterial)
      .innerJoin(course, eq(courseMaterial.courseId, course.id))
      .orderBy(desc(courseMaterial.createdAt))

    const rows =
      conditions.length > 0
        ? await query.where(and(...conditions))
        : await query

    return ok(rows)
  }

  async function get(courseMaterialId?: string): Promise<
    Result<{
      id: string
      title: string
      description: string | null
      courseMaterialType: string
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
    if (!courseMaterialId) {
      return err("not_found", "Course material not found")
    }

    const [row] = await db
      .select({
        id: courseMaterial.id,
        title: courseMaterial.title,
        description: courseMaterial.description,
        courseMaterialType: courseMaterial.courseMaterialType,
        year: courseMaterial.year,
        semester: courseMaterial.semester,
        fileName: courseMaterial.fileName,
        mimeType: courseMaterial.mimeType,
        fileSize: courseMaterial.fileSize,
        createdAt: courseMaterial.createdAt,
        courseId: courseMaterial.courseId,
        courseCode: course.code,
        courseName: course.name,
        studentId: courseMaterial.userId,
        studentName: studentTable.name,
      })
      .from(courseMaterial)
      .innerJoin(course, eq(courseMaterial.courseId, course.id))
      .innerJoin(studentTable, eq(courseMaterial.userId, studentTable.id))
      .where(eq(courseMaterial.id, courseMaterialId))
      .limit(1)

    if (!row) {
      return err("not_found", "Course material not found")
    }

    return ok(row)
  }

  async function stream(
    courseMaterialId?: string
  ): Promise<Result<StreamResult>> {
    if (!courseMaterialId) {
      return err("not_found", "Course material not found")
    }

    const [row] = await db
      .select({
        filePath: courseMaterial.filePath,
        fileName: courseMaterial.fileName,
        mimeType: courseMaterial.mimeType,
      })
      .from(courseMaterial)
      .where(eq(courseMaterial.id, courseMaterialId))
      .limit(1)

    if (!row) {
      return err("not_found", "Course material not found")
    }

    const stored = await storage.get(row.filePath)
    if (!stored) {
      return err("not_found", "Course material content not found")
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

export type CourseMaterials = ReturnType<typeof createCourseMaterials>
