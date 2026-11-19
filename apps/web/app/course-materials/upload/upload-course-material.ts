import type { CourseMaterialType } from "@gibiverse/shared/types"

export type UploadCourseMaterialPayload = {
  file: File
  title: string
  courseId: string
  courseMaterialType: CourseMaterialType | string
  resourceType?: string
  year: number
  semester: string
  description?: string
}

export type UploadCourseMaterialResult = {
  id: string
  title: string
}

export function uploadCourseMaterial(
  payload: UploadCourseMaterialPayload,
  onProgress?: (percent: number) => void
): Promise<UploadCourseMaterialResult> {
  return new Promise((resolve, reject) => {
    const form = new FormData()
    form.set("file", payload.file)
    form.set("title", payload.title)
    form.set("courseId", payload.courseId)
    form.set(
      "courseMaterialType",
      (payload.courseMaterialType || payload.resourceType) as string
    )
    form.set("year", String(payload.year))
    form.set("semester", payload.semester)
    if (payload.description?.trim()) {
      form.set("description", payload.description.trim())
    }

    const xhr = new XMLHttpRequest()
    xhr.open("POST", "/api/course-materials")
    xhr.responseType = "json"

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return
      const percent = Math.round((event.loaded / event.total) * 100)
      onProgress?.(percent)
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response as UploadCourseMaterialResult)
        return
      }
      const message =
        (xhr.response && typeof xhr.response === "object"
          ? (xhr.response as { error?: string }).error
          : null) || `Upload failed (${xhr.status})`
      reject(new Error(message))
    }

    xhr.onerror = () => {
      reject(new Error("Network error during upload"))
    }

    xhr.send(form)
  })
}

// Backwards compatibility aliases
export const uploadResource = uploadCourseMaterial
export type UploadResourcePayload = UploadCourseMaterialPayload
export type UploadResourceResult = UploadCourseMaterialResult
