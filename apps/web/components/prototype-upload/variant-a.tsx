"use client"

import * as React from "react"
import {
  Upload,
  FileText,
  FileQuestion,
  Presentation,
  FileCode,
  FlaskConical,
  Files,
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Eye,
  Download,
  Check,
} from "lucide-react"
import {
  mockCourses,
  resourceTypeOptions,
  semesterOptions,
  yearOptions,
  testFilePresets,
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

export function VariantA() {
  const [isOpen, setIsOpen] = React.useState(true)
  const [isDragging, setIsDragging] = React.useState(false)

  // File state
  const [selectedFile, setSelectedFile] = React.useState<{
    name: string
    size: number
    type: string
  } | null>(null)
  const [fileError, setFileError] = React.useState<string | null>(null)
  const [previewInfo, setPreviewInfo] = React.useState<{
    formatLabel?: string
    previewType?: "pdf" | "docx" | "image" | "download-only"
  } | null>(null)

  // Form state
  const [title, setTitle] = React.useState("")
  const [courseId, setCourseId] = React.useState("c1")
  const [resourceType, setResourceType] = React.useState<ResourceType>("exam")
  const [year, setYear] = React.useState<number>(2024)
  const [semester, setSemester] = React.useState<Semester>("1")
  const [description, setDescription] = React.useState("")
  const [autoDetected, setAutoDetected] = React.useState(false)

  // Upload progress simulation state
  const [uploadStatus, setUploadStatus] = React.useState<"idle" | "uploading" | "success" | "error">("idle")
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [simulateError, setSimulateError] = React.useState(false)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  function handleFileSelected(file: File | { name: string; size: number; type: string }) {
    setUploadStatus("idle")
    setUploadProgress(0)

    const validation = validateFile(file as File)
    if (!validation.valid) {
      setSelectedFile(null)
      setFileError(validation.error || "Invalid file")
      setPreviewInfo(null)
      return
    }

    setFileError(null)
    setSelectedFile({ name: file.name, size: file.size, type: file.type })
    setPreviewInfo({
      formatLabel: validation.formatLabel,
      previewType: validation.previewType,
    })

    // Auto-detect title and resource type
    const inferredTitle = sanitizeTitleFromFilename(file.name)
    const inferredType = detectResourceType(file.name)
    setTitle(inferredTitle)
    setResourceType(inferredType)
    setAutoDetected(true)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]!)
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleUpload() {
    if (!selectedFile || !title.trim() || !courseId) return

    setUploadStatus("uploading")
    setUploadProgress(0)

    let progress = 0
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 10
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        if (simulateError) {
          setUploadStatus("error")
        } else {
          setUploadStatus("success")
        }
      }
      setUploadProgress(progress)
    }, 200)
  }

  function resetForm() {
    setSelectedFile(null)
    setFileError(null)
    setPreviewInfo(null)
    setTitle("")
    setDescription("")
    setAutoDetected(false)
    setUploadStatus("idle")
    setUploadProgress(0)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const selectedCourse = mockCourses.find((c) => c.id === courseId)

  return (
    <div className="min-h-[85vh] p-6 flex flex-col items-center justify-center">
      {!isOpen && (
        <div className="text-center space-y-4">
          <p className="text-neutral-500">Upload modal closed</p>
          <button
            onClick={() => setIsOpen(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow transition flex items-center gap-2 mx-auto"
          >
            <Upload className="size-4" /> Open Upload Modal (Variant A)
          </button>
        </div>
      )}

      {isOpen && (
        <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden transition-all">
          {/* Header */}
          <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Upload Academic Resource
                </h2>
                <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-medium">
                  Variant A: Direct Single-Step
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Share past exams, notes, slides, or assignments with fellow students
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-lg"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Preset testing pills */}
          <div className="bg-neutral-50 dark:bg-neutral-950/60 px-6 py-2 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-neutral-500 whitespace-nowrap font-medium flex items-center gap-1">
              <Sparkles className="size-3 text-amber-500" /> Quick test files:
            </span>
            {testFilePresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleFileSelected(preset as any)}
                className="px-2.5 py-1 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-emerald-500 hover:text-emerald-600 whitespace-nowrap transition"
                title={preset.description}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* 1. Drag & Drop File Zone or Selected File Chip */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx,.pptx,.png,.jpg,.jpeg,.webp"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelected(e.target.files[0])
                }
              }}
            />

            {!selectedFile ? (
              <div>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                      : "border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-800/20"
                  }`}
                >
                  <div className="size-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3">
                    <Upload className="size-6" />
                  </div>
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold underline underline-offset-2">
                      Click to browse
                    </span>{" "}
                    or drag & drop your file here
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    PDF, Word (.docx), Slides (.pptx), or Images up to {MAX_FILE_SIZE_MB} MB
                  </p>
                </div>

                {fileError && (
                  <div className="mt-2.5 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5 text-red-500" />
                    <div>
                      <p className="font-semibold">File validation error</p>
                      <p>{fileError}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <FileText className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {selectedFile.name}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 font-mono">
                        {formatBytes(selectedFile.size)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      <span>{previewInfo?.formatLabel}</span>
                      <span>•</span>
                      {previewInfo?.previewType === "download-only" ? (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Download className="size-3" /> Download only in MVP
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Eye className="size-3" /> Inline browser preview ready
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-neutral-500 hover:text-red-600 px-2 py-1 rounded hover:bg-white dark:hover:bg-neutral-800 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 transition"
                >
                  Change
                </button>
              </div>
            )}

            {/* Auto-detected notification banner */}
            {autoDetected && (
              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-blue-500 shrink-0" />
                  <span>
                    Auto-suggested <strong>Title</strong> and <strong>Resource Type</strong> from filename.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoDetected(false)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}

            {/* 2. Metadata form fields */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Resource Title <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-neutral-400">{title.length}/120</span>
                </div>
                <input
                  type="text"
                  maxLength={120}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. CS201 Final Exam Solutions (Fall 2024)"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Course Selection */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Associated Course <span className="text-red-500">*</span>
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {mockCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name} ({c.department})
                    </option>
                  ))}
                </select>
                {selectedCourse && (
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Department: {selectedCourse.department}
                  </p>
                )}
              </div>

              {/* Resource Type segmented pills */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                  Resource Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {resourceTypeOptions.map((opt) => {
                    const isSelected = resourceType === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setResourceType(opt.value)}
                        className={`p-2 rounded-lg border text-center transition flex flex-col items-center gap-1 ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium ring-1 ring-emerald-500"
                            : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-600 dark:text-neutral-400"
                        }`}
                      >
                        <span className="text-xs">{opt.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Academic Period: Year + Semester */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value as Semester)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {semesterOptions.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Description */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Description <span className="text-neutral-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes about exam version, coverage, professor, or solutions included..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>

            {/* Upload status feedback */}
            {uploadStatus === "uploading" && (
              <div className="space-y-1.5 p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-neutral-700 dark:text-neutral-300">Uploading to storage...</span>
                  <span className="text-emerald-600 font-mono">{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {uploadStatus === "success" && (
              <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span className="font-medium">Resource successfully published and verified!</span>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="underline font-semibold hover:text-emerald-900"
                >
                  Upload another
                </button>
              </div>
            )}

            {uploadStatus === "error" && (
              <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-800 dark:text-red-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-red-600" />
                  <span>Network error occurred while uploading. Please retry.</span>
                </div>
                <button
                  type="button"
                  onClick={handleUpload}
                  className="px-2.5 py-1 bg-red-600 text-white rounded font-medium hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* Footer controls */}
          <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-950/80 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-neutral-500 cursor-pointer">
              <input
                type="checkbox"
                checked={simulateError}
                onChange={(e) => setSimulateError(e.target.checked)}
                className="rounded border-neutral-300 text-emerald-600"
              />
              Simulate upload error
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile || !title.trim() || uploadStatus === "uploading"}
                className={`px-5 py-2 text-xs font-semibold rounded-lg shadow transition flex items-center gap-2 ${
                  !selectedFile || !title.trim() || uploadStatus === "uploading"
                    ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {uploadStatus === "uploading" ? (
                  <>Uploading ({uploadProgress}%)...</>
                ) : (
                  <>
                    <Upload className="size-3.5" /> Publish Resource
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
