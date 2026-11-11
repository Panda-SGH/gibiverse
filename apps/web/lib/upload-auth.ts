/** Path used as the post-sign-in return target for resource upload. */
export const UPLOAD_RESOURCE_PATH = "/resources/upload"

export function getUploadSignInHref(
  callbackPath: string = UPLOAD_RESOURCE_PATH
): string {
  const callbackUrl = encodeURIComponent(callbackPath)
  return `/sign-in?callbackUrl=${callbackUrl}`
}
