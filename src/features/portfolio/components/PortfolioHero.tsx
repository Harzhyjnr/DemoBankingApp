import { useNavigate } from 'react-router-dom'
import { ArrowLeftRight, ArrowUpRight, Wallet } from 'lucide-react'

import { ChangePill } from '@/features/portfolio/components/ChangePill'
import { Button } from '@/components/ui/button'
import { Money } from '@/components/shared/Money'
import type { PortfolioSummary } from '@/lib/api/types'
import { cn } from '@/lib/utils'

interface PortfolioHeroProps {
  summary: PortfolioSummary | undefined
  isPending: boolean
  cryptoShare: number
}

export function PortfolioHero({ summary, isPending, cryptoShare }: PortfolioHeroProps) {
  const navigate = useNavigate()

  return (
    <section aria-label="Portfolio value">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-600/20 via-teal-700/20 to-cyan-800/20 shadow-glow-green">
        <div aria-hidden="true" className="absolute inset-0 bg-grid opacity-50 bg-radial-fade" />
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-16 size-72 rounded-full bg-emerald-400/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 left-1/3 size-80 rounded-full bg-cyan-400/15 blur-3xl"
        />

        <div className="relative grid gap-8 p-6 md:p-8 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-foreground/80">
              <Wallet className="size-4" aria-hidden="true" />
              Total portfolio
            </p>
            {isPending || !summary ? (
              <div className="mt-3 h-14 w-64 animate-pulse rounded-xl bg-foreground/10" />
            ) : (
              <p className="mt-2 font-display text-5xl font-bold tracking-tight tabular-nums md:text-6xl">
                <Money amount={summary.totalValue} currency={summary.currency} />
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {summary ? (
                <>
                  <ChangePill
                    value={summary.change24h}
                    className="bg-white/10 text-foreground ring-white/15 [&_svg]:hidden"
                  />
                  <span className="text-xs text-foreground/70">today</span>
                </>
              ) : (
                <span className="h-6 w-28 animate-pulse rounded-full bg-foreground/10" />
              )}
              <span
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset',
                  'bg-white/10 text-foreground/80 ring-white/15',
                )}
              >
                Naira cash{' '}
                <span className="font-bold">
                  {summary ? Math.round((1 - cryptoShare) * 100) : 0}%
                </span>{' '}
                · Crypto{' '}
                <span className="font-bold">{summary ? Math.round(cryptoShare * 100) : 0}%</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3 lg:flex-col">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <Button
                onClick={() => navigate('/transfers')}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                <ArrowLeftRight className="size-4" aria-hidden="true" />
                Send
              </Button>
              <Button
                onClick={() => navigate('/transactions')}
                className="bg-emerald-400 text-emerald-950 hover:bg-emerald-300"
              >
                <ArrowUpRight className="size-4" aria-hidden="true" />
                Activity
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
