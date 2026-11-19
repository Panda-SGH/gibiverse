import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Download } from "lucide-react"
import { Button } from "@gibiverse/ui/components/button"
import { ResourcePreview } from "@/components/resource-preview"
import { client } from "@gibiverse/api-client"
import {
  formatAcademicPeriod,
  formatRelativeUploadDate,
} from "@/lib/formatters"
import {
  resolvePreviewType,
  resourceDownloadUrl,
} from "../presentation"
import { formatBytes } from "@gibiverse/shared/utils"

type ResourcePageProps = {
  params: Promise<{ id: string }>
}

function formatUploadDate(createdAt: string): string {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(createdAt))
}

export default async function ResourceDetailPage({ params }: ResourcePageProps) {
  const { id } = await params
  const [res, coursesRes, deptRes, univRes] = await Promise.all([
    client.api["course-materials"][":id"]
      .$get({
        param: { id },
      })
      .catch(() => null),
    client.api.courses.$get().catch(() => null),
    client.api.departments.$get().catch(() => null),
    client.api.universities.$get().catch(() => null),
  ])

  if (!res || !res.ok) notFound()
  const resource = await res.json()

  const courses = coursesRes && coursesRes.ok ? await coursesRes.json() : []
  const departments = deptRes && deptRes.ok ? await deptRes.json() : []
  const universities = univRes && univRes.ok ? await univRes.json() : []

  const matchedCourse = courses.find((c) => c.id === resource.courseId)
  const matchedDept = departments.find(
    (d) => d.id === matchedCourse?.departmentId
  )
  const matchedUni = universities.find(
    (u) => u.id === matchedDept?.universityId
  )

  const universityName =
    matchedUni?.name ?? universities[0]?.name ?? "Gibiverse University"
  const departmentName = matchedDept?.name ?? "Computer Science"

  const previewType = resolvePreviewType(resource.fileName, resource.mimeType)
  const fileExt = resource.fileName.split(".").pop()?.toUpperCase() ?? "FILE"

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top back navigation */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/resources" />}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to resources
        </Button>
      </div>

      {/* Uncarded Header Section */}
      <div className="mb-8 flex flex-col gap-3">
        {/* Row 1: Title on left, Download button to far right */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground sm:max-w-2xl">
            {resource.title}
          </h1>

          <Button
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shrink-0 shadow-sm"
            nativeButton={false}
            render={
              <a
                href={resourceDownloadUrl(resource.id)}
                download={resource.fileName}
              />
            }
            data-testid="download-button"
          >
            <Download className="size-4 mr-2" />
            Download
            <span className="ml-2.5 rounded bg-emerald-700/80 px-2 py-0.5 text-xs font-mono font-normal tracking-wide">
              {fileExt} · {formatBytes(resource.fileSize)}
            </span>
          </Button>
        </div>

        {/* Row 2: University, Department, Course, Academic Year in middle */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-muted-foreground">
          <span>{universityName}</span>
          <span className="text-muted-foreground/40">·</span>
          <span>{departmentName}</span>
          <span className="text-muted-foreground/40">·</span>
          <span>
            {resource.courseCode} ({resource.courseName})
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span>{formatAcademicPeriod(resource.year, resource.semester)}</span>
        </div>

        {/* Row 3: Uploader name, upload time at bottom */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span>Uploaded by {resource.studentName}</span>
          <span className="text-muted-foreground/40">·</span>
          <span>
            {formatUploadDate(resource.createdAt)} ({formatRelativeUploadDate(resource.createdAt)})
          </span>
        </div>

        {/* Optional Description */}
        {resource.description ? (
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
            {resource.description}
          </p>
        ) : null}
      </div>

      {/* Document Preview Section */}
      <section aria-labelledby="preview-heading" className="flex flex-col gap-4">
        <div className="rounded-xl border bg-card p-2 sm:p-4 shadow-sm">
          <ResourcePreview
            resourceId={resource.id}
            fileName={resource.fileName}
            fileSize={resource.fileSize}
            previewType={previewType}
            title={resource.title}
          />
        </div>
      </section>
    </div>
  )
}
