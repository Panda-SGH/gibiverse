"use client"

import * as React from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  RotateCcw,
  Upload,
} from "lucide-react"
import { Button } from "@gibiverse/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@gibiverse/ui/components/dialog"
import { Input } from "@gibiverse/ui/components/input"
import { Label } from "@gibiverse/ui/components/label"
import { Progress } from "@gibiverse/ui/components/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gibiverse/ui/components/select"
import { Textarea } from "@gibiverse/ui/components/textarea"
import { CoursePicker } from "@/components/course-picker"
import type { Course, Department } from "@/lib/academic"
import {
  resourceTypeOptions,
  semesterOptions,
  yearOptions,
} from "@/lib/resource-options"
import {
  detectResourceType,
  formatBytes,
  MAX_FILE_SIZE_MB,
  sanitizeTitleFromFilename,
  validateFile,
  type ResourceType,
  type Semester,
} from "@/lib/resource-validation"
import { uploadResource } from "@/lib/upload-resource"

type UploadResourceWizardProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  departments: Department[]
  courses: Course[]
}

type UploadPhase = "form" | "uploading" | "error" | "success"

export function UploadResourceWizard({
  open,
  onOpenChange,
  departments,
  courses,
}: UploadResourceWizardProps) {
  const [step, setStep] = React.useState<1 | 2>(1)
  const [phase, setPhase] = React.useState<UploadPhase>("form")
  const [isDragging, setIsDragging] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [fileError, setFileError] = React.useState<string | null>(null)
  const [formatLabel, setFormatLabel] = React.useState<string | null>(null)

  const [title, setTitle] = React.useState("")
  const [courseId, setCourseId] = React.useState<string | null>(null)
  const [departmentId, setDepartmentId] = React.useState<string | null>(null)
  const [resourceType, setResourceType] = React.useState<ResourceType>("other")
  const [year, setYear] = React.useState(() => new Date().getFullYear())
  const [semester, setSemester] = React.useState<Semester>("1")
  const [description, setDescription] = React.useState("")

  const [progress, setProgress] = React.useState(0)
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const [createdResourceId, setCreatedResourceId] = React.useState<string | null>(
    null
  )

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const years = React.useMemo(() => yearOptions(), [])

  function resetWizard() {
    setStep(1)
    setPhase("form")
    setIsDragging(false)
    setSelectedFile(null)
    setFileError(null)
    setFormatLabel(null)
    setTitle("")
    setCourseId(null)
    setDepartmentId(null)
    setResourceType("other")
    setYear(new Date().getFullYear())
    setSemester("1")
    setDescription("")
    setProgress(0)
    setUploadError(null)
    setCreatedResourceId(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetWizard()
    onOpenChange(next)
  }

  function handleFileSelected(file: File) {
    const validation = validateFile(file)
    if (!validation.valid) {
      setSelectedFile(null)
      setFileError(validation.error || "Invalid file")
      setFormatLabel(null)
      return
    }

    setFileError(null)
    setSelectedFile(file)
    setFormatLabel(validation.formatLabel ?? null)
    setTitle(sanitizeTitleFromFilename(file.name))
    setResourceType(detectResourceType(file.name))
  }

  async function startUpload() {
    if (!selectedFile || !courseId || !title.trim()) return

    setPhase("uploading")
    setProgress(0)
    setUploadError(null)

    try {
      const result = await uploadResource(
        {
          file: selectedFile,
          title: title.trim(),
          courseId,
          resourceType,
          year,
          semester,
          description,
        },
        setProgress
      )
      setCreatedResourceId(result.id)
      setProgress(100)
      setPhase("success")
    } catch (error) {
      setPhase("error")
      setUploadError(
        error instanceof Error ? error.message : "Upload failed. Try again."
      )
    }
  }

  const canContinueFromStep1 = Boolean(selectedFile) && !fileError
  const canSubmit =
    Boolean(selectedFile) &&
    Boolean(courseId) &&
    title.trim().length > 0 &&
    phase !== "uploading"

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>Upload Resource</DialogTitle>
          <DialogDescription>
            Share academic materials with your course.
          </DialogDescription>
          {phase === "form" ? (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div
                className={`h-1.5 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`}
              />
              <div
                className={`h-1.5 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`}
              />
            </div>
          ) : null}
        </DialogHeader>

        <div className="px-6 py-5">
          {phase === "form" && step === 1 ? (
            <div className="flex flex-col gap-4">
              <div
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border bg-muted/30"
                }`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                  const file = e.dataTransfer.files?.[0]
                  if (file) handleFileSelected(file)
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mb-3 size-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  Drop a file here, or click to browse
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PDF, DOCX, PPTX, PNG, JPG, WebP · up to {MAX_FILE_SIZE_MB} MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.pptx,.png,.jpg,.jpeg,.webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelected(file)
                  }}
                />
              </div>

              {fileError ? (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <span>{fileError}</span>
                </div>
              ) : null}

              {selectedFile ? (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2">
                  <FileText className="size-5 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatLabel ?? "Document"} ·{" "}
                      {formatBytes(selectedFile.size)}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="flex justify-end">
                <Button
                  type="button"
                  disabled={!canContinueFromStep1}
                  onClick={() => setStep(2)}
                >
                  Continue
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </div>
            </div>
          ) : null}

          {phase === "form" && step === 2 ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="resource-title">Title</Label>
                <Input
                  id="resource-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Midterm Exam 2024"
                />
              </div>

              <CoursePicker
                departments={departments}
                courses={courses}
                departmentId={departmentId}
                courseId={courseId}
                onDepartmentChange={setDepartmentId}
                onCourseChange={setCourseId}
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <Label>Resource type</Label>
                  <Select
                    value={resourceType}
                    onValueChange={(value) => {
                      if (value) setResourceType(value as ResourceType)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Year</Label>
                  <Select
                    value={String(year)}
                    onValueChange={(value) => {
                      if (value) setYear(Number.parseInt(value, 10))
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((option) => (
                        <SelectItem key={option} value={String(option)}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Semester</Label>
                  <Select
                    value={semester}
                    onValueChange={(value) => {
                      if (value) setSemester(value as Semester)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {semesterOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="resource-description">
                  Description{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="resource-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add context for other students"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft data-icon="inline-start" />
                  Back
                </Button>
                <Button
                  type="button"
                  disabled={!canSubmit}
                  onClick={() => void startUpload()}
                >
                  Upload
                  <Upload data-icon="inline-end" />
                </Button>
              </div>
            </div>
          ) : null}

          {phase === "uploading" ? (
            <div className="flex flex-col gap-4 py-6">
              <p className="text-sm font-medium text-foreground">
                Uploading {selectedFile?.name}…
              </p>
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground">{progress}%</p>
            </div>
          ) : null}

          {phase === "error" ? (
            <div className="flex flex-col gap-4 py-4">
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your file and metadata are still here. You can retry without
                re-entering details.
              </p>
              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPhase("form")
                    setStep(2)
                  }}
                >
                  <ArrowLeft data-icon="inline-start" />
                  Edit details
                </Button>
                <Button type="button" onClick={() => void startUpload()}>
                  <RotateCcw data-icon="inline-start" />
                  Retry upload
                </Button>
              </div>
            </div>
          ) : null}

          {phase === "success" && createdResourceId ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <CheckCircle2 className="size-12 text-primary" />
              <div className="flex flex-col gap-1">
                <p className="text-lg font-semibold text-foreground">
                  Resource uploaded
                </p>
                <p className="text-sm text-muted-foreground">
                  “{title}” is ready for your course.
                </p>
              </div>
              <Button
                nativeButton={false}
                render={<Link href={`/resources/${createdResourceId}`} />}
              >
                View resource
              </Button>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
