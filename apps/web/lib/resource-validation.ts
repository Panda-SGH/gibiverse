export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB
export const MAX_FILE_SIZE_MB = 50

export const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".pptx",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
] as const

export const ALLOWED_MIME_TYPES: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    ".pptx",
  "image/png": ".png",
  "image/jpeg": ".jpg, .jpeg",
  "image/webp": ".webp",
}

export type ResourceType =
  | "exam"
  | "notes"
  | "slides"
  | "assignment"
  | "lab"
  | "other"

export type Semester = "1" | "2" | "summer"

export interface FileValidationResult {
  valid: boolean
  error?: string
  formatLabel?: string
  previewType?: "pdf" | "docx" | "image" | "download-only"
}

export type FileLike = {
  name: string
  size: number
  type: string
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function validateFile(file: FileLike): FileValidationResult {
  if (file.size === 0) {
    return { valid: false, error: "File is empty (0 bytes)." }
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size (${formatBytes(file.size)}) exceeds the maximum allowed limit of ${MAX_FILE_SIZE_MB} MB.`,
    }
  }

  const name = file.name.toLowerCase()
  const extension = "." + (name.split(".").pop() ?? "")

  const isAllowedExt = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext))
  const isAllowedMime = Object.keys(ALLOWED_MIME_TYPES).includes(file.type)

  if (!isAllowedExt && !isAllowedMime) {
    return {
      valid: false,
      error: `Unsupported format (${extension || "unknown"}). Allowed formats: PDF, DOCX, PPTX, PNG, JPG, WebP.`,
    }
  }

  let previewType: "pdf" | "docx" | "image" | "download-only" = "download-only"
  if (extension === ".pdf" || file.type === "application/pdf") {
    previewType = "pdf"
  } else if (
    extension === ".docx" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    previewType = "docx"
  } else if (
    [".png", ".jpg", ".jpeg", ".webp"].includes(extension) ||
    file.type.startsWith("image/")
  ) {
    previewType = "image"
  }

  let formatLabel = "Document"
  if (previewType === "pdf") formatLabel = "PDF Document"
  else if (previewType === "docx") formatLabel = "Word Document"
  else if (previewType === "image") formatLabel = "Image"
  else if (extension === ".pptx")
    formatLabel = "PowerPoint Presentation (Download-only)"

  return {
    valid: true,
    formatLabel,
    previewType,
  }
}

export function sanitizeTitleFromFilename(filename: string): string {
  const withoutExt = filename.replace(/\.[^/.]+$/, "")
  const cleaned = withoutExt.replace(/[_-]+/g, " ")
  return cleaned
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function detectResourceType(filename: string): ResourceType {
  const lower = filename.toLowerCase()
  if (/exam|midterm|final|quiz|test|paper/.test(lower)) return "exam"
  if (/slide|presentation|lecture|deck|ch\d+|session/.test(lower))
    return "slides"
  if (/note|summary|cheatsheet|study|review/.test(lower)) return "notes"
  if (/assign|homework|hw|problem|set|task|proj/.test(lower))
    return "assignment"
  if (/lab|experiment|practical|worksheet/.test(lower)) return "lab"
  return "other"
}
