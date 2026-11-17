import type { ResourceType, Semester } from "@gibiverse/shared/types"
import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
} from "@gibiverse/shared/types"
import { formatBytes } from "@gibiverse/shared/utils"
import {
  validateFile as coreValidateFile,
  type FileLike,
} from "@gibiverse/shared/validation"
import {
  resolvePreviewType,
  resolveFormatLabel,
  type ResourcePreviewType,
} from "../app/resources/presentation"

export {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  formatBytes,
  type ResourceType,
  type Semester,
  type FileLike,
}

export interface FileValidationResult {
  valid: boolean
  error?: string
  formatLabel?: string
  previewType?: ResourcePreviewType
}

export function validateFile(file: FileLike): FileValidationResult {
  const coreResult = coreValidateFile(file)
  if (!coreResult.valid) {
    return coreResult
  }

  const previewType = resolvePreviewType(file.name, file.type)
  const formatLabel = resolveFormatLabel(previewType, file.name)

  return {
    valid: true,
    previewType,
    formatLabel,
  }
}

export function sanitizeTitleFromFilename(filename: string): string {
  const withoutExt = filename.replace(/\.[^/.]+$/, "")
  const cleaned = withoutExt.replace(/[_-]+/g, " ")
  return cleaned
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function detectResourceType(filename: string): ResourceType {
  const lower = filename.toLowerCase()
  if (/exam|midterm|final|quiz|test|paper/.test(lower)) return "exam"
  if (/slide|presentation|lecture|deck|ch\d+|session/.test(lower))
    return "slides"
  if (/note|summary|cheatsheet|study|review/.test(lower)) return "notes"
  if (/assign|homework|hw|problem|set|task|proj/.test(lower))
    return "assignment"
  if (/lab|experiment|practical|worksheet/.test(lower)) return "lab"
  return "other"
}
