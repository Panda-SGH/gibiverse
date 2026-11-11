import { BookOpen } from "lucide-react"
import { UploadResourceButton } from "@/components/upload-resource-button"
import { listCourses, listDepartments, listUniversities } from "@/lib/academic"
import { listResources } from "@/lib/resource-catalog"
import { ResourceCatalogClient } from "./resource-catalog-client"

export default async function ResourcesPage() {
  const [universities, departments, courses, resources] = await Promise.all([
    listUniversities(),
    listDepartments(),
    listCourses(),
    listResources(),
  ])

  const primaryUniversity = universities[0] ?? null
  const scopedDepartments = primaryUniversity
    ? departments.filter((d) => d.universityId === primaryUniversity.id)
    : departments

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Course Resources
            </h1>
            <p className="text-sm text-muted-foreground">
              Explore past exams, lecture notes, slides, and assignments across
              courses.
            </p>
          </div>
        </div>
        <UploadResourceButton
          departments={scopedDepartments}
          courses={courses}
        />
      </div>

      <ResourceCatalogClient
        departments={scopedDepartments}
        courses={courses}
        initialResources={resources}
      />
    </div>
  )
}
