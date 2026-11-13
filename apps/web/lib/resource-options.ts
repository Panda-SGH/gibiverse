import type { ResourceType, Semester } from "./resource-validation"

export const resourceTypePillLabels: Record<ResourceType, string> = {
  exam: "Exam",
  notes: "Notes",
  slides: "Slides",
  assignment: "Assignment",
  lab: "Lab",
  other: "Other",
}

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

export const semesterOptions: Array<{ value: Semester; label: string }> = [
  { value: "1", label: "Semester 1" },
  { value: "2", label: "Semester 2" },
  { value: "summer", label: "Summer" },
]

export function yearOptions(now = new Date()): number[] {
  const current = now.getFullYear()
  return Array.from({ length: 8 }, (_, i) => current - i)
}
