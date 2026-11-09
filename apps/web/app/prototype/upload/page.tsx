// PROTOTYPE — 3 variants of Gibiverse Resource Upload UX & Client-Side Validation
// Switchable via ?variant=A|B|C
// Question: How should the resource upload experience behave for students?
// Rules: 50MB max, PDF/DOCX/PPTX/Images, inline preview vs download-only, drag-and-drop, progress & errors

import { Suspense } from "react"
import { PrototypeUploadClient } from "./client"

export default function UploadPrototypePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-neutral-500">Loading upload prototype...</div>}>
      <PrototypeUploadClient />
    </Suspense>
  )
}
