import test from "node:test"
import assert from "node:assert/strict"
import {
  MAX_FILE_SIZE_BYTES,
  validateFile,
} from "../lib/resource-validation"

function makeFile(overrides: {
  name?: string
  size?: number
  type?: string
}): File {
  const name = overrides.name ?? "notes.pdf"
  const type = overrides.type ?? "application/pdf"
  const size = overrides.size ?? 1024
  const buffer = Buffer.alloc(size, 1)
  return new File([buffer], name, { type })
}

test("rejects empty files (0 bytes)", () => {
  const result = validateFile(makeFile({ size: 0, name: "empty.pdf" }))
  assert.strictEqual(result.valid, false)
  assert.match(result.error ?? "", /empty/i)
})

test("rejects files larger than 50 MB", () => {
  const result = validateFile(
    makeFile({ size: MAX_FILE_SIZE_BYTES + 1, name: "huge.pdf" })
  )
  assert.strictEqual(result.valid, false)
  assert.match(result.error ?? "", /50\s*MB/i)
})

test("rejects unsupported extensions and MIME types", () => {
  const result = validateFile(
    makeFile({
      name: "malware.exe",
      type: "application/x-msdownload",
      size: 100,
    })
  )
  assert.strictEqual(result.valid, false)
  assert.match(result.error ?? "", /unsupported/i)
})

test("accepts allowed formats within size limits", () => {
  const cases = [
    { name: "exam.pdf", type: "application/pdf" },
    {
      name: "notes.docx",
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
    {
      name: "deck.pptx",
      type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    },
    { name: "diagram.png", type: "image/png" },
    { name: "photo.jpg", type: "image/jpeg" },
    { name: "photo.jpeg", type: "image/jpeg" },
    { name: "shot.webp", type: "image/webp" },
  ] as const

  for (const fileCase of cases) {
    const result = validateFile(makeFile({ ...fileCase, size: 2048 }))
    assert.strictEqual(
      result.valid,
      true,
      `expected ${fileCase.name} to be valid`
    )
  }
})
