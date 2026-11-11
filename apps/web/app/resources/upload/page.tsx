import { UploadResourceButton } from "@/components/upload-resource-button"
import { listCourses, listDepartments, listUniversities } from "@/lib/academic"

export default async function ResourcesUploadPage() {
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
    <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Upload Resource</h1>
        <p className="text-sm text-muted-foreground">
          Share academic materials with your course.
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
