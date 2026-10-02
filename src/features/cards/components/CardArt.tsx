import { Nfc, Snowflake } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import type { Card } from '@/lib/api/types'
import { cn } from '@/lib/utils'

const BRAND_GRADIENT: Record<string, string> = {
  Visa: 'from-indigo-600 via-violet-600 to-fuchsia-600',
  Mastercard: 'from-rose-600 via-orange-500 to-amber-500',
}

export function CardArt({ card, className }: { card: Card; className?: string }) {
  const frozen = card.status === 'frozen'

  return (
    <div
      className={cn(
        'relative aspect-[8/5] w-full overflow-hidden rounded-3xl p-5 text-white shadow-xl shadow-black/10 transition-all duration-300',
        'bg-gradient-to-br',
        BRAND_GRADIENT[card.brand] ?? 'from-slate-600 via-slate-700 to-slate-800',
        'ring-1 ring-white/20',
        frozen && 'grayscale brightness-90',
        className,
      )}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-grid opacity-20 bg-radial-fade" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/10"
      />
      <div
        aria-hidden="true"
        className="absolute -top-16 -right-16 size-48 rounded-full bg-white/15 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-20 -left-12 size-56 rounded-full bg-black/10 blur-3xl"
      />

      {frozen ? (
        <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm">
            <Snowflake className="mr-1.5 inline size-3.5" />
            Frozen
          </span>
        </div>
      ) : null}

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-wide">{card.name}</p>
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.2em] text-white/70">
              {card.brand}
            </p>
          </div>
          <Badge
            variant={frozen ? 'warning' : 'secondary'}
            className="border-transparent bg-black/30 text-white"
          >
            {frozen ? 'Frozen' : 'Active'}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex h-8 w-11 items-center justify-center rounded-md bg-gradient-to-br from-amber-200 to-amber-400 shadow-inner">
            <div className="h-5 w-8 rounded-[3px] border border-amber-700/40 bg-gradient-to-br from-amber-100/60 to-transparent" />
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/70">
            <Nfc className="size-4" aria-hidden="true" />
            Contactless
          </span>
        </div>

        <div className="flex items-end justify-between gap-3">
          <p className="font-mono text-lg tracking-[0.2em] text-white/95">{card.maskedNumber}</p>
          <p className="text-[11px] uppercase tracking-widest text-white/70">
            <span className="mr-1.5 text-white/50">Expires</span>
            {card.expiry}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-white/20 pt-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">Virtual card</span>
          <span className="font-display text-base font-bold italic tracking-wide">Kobo</span>
        </div>
      </div>
    </div>
  )
}
