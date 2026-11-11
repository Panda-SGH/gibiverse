import { semesterOptions } from "./resource-options"
import type { ResourceType, Semester } from "./resource-validation"

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
  resourceType: ResourceType
  year: number
  semester: Semester
  createdAt: string
  courseId: string
  courseCode: string
  courseName: string
  departmentId: string
}

export function formatAcademicPeriod(year: number, semester: string): string {
  const label =
    semesterOptions.find((option) => option.value === semester)?.label ??
    semester
  return `${year} · ${label}`
}

export function formatRelativeUploadDate(
  createdAt: string,
  now: Date = new Date()
): string {
  const then = new Date(createdAt)
  const diffMs = Math.max(0, now.getTime() - then.getTime())
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return "just now"
  if (minutes < 60) {
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`
  }
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`
  }
  const days = Math.floor(hours / 24)
  return days === 1 ? "1 day ago" : `${days} days ago`
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
  const query = params.toString()
  return query ? `/api/resources?${query}` : "/api/resources"
}

const API_URL = process.env.API_URL || "http://localhost:8787"

function resourcesBaseUrl() {
  if (typeof window !== "undefined") {
    return ""
  }
  return API_URL
}

export async function listResources(
  filters: CatalogFilters = {
    resourceType: null,
    departmentId: null,
    courseId: null,
  }
): Promise<CatalogResource[]> {
  const path = buildResourcesQuery(filters)
  const res = await fetch(`${resourcesBaseUrl()}${path}`, {
    cache: "no-store",
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status}`)
  }
  return res.json() as Promise<CatalogResource[]>
}
