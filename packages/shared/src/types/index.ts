/**
 * Shared domain types foundation for Gibiverse.
 */
export type Semester = 1 | 2 | "summer"

export interface AcademicPeriod {
  year: number
  semester: Semester
}

export * from "./vote.js"
