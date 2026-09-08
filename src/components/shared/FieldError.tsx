import * as React from 'react'
import { cn } from '@/lib/utils'

export function FieldError({ className, ...props }: React.ComponentProps<'p'>) {
  if (!props.children) return null
  return (
    <p
      id={props.id}
      className={cn('text-sm font-medium text-destructive', className)}
      role="alert"
      {...props}
    />
  )
}
