"use client"

import { useSearchParams } from "next/navigation"
import { VariantA } from "@/components/prototype/variant-a"
import { VariantB } from "@/components/prototype/variant-b"
import { VariantC } from "@/components/prototype/variant-c"
import { PrototypeSwitcher } from "@/components/prototype/switcher"

export function PrototypeNavPage() {
  const searchParams = useSearchParams()
  const variant = searchParams.get("variant") ?? "A"

  return (
    <>
      {variant === "A" && <VariantA />}
      {variant === "B" && <VariantB />}
      {variant === "C" && <VariantC />}
      <PrototypeSwitcher />
    </>
  )
}
