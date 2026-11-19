import {
  COURSE_MATERIAL_TYPES,
  SEMESTERS,
  type CourseMaterialType,
  type Semester,
} from "@gibiverse/shared/types"

export {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  MIN_ACADEMIC_YEAR,
  MAX_ACADEMIC_YEAR,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  COURSE_MATERIAL_TYPES,
  SEMESTERS,
  type CourseMaterialType,
  type Semester,
} from "@gibiverse/shared/types"

export {
  validateFile,
  validateFile as validateUploadFile,
  type FileLike,
} from "@gibiverse/shared/validation"

export { formatBytes } from "@gibiverse/shared/utils"

export function isCourseMaterialType(
  value: string
): value is CourseMaterialType {
  return (COURSE_MATERIAL_TYPES as readonly string[]).includes(value)
}

export function isSemester(value: string): value is Semester {
  return (SEMESTERS as readonly string[]).includes(value)
}
