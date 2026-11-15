import test from "node:test"
import assert from "node:assert/strict"
import {
  resolvePreviewType,
  resourceDownloadUrl,
  resourcePreviewUrl,
} from "../app/resources/presentation.js"

test("resourcePreviewUrl and resourceDownloadUrl point at streaming endpoints", () => {
  assert.strictEqual(
    resourcePreviewUrl("abc"),
    "/api/resources/abc/preview"
  )
  assert.strictEqual(
    resourceDownloadUrl("abc"),
    "/api/resources/abc/download"
  )
})

test("resolvePreviewType maps MIME and extensions to preview modes", () => {
  assert.strictEqual(
    resolvePreviewType("notes.pdf", "application/pdf"),
    "pdf"
  )
  assert.strictEqual(
    resolvePreviewType(
      "notes.docx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ),
    "docx"
  )
  assert.strictEqual(resolvePreviewType("figure.png", "image/png"), "image")
  assert.strictEqual(
    resolvePreviewType(
      "deck.pptx",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ),
    "download-only"
  )
})
