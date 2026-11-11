import Link from "next/link"
import { ArrowLeft, BookOpen } from "lucide-react"
import { Button } from "@gibiverse/ui/components/button"

type ResourcePageProps = {
  params: Promise<{ id: string }>
}

export default async function ResourceDetailPage({ params }: ResourcePageProps) {
  const { id } = await params

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        className="mb-6"
        nativeButton={false}
        render={<Link href="/resources" />}
      >
        <ArrowLeft data-icon="inline-start" />
        Back to resources
      </Button>
      <div className="flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <BookOpen className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Resource</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Resource ID: <code className="font-mono text-foreground">{id}</code>
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Full preview and download land in a follow-up ticket.
          </p>
        </div>
      </div>
    </div>
  )
}
