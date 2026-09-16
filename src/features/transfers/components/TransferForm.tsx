import { useState } from 'react'
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Landmark, Loader2 } from 'lucide-react'

import { Money } from '@/components/shared/Money'
import { FieldError } from '@/components/shared/FieldError'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAccounts } from '@/features/accounts/api'
import { useCreateTransfer } from '@/features/transfers/api'
import { toMinorUnits, formatMoney } from '@/lib/money'
import type { Account } from '@/lib/api/types'

interface TransferFormProps {
  defaultFromAccountId?: string
  onCancel?: () => void
}

type Step = 'details' | 'review' | 'done'

interface FormState {
  fromAccountId: string
  toAccountId: string
  amount: string
  description: string
}

interface ReviewValues {
  fromAccount: Account | undefined
  toAccount: Account | undefined
  amountMinor: number
  description: string
}

const EMPTY_FORM: FormState = {
  fromAccountId: '',
  toAccountId: '',
  amount: '',
  description: '',
}

function parseAmount(raw: string): number {
  const value = Number(raw.trim().replace(',', '.'))
  if (!Number.isFinite(value) || value <= 0) return NaN
  return toMinorUnits(value)
}

export function TransferForm({ defaultFromAccountId, onCancel }: TransferFormProps) {
  const accountsQuery = useAccounts()
  const transferMutation = useCreateTransfer()

  const [step, setStep] = useState<Step>('details')
  const [form, setForm] = useState<FormState>(() =>
    defaultFromAccountId ? { ...EMPTY_FORM, fromAccountId: defaultFromAccountId } : EMPTY_FORM,
  )
  const [review, setReview] = useState<ReviewValues | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const accounts = accountsQuery.data ?? []
  const currency = accounts[0]?.currency ?? 'NGN'

  function selectAccount(id: string, field: 'fromAccountId' | 'toAccountId') {
    setForm((current) => ({
      ...current,
      [field]: id,
    }))
  }

  function goToReview() {
    const nextErrors: Record<string, string> = {}

    if (!form.fromAccountId) nextErrors.fromAccountId = 'Select a source account.'
    if (!form.toAccountId) nextErrors.toAccountId = 'Select a destination account.'
    if (form.fromAccountId && form.fromAccountId === form.toAccountId) {
      nextErrors.toAccountId = 'Destination must be different from the source account.'
    }

    const amountMinor = parseAmount(form.amount)
    if (!form.amount || Number.isNaN(amountMinor)) {
      nextErrors.amount = 'Enter an amount greater than zero.'
    }

    const fromAccount = accounts.find((account) => account.id === form.fromAccountId)
    if (fromAccount && !Number.isNaN(amountMinor) && amountMinor > fromAccount.balance.amount) {
      nextErrors.amount = 'Amount exceeds the available balance of the source account.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const toAccount = accounts.find((account) => account.id === form.toAccountId)
    setReview({
      fromAccount,
      toAccount,
      amountMinor,
      description: form.description.trim(),
    })
    setStep('review')
  }

  function backToDetails() {
    setErrors({})
    setStep('details')
  }

  function submit() {
    if (!review) return
    transferMutation.mutate(
      {
        fromAccountId: review.fromAccount!.id,
        toAccountId: review.toAccount!.id,
        amount: { amount: review.amountMinor, currency },
        description: review.description || undefined,
      },
      {
        onSuccess: () => setStep('done'),
      },
    )
  }

  if (step === 'done' && review) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40">
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Transfer complete</h2>
          <p className="text-muted-foreground">
            {formatMoney(review.amountMinor, { currency })} moved from {review.fromAccount?.name} to{' '}
            {review.toAccount?.name}.
          </p>
        </div>
        <Button onClick={() => setStep('details')}>Send another transfer</Button>
      </div>
    )
  }

  if (step === 'review' && review) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold tracking-tight">Review transfer</h2>
        <dl className="divide-y overflow-hidden rounded-2xl border border-border/60 bg-muted/40">
          <div className="flex items-center justify-between px-4 py-3">
            <dt className="text-sm text-muted-foreground">From</dt>
            <dd className="flex items-center gap-2 text-sm font-medium">
              <Landmark className="h-4 w-4" aria-hidden="true" />
              {review.fromAccount?.name}
            </dd>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <dt className="text-sm text-muted-foreground">To</dt>
            <dd className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="h-4 w-4" aria-hidden="true" />
              {review.toAccount?.name}
            </dd>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <dt className="text-sm text-muted-foreground">Amount</dt>
            <dd className="text-lg font-semibold tabular-nums">
              <Money amount={review.amountMinor} currency={currency} />
            </dd>
          </div>
          {review.description ? (
            <div className="flex items-center justify-between px-4 py-3">
              <dt className="text-sm text-muted-foreground">Note</dt>
              <dd className="text-sm font-medium">{review.description}</dd>
            </div>
          ) : null}
        </dl>

        {transferMutation.isError && (
          <p className="text-sm font-medium text-destructive" role="alert">
            {(transferMutation.error as Error)?.message ?? 'The transfer could not be completed.'}
          </p>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <Button variant="ghost" onClick={backToDetails} disabled={transferMutation.isPending}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Button>
          <Button onClick={submit} disabled={transferMutation.isPending}>
            {transferMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            Confirm transfer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">New transfer</h2>
        <p className="text-sm text-muted-foreground">
          Move money between your own accounts in a few steps.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="from-account">From account</Label>
          <Select
            value={form.fromAccountId}
            onValueChange={(value) => selectAccount(value, 'fromAccountId')}
          >
            <SelectTrigger id="from-account" aria-label="Source account">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} ·{' '}
                  {formatMoney(account.balance.amount, { currency: account.currency })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError>{errors.fromAccountId}</FieldError>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="to-account">To account</Label>
          <Select
            value={form.toAccountId}
            onValueChange={(value) => selectAccount(value, 'toAccountId')}
          >
            <SelectTrigger id="to-account" aria-label="Destination account">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError>{errors.toAccountId}</FieldError>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="transfer-amount">Amount</Label>
        <Input
          id="transfer-amount"
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={form.amount}
          onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
        />
        <FieldError>{errors.amount}</FieldError>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="transfer-description">Note (optional)</Label>
        <Input
          id="transfer-description"
          type="text"
          placeholder="e.g. Monthly savings"
          value={form.description}
          onChange={(event) =>
            setForm((current) => ({ ...current, description: event.target.value }))
          }
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        {onCancel ? (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : (
          <span />
        )}
        <Button onClick={goToReview} disabled={accountsQuery.isPending}>
          Review transfer
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
