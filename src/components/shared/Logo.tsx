import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  markClassName?: string
}

export function Logo({ className, markClassName }: LogoProps) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 font-display text-lg font-bold text-emerald-950 shadow-glow-green',
          markClassName,
        )}
      >
        ₦
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        Kobo<span className="text-gradient">Pay</span>
      </span>
    </span>
  )
}
