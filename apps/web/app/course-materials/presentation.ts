import { formatAcademicPeriod, formatRelativeUploadDate } from "@/lib/formatters"
import type { CourseMaterialType, Semester } from "@gibiverse/shared/types"

export { formatAcademicPeriod, formatRelativeUploadDate }

export type CourseMaterialFilters = {
  courseMaterialType?: CourseMaterialType | null
  resourceType?: CourseMaterialType | null
  departmentId: string | null
  courseId: string | null
}

// Backwards compatibility alias
export type CatalogFilters = CourseMaterialFilters

export type CourseMaterialEmptyState = {
  title: string
  description: string
}

// Backwards compatibility alias
export type CatalogEmptyState = CourseMaterialEmptyState

export type CatalogCourseMaterial = {
  id: string
  title: string
  courseMaterialType: CourseMaterialType | string
  resourceType?: CourseMaterialType | string
  year: number
  semester: Semester | string
  createdAt: string
  courseId: string
  courseCode: string
  courseName: string
  departmentId: string
  thumbnailPath?: string | null
}

// Backwards compatibility alias
export type CatalogResource = CatalogCourseMaterial

export function hasActiveCatalogFilters(filters: CourseMaterialFilters): boolean {
  return Boolean(
    filters.courseMaterialType ||
      filters.resourceType ||
      filters.departmentId ||
      filters.courseId
  )
}

export function catalogEmptyState(
  filters: CourseMaterialFilters
): CourseMaterialEmptyState {
  if (hasActiveCatalogFilters(filters)) {
    return {
      title: "No course materials match these filters",
      description:
        "Try clearing or adjusting the course material type, department, or course filters.",
    }
  }

  return {
    title: "No course materials yet",
    description:
      "Be the first to upload past exams, notes, or slides for your courses.",
  }
}

export function buildCourseMaterialsQuery(
  filters: CourseMaterialFilters
): string {
  const params = new URLSearchParams()
  const type = filters.courseMaterialType || filters.resourceType
  if (type) params.set("courseMaterialType", type)
  if (filters.departmentId) params.set("departmentId", filters.departmentId)
  if (filters.courseId) params.set("courseId", filters.courseId)
  const qs = params.toString()
  return qs ? `/api/course-materials?${qs}` : "/api/course-materials"
}

// Backwards compatibility alias
export const buildResourcesQuery = buildCourseMaterialsQuery

export type CourseMaterialDetail = {
  id: string
  title: string
  description: string | null
  courseMaterialType: CourseMaterialType
  resourceType?: CourseMaterialType
  year: number
  semester: Semester
  fileName: string
  mimeType: string
  fileSize: number
  createdAt: string
  courseId: string
  courseCode: string
  courseName: string
  studentId: string
  studentName: string
}

// Backwards compatibility alias
export type ResourceDetail = CourseMaterialDetail

export type CourseMaterialPreviewType =
  | "pdf"
  | "docx"
  | "image"
  | "download-only"

// Backwards compatibility alias
export type ResourcePreviewType = CourseMaterialPreviewType

export const UPLOAD_COURSE_MATERIAL_PATH = "/course-materials/upload"
// Backwards compatibility alias
export const UPLOAD_RESOURCE_PATH = UPLOAD_COURSE_MATERIAL_PATH

export function getUploadSignInHref(
  callbackPath: string = UPLOAD_COURSE_MATERIAL_PATH
): string {
  const callbackUrl = encodeURIComponent(callbackPath)
  return `/sign-in?callbackUrl=${callbackUrl}`
}

export function courseMaterialPreviewUrl(id: string): string {
  return `/api/course-materials/${id}/preview`
}

// Backwards compatibility alias
export const resourcePreviewUrl = courseMaterialPreviewUrl

export function courseMaterialDownloadUrl(id: string): string {
  return `/api/course-materials/${id}/download`
}

// Backwards compatibility alias
export const resourceDownloadUrl = courseMaterialDownloadUrl

export function resolvePreviewType(
  fileName: string,
  mimeType: string
): CourseMaterialPreviewType {
  const name = fileName.toLowerCase()
  const extension = "." + (name.split(".").pop() ?? "")
  if (extension === ".pdf" || mimeType === "application/pdf") {
    return "pdf"
  }
  if (
    extension === ".docx" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "docx"
  }
  if (
    [".png", ".jpg", ".jpeg", ".webp"].includes(extension) ||
    mimeType.startsWith("image/")
  ) {
    return "image"
  }
  return "download-only"
}

export function resolveFormatLabel(
  previewType: CourseMaterialPreviewType,
  fileName: string
): string {
  const name = fileName.toLowerCase()
  const extension = "." + (name.split(".").pop() ?? "")
  if (previewType === "pdf") return "PDF Document"
  if (previewType === "docx") return "Word Document"
  if (previewType === "image") return "Image"
  if (extension === ".pptx") return "PowerPoint Presentation (Download-only)"
  return "Document"
}
