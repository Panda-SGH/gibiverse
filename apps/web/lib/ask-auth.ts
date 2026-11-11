/** Path used as the post-sign-in return target for asking a question. */
export const ASK_QUESTION_PATH = "/questions/ask"

export function getAskSignInHref(
  callbackPath: string = ASK_QUESTION_PATH
): string {
  const callbackUrl = encodeURIComponent(callbackPath)
  return `/sign-in?callbackUrl=${callbackUrl}`
}
