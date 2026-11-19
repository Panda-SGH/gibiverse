"use client"

import * as React from "react"
import DOMPurify from "dompurify"
import mammoth from "mammoth"

export function DocxPreview({ fileUrl }: { fileUrl: string }) {
  const [html, setHtml] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(fileUrl)
        if (!res.ok) {
          throw new Error(`Preview fetch failed: ${res.status}`)
        }
        const arrayBuffer = await res.arrayBuffer()
        const result = await mammoth.convertToHtml({ arrayBuffer })
        if (cancelled) return
        setHtml(DOMPurify.sanitize(result.value))
      } catch {
        if (!cancelled) {
          setError("Could not load this DOCX preview.")
          setHtml(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [fileUrl])

  return (
    <div
      className="rounded-lg border border-border bg-background p-6"
      data-testid="preview-docx"
    >
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading preview…</p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {html ? (
        <div
          className="space-y-3 text-sm leading-relaxed text-foreground [&_a]:text-primary [&_a]:underline [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_ol]:list-decimal [&_p]:mb-2 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_ul]:list-disc"
          // Sanitized with DOMPurify above
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : null}
    </div>
  )
}
