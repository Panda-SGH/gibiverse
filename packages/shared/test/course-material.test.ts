import test from "node:test"
import assert from "node:assert/strict"
import {
  COURSE_MATERIAL_TYPES,
  SEMESTERS,
  courseMaterialTypeSchema,
  semesterSchema,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MIN_ACADEMIC_YEAR,
  MAX_ACADEMIC_YEAR,
  courseMaterialTypePillLabels,
  courseMaterialTypeOptions,
  semesterOptions,
  yearOptions,
} from "../src/types/course-material.js"
import { formatBytes } from "../src/utils/course-material.js"
import {
  validateFile,
  listCourseMaterialsQuerySchema,
  uploadCourseMaterialSchema,
} from "../src/validation/course-material.js"

test("COURSE_MATERIAL_TYPES and SEMESTERS contain domain values", () => {
  assert.deepEqual(COURSE_MATERIAL_TYPES, [
    "exam",
    "notes",
    "slides",
    "assignment",
    "lab",
    "other",
  ])
  assert.deepEqual(SEMESTERS, ["1", "2", "summer"])
})

test("courseMaterialTypeSchema validates valid course material types and rejects invalid", () => {
  for (const type of COURSE_MATERIAL_TYPES) {
    const parsed = courseMaterialTypeSchema.safeParse(type)
    assert.equal(parsed.success, true)
  }
  const invalid = courseMaterialTypeSchema.safeParse("textbook")
  assert.equal(invalid.success, false)
})

test("semesterSchema validates valid semesters and rejects invalid", () => {
  for (const sem of SEMESTERS) {
    const parsed = semesterSchema.safeParse(sem)
    assert.equal(parsed.success, true)
  }
  const invalid = semesterSchema.safeParse("fall")
  assert.equal(invalid.success, false)
})

test("file constants and academic year limits have expected values", () => {
  assert.equal(MAX_FILE_SIZE_MB, 50)
  assert.equal(MAX_FILE_SIZE_BYTES, 50 * 1024 * 1024)
  assert.equal(MIN_ACADEMIC_YEAR, 2000)
  assert.equal(MAX_ACADEMIC_YEAR, 2100)
  assert.ok(ALLOWED_EXTENSIONS.includes(".pdf"))
  assert.ok(ALLOWED_EXTENSIONS.includes(".docx"))
  assert.ok(ALLOWED_EXTENSIONS.includes(".pptx"))
  assert.ok(ALLOWED_EXTENSIONS.includes(".png"))
  assert.ok(ALLOWED_EXTENSIONS.includes(".jpg"))
  assert.ok(ALLOWED_EXTENSIONS.includes(".jpeg"))
  assert.ok(ALLOWED_EXTENSIONS.includes(".webp"))
  assert.ok(ALLOWED_MIME_TYPES.includes("application/pdf"))
  assert.ok(
    ALLOWED_MIME_TYPES.includes(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
  )
})

test("course material options and labels are defined correctly", () => {
  assert.equal(courseMaterialTypePillLabels.exam, "Exam")
  assert.equal(courseMaterialTypePillLabels.notes, "Notes")
  assert.equal(courseMaterialTypePillLabels.slides, "Slides")
  assert.equal(courseMaterialTypePillLabels.assignment, "Assignment")
  assert.equal(courseMaterialTypePillLabels.lab, "Lab")
  assert.equal(courseMaterialTypePillLabels.other, "Other")

  assert.equal(courseMaterialTypeOptions.length, 6)
  assert.deepEqual(
    courseMaterialTypeOptions.map((o) => o.value),
    [...COURSE_MATERIAL_TYPES]
  )

  assert.equal(semesterOptions.length, 3)
  assert.deepEqual(
    semesterOptions.map((o) => o.value),
    [...SEMESTERS]
  )

  const fixedDate = new Date(2026, 0, 1)
  const years = yearOptions(fixedDate)
  assert.equal(years.length, 8)
  assert.equal(years[0], 2026)
  assert.equal(years[7], 2019)
})

test("formatBytes formats byte numbers accurately", () => {
  assert.equal(formatBytes(0), "0 B")
  assert.equal(formatBytes(1024), "1 KB")
  assert.equal(formatBytes(50 * 1024 * 1024), "50 MB")
})

test("validateFile validates file size, empty files, and allowed formats", () => {
  const emptyRes = validateFile({
    name: "notes.pdf",
    size: 0,
    type: "application/pdf",
  })
  assert.equal(emptyRes.valid, false)
  assert.match(emptyRes.error ?? "", /empty/i)

  const overRes = validateFile({
    name: "huge.pdf",
    size: MAX_FILE_SIZE_BYTES + 1,
    type: "application/pdf",
  })
  assert.equal(overRes.valid, false)
  assert.match(
    overRes.error ?? "",
    /exceeds the maximum allowed limit of 50 MB/i
  )

  const exeRes = validateFile({
    name: "virus.exe",
    size: 1024,
    type: "application/x-msdownload",
  })
  assert.equal(exeRes.valid, false)
  assert.match(exeRes.error ?? "", /unsupported format/i)

  const allowed = validateFile({
    name: "test.pdf",
    size: 1024,
    type: "application/pdf",
  })
  assert.equal(allowed.valid, true)
})

test("listCourseMaterialsQuerySchema validates queries with courseMaterialType", () => {
  const valid = listCourseMaterialsQuerySchema.safeParse({
    courseMaterialType: "exam",
    departmentId: "dept_cs",
    courseId: "course_1",
  })
  assert.equal(valid.success, true)
  if (valid.success) {
    assert.equal(valid.data.courseMaterialType, "exam")
    assert.equal(valid.data.departmentId, "dept_cs")
    assert.equal(valid.data.courseId, "course_1")
  }

  const invalid = listCourseMaterialsQuerySchema.safeParse({
    courseMaterialType: "invalid-type",
  })
  assert.equal(invalid.success, false)
})

test("uploadCourseMaterialSchema validates valid metadata and rejects invalid", () => {
  const result = uploadCourseMaterialSchema.safeParse({
    title: "Midterm Exam 2024",
    courseId: "course_1",
    courseMaterialType: "exam",
    year: 2024,
    semester: "1",
    description: "Sample exam with answers",
  })
  // file is missing in this test
  assert.equal(result.success, false)
  if (!result.success) {
    assert.equal(result.error.issues[0]?.path[0], "file")
  }
})
