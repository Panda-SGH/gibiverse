"use client"

import * as React from "react"
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  ShieldCheck,
  Eye,
  Download,
  RotateCcw,
  Check,
} from "lucide-react"
import {
  mockCourses,
  resourceTypeOptions,
  semesterOptions,
  yearOptions,
  testFilePresets,
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

export function VariantB() {
  const [currentStep, setCurrentStep] = React.useState<1 | 2 | 3>(1)
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

  // Metadata state
  const [title, setTitle] = React.useState("")
  const [courseId, setCourseId] = React.useState("c1")
  const [resourceType, setResourceType] = React.useState<ResourceType>("exam")
  const [year, setYear] = React.useState<number>(2024)
  const [semester, setSemester] = React.useState<Semester>("1")
  const [description, setDescription] = React.useState("")

  // Step 3 progress & error simulation
  const [progress, setProgress] = React.useState(0)
  const [uploadState, setUploadState] = React.useState<"uploading" | "complete" | "error">("uploading")
  const [simulateFailure, setSimulateFailure] = React.useState(false)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  function handleFileSelected(file: File | { name: string; size: number; type: string }) {
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

    // Pre-fill metadata
    setTitle(sanitizeTitleFromFilename(file.name))
    setResourceType(detectResourceType(file.name))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]!)
    }
  }

  function startUpload() {
    setCurrentStep(3)
    setProgress(0)
    setUploadState("uploading")

    let current = 0
    const timer = setInterval(() => {
      current += 15
      if (current >= 100) {
        current = 100
        clearInterval(timer)
        if (simulateFailure) {
          setUploadState("error")
        } else {
          setUploadState("complete")
        }
      }
      setProgress(current)
    }, 250)
  }

  function resetAll() {
    setCurrentStep(1)
    setSelectedFile(null)
    setFileError(null)
    setPreviewInfo(null)
    setTitle("")
    setDescription("")
    setProgress(0)
    setUploadState("uploading")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const selectedCourse = mockCourses.find((c) => c.id === courseId)

  return (
    <div className="min-h-[85vh] p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden transition-all">
        {/* Header with Step Progress Indicator */}
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Upload Resource Wizard
              </h2>
              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-medium">
                Variant B: Guided 2-Step
              </span>
            </div>
            <span className="text-xs font-mono text-neutral-500">Step {currentStep} of 2</span>
          </div>

          {/* Stepper bar */}
          <div className="grid grid-cols-2 gap-2">
            <div
              className={`h-1.5 rounded-full transition-all ${
                currentStep >= 1 ? "bg-blue-600" : "bg-neutral-200 dark:bg-neutral-800"
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all ${
                currentStep >= 2 ? "bg-blue-600" : "bg-neutral-200 dark:bg-neutral-800"
              }`}
            />
          </div>
        </div>

        {/* Preset test bar */}
        <div className="bg-neutral-50 dark:bg-neutral-950 px-6 py-2 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-neutral-500 whitespace-nowrap font-medium flex items-center gap-1">
            <Sparkles className="size-3 text-amber-500" /> Presets:
          </span>
          {testFilePresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                handleFileSelected(preset as any)
              }}
              className="px-2.5 py-1 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-blue-500 hover:text-blue-600 whitespace-nowrap transition"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* STEP 1: FILE VALIDATION */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Step 1: Select and verify your document
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  We check file size and formats up front so you never fill a form only to be rejected later.
                </p>
              </div>

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

              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                }}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                    : selectedFile
                    ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10"
                    : "border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 bg-neutral-50/30"
                }`}
              >
                <div
                  className={`size-14 rounded-full mx-auto flex items-center justify-center mb-3 transition ${
                    selectedFile
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                      : "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                  }`}
                >
                  {selectedFile ? <CheckCircle2 className="size-7" /> : <Upload className="size-7" />}
                </div>

                {selectedFile ? (
                  <div>
                    <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                      File verified! Ready for step 2 ({formatBytes(selectedFile.size)})
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        fileInputRef.current?.click()
                      }}
                      className="mt-3 text-xs px-3 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50"
                    >
                      Choose different file
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                      Drag and drop your file here, or{" "}
                      <span className="text-blue-600 dark:text-blue-400 underline">browse</span>
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      Single file per resource (up to {MAX_FILE_SIZE_MB} MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Validation feedback card */}
              {fileError && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-3">
                  <AlertTriangle className="size-5 shrink-0 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-bold">File Rejected</p>
                    <p className="mt-0.5">{fileError}</p>
                    <p className="mt-2 text-neutral-500 dark:text-neutral-400">
                      Please select an academic document in PDF, Word, PowerPoint, or PNG/JPG format under 50 MB.
                    </p>
                  </div>
                </div>
              )}

              {/* Rules & format matrix summary */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-950/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  <ShieldCheck className="size-4 text-emerald-500" /> Validation Rules & Preview Specs:
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-600 dark:text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <Check className="size-3 text-emerald-500" /> PDF (.pdf) — In-browser viewer (react-pdf)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="size-3 text-emerald-500" /> Word (.docx) — HTML preview (mammoth)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="size-3 text-emerald-500" /> Images (.png, .jpg, .webp) — Instant view
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="size-3 text-amber-500" /> Slides (.pptx) — Direct download in MVP
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={!selectedFile}
                  onClick={() => setCurrentStep(2)}
                  className={`px-6 py-2.5 rounded-lg text-xs font-semibold shadow transition flex items-center gap-2 ${
                    !selectedFile
                      ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  Next: Add Details <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: METADATA & ACADEMIC CONTEXT */}
          {currentStep === 2 && (
            <div className="space-y-5">
              {/* Selected file mini-banner */}
              <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="size-5 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {selectedFile?.name}
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      {formatBytes(selectedFile?.size || 0)} • {previewInfo?.formatLabel}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium shrink-0"
                >
                  Change file
                </button>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Step 2: Add academic categorization
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Helps students find your upload via course filters and search.
                </p>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-neutral-400">{title.length}/120</span>
                  </div>
                  <input
                    type="text"
                    maxLength={120}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Course */}
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                    Resource Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {resourceTypeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setResourceType(opt.value)}
                        className={`p-2.5 rounded-lg border text-left transition flex flex-col gap-0.5 ${
                          resourceType === opt.value
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500"
                            : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 text-neutral-600 dark:text-neutral-400"
                        }`}
                      >
                        <span className="text-xs font-semibold">{opt.label}</span>
                        <span className="text-[10px] text-neutral-400 line-clamp-1">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Year + Semester */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Academic Year <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
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
                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
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
                    Description <span className="text-neutral-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    maxLength={500}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide additional details or solutions key info..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 resize-none"
                  />
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5"
                >
                  <ArrowLeft className="size-3.5" /> Back
                </button>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-neutral-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={simulateFailure}
                      onChange={(e) => setSimulateFailure(e.target.checked)}
                      className="rounded border-neutral-300 text-blue-600"
                    />
                    Simulate error
                  </label>
                  <button
                    type="button"
                    disabled={!title.trim()}
                    onClick={startUpload}
                    className={`px-6 py-2.5 rounded-lg text-xs font-semibold shadow transition flex items-center gap-2 ${
                      !title.trim()
                        ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    Publish Resource <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: DEDICATED PROGRESS / RESULT SCREEN */}
          {currentStep === 3 && (
            <div className="py-8 text-center space-y-6">
              {uploadState === "uploading" && (
                <div className="space-y-4">
                  <div className="relative size-24 mx-auto">
                    <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-neutral-200 dark:text-neutral-800"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-blue-600 transition-all duration-200"
                        strokeDasharray={`${progress}, 100`}
                        strokeWidth="3"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-lg text-neutral-800 dark:text-neutral-200">
                      {progress}%
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                      Uploading to Gibiverse Storage...
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Writing to path: <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">{selectedCourse?.code.toLowerCase()}/{selectedFile?.name}</code>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs text-neutral-500 hover:text-red-600 underline"
                  >
                    Cancel upload
                  </button>
                </div>
              )}

              {uploadState === "complete" && (
                <div className="space-y-4">
                  <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      Upload Verified & Published!
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                      <strong>{title}</strong> is now live under <strong>{selectedCourse?.code}</strong>.
                    </p>
                  </div>

                  <div className="p-3 max-w-sm mx-auto rounded-xl border border-neutral-200 dark:border-neutral-800 text-left bg-neutral-50 dark:bg-neutral-950/60 text-xs space-y-1">
                    <div className="font-semibold text-neutral-800 dark:text-neutral-200">{title}</div>
                    <div className="text-neutral-500">
                      {selectedCourse?.name} • Year {year} Sem {semester}
                    </div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                      Preview status: {previewInfo?.formatLabel}
                    </div>
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={resetAll}
                      className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                    >
                      Upload another resource
                    </button>
                  </div>
                </div>
              )}

              {uploadState === "error" && (
                <div className="space-y-4">
                  <div className="size-16 rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 mx-auto flex items-center justify-center">
                    <AlertTriangle className="size-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                      Upload Failed
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                      Could not reach storage provider. Your metadata is preserved.
                    </p>
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300"
                    >
                      Edit details
                    </button>
                    <button
                      type="button"
                      onClick={startUpload}
                      className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      <RotateCcw className="size-3.5" /> Retry upload
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
