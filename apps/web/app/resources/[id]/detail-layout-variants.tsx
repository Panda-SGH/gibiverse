"use client"

import Link from "next/link"
import {
  ArrowLeft,
  Download,
  FileText,
  Calendar,
  User,
  GraduationCap,
  HardDrive,
  Clock,
  Sparkles,
} from "lucide-react"
import { Badge } from "@gibiverse/ui/components/badge"
import { Button } from "@gibiverse/ui/components/button"
import { ResourcePreview } from "@/components/resource-preview"
import {
  formatAcademicPeriod,
  formatRelativeUploadDate,
} from "@/lib/formatters"
import {
  type ResourcePreviewType,
  resourceDownloadUrl,
} from "../presentation"
import { formatBytes } from "@gibiverse/shared/utils"

export type DetailResourceData = {
  id: string
  title: string
  description: string | null
  fileName: string
  fileSize: number
  mimeType: string
  resourceType: string
  studentName: string
  courseCode: string
  courseName: string
  year: number
  semester: string
  createdAt: string
  typeLabel: string
  previewType: ResourcePreviewType
}

function formatUploadDate(createdAt: string): string {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(createdAt))
}

/**
 * Variant A: Split Reader (Side-by-side Desktop Grid with Sticky Info/Actions Sidebar)
 * Document viewing stage takes prime width on left; sticky right panel has metadata and CTA.
 */
export function VariantA({ resource }: { resource: DetailResourceData }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top back navigation */}
      <div className="mb-6 flex items-center justify-between">
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
        <span className="text-xs font-mono text-muted-foreground">
          {resource.courseCode} · {resource.fileName}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Main Document Reading Stage (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <FileText className="size-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Document Preview
              </h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {resource.fileName} ({formatBytes(resource.fileSize)})
            </span>
          </div>

          <div className="rounded-xl border bg-muted/20 p-2 sm:p-4 shadow-sm">
            <ResourcePreview
              resourceId={resource.id}
              fileName={resource.fileName}
              fileSize={resource.fileSize}
              previewType={resource.previewType}
              title={resource.title}
            />
          </div>
        </div>

        {/* Sticky Sidebar Details & Actions (4 cols) */}
        <div className="lg:col-span-4">
          <div className="sticky top-20 flex flex-col gap-6 rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-emerald-600/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                {resource.typeLabel}
              </Badge>
              <Badge variant="secondary">{resource.courseCode}</Badge>
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {resource.title}
              </h1>
              {resource.description ? (
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {resource.description}
                </p>
              ) : null}
            </div>

            {/* Primary Action Button */}
            <Button
              size="lg"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow"
              nativeButton={false}
              render={
                <a
                  href={resourceDownloadUrl(resource.id)}
                  download={resource.fileName}
                />
              }
              data-testid="download-button"
            >
              <Download className="size-5 mr-2" />
              Download {resource.fileName.split(".").pop()?.toUpperCase()} ({formatBytes(resource.fileSize)})
            </Button>

            {/* Metadata Section */}
            <div className="border-t pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Resource Details
              </h3>
              <dl className="flex flex-col gap-3.5 text-sm">
                <div className="flex items-start gap-3">
                  <GraduationCap className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                  <div>
                    <dt className="text-xs text-muted-foreground">Course</dt>
                    <dd className="font-medium text-foreground">
                      {resource.courseCode} · {resource.courseName}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                  <div>
                    <dt className="text-xs text-muted-foreground">Academic Period</dt>
                    <dd className="font-medium text-foreground">
                      {formatAcademicPeriod(resource.year, resource.semester)}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                  <div>
                    <dt className="text-xs text-muted-foreground">Uploaded by</dt>
                    <dd className="font-medium text-foreground">{resource.studentName}</dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                  <div>
                    <dt className="text-xs text-muted-foreground">Upload Date</dt>
                    <dd className="font-medium text-foreground">
                      {formatUploadDate(resource.createdAt)} ({formatRelativeUploadDate(resource.createdAt)})
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <HardDrive className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                  <div>
                    <dt className="text-xs text-muted-foreground">File Size</dt>
                    <dd className="font-medium text-foreground">{formatBytes(resource.fileSize)}</dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Variant B: Academic Brief (Elevated Centered Hero Card + Focused Document Stage)
 * Cohesive single-column reading flow with an elevated hero card highlighting key context and actions.
 */
export function VariantB({ resource }: { resource: DetailResourceData }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
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

      {/* Hero Header Card */}
      <div className="mb-8 rounded-2xl border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-500/5">
              {resource.typeLabel}
            </Badge>
            <Badge variant="secondary">{resource.courseCode}</Badge>
            <span className="text-xs text-muted-foreground">
              {formatAcademicPeriod(resource.year, resource.semester)}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            Uploaded {formatRelativeUploadDate(resource.createdAt)}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {resource.title}
        </h1>

        {resource.description ? (
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {resource.description}
          </p>
        ) : null}

        {/* Separator / Footer of Hero */}
        <div className="mt-6 pt-6 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-700 font-semibold text-sm">
              {resource.studentName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Uploaded by</p>
              <p className="text-sm font-medium text-foreground">{resource.studentName}</p>
            </div>
            <span className="hidden sm:inline text-muted-foreground/40">·</span>
            <div className="hidden sm:block">
              <p className="text-xs text-muted-foreground">Course</p>
              <p className="text-sm font-medium text-foreground">{resource.courseName}</p>
            </div>
          </div>

          <Button
            size="lg"
            className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
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
            Download ({formatBytes(resource.fileSize)})
          </Button>
        </div>
      </div>

      {/* Document Preview Section */}
      <section aria-labelledby="preview-heading" className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2
            id="preview-heading"
            className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2"
          >
            <Sparkles className="size-4 text-emerald-600" />
            Document Preview
          </h2>
          <span className="text-xs font-mono text-muted-foreground">
            {resource.fileName}
          </span>
        </div>
        <div className="rounded-xl border bg-card p-2 sm:p-4 shadow-sm">
          <ResourcePreview
            resourceId={resource.id}
            fileName={resource.fileName}
            fileSize={resource.fileSize}
            previewType={resource.previewType}
            title={resource.title}
          />
        </div>
      </section>
    </div>
  )
}

/**
 * Variant C: Workspace & Info Ribbon (Max-width Workspace Canvas with Compact Horizontal Metadata Strip)
 * Full-width workspace mode with a structured multi-column spec ribbon across top and maximized preview canvas.
 */
export function VariantC({ resource }: { resource: DetailResourceData }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header & Quick Action Row */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/resources" />}
            className="size-9 p-0 text-muted-foreground hover:text-foreground"
            aria-label="Back to resources"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                {resource.courseCode}
              </span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{resource.typeLabel}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {resource.title}
            </h1>
          </div>
        </div>

        <Button
          size="default"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shrink-0"
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
          Download {resource.fileName.split(".").pop()?.toUpperCase()}
        </Button>
      </div>

      {/* Horizontal Metadata Ribbon */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 rounded-xl border bg-muted/40 p-4 text-xs">
        <div className="flex flex-col gap-1 border-r pr-3">
          <span className="text-muted-foreground">Course</span>
          <span className="font-semibold text-foreground truncate" title={resource.courseName}>
            {resource.courseCode} · {resource.courseName}
          </span>
        </div>
        <div className="flex flex-col gap-1 border-r pr-3">
          <span className="text-muted-foreground">Academic Period</span>
          <span className="font-semibold text-foreground">
            {formatAcademicPeriod(resource.year, resource.semester)}
          </span>
        </div>
        <div className="flex flex-col gap-1 sm:border-r pr-3">
          <span className="text-muted-foreground">Uploaded by</span>
          <span className="font-semibold text-foreground truncate">
            {resource.studentName}
          </span>
        </div>
        <div className="flex flex-col gap-1 border-r pr-3">
          <span className="text-muted-foreground">Uploaded</span>
          <span className="font-semibold text-foreground">
            {formatUploadDate(resource.createdAt)}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground">File Size</span>
          <span className="font-semibold text-foreground font-mono">
            {formatBytes(resource.fileSize)}
          </span>
        </div>
      </div>

      {resource.description ? (
        <p className="mb-6 text-sm text-muted-foreground max-w-3xl leading-relaxed">
          {resource.description}
        </p>
      ) : null}

      {/* Expansive Reading Canvas */}
      <div className="rounded-2xl border bg-card p-3 sm:p-6 shadow-sm">
        <ResourcePreview
          resourceId={resource.id}
          fileName={resource.fileName}
          fileSize={resource.fileSize}
          previewType={resource.previewType}
          title={resource.title}
        />
      </div>
    </div>
  )
}
