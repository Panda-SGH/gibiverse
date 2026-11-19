import { BookOpen } from "lucide-react"
import { UploadResourceButton } from "@/components/upload-resource-button"
import { client } from "@gibiverse/api-client"
import { ResourceCatalogClient } from "./resource-catalog-client"

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const variant =
    typeof resolvedParams.variant === "string" ? resolvedParams.variant : "D"

  const [univRes, deptRes, courseRes, resourcesRes] = await Promise.all([
    client.api.universities.$get(),
    client.api.departments.$get(),
    client.api.courses.$get(),
    client.api.resources.$get(),
  ])

  const universities = univRes.ok ? await univRes.json() : []
  const departments = deptRes.ok ? await deptRes.json() : []
  const courses = courseRes.ok ? await courseRes.json() : []
  const resources = resourcesRes.ok ? await resourcesRes.json() : []

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
        variant={variant}
        universityName={primaryUniversity?.name ?? null}
      />
    </div>
  )
}
