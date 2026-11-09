"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"

export const uploadVariants = [
  { key: "A", name: "Single-Step Modal (Drop & Auto-Detect)" },
  { key: "B", name: "Two-Step Wizard (File First → Metadata)" },
  { key: "C", name: "Batch Queue Drawer (Multi-File & Review)" },
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
  const currentIndex = uploadVariants.findIndex((v) => v.key === current)
  const currentVariant = uploadVariants[currentIndex >= 0 ? currentIndex : 0]!

  const go = React.useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("variant", key)
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const prev = React.useCallback(() => {
    const i = currentIndex <= 0 ? uploadVariants.length - 1 : currentIndex - 1
    go(uploadVariants[i]!.key)
  }, [currentIndex, go])

  const next = React.useCallback(() => {
    const i = currentIndex >= uploadVariants.length - 1 ? 0 : currentIndex + 1
    go(uploadVariants[i]!.key)
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
    <div className="fixed bottom-6 left-1/2 z-[9999] flex -translate-x-1/2 items-center gap-3 rounded-full border border-neutral-300 bg-white/95 px-4 py-2 font-sans text-sm shadow-xl backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/95">
      <button
        onClick={prev}
        className="flex size-7 items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        aria-label="Previous variant"
        title="Previous variant (Left arrow)"
      >
        ←
      </button>
      <span className="min-w-[280px] text-center font-medium">
        Variant {currentVariant.key}: {currentVariant.name}
      </span>
      <button
        onClick={next}
        className="flex size-7 items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        aria-label="Next variant"
        title="Next variant (Right arrow)"
      >
        →
      </button>
    </div>
  )
}
