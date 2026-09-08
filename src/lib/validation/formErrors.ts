import type { FieldValues, Path } from 'react-hook-form'
import type { ZodError } from 'zod'

export interface ZodFieldError {
  type: string
  message: string
}

export function zodToFieldErrors<TFieldValues extends FieldValues>(
  error: ZodError,
): Partial<Record<Path<TFieldValues>, ZodFieldError>> {
  const result: Partial<Record<Path<TFieldValues>, ZodFieldError>> = {}
  for (const issue of error.issues) {
    const key = issue.path[0] as Path<TFieldValues>
    if (key !== undefined && !result[key]) {
      result[key] = { type: issue.code, message: issue.message }
    }
  }
  return result
}
