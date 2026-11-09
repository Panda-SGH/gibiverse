"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { PrototypeSwitcher } from "@/components/prototype-upload/switcher"
import { VariantA } from "@/components/prototype-upload/variant-a"
import { VariantB } from "@/components/prototype-upload/variant-b"
import { VariantC } from "@/components/prototype-upload/variant-c"
import { BookOpen, Search, Upload as UploadIcon, HelpCircle, User } from "lucide-react"

export function PrototypeUploadClient() {
  const searchParams = useSearchParams()
  const variant = (searchParams.get("variant") ?? "A").toUpperCase()

  return (
    <div className="min-h-screen bg-neutral-100/60 dark:bg-neutral-950 font-sans text-neutral-900 dark:text-neutral-100 flex flex-col pb-20">
      {/* Real app header from Gibiverse Top Nav Classic decision */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-lg text-emerald-600 dark:text-emerald-400">
            <BookOpen className="size-6" />
            <span>Gibiverse</span>
          </div>

          <nav className="flex items-center gap-4 text-sm font-medium text-neutral-600 dark:text-neutral-300">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
              Resources
            </span>
            <span className="hover:text-neutral-900 dark:hover:text-white cursor-pointer">
              Questions & Answers
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="size-4 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              readOnly
              placeholder="Search CS201 exams, notes..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed"
            />
          </div>

          <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
            SK
          </div>
        </div>
      </header>

      {/* Prototype context banner */}
      <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-white/20 font-mono font-bold">Issue #7 Prototype</span>
          <span>
            Testing resource upload UX, drag-and-drop behavior, pre-flight validation rules, and error recovery.
          </span>
        </div>
        <div className="flex items-center gap-4 font-medium">
          <span>Active Variant: {variant}</span>
          <span>Use ← → keys or bottom bar to switch</span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
        {variant === "A" && <VariantA />}
        {variant === "B" && <VariantB />}
        {variant === "C" && <VariantC />}
      </main>

      {/* Floating Bottom Switcher */}
      <PrototypeSwitcher />
    </div>
  )
}
