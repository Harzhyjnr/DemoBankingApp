import type { AssetSymbol } from '@/lib/api/types'
import { cn } from '@/lib/utils'

interface AssetIconProps {
  symbol: AssetSymbol
  className?: string
}

const STYLE: Record<AssetSymbol, string> = {
  BTC: 'bg-gradient-to-br from-amber-400 to-orange-500 text-orange-950',
  ETH: 'bg-gradient-to-br from-violet-400 to-indigo-500 text-indigo-950',
  USDT: 'bg-gradient-to-br from-teal-300 to-emerald-500 text-emerald-950',
}

export function AssetIcon({ symbol, className }: AssetIconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold shadow-md',
        STYLE[symbol],
        className,
      )}
    >
      {symbol === 'USDT' ? '$' : symbol}
    </span>
  )
}
