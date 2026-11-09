"use client"

import * as React from "react"
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Layers,
  Sparkles,
  ArrowRight,
  Check,
  RotateCcw,
  Plus,
  Copy,
  X,
  FileQuestion,
} from "lucide-react"
import {
  mockCourses,
  resourceTypeOptions,
  semesterOptions,
  yearOptions,
  type Course,
} from "./mock-data"
import {
  validateFile,
  sanitizeTitleFromFilename,
  detectResourceType,
  formatBytes,
  MAX_FILE_SIZE_MB,
  type ResourceType,
  type Semester,
} from "./validation"

interface QueuedFile {
  id: string
  file: { name: string; size: number; type: string }
  valid: boolean
  error?: string
  formatLabel?: string
  previewType?: "pdf" | "docx" | "image" | "download-only"
  // Metadata
  title: string
  courseId: string
  resourceType: ResourceType
  year: number
  semester: Semester
  description: string
  // Upload status
  status: "pending" | "uploading" | "success" | "error"
  progress: number
}

const sampleBatchPreset: Array<{ name: string; size: number; type: string }> = [
  {
    name: "CS201_Midterm_2024.pdf",
    size: 3.2 * 1024 * 1024,
    type: "application/pdf",
  },
  {
    name: "CS201_Final_Exam_2024.pdf",
    size: 4.8 * 1024 * 1024,
    type: "application/pdf",
  },
  {
    name: "Lecture_07_Binary_Heaps.docx",
    size: 1.9 * 1024 * 1024,
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  {
    name: "Raw_Lecture_Recordings.zip",
    size: 120 * 1024 * 1024,
    type: "application/zip", // Intentionally triggers both format and size error!
  },
]

export function VariantC() {
  const [queue, setQueue] = React.useState<QueuedFile[]>(() => {
    // Initial sample batch
    return sampleBatchPreset.map((f, i) => {
      const v = validateFile(f as File)
      return {
        id: `init-${i}`,
        file: f,
        valid: v.valid,
        error: v.error,
        formatLabel: v.formatLabel,
        previewType: v.previewType,
        title: sanitizeTitleFromFilename(f.name),
        courseId: "c1",
        resourceType: detectResourceType(f.name),
        year: 2024,
        semester: "1",
        description: "",
        status: "pending",
        progress: 0,
      }
    })
  })

  const [activeId, setActiveId] = React.useState<string>(queue[0]?.id || "")
  const [isDragging, setIsDragging] = React.useState(false)
  const [isBatchUploading, setIsBatchUploading] = React.useState(false)

  const activeItem = queue.find((q) => q.id === activeId) ?? queue[0]

  function addFilesToQueue(files: FileList | File[] | Array<{ name: string; size: number; type: string }>) {
    const newItems: QueuedFile[] = Array.from(files).map((f, i) => {
      const v = validateFile(f as File)
      return {
        id: `q-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        file: { name: f.name, size: f.size, type: f.type },
        valid: v.valid,
        error: v.error,
        formatLabel: v.formatLabel,
        previewType: v.previewType,
        title: sanitizeTitleFromFilename(f.name),
        courseId: "c1",
        resourceType: detectResourceType(f.name),
        year: 2024,
        semester: "1",
        description: "",
        status: "pending",
        progress: 0,
      }
    })

    setQueue((prev) => {
      const updated = [...prev, ...newItems]
      if (!activeId && updated.length > 0) {
        setActiveId(updated[0]!.id)
      }
      return updated
    })
  }

  function removeItem(id: string) {
    setQueue((prev) => {
      const filtered = prev.filter((item) => item.id !== id)
      if (activeId === id && filtered.length > 0) {
        setActiveId(filtered[0]!.id)
      }
      return filtered
    })
  }

  function updateActiveItem(patch: Partial<QueuedFile>) {
    if (!activeItem) return
    setQueue((prev) =>
      prev.map((item) => (item.id === activeItem.id ? { ...item, ...patch } : item))
    )
  }

  function applyActiveSettingsToAll() {
    if (!activeItem) return
    setQueue((prev) =>
      prev.map((item) =>
        item.valid
          ? {
              ...item,
              courseId: activeItem.courseId,
              year: activeItem.year,
              semester: activeItem.semester,
            }
          : item
      )
    )
  }

  function startBatchUpload() {
    const validItems = queue.filter((item) => item.valid && item.status !== "success")
    if (validItems.length === 0) return

    setIsBatchUploading(true)

    // Simulate progress per file
    const interval = setInterval(() => {
      setQueue((prev) => {
        let allDone = true
        const updated = prev.map((item) => {
          if (!item.valid || item.status === "success") return item
          const nextProg = Math.min(100, item.progress + Math.floor(Math.random() * 25) + 15)
          if (nextProg < 100) allDone = false
          const itemStatus: "success" | "uploading" = nextProg >= 100 ? "success" : "uploading"
          return {
            ...item,
            status: itemStatus,
            progress: nextProg,
          }
        })
        if (allDone) {
          clearInterval(interval)
          setIsBatchUploading(false)
        }
        return updated
      })
    }, 200)
  }

  const validCount = queue.filter((item) => item.valid).length
  const errorCount = queue.filter((item) => !item.valid).length
  const successCount = queue.filter((item) => item.status === "success").length

  return (
    <div className="min-h-[85vh] p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Batch Resource Uploader
            </h2>
            <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-medium">
              Variant C: Multi-File Queue & Inspector
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => addFilesToQueue(sampleBatchPreset)}
              className="px-2.5 py-1 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-purple-500 text-purple-700 dark:text-purple-300 transition flex items-center gap-1.5"
            >
              <Sparkles className="size-3.5" /> Reload Preset Batch
            </button>
            <span className="text-neutral-300 dark:text-neutral-700">|</span>
            <span className="text-neutral-500 font-mono">
              {validCount} ready, {errorCount} errors
            </span>
          </div>
        </div>

        {/* Split Container: Left Queue + Right Inspector */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
          {/* LEFT: Multi-File Queue */}
          <div className="md:col-span-5 border-r border-neutral-100 dark:border-neutral-800 p-4 flex flex-col bg-neutral-50/30 dark:bg-neutral-950/20">
            {/* Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                setIsDragging(false)
              }}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                if (e.dataTransfer.files) {
                  addFilesToQueue(e.dataTransfer.files)
                }
              }}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition mb-3 ${
                isDragging
                  ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/20"
                  : "border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 bg-white dark:bg-neutral-900"
              }`}
            >
              <input
                type="file"
                multiple
                className="hidden"
                id="batch-file-input"
                onChange={(e) => {
                  if (e.target.files) addFilesToQueue(e.target.files)
                }}
              />
              <label htmlFor="batch-file-input" className="cursor-pointer block">
                <Upload className="size-5 mx-auto text-purple-600 dark:text-purple-400 mb-1" />
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  Drop multiple files or browse
                </p>
                <p className="text-[10px] text-neutral-400">PDF, DOCX, PPTX, Images ≤ {MAX_FILE_SIZE_MB}MB</p>
              </label>
            </div>

            {/* Queue items list */}
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[360px] pr-1">
              {queue.length === 0 && (
                <div className="text-center py-8 text-neutral-400 text-xs">
                  No files in queue. Drop files to get started.
                </div>
              )}

              {queue.map((item) => {
                const isSelected = activeItem?.id === item.id
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveId(item.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition relative group ${
                      isSelected
                        ? "border-purple-500 bg-purple-50/40 dark:bg-purple-950/30 ring-1 ring-purple-500"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 bg-white dark:bg-neutral-900"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                          {item.file.name}
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          {formatBytes(item.file.size)} • {item.valid ? item.formatLabel : "Invalid file"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeItem(item.id)
                        }}
                        className="text-neutral-300 hover:text-red-500 p-0.5"
                        title="Remove from queue"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    {/* Status badge / progress */}
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      {item.valid ? (
                        item.status === "success" ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="size-3" /> Uploaded
                          </span>
                        ) : item.status === "uploading" ? (
                          <span className="text-purple-600 font-mono font-medium">
                            Uploading {item.progress}%
                          </span>
                        ) : (
                          <span className="text-neutral-500 flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-purple-500" />
                            Ready • {item.resourceType}
                          </span>
                        )
                      ) : (
                        <span className="text-red-600 font-medium flex items-center gap-1 truncate">
                          <AlertTriangle className="size-3 shrink-0" />
                          {item.error}
                        </span>
                      )}
                    </div>

                    {/* Mini progress bar */}
                    {item.status === "uploading" && (
                      <div className="h-1 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="h-full bg-purple-600 transition-all duration-150"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* RIGHT: Selected File Metadata Inspector */}
          <div className="md:col-span-7 p-6 flex flex-col justify-between bg-white dark:bg-neutral-900">
            {activeItem ? (
              <div className="space-y-4">
                {/* Active file summary & validation warning if invalid */}
                <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      File Metadata Inspector
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Configuring: <span className="font-mono text-neutral-700 dark:text-neutral-300">{activeItem.file.name}</span>
                    </p>
                  </div>

                  {activeItem.valid && (
                    <button
                      type="button"
                      onClick={applyActiveSettingsToAll}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 flex items-center gap-1.5"
                      title="Apply course, year, and semester to all valid files in queue"
                    >
                      <Copy className="size-3" /> Apply course/period to all
                    </button>
                  )}
                </div>

                {!activeItem.valid ? (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 space-y-2">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="size-4" /> This file cannot be uploaded
                    </p>
                    <p>{activeItem.error}</p>
                    <p className="text-neutral-500">
                      Remove this file from the queue on the left to proceed with the remaining valid items.
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(activeItem.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <span className="text-neutral-400">{activeItem.title.length}/120</span>
                      </div>
                      <input
                        type="text"
                        maxLength={120}
                        value={activeItem.title}
                        onChange={(e) => updateActiveItem({ title: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      />
                    </div>

                    {/* Course */}
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                        Course <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={activeItem.courseId}
                        onChange={(e) => updateActiveItem({ courseId: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      >
                        {mockCourses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.code} — {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Resource Type */}
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                        Resource Type <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {resourceTypeOptions.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => updateActiveItem({ resourceType: opt.value })}
                            className={`p-1.5 text-xs rounded border transition ${
                              activeItem.resourceType === opt.value
                                ? "border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold"
                                : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Year + Semester */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                          Academic Year
                        </label>
                        <select
                          value={activeItem.year}
                          onChange={(e) => updateActiveItem({ year: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                        >
                          {yearOptions.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                          Semester
                        </label>
                        <select
                          value={activeItem.semester}
                          onChange={(e) => updateActiveItem({ semester: e.target.value as Semester })}
                          className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                        >
                          {semesterOptions.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        maxLength={500}
                        value={activeItem.description}
                        onChange={(e) => updateActiveItem({ description: e.target.value })}
                        placeholder="Optional details or context..."
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-neutral-400 text-sm">
                Select a file from the queue to edit its details
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 mt-4 flex items-center justify-between">
              <div className="text-xs text-neutral-500">
                {successCount > 0 && (
                  <span className="text-emerald-600 font-medium">
                    {successCount} of {validCount} files published
                  </span>
                )}
              </div>

              <button
                type="button"
                disabled={validCount === 0 || isBatchUploading}
                onClick={startBatchUpload}
                className={`px-6 py-2.5 rounded-lg text-xs font-semibold shadow transition flex items-center gap-2 ${
                  validCount === 0 || isBatchUploading
                    ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                }`}
              >
                {isBatchUploading ? (
                  <>Uploading batch...</>
                ) : (
                  <>
                    <Upload className="size-4" /> Upload All Valid ({validCount} files)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
