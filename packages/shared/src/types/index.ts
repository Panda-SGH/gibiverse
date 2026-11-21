import type { Semester } from "./course-material.js"

/**
 * Shared domain types foundation for Gibiverse.
 */
export interface AcademicPeriod {
  year: number
  semester: Semester | 1 | 2
}

export * from "./vote.js"
export * from "./qa.js"
export * from "./search.js"
export * from "./course-material.js"
