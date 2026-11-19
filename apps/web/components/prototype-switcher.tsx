"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

type VariantDef = {
  key: string
  name: string
}

export function PrototypeSwitcher({
  variants,
  current,
}: {
  variants: VariantDef[]
  current: string
}) {
  if (process.env.NODE_ENV === "production") return null

  const router = useRouter()
  const searchParams = useSearchParams()

  const currentIndex = variants.findIndex((v) => v.key === current)
  const currentVariant = variants[currentIndex] ?? variants[0]!

  function navigate(direction: "prev" | "next") {
    const offset = direction === "prev" ? -1 : 1
    const nextIndex =
      (currentIndex + offset + variants.length) % variants.length
    const nextVariant = variants[nextIndex]!
    const params = new URLSearchParams(searchParams.toString())
    params.set("variant", nextVariant.key)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  React.useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return
      }
      if (e.key === "ArrowLeft") navigate("prev")
      if (e.key === "ArrowRight") navigate("next")
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex])

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full border border-zinc-300 bg-zinc-900 px-2 py-1.5 text-sm text-white shadow-2xl dark:border-zinc-600 dark:bg-zinc-800">
        <button
          onClick={() => navigate("prev")}
          className="flex size-7 items-center justify-center rounded-full transition-colors hover:bg-zinc-700"
          aria-label="Previous variant"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="min-w-[160px] select-none px-2 text-center font-medium">
          {currentVariant.key} ({currentVariant.name})
        </span>
        <button
          onClick={() => navigate("next")}
          className="flex size-7 items-center justify-center rounded-full transition-colors hover:bg-zinc-700"
          aria-label="Next variant"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
