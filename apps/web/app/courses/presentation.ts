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
  universityId: string
  departmentId: string
}

/** Pure helper: courses belonging to a university (empty when no university). */
export function filterCoursesByUniversity(
  courses: Course[],
  universityId: string | null | undefined
): Course[] {
  if (!universityId) return []
  return courses.filter((course) => course.universityId === universityId)
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
