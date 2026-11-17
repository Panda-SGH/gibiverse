import { z } from "zod"

/**
 * Allowed resource classifications in Gibiverse.
 */
export const RESOURCE_TYPES = [
  "exam",
  "notes",
  "slides",
  "assignment",
  "lab",
  "other",
] as const

export const resourceTypeSchema = z.enum(RESOURCE_TYPES, {
  message: "Invalid resource type",
})

export type ResourceType = z.infer<typeof resourceTypeSchema>

/**
 * Allowed academic semesters in Gibiverse.
 */
export const SEMESTERS = ["1", "2", "summer"] as const

export const semesterSchema = z.union(
  [
    z.literal("1"),
    z.literal("2"),
    z.literal("summer"),
    z.literal(1).transform(() => "1" as const),
    z.literal(2).transform(() => "2" as const),
  ],
  {
    message: "Invalid semester",
  }
)

export type Semester = (typeof SEMESTERS)[number]

/**
 * File constraint constants.
 */
export const MAX_FILE_SIZE_MB = 50
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".pptx",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
] as const

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/png",
  "image/jpeg",
  "image/webp",
] as const

/**
 * UI Pill labels for ResourceType.
 */
export const resourceTypePillLabels: Record<ResourceType, string> = {
  exam: "Exam",
  notes: "Notes",
  slides: "Slides",
  assignment: "Assignment",
  lab: "Lab",
  other: "Other",
}

/**
 * Select options for ResourceType.
 */
export const resourceTypeOptions: Array<{
  value: ResourceType
  label: string
}> = [
  { value: "exam", label: "Past Exam" },
  { value: "notes", label: "Lecture Notes" },
  { value: "slides", label: "Slides / Deck" },
  { value: "assignment", label: "Assignment" },
  { value: "lab", label: "Lab Material" },
  { value: "other", label: "Other" },
]

/**
 * Select options for Semester.
 */
export const semesterOptions: Array<{ value: Semester; label: string }> = [
  { value: "1", label: "Semester 1" },
  { value: "2", label: "Semester 2" },
  { value: "summer", label: "Summer" },
]

/**
 * Generates academic year choices (defaults to current year and 7 years prior).
 */
export function yearOptions(now = new Date()): number[] {
  const current = now.getFullYear()
  return Array.from({ length: 8 }, (_, i) => current - i)
}
