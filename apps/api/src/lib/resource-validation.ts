// Re-export from canonical location for backward compatibility.
export {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  RESOURCE_TYPES,
  SEMESTERS,
  type ResourceType,
  type Semester,
  type FileLike,
  formatBytes,
  validateUploadFile,
  isResourceType,
  isSemester,
} from "../resources/validation.js"
