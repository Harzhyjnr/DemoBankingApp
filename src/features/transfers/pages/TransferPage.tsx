import { useSearchParams } from 'react-router-dom'
import { ArrowLeftRight, Zap } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { CardContent } from '@/components/ui/card'
import { TransferForm } from '@/features/transfers/components/TransferForm'

export default function TransferPage() {
  const [searchParams] = useSearchParams()
  const defaultFromAccountId = searchParams.get('from') ?? undefined

  return (
    <div className="space-y-8">
      <PageHeader
        title="Send money"
        description="Move money between your naira accounts in seconds."
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20">
          <ArrowLeftRight className="size-3.5" aria-hidden="true" />
          Instant · no fees
        </span>
      </PageHeader>

      <section aria-label="New transfer" className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 right-10 hidden size-40 rounded-full bg-emerald-500/10 blur-3xl lg:block"
        />
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 shadow-card-hover backdrop-blur">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-grid opacity-20 bg-radial-fade" />
          <CardContent className="relative py-8">
            <div className="mb-6 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-500 ring-1 ring-emerald-500/20">
                <Zap className="size-3" aria-hidden="true" />
                Money moves in seconds
              </span>
            </div>
            <TransferForm defaultFromAccountId={defaultFromAccountId} />
          </CardContent>
        </div>
      </section>
    </div>
  )
}
