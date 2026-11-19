export type UploadResourcePayload = {
  file: File
  title: string
  courseId: string
  resourceType: string
  year: number
  semester: string
  description?: string
}

export type UploadResourceResult = {
  id: string
  title: string
}

export function uploadResource(
  payload: UploadResourcePayload,
  onProgress?: (percent: number) => void
): Promise<UploadResourceResult> {
  return new Promise((resolve, reject) => {
    const form = new FormData()
    form.set("file", payload.file)
    form.set("title", payload.title)
    form.set("courseId", payload.courseId)
    form.set("courseMaterialType", payload.resourceType)
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
        resolve(xhr.response as UploadResourceResult)
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
