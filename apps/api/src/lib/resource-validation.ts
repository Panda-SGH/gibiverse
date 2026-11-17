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
  type FileValidationResult,
} from "@gibiverse/shared/validation"

export { formatBytes } from "@gibiverse/shared/utils"

export { isResourceType, isSemester } from "../resources/validation.js"
