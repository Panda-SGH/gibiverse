export type University = {
  id: string
  name: string
}

export type Department = {
  id: string
  name: string
  universityId: string
}

export type Course = {
  id: string
  name: string
  code: string
  departmentId: string
}

const API_URL = process.env.API_URL || "http://localhost:8787"

function academicBaseUrl() {
  if (typeof window !== "undefined") {
    return ""
  }
  return API_URL
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${academicBaseUrl()}${path}`, {
    cache: "no-store",
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function listUniversities() {
  return getJson<University[]>("/api/universities")
}

export function listDepartments(universityId?: string) {
  const query = universityId
    ? `?universityId=${encodeURIComponent(universityId)}`
    : ""
  return getJson<Department[]>(`/api/departments${query}`)
}

export function listCourses(departmentId?: string) {
  const query = departmentId
    ? `?departmentId=${encodeURIComponent(departmentId)}`
    : ""
  return getJson<Course[]>(`/api/courses${query}`)
}

/** Pure helper: courses belonging to a department (empty when no department). */
export function filterCoursesByDepartment(
  courses: Course[],
  departmentId: string | null | undefined
): Course[] {
  if (!departmentId) return []
  return courses.filter((course) => course.departmentId === departmentId)
}

export function groupCoursesByDepartment(
  departments: Department[],
  courses: Course[]
): Array<Department & { courses: Course[] }> {
  return departments.map((department) => ({
    ...department,
    courses: courses
      .filter((course) => course.departmentId === department.id)
      .sort((a, b) => a.code.localeCompare(b.code)),
  }))
}
