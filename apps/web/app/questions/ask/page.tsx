import { AskQuestionButton } from "@/components/ask-question-button"
import { client } from "@gibiverse/api-client"

export default async function AskQuestionPage() {
  const [univRes, courseRes] = await Promise.all([
    client.api.universities.$get(),
    client.api.courses.$get(),
  ])

  const universities = univRes.ok ? await univRes.json() : []
  const courses = courseRes.ok ? await courseRes.json() : []

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ask a Question</h1>
        <p className="text-sm text-muted-foreground">
          Post an academic question tied to a course.
        </p>
      </div>
      <AskQuestionButton
        universities={universities}
        courses={courses}
        autoOpen
      />
    </div>
  )
}
