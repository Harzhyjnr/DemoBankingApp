import { Snowflake, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useToggleCardStatus } from '@/features/cards/api'
import type { Card } from '@/lib/api/types'

interface FreezeToggleProps {
  card: Card
}

export function FreezeToggle({ card }: FreezeToggleProps) {
  const mutation = useToggleCardStatus()
  const frozen = card.status === 'frozen'
  const pending = mutation.isPending && mutation.variables?.cardId === card.id

  return (
    <Button
      variant={frozen ? 'outline' : 'secondary'}
      size="sm"
      disabled={pending}
      onClick={() => mutation.mutate({ cardId: card.id, status: frozen ? 'active' : 'frozen' })}
      aria-label={frozen ? `Re-activate ${card.name}` : `Freeze ${card.name}`}
    >
      {frozen ? (
        <Sun className="size-4" aria-hidden="true" />
      ) : (
        <Snowflake className="size-4" aria-hidden="true" />
      )}
      {pending ? 'Updating…' : frozen ? 'Re-activate' : 'Freeze'}
    </Button>
  )
}
