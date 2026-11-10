"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { GraduationCap, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@gibiverse/ui/components/button"
import { signIn, useSession } from "@/lib/auth-client"
import { GoogleAuthButton } from "@/components/google-auth-button"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const { data: session, isPending: isSessionPending } = useSession()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // Redirect to home if already authenticated
  React.useEffect(() => {
    if (!isSessionPending && session?.user) {
      router.replace("/")
    }
  }, [session, isSessionPending, router])

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.")
      return
    }

    setIsLoading(true)
    try {
      const result = await signIn.email({
        email,
        password,
        callbackURL: callbackUrl,
      })

      if (result?.error) {
        setErrorMessage(
          result.error.message ||
            "Failed to sign in. Please verify your credentials."
        )
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred."
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSessionPending) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-col items-center space-y-2 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <GraduationCap className="size-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Sign in to Gibiverse
        </h1>
        <p className="text-sm text-muted-foreground">
          Access your university academic resources and course Q&amp;A
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        {errorMessage && (
          <div
            className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
            role="alert"
          >
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Google OAuth One-Click */}
        <GoogleAuthButton
          callbackUrl={callbackUrl}
          text="Continue with Google"
          disabled={isLoading}
          onError={setErrorMessage}
          testId="google-signin-button"
        />

        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Password
              </label>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            Sign In
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to Gibiverse?{" "}
        <Link
          href={`/sign-up${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign Up
        </Link>
      </p>
    </div>
  )
}

export default function SignInPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SignInForm />
    </React.Suspense>
  )
}
