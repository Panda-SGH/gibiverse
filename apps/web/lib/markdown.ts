export type MarkdownNode =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "code_block"; language: string; code: string }
  | { type: "blockquote"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }

export function parseMarkdownToNodes(markdown: string): MarkdownNode[] {
  const lines = (markdown || "").split(/\r?\n/)
  const nodes: MarkdownNode[] = []
  let i = 0

  while (i < lines.length) {
    const rawLine = lines[i]!
    const trimmed = rawLine.trim()

    if (!trimmed) {
      i++
      continue
    }

    // Fenced Code Block
    if (trimmed.startsWith("```")) {
      const language = trimmed.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i]!.trim().startsWith("```")) {
        codeLines.push(lines[i]!)
        i++
      }
      if (i < lines.length && lines[i]!.trim().startsWith("```")) {
        i++
      }
      nodes.push({
        type: "code_block",
        language,
        code: codeLines.join("\n"),
      })
      continue
    }

    // Heading (# ... ######)
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/)
    if (headingMatch) {
      nodes.push({
        type: "heading",
        level: headingMatch[1]!.length,
        text: headingMatch[2]!.trim(),
      })
      i++
      continue
    }

    // Blockquote (> ...)
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [trimmed.replace(/^>\s?/, "")]
      i++
      while (i < lines.length && lines[i]!.trim().startsWith(">")) {
        quoteLines.push(lines[i]!.trim().replace(/^>\s?/, ""))
        i++
      }
      nodes.push({
        type: "blockquote",
        text: quoteLines.join(" "),
      })
      continue
    }

    // Lists (unordered - / * or ordered 1. )
    const isUnordered = /^[-*]\s+(.*)$/.test(trimmed)
    const isOrdered = /^\d+\.\s+(.*)$/.test(trimmed)
    if (isUnordered || isOrdered) {
      const items: string[] = []
      const ordered = isOrdered
      while (i < lines.length) {
        const itemLine = lines[i]!.trim()
        const match = ordered
          ? itemLine.match(/^\d+\.\s+(.*)$/)
          : itemLine.match(/^[-*]\s+(.*)$/)
        if (!match) break
        items.push(match[1]!.trim())
        i++
      }
      nodes.push({
        type: "list",
        ordered,
        items,
      })
      continue
    }

    // Paragraph (accumulate until blank line or special block)
    const paragraphLines: string[] = [trimmed]
    i++
    while (i < lines.length) {
      const nextLine = lines[i]!
      const nextTrimmed = nextLine.trim()
      if (
        !nextTrimmed ||
        nextTrimmed.startsWith("```") ||
        /^#{1,6}\s+/.test(nextTrimmed) ||
        nextTrimmed.startsWith(">") ||
        /^[-*]\s+/.test(nextTrimmed) ||
        /^\d+\.\s+/.test(nextTrimmed)
      ) {
        break
      }
      paragraphLines.push(nextTrimmed)
      i++
    }

    nodes.push({
      type: "paragraph",
      text: paragraphLines.join(" "),
    })
  }

  return nodes
}
