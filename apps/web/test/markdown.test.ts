import test from "node:test"
import assert from "node:assert/strict"
import { parseMarkdownToNodes } from "../lib/markdown"

test("parseMarkdownToNodes parses headings, paragraphs, and lists", () => {
  const md = `# Title\n\nThis is a paragraph with **bold** and *italic* and \`code\`.\n\n- Item 1\n- Item 2`
  const nodes = parseMarkdownToNodes(md)

  assert.strictEqual(nodes[0]?.type, "heading")
  assert.strictEqual(nodes[0]?.level, 1)
  assert.strictEqual(nodes[0]?.text, "Title")

  assert.strictEqual(nodes[1]?.type, "paragraph")

  assert.strictEqual(nodes[2]?.type, "list")
  assert.strictEqual(nodes[2]?.items.length, 2)
})

test("parseMarkdownToNodes parses code blocks", () => {
  const md = "```ts\nconst x = 10\n```"
  const nodes = parseMarkdownToNodes(md)

  assert.strictEqual(nodes[0]?.type, "code_block")
  assert.strictEqual(nodes[0]?.language, "ts")
  assert.strictEqual(nodes[0]?.code, "const x = 10")
})
