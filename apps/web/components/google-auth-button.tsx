"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@gibiverse/ui/components/button"
import { signIn } from "@/lib/auth-client"

interface GoogleAuthButtonProps {
  callbackUrl?: string
  text?: string
  disabled?: boolean
  onError?: (error: string) => void
  testId?: string
}

export function GoogleAuthButton({
  callbackUrl = "/",
  text = "Continue with Google",
  disabled = false,
  onError,
  testId = "google-auth-button",
}: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn.social({
        provider: "google",
        callbackURL: callbackUrl,
      })
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to initiate Google sign in."
      onError?.(message)
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="mb-5 flex w-full items-center justify-center gap-2 font-medium"
      onClick={handleGoogleSignIn}
      disabled={disabled || isLoading}
      data-testid={testId}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <svg className="size-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.675-5.17 3.675-9.15z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.25v3.15C3.26 21.36 7.34 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.25C.45 8.22 0 10.05 0 12s.45 3.78 1.25 5.39l4.02-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.61l4.02 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
          />
        </svg>
      )}
      <span>{text}</span>
    </Button>
  )
}
