import type { ResourceType, Semester } from "./resource-validation"
import { validateFile } from "./resource-validation"

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

const API_URL = process.env.API_URL || "http://localhost:8787"

function resourcesBaseUrl() {
  if (typeof window !== "undefined") {
    return ""
  }
  return API_URL
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

export async function getResource(
  id: string
): Promise<ResourceDetail | null> {
  const res = await fetch(`${resourcesBaseUrl()}/api/resources/${id}`, {
    cache: "no-store",
  })
  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`Failed to fetch resource ${id}: ${res.status}`)
  }
  return res.json() as Promise<ResourceDetail>
}
