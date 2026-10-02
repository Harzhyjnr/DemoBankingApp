import { CreditCard, ShieldCheck, SlidersHorizontal } from 'lucide-react'

import { CardArt } from '@/features/cards/components/CardArt'
import { FreezeToggle } from '@/features/cards/components/FreezeToggle'
import { useCards } from '@/features/cards/api'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export default function CardsPage() {
  const { data: cards, isPending, isError, refetch } = useCards()

  return (
    <div className="space-y-8">
      <PageHeader title="Cards" description="Freeze or re-activate your virtual cards instantly.">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          Chip · contactless · frozen in one tap
        </span>
      </PageHeader>

      {isPending ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {Array.from({ length: 2 }, (_, i) => (
            <Skeleton key={i} className="aspect-[8/5] rounded-3xl" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="We couldn't load your cards"
          description="Something went wrong while fetching your cards."
        >
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </EmptyState>
      ) : cards && cards.length > 0 ? (
        <div className="grid items-start gap-6 sm:grid-cols-2">
          {cards.map((card, index) => {
            const frozen = card.status === 'frozen'
            return (
              <div
                key={card.id}
                className={cn('group transition-all duration-300', index === 1 && 'sm:mt-8')}
              >
                <Card
                  className={cn(
                    'overflow-visible rounded-3xl border-border/60 shadow-card-hover transition-all duration-300',
                    'hover:-translate-y-1 hover:shadow-xl',
                    frozen && 'opacity-90',
                  )}
                >
                  <CardContent className="space-y-4 p-5">
                    <CardArt card={card} />
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <SlidersHorizontal
                          className="size-4 shrink-0 text-muted-foreground/60"
                          aria-hidden="true"
                        />
                        <span>
                          {frozen ? (
                            'Payments with this card are paused.'
                          ) : (
                            <>
                              This card is ready to use.
                              <CreditCard
                                className="ml-1.5 inline size-3.5 text-emerald-500"
                                aria-hidden="true"
                              />
                            </>
                          )}
                        </span>
                      </div>
                      <FreezeToggle card={card} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState title="No cards" description="You don't have any virtual cards yet.">
          <CreditCard className="size-6 text-muted-foreground" aria-hidden="true" />
        </EmptyState>
      )}
    </div>
  )
}
