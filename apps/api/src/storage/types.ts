export type StoragePutOptions = {
  contentType?: string
}

export type StorageGetResult = {
  stream: ReadableStream<Uint8Array>
  contentType: string
  size: number
}

export type StorageUrlOptions = {
  expiresIn?: number
  disposition?: "inline" | "attachment"
}

export interface StorageProvider {
  put(
    key: string,
    data: Buffer | ReadableStream<Uint8Array>,
    opts?: StoragePutOptions
  ): Promise<{ key: string; size: number }>

  get(key: string): Promise<StorageGetResult | null>

  delete(key: string): Promise<void>

  exists(key: string): Promise<boolean>

  getUrl(key: string, opts?: StorageUrlOptions): Promise<string>
}
