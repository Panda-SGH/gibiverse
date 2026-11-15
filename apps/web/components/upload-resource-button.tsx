"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Upload } from "lucide-react"
import { Button } from "@gibiverse/ui/components/button"
import { UploadResourceWizard } from "@/components/upload-resource-wizard"
import type { Course, Department } from "@/app/courses/presentation"
import { useSession } from "@/lib/auth-client"
import { getUploadSignInHref, UPLOAD_RESOURCE_PATH } from "@/app/resources/presentation"

type UploadResourceButtonProps = {
  departments: Department[]
  courses: Course[]
  /** When true, open the wizard immediately (authenticated deep link). */
  autoOpen?: boolean
}

export function UploadResourceButton({
  departments,
  courses,
  autoOpen = false,
}: UploadResourceButtonProps) {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [open, setOpen] = React.useState(false)
  const didAutoOpen = React.useRef(false)

  React.useEffect(() => {
    if (!autoOpen || didAutoOpen.current || isPending) return
    if (!session?.user) {
      router.replace(getUploadSignInHref(UPLOAD_RESOURCE_PATH))
      return
    }
    didAutoOpen.current = true
    setOpen(true)
  }, [autoOpen, isPending, router, session?.user])

  function handleClick() {
    if (isPending) return
    if (!session?.user) {
      router.push(getUploadSignInHref(UPLOAD_RESOURCE_PATH))
      return
    }
    setOpen(true)
  }

  return (
    <>
      <Button type="button" onClick={handleClick} disabled={isPending}>
        <Upload data-icon="inline-start" />
        Upload Resource
      </Button>
      <UploadResourceWizard
        open={open}
        onOpenChange={setOpen}
        departments={departments}
        courses={courses}
      />
    </>
  )
}
