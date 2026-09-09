import { Badge } from '@/components/ui/badge'
import type { TransactionStatus } from '@/lib/api/types'

const STATUS_VARIANT: Record<
  TransactionStatus,
  'secondary' | 'success' | 'destructive' | 'outline'
> = {
  completed: 'success',
  pending: 'secondary',
  failed: 'destructive',
  reversed: 'outline',
}

export function StatusBadge({ status }: { status: TransactionStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>
}
