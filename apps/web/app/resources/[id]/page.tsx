import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Download } from "lucide-react"
import { Badge } from "@gibiverse/ui/components/badge"
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
import { resourceTypeOptions } from "@/lib/resource-options"
import { formatBytes } from "@/lib/resource-validation"

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
  const res = await client.api.resources[":id"]
    .$get({
      param: { id },
    })
    .catch(() => null)

  if (!res || !res.ok) notFound()
  const resource = await res.json()

  const previewType = resolvePreviewType(resource.fileName, resource.mimeType)
  const typeLabel =
    resourceTypeOptions.find((option) => option.value === resource.resourceType)
      ?.label ?? resource.resourceType

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        className="mb-6"
        nativeButton={false}
        render={<Link href="/resources" />}
      >
        <ArrowLeft data-icon="inline-start" />
        Back to resources
      </Button>

      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{resource.courseCode}</Badge>
            <Badge variant="outline">{typeLabel}</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {resource.title}
          </h1>
          {resource.description ? (
            <p className="max-w-2xl text-sm text-muted-foreground">
              {resource.description}
            </p>
          ) : null}
          <dl className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <div>
              <dt className="font-medium text-foreground">Student</dt>
              <dd>{resource.studentName}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Course</dt>
              <dd>
                {resource.courseCode} · {resource.courseName}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Academic period</dt>
              <dd>
                {formatAcademicPeriod(resource.year, resource.semester)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Upload date</dt>
              <dd>
                <time dateTime={resource.createdAt}>
                  {formatUploadDate(resource.createdAt)}
                  <span aria-hidden="true"> · </span>
                  {formatRelativeUploadDate(resource.createdAt)}
                </time>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Size</dt>
              <dd>
                {resource.fileName}
                <span aria-hidden="true"> · </span>
                {formatBytes(resource.fileSize)}
              </dd>
            </div>
          </dl>
        </div>

        <Button
          size="lg"
          className="shrink-0"
          nativeButton={false}
          render={
            <a
              href={resourceDownloadUrl(resource.id)}
              download={resource.fileName}
            />
          }
          data-testid="download-button"
        >
          <Download data-icon="inline-start" />
          Download
        </Button>
      </div>

      <section aria-labelledby="preview-heading" className="flex flex-col gap-3">
        <h2
          id="preview-heading"
          className="text-lg font-semibold text-foreground"
        >
          Preview
        </h2>
        <ResourcePreview
          resourceId={resource.id}
          fileName={resource.fileName}
          fileSize={resource.fileSize}
          previewType={previewType}
          title={resource.title}
        />
      </section>
    </div>
  )
}
