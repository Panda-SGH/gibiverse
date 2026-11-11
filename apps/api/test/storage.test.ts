import test, { after, before } from "node:test"
import assert from "node:assert/strict"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { LocalStorage } from "../src/storage/local.js"
import { createStorage } from "../src/storage/index.js"

let basePath: string
let storage: LocalStorage

before(async () => {
  basePath = await mkdtemp(path.join(tmpdir(), "gibiverse-storage-"))
  storage = new LocalStorage({ basePath })
})

after(async () => {
  await rm(basePath, { recursive: true, force: true })
})

test("put stores a file and get returns its contents", async () => {
  const key = "cs201/exam-2024.pdf"
  const payload = Buffer.from("%PDF-1.4 exam content")
  const putResult = await storage.put(key, payload, {
    contentType: "application/pdf",
  })

  assert.strictEqual(putResult.key, key)
  assert.strictEqual(putResult.size, payload.byteLength)

  const got = await storage.get(key)
  assert.ok(got)
  assert.strictEqual(got.contentType, "application/pdf")
  assert.strictEqual(got.size, payload.byteLength)

  const reader = got.stream.getReader()
  const chunks: Uint8Array[] = []
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }
  const body = Buffer.concat(chunks.map((c) => Buffer.from(c)))
  assert.deepStrictEqual(body, payload)
})

test("exists reflects put and delete; missing get returns null", async () => {
  const key = "math101/notes.docx"
  assert.strictEqual(await storage.exists(key), false)
  assert.strictEqual(await storage.get(key), null)

  await storage.put(key, Buffer.from("docx"), {
    contentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  })
  assert.strictEqual(await storage.exists(key), true)

  await storage.delete(key)
  assert.strictEqual(await storage.exists(key), false)
  assert.strictEqual(await storage.get(key), null)

  // delete of missing key is a no-op
  await storage.delete(key)
})

test("getUrl returns local /api/files path with disposition", async () => {
  const key = "cs201/exam-2024.pdf"
  const inlineUrl = await storage.getUrl(key, { disposition: "inline" })
  const attachmentUrl = await storage.getUrl(key, {
    disposition: "attachment",
  })

  assert.strictEqual(
    inlineUrl,
    `/api/files/${encodeURIComponent(key)}?disposition=inline`
  )
  assert.strictEqual(
    attachmentUrl,
    `/api/files/${encodeURIComponent(key)}?disposition=attachment`
  )
})

test("createStorage factory defaults to local filesystem provider", async () => {
  const previous = process.env.STORAGE_PROVIDER
  const previousPath = process.env.STORAGE_LOCAL_PATH
  process.env.STORAGE_PROVIDER = "local"
  process.env.STORAGE_LOCAL_PATH = basePath

  try {
    const provider = createStorage()
    const key = "factory/check.txt"
    await provider.put(key, Buffer.from("ok"), { contentType: "text/plain" })
    assert.strictEqual(await provider.exists(key), true)
  } finally {
    if (previous === undefined) delete process.env.STORAGE_PROVIDER
    else process.env.STORAGE_PROVIDER = previous
    if (previousPath === undefined) delete process.env.STORAGE_LOCAL_PATH
    else process.env.STORAGE_LOCAL_PATH = previousPath
  }
})
