import { Library } from "lucide-react"
import { listCourses, listDepartments, listUniversities } from "@/lib/academic"
import { CourseDirectoryClient } from "./course-directory-client"

export default async function CoursesPage() {
  const [universities, departments, courses] = await Promise.all([
    listUniversities(),
    listDepartments(),
    listCourses(),
  ])

  const primaryUniversity = universities[0] ?? null
  const scopedDepartments = primaryUniversity
    ? departments.filter((d) => d.universityId === primaryUniversity.id)
    : departments

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Library className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Course Directory
          </h1>
          <p className="text-sm text-muted-foreground">
            {primaryUniversity
              ? `Browse departments and courses at ${primaryUniversity.name}.`
              : "Browse academic departments and their offered courses."}
          </p>
        </div>
      </div>

      <CourseDirectoryClient
        departments={scopedDepartments}
        courses={courses}
      />
    </div>
  )
}
