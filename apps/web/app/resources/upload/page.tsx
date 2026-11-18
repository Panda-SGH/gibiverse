import { UploadResourceButton } from "@/components/upload-resource-button"
import { client } from "@gibiverse/api-client"

export default async function ResourcesUploadPage() {
  const [univRes, deptRes, courseRes] = await Promise.all([
    client.api.universities.$get(),
    client.api.departments.$get(),
    client.api.courses.$get(),
  ])

  const universities = univRes.ok ? await univRes.json() : []
  const departments = deptRes.ok ? await deptRes.json() : []
  const courses = courseRes.ok ? await courseRes.json() : []

  const primaryUniversity = universities[0] ?? null
  const scopedDepartments = primaryUniversity
    ? departments.filter((d) => d.universityId === primaryUniversity.id)
    : departments

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Upload Resource</h1>
        <p className="text-sm text-muted-foreground">
          Share academic resources with your course.
        </p>
      </div>
      <UploadResourceButton
        departments={scopedDepartments}
        courses={courses}
        autoOpen
      />
    </div>
  )
}
