import { UploadCourseMaterialButton } from "@/components/upload-course-material-button"
import { client } from "@gibiverse/api-client"

export default async function CourseMaterialsUploadPage() {
  const [univRes, courseRes] = await Promise.all([
    client.api.universities.$get(),
    client.api.courses.$get(),
  ])

  const universities = univRes.ok ? await univRes.json() : []
  const courses = courseRes.ok ? await courseRes.json() : []

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Upload Course Material
        </h1>
        <p className="text-sm text-muted-foreground">
          Share academic course materials with your course.
        </p>
      </div>
      <UploadCourseMaterialButton
        universities={universities}
        courses={courses}
        autoOpen
      />
    </div>
  )
}
