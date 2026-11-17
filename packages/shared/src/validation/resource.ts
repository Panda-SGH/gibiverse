import { z } from "zod"
import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  MIN_ACADEMIC_YEAR,
  MAX_ACADEMIC_YEAR,
  resourceTypeSchema,
  semesterSchema,
} from "../types/resource.js"
import { formatBytes } from "../utils/resource.js"

export type FileLike = {
  name: string
  size: number
  type: string
}

export interface FileValidationResult {
  valid: boolean
  error?: string
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
  const isAllowedExt = ALLOWED_EXTENSIONS.some((ext: string) =>
    name.endsWith(ext)
  )
  const isAllowedMime = (ALLOWED_MIME_TYPES as readonly string[]).includes(
    file.type
  )

  if (!isAllowedExt && !isAllowedMime) {
    return {
      valid: false,
      error: `Unsupported format (${extension || "unknown"}). Allowed formats: PDF, DOCX, PPTX, PNG, JPG, WebP.`,
    }
  }

  return { valid: true }
}

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((val) => (val && val.length > 0 ? val : undefined))

export const listResourcesQuerySchema = z.object({
  resourceType: resourceTypeSchema.optional(),
  departmentId: optionalString,
  courseId: optionalString,
})

export type ListResourcesQuery = z.infer<typeof listResourcesQuerySchema>

export const uploadResourceSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    courseId: z.string().trim().min(1, "Course is required"),
    resourceType: resourceTypeSchema,
    year: z.coerce
      .number({ message: "Invalid academic year" })
      .int("Invalid academic year")
      .min(MIN_ACADEMIC_YEAR, "Invalid academic year")
      .max(MAX_ACADEMIC_YEAR, "Invalid academic year"),
    semester: semesterSchema,
    description: z
      .string()
      .trim()
      .optional()
      .nullable()
      .transform((val) => (val ? val : null)),
    file: z.custom<File>(
      (val) => typeof File !== "undefined" && val instanceof File,
      "File is required"
    ),
  })
  .superRefine((data, ctx) => {
    if (data.file && typeof data.file.size === "number") {
      const fileValidation = validateFile({
        name: data.file.name,
        size: data.file.size,
        type: data.file.type,
      })
      if (!fileValidation.valid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: fileValidation.error ?? "Invalid file",
          path: ["file"],
        })
      }
    }
  })

export type UploadResourceInput = z.infer<typeof uploadResourceSchema>
