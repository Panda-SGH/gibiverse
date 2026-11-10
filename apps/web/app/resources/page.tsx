import { BookOpen } from "lucide-react"

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <BookOpen className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Course Resources
          </h1>
          <p className="text-sm text-muted-foreground">
            Explore past exams, lecture notes, slides, and assignments across
            courses.
          </p>
        </div>
      </div>
    </div>
  )
}
