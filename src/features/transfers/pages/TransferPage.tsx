import { useSearchParams } from 'react-router-dom'
import { ArrowLeftRight } from 'lucide-react'
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

      <section aria-label="New transfer">
        <div className="card-crypto relative overflow-hidden">
          <div aria-hidden="true" className="absolute inset-0 bg-grid opacity-30 bg-radial-fade" />
          <CardContent className="relative py-6">
            <TransferForm defaultFromAccountId={defaultFromAccountId} />
          </CardContent>
        </div>
      </section>
    </div>
  )
}
