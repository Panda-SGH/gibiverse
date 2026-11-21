import test from "node:test"
import assert from "node:assert/strict"
import {
  COURSE_MATERIAL_TYPES,
  courseMaterialTypeSchema,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  courseMaterialTypePillLabels,
  courseMaterialTypeOptions,
  academicPeriodOptions,
} from "../src/types/course-material.js"
import { formatBytes } from "../src/utils/course-material.js"
import {
  validateFile,
  academicPeriodSchema,
  listCourseMaterialsQuerySchema,
  uploadCourseMaterialSchema,
} from "../src/validation/course-material.js"

test("COURSE_MATERIAL_TYPES contains domain values", () => {
  assert.deepEqual(COURSE_MATERIAL_TYPES, [
    "exam",
    "notes",
    "slides",
    "assignment",
    "lab",
    "other",
  ])
})

test("courseMaterialTypeSchema validates valid course material types and rejects invalid", () => {
  for (const type of COURSE_MATERIAL_TYPES) {
    const parsed = courseMaterialTypeSchema.safeParse(type)
    assert.equal(parsed.success, true)
  }
  const invalid = courseMaterialTypeSchema.safeParse("textbook")
  assert.equal(invalid.success, false)
})

test("academicPeriodSchema validates combined academic period strings and rejects invalid", () => {
  const validPeriods = [
    "2026/2027 semester 1",
    "2026/2027 semester 2",
    "2026/2027 summer",
    "2025/2026 semester 1",
  ]
  for (const period of validPeriods) {
    const parsed = academicPeriodSchema.safeParse(period)
    assert.equal(parsed.success, true, `Expected ${period} to be valid`)
  }

  const invalidPeriods = [
    "2026",
    "2026/2027",
    "2026/2027 semester 3",
    "2026/2027 fall",
    "2026/2027 spring",
    "",
    "invalid",
  ]
  for (const invalid of invalidPeriods) {
    const parsed = academicPeriodSchema.safeParse(invalid)
    assert.equal(parsed.success, false, `Expected ${invalid} to be invalid`)
  }
})

test("academicPeriodOptions generates curated rolling academic periods", () => {
  const fixedDate = new Date(2026, 0, 1)
  const options = academicPeriodOptions(fixedDate)
  assert.equal(options.length, 18) // 6 years * 3 terms
  assert.equal(options[0]?.value, "2026/2027 semester 1")
  assert.equal(options[1]?.value, "2026/2027 semester 2")
  assert.equal(options[2]?.value, "2026/2027 summer")
  assert.equal(options[options.length - 1]?.value, "2021/2022 summer")
})

test("file constants have expected values", () => {
  assert.equal(MAX_FILE_SIZE_MB, 50)
  assert.equal(MAX_FILE_SIZE_BYTES, 50 * 1024 * 1024)
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

test("listCourseMaterialsQuerySchema validates queries with universityId, departmentId, and courseMaterialType", () => {
  const valid = listCourseMaterialsQuerySchema.safeParse({
    courseMaterialType: "exam",
    universityId: "uni_1",
    departmentId: "dept_cs",
    courseId: "course_1",
  })
  assert.equal(valid.success, true)
  if (valid.success) {
    assert.equal(valid.data.courseMaterialType, "exam")
    assert.equal(valid.data.universityId, "uni_1")
    assert.equal(valid.data.departmentId, "dept_cs")
    assert.equal(valid.data.courseId, "course_1")
  }

  const invalid = listCourseMaterialsQuerySchema.safeParse({
    courseMaterialType: "invalid-type",
  })
  assert.equal(invalid.success, false)
})

test("uploadCourseMaterialSchema requires academicPeriod and file, without description field", () => {
  const result = uploadCourseMaterialSchema.safeParse({
    title: "Midterm Exam 2024",
    courseId: "course_1",
    courseMaterialType: "exam",
    academicPeriod: "2024/2025 semester 1",
  })
  // file is missing in this test
  assert.equal(result.success, false)
  if (!result.success) {
    assert.equal(result.error.issues[0]?.path[0], "file")
  }

  const invalidPeriod = uploadCourseMaterialSchema.safeParse({
    title: "Midterm Exam 2024",
    courseId: "course_1",
    courseMaterialType: "exam",
    academicPeriod: "invalid-period",
  })
  assert.equal(invalidPeriod.success, false)
  if (!invalidPeriod.success) {
    assert.ok(
      invalidPeriod.error.issues.some((i) => i.path[0] === "academicPeriod")
    )
  }
})
