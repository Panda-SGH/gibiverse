"use client"

import dynamic from "next/dynamic"
import type { ResourcePreviewType } from "@/app/resources/presentation"
import { resourcePreviewUrl } from "@/app/resources/presentation"
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

export function ResourcePreview({
  resourceId,
  fileName,
  fileSize,
  previewType,
  title,
}: {
  resourceId: string
  fileName: string
  fileSize: number
  previewType: ResourcePreviewType
  title: string
}) {
  const previewUrl = resourcePreviewUrl(resourceId)

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
      resourceId={resourceId}
      fileName={fileName}
      fileSize={fileSize}
      message="Presentations and unsupported resources are download-only"
    />
  )
}
