import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChangePillProps {
  value: number
  className?: string
}

export function ChangePill({ value, className }: ChangePillProps) {
  const isUp = value >= 0
  const Icon = isUp ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ring-1 ring-inset',
        isUp
          ? 'bg-emerald-500/15 text-emerald-500 ring-emerald-500/25'
          : 'bg-rose-500/15 text-rose-500 ring-rose-500/25',
        className,
      )}
      data-trend={isUp ? 'up' : 'down'}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {Math.abs(value).toFixed(2)}%
    </span>
  )
}
