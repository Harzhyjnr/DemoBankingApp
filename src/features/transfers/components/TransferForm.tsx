import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Landmark,
  Loader2,
  Lock,
  UserPlus,
} from 'lucide-react'

import { AmountInput } from '@/components/shared/AmountInput'
import { FieldError } from '@/components/shared/FieldError'
import { Money } from '@/components/shared/Money'
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
import { useCreateTransfer, useRecentTransfers } from '@/features/transfers/api'
import { toMinorUnits, formatMoney } from '@/lib/money'
import type { Account, TransferRecipient } from '@/lib/api/types'
import { cn } from '@/lib/utils'

interface TransferFormProps {
  defaultFromAccountId?: string
  onCancel?: () => void
}

type Step = 'details' | 'review' | 'done'

const STEP_ORDER: Step[] = ['details', 'review', 'done']

const STEP_LABELS: Record<Step, string> = {
  details: 'Details',
  review: 'Review',
  done: 'Done',
}

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

function StepIndicator({ step }: { step: Step }) {
  const activeIndex = STEP_ORDER.indexOf(step)
  return (
    <ol aria-label="Transfer progress" className="flex items-center gap-2">
      {STEP_ORDER.map((label, index) => {
        const state =
          index < activeIndex ? 'complete' : index === activeIndex ? 'current' : 'upcoming'
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                'flex size-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                state === 'complete' &&
                  'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                state === 'current' &&
                  'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30',
                state === 'upcoming' && 'border-border text-muted-foreground',
              )}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              {state === 'complete' ? <Check className="size-3.5" aria-hidden="true" /> : index + 1}
            </span>
            <span
              className={cn(
                'text-xs font-medium',
                state === 'current' ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {STEP_LABELS[label]}
            </span>
            {index < STEP_ORDER.length - 1 ? (
              <span aria-hidden="true" className="mx-1 h-px w-6 bg-border" />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

export function TransferForm({ defaultFromAccountId, onCancel }: TransferFormProps) {
  const accountsQuery = useAccounts()
  const transferMutation = useCreateTransfer()
  const recentQuery = useRecentTransfers()

  const [step, setStep] = useState<Step>('details')
  const [form, setForm] = useState<FormState>(() =>
    defaultFromAccountId ? { ...EMPTY_FORM, fromAccountId: defaultFromAccountId } : EMPTY_FORM,
  )
  const [review, setReview] = useState<ReviewValues | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState<string | null>(null)

  const accounts = accountsQuery.data ?? []
  const currency = accounts[0]?.currency ?? 'NGN'
  const recent = recentQuery.data

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
    setPin('')
    setPinError(null)
    setStep('details')
  }

  function selectRecipient(recipient: TransferRecipient) {
    setForm((current) => ({ ...current, toAccountId: recipient.accountId }))
  }

  function submit() {
    if (!review) return
    if (!/^\d{4}$/.test(pin)) {
      setPinError('Enter your 4-digit PIN.')
      return
    }
    setPinError(null)
    transferMutation.mutate(
      {
        fromAccountId: review.fromAccount!.id,
        toAccountId: review.toAccount!.id,
        amount: { amount: review.amountMinor, currency },
        description: review.description || undefined,
        pin,
      },
      {
        onSuccess: () => setStep('done'),
      },
    )
  }

  if (step === 'done' && review) {
    const recents = recent?.transfers.slice(0, 3) ?? []
    const recipients = recent?.recipients.slice(0, 3) ?? []
    return (
      <div className="space-y-8">
        <div className="space-y-6 text-center">
          <div className="relative mx-auto flex size-20 items-center justify-center">
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-emerald-500/15 animate-pulse"
            />
            <span className="relative flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-600/30">
              <CheckCircle2 className="size-8" aria-hidden="true" />
            </span>
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Transfer complete</h2>
            <p className="text-muted-foreground">
              {formatMoney(review.amountMinor, { currency })} moved from {review.fromAccount?.name}{' '}
              to {review.toAccount?.name}.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <Button onClick={() => setStep('details')}>Send another transfer</Button>
            {onCancel ? (
              <Button variant="ghost" onClick={onCancel}>
                Done
              </Button>
            ) : null}
          </div>
        </div>

        {recipients.length > 0 ? (
          <section aria-label="Recent recipients" className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <UserPlus className="size-4 text-muted-foreground" aria-hidden="true" />
              Recent recipients
            </h3>
            <div className="flex flex-wrap gap-2">
              {recipients.map((recipient) => (
                <Button
                  key={recipient.accountId}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    selectRecipient(recipient)
                    setStep('details')
                  }}
                >
                  {recipient.accountName}
                </Button>
              ))}
            </div>
          </section>
        ) : null}

        <section aria-label="Recent transfers" className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
            Recent transfers
          </h3>
          {recents.length > 0 ? (
            <dl className="divide-y overflow-hidden rounded-2xl border border-border/60 bg-muted/40">
              {recents.map((transfer) => (
                <div
                  key={transfer.id}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <div className="min-w-0">
                    <dt className="truncate text-sm font-medium tabular-nums">
                      <Money amount={transfer.amount.amount} currency={transfer.amount.currency} />
                    </dt>
                    <p className="truncate text-xs text-muted-foreground">
                      {new Date(transfer.date).toLocaleDateString(undefined, {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                  <dd className="shrink-0 text-xs text-muted-foreground">
                    To{' '}
                    {accounts.find((account) => account.id === transfer.toAccountId)?.name ??
                      transfer.toAccountId}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">No recent transfers yet.</p>
          )}
        </section>
      </div>
    )
  }

  if (step === 'review' && review) {
    return (
      <div className="space-y-6">
        <StepIndicator step="review" />
        <h2 className="text-lg font-semibold tracking-tight">Review transfer</h2>
        <dl className="divide-y overflow-hidden rounded-2xl border border-border/60 bg-muted/40">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="flex items-center gap-2 text-sm text-muted-foreground">
              <Landmark className="size-4 text-emerald-500" aria-hidden="true" />
              From
            </dt>
            <dd className="text-sm font-medium">{review.fromAccount?.name}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="size-4 text-teal-500" aria-hidden="true" />
              To
            </dt>
            <dd className="text-sm font-medium">{review.toAccount?.name}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-emerald-500/5 to-transparent px-4 py-4">
            <dt className="text-sm text-muted-foreground">Amount</dt>
            <dd className="text-2xl font-bold tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400">
              <Money amount={review.amountMinor} currency={currency} />
            </dd>
          </div>
          {review.description ? (
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <dt className="text-sm text-muted-foreground">Note</dt>
              <dd className="text-sm font-medium">{review.description}</dd>
            </div>
          ) : null}
        </dl>

        <div className="space-y-1.5">
          <Label htmlFor="transfer-pin">Confirm with your 4-digit PIN</Label>
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground"
            >
              <Lock className="size-4" />
            </span>
            <Input
              id="transfer-pin"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              placeholder="••••"
              value={pin}
              className="pl-9"
              aria-invalid={pinError ? true : undefined}
              onChange={(event) => {
                setPin(event.target.value.replace(/\D/g, '').slice(0, 4))
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">Demo PIN: 1234</p>
          <FieldError>{pinError}</FieldError>
        </div>

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
          <Button
            onClick={submit}
            disabled={transferMutation.isPending}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700"
          >
            {transferMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            Confirm transfer
          </Button>
        </div>
      </div>
    )
  }

  const fromAccount = accounts.find((account) => account.id === form.fromAccountId)

  return (
    <div className="space-y-6">
      <StepIndicator step="details" />
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
            <SelectTrigger id="from-account" aria-label="Source account" className="h-12">
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
            <SelectTrigger id="to-account" aria-label="Destination account" className="h-12">
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

      <AmountInput
        id="transfer-amount"
        label="Amount"
        value={form.amount}
        onValueChange={(value) => setForm((current) => ({ ...current, amount: value }))}
        currency={currency}
        error={errors.amount}
        className="h-12 text-lg font-semibold"
        hint={
          fromAccount
            ? `Available: ${formatMoney(fromAccount.balance.amount, { currency: fromAccount.currency })}`
            : undefined
        }
      />

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
        <Button
          onClick={goToReview}
          disabled={accountsQuery.isPending}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700"
        >
          Review transfer
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
