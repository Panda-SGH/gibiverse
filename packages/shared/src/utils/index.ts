import type { AcademicPeriod, Semester } from "../types/index.js"

/**
 * Shared domain utilities foundation for Gibiverse.
 */
export function formatAcademicPeriod(period: AcademicPeriod): string
export function formatAcademicPeriod(year: number, semester: Semester): string
export function formatAcademicPeriod(
  yearOrPeriod: number | AcademicPeriod,
  semester?: Semester
): string {
  const year =
    typeof yearOrPeriod === "object" ? yearOrPeriod.year : yearOrPeriod
  const sem =
    typeof yearOrPeriod === "object" ? yearOrPeriod.semester : semester!
  const semesterLabel = sem === "summer" ? "Summer" : `Semester ${sem}`
  return `${year} - ${semesterLabel}`
}

export * from "./vote.js"
export * from "./course-material.js"

