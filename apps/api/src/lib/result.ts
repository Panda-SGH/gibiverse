import type dbDefault from "../db/index.js"

export type Db = typeof dbDefault

export type StudentIdentity = {
  id: string
  name: string
}

export type ErrorCode = "validation" | "not_found" | "forbidden"

export type DomainError = {
  code: ErrorCode
  message: string
}

export type Result<T> =
  { ok: true; data: T } | { ok: false; error: DomainError }

export function ok<T>(data: T): Result<T> {
  return { ok: true, data }
}

export function err<T = never>(code: ErrorCode, message: string): Result<T> {
  return { ok: false, error: { code, message } }
}

export function statusFor(error: DomainError): 400 | 403 | 404 {
  if (error.code === "not_found") return 404
  if (error.code === "forbidden") return 403
  return 400
}
