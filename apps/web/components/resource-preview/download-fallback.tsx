import { FileWarning } from "lucide-react"
import { Button } from "@gibiverse/ui/components/button"
import { formatBytes } from "@/lib/resource-validation"
import { resourceDownloadUrl } from "@/app/resources/presentation"

export function DownloadFallback({
  resourceId,
  fileName,
  fileSize,
  message = "This resource type can't be previewed in the browser",
}: {
  resourceId: string
  fileName: string
  fileSize: number
  message?: string
}) {
  return (
    <div
      className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border bg-muted/30 px-6 py-12 text-center"
      data-testid="preview-fallback"
    >
      <div className="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <FileWarning className="size-6" />
      </div>
      <div className="flex max-w-md flex-col gap-1">
        <p className="text-base font-medium text-foreground">{fileName}</p>
        <p className="text-sm text-muted-foreground">
          {message}
          <span aria-hidden="true"> · </span>
          {formatBytes(fileSize)}
        </p>
      </div>
      <Button
        nativeButton={false}
        render={
          <a href={resourceDownloadUrl(resourceId)} download={fileName} />
        }
      >
        Download
      </Button>
    </div>
  )
}
