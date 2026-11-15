export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024
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

export const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/png",
  "image/jpeg",
  "image/webp",
])

export const RESOURCE_TYPES = [
  "exam",
  "notes",
  "slides",
  "assignment",
  "lab",
  "other",
] as const

export const SEMESTERS = ["1", "2", "summer"] as const

export type ResourceType = (typeof RESOURCE_TYPES)[number]
export type Semester = (typeof SEMESTERS)[number]

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

export function validateUploadFile(file: FileLike): {
  valid: boolean
  error?: string
} {
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
  const isAllowedMime = ALLOWED_MIME_TYPES.has(file.type)

  if (!isAllowedExt && !isAllowedMime) {
    return {
      valid: false,
      error: `Unsupported format (${extension || "unknown"}). Allowed formats: PDF, DOCX, PPTX, PNG, JPG, WebP.`,
    }
  }

  return { valid: true }
}

export function isResourceType(value: string): value is ResourceType {
  return (RESOURCE_TYPES as readonly string[]).includes(value)
}

export function isSemester(value: string): value is Semester {
  return (SEMESTERS as readonly string[]).includes(value)
}
