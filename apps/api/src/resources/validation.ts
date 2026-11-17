// Re-export canonical resource domain definitions from @gibiverse/shared
export {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  MIN_ACADEMIC_YEAR,
  MAX_ACADEMIC_YEAR,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  RESOURCE_TYPES,
  SEMESTERS,
  type ResourceType,
  type Semester,
} from "@gibiverse/shared/types"

export {
  validateFile,
  validateFile as validateUploadFile,
  type FileLike,
} from "@gibiverse/shared/validation"

export { formatBytes } from "@gibiverse/shared/utils"

import {
  RESOURCE_TYPES,
  SEMESTERS,
  type ResourceType,
  type Semester,
} from "@gibiverse/shared/types"

export function isResourceType(value: string): value is ResourceType {
  return (RESOURCE_TYPES as readonly string[]).includes(value)
}

export function isSemester(value: string): value is Semester {
  return (SEMESTERS as readonly string[]).includes(value)
}
