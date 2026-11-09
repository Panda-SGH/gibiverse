// PROTOTYPE — 3 variants of Gibiverse page structure & navigation, switchable via ?variant=A|B|C
// Question: What pages does the student-facing web app need, and how does a student navigate between them?

import { Suspense } from "react"
import { PrototypeNavPage } from "./client"

export default function Page() {
  return (
    <Suspense>
      <PrototypeNavPage />
    </Suspense>
  )
}
