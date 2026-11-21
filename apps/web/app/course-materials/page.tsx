import { BookOpen } from "lucide-react"
import { UploadCourseMaterialButton } from "@/components/upload-course-material-button"
import { client } from "@gibiverse/api-client"
import { CourseMaterialCatalogClient } from "./course-material-catalog-client"

export default async function CourseMaterialsPage() {
  const [univRes, courseRes, materialsRes] = await Promise.all([
    client.api.universities.$get(),
    client.api.courses.$get(),
    client.api["course-materials"].$get({ query: {} }),
  ])

  const universities = univRes.ok ? await univRes.json() : []
  const courses = courseRes.ok ? await courseRes.json() : []
  const courseMaterials = materialsRes.ok ? await materialsRes.json() : []

  const primaryUniversity = universities[0] ?? null

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Course Materials
            </h1>
            <p className="text-sm text-muted-foreground">
              Explore past exams, lecture notes, slides, and assignments across
              courses.
            </p>
          </div>
        </div>
        <UploadCourseMaterialButton
          universities={universities}
          courses={courses}
        />
      </div>

      <CourseMaterialCatalogClient
        universities={universities}
        courses={courses}
        initialCourseMaterials={courseMaterials}
        universityName={primaryUniversity?.name ?? null}
      />
    </div>
  )
}
