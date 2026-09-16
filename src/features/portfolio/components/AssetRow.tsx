import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

import { Money } from '@/components/shared/Money'
import { AssetIcon } from '@/features/portfolio/components/AssetIcon'
import { ChangePill } from '@/features/portfolio/components/ChangePill'
import { Sparkline } from '@/features/portfolio/components/Sparkline'
import type { CryptoHolding, MarketPrice } from '@/lib/api/types'
import { cn } from '@/lib/utils'

interface AssetRowProps {
  holding: CryptoHolding
  price: MarketPrice
  href?: string
  className?: string
}

export function AssetRow({ holding, price, href, className }: AssetRowProps) {
  const trend = price.change24h >= 0 ? 'up' : 'down'
  const inner = (
    <>
      <div className="flex min-w-0 items-center gap-3">
        <AssetIcon symbol={holding.symbol} />
        <div className="min-w-0">
          <p className="truncate font-semibold">{price.name}</p>
          <p className="text-xs text-muted-foreground">
            {holding.symbol} ·{' '}
            {holding.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </p>
        </div>
      </div>
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium tabular-nums">{formatPrice(price.price)}</p>
        <p className="text-xs text-muted-foreground">per {holding.symbol}</p>
      </div>
      <ChangePill value={price.change24h} />
      <div className="hidden md:block">
        <Sparkline data={price.sparkline} trend={trend} />
      </div>
      <div className="text-right">
        <p className="font-semibold tabular-nums">
          <Money amount={holding.value} currency="NGN" />
        </p>
        <p className="text-xs text-muted-foreground">value</p>
      </div>
      {href ? <ChevronRight className="size-5 text-muted-foreground" aria-hidden="true" /> : null}
    </>
  )

  const classes = cn(
    'flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-muted/60 sm:gap-6',
    className,
  )

  if (href) {
    return (
      <Link to={href} className={cn(classes, 'group')}>
        {inner}
      </Link>
    )
  }
  return <div className={classes}>{inner}</div>
}

function formatPrice(priceMinor: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(priceMinor / 100)
}
