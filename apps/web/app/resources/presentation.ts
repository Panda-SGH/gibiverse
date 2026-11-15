import { formatAcademicPeriod, formatRelativeUploadDate } from "@/lib/formatters"
import type { ResourceType, Semester } from "@/lib/resource-validation"
import { validateFile } from "@/lib/resource-validation"

export { formatAcademicPeriod, formatRelativeUploadDate }

export type CatalogFilters = {
  resourceType: ResourceType | null
  departmentId: string | null
  courseId: string | null
}

export type CatalogEmptyState = {
  title: string
  description: string
}

export type CatalogResource = {
  id: string
  title: string
  resourceType: ResourceType | string
  year: number
  semester: Semester | string
  createdAt: string
  courseId: string
  courseCode: string
  courseName: string
  departmentId: string
}

export function hasActiveCatalogFilters(filters: CatalogFilters): boolean {
  return Boolean(
    filters.resourceType || filters.departmentId || filters.courseId
  )
}

export function catalogEmptyState(filters: CatalogFilters): CatalogEmptyState {
  if (hasActiveCatalogFilters(filters)) {
    return {
      title: "No resources match these filters",
      description:
        "Try clearing or adjusting the resource type, department, or course filters.",
    }
  }

  return {
    title: "No resources yet",
    description:
      "Be the first to upload past exams, notes, or slides for your courses.",
  }
}

export function buildResourcesQuery(filters: CatalogFilters): string {
  const params = new URLSearchParams()
  if (filters.resourceType) params.set("resourceType", filters.resourceType)
  if (filters.departmentId) params.set("departmentId", filters.departmentId)
  if (filters.courseId) params.set("courseId", filters.courseId)
  const qs = params.toString()
  return qs ? `/api/resources?${qs}` : "/api/resources"
}

export type ResourceDetail = {
  id: string
  title: string
  description: string | null
  resourceType: ResourceType
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

export type ResourcePreviewType = "pdf" | "docx" | "image" | "download-only"

export const UPLOAD_RESOURCE_PATH = "/resources/upload"

export function getUploadSignInHref(
  callbackPath: string = UPLOAD_RESOURCE_PATH
): string {
  const callbackUrl = encodeURIComponent(callbackPath)
  return `/sign-in?callbackUrl=${callbackUrl}`
}

export function resourcePreviewUrl(id: string): string {
  return `/api/resources/${id}/preview`
}

export function resourceDownloadUrl(id: string): string {
  return `/api/resources/${id}/download`
}

export function resolvePreviewType(
  fileName: string,
  mimeType: string
): ResourcePreviewType {
  return (
    validateFile({ name: fileName, size: 1, type: mimeType }).previewType ??
    "download-only"
  )
}
