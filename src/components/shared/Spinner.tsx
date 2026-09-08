import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SpinnerProps {
  className?: string
  label?: string
}

export function Spinner({ className, label = 'Loading' }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className="inline-flex items-center gap-2">
      <Loader2 className={cn('h-4 w-4 animate-spin', className)} aria-hidden="true" />
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  )
}
