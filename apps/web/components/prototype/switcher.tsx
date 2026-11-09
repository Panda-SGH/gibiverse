"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"

const variants = [
  { key: "A", name: "Top Nav Classic" },
  { key: "B", name: "Sidebar Dashboard" },
  { key: "C", name: "Command-bar Minimal" },
] as const

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

export function PrototypeSwitcher() {
  if (process.env.NODE_ENV === "production") return null

  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get("variant") ?? "A"
  const currentIndex = variants.findIndex((v) => v.key === current)
  const currentVariant = variants[currentIndex >= 0 ? currentIndex : 0]!

  const go = React.useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("variant", key)
      // preserve the page param if present
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const prev = React.useCallback(() => {
    const i = currentIndex <= 0 ? variants.length - 1 : currentIndex - 1
    go(variants[i]!.key)
  }, [currentIndex, go])

  const next = React.useCallback(() => {
    const i = currentIndex >= variants.length - 1 ? 0 : currentIndex + 1
    go(variants[i]!.key)
  }, [currentIndex, go])

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.defaultPrevented || e.repeat) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isTypingTarget(e.target)) return
      if (e.key === "ArrowLeft") prev()
      else if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [prev, next])

  return (
    <div className="fixed bottom-6 left-1/2 z-[9999] flex -translate-x-1/2 items-center gap-3 rounded-full border border-neutral-300 bg-white px-4 py-2 font-sans text-sm shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
      <button
        onClick={prev}
        className="flex size-7 items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
        aria-label="Previous variant"
      >
        ←
      </button>
      <span className="min-w-[180px] text-center font-medium">
        {currentVariant.key} — {currentVariant.name}
      </span>
      <button
        onClick={next}
        className="flex size-7 items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
        aria-label="Next variant"
      >
        →
      </button>
    </div>
  )
}
