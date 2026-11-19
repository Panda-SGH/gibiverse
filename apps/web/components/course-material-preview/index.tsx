"use client"

import dynamic from "next/dynamic"
import type { CourseMaterialPreviewType } from "@/app/course-materials/presentation"
import { courseMaterialPreviewUrl } from "@/app/course-materials/presentation"
import { DownloadFallback } from "./download-fallback"
import { ImagePreview } from "./image-preview"
import { DocxPreview } from "./docx-preview"

const PdfPreview = dynamic(
  () => import("./pdf-preview").then((mod) => mod.PdfPreview),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-muted-foreground">Loading PDF preview…</p>
    ),
  }
)

export function CourseMaterialPreview({
  courseMaterialId,
  resourceId,
  fileName,
  fileSize,
  previewType,
  title,
}: {
  courseMaterialId?: string
  resourceId?: string
  fileName: string
  fileSize: number
  previewType: CourseMaterialPreviewType
  title: string
}) {
  const id = courseMaterialId || resourceId || ""
  const previewUrl = courseMaterialPreviewUrl(id)

  if (previewType === "pdf") {
    return <PdfPreview fileUrl={previewUrl} />
  }

  if (previewType === "docx") {
    return <DocxPreview fileUrl={previewUrl} />
  }

  if (previewType === "image") {
    return <ImagePreview src={previewUrl} alt={title} />
  }

  return (
    <DownloadFallback
      courseMaterialId={id}
      fileName={fileName}
      fileSize={fileSize}
      message="Presentations and unsupported course materials are download-only"
    />
  )
}

// Backwards compatibility alias
export const ResourcePreview = CourseMaterialPreview
