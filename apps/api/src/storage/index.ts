import { LocalStorage } from "./local.js"
import type { StorageProvider } from "./types.js"

export type { StorageProvider } from "./types.js"
export { LocalStorage } from "./local.js"

export function createStorage(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER ?? "local"

  if (provider === "s3") {
    throw new Error(
      "S3 storage provider is not implemented yet. Set STORAGE_PROVIDER=local."
    )
  }

  const basePath = process.env.STORAGE_LOCAL_PATH ?? "./uploads"
  return new LocalStorage({ basePath })
}
