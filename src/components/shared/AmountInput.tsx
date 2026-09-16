import { cn } from '@/lib/utils'
import { FieldError } from '@/components/shared/FieldError'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatMoney, toMinorUnits } from '@/lib/money'

export interface AmountInputProps {
  id: string
  value: string
  onValueChange: (value: string) => void
  currency?: string
  locale?: string
  label?: string
  hint?: string
  error?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function AmountInput({
  id,
  value,
  onValueChange,
  currency = 'NGN',
  locale = 'en-NG',
  label,
  hint,
  error,
  placeholder = '0.00',
  disabled,
  className,
}: AmountInputProps) {
  const parsed = parseLocalizedNumber(value)
  const preview =
    Number.isFinite(parsed) && parsed > 0
      ? formatMoney(toMinorUnits(parsed), { currency, locale })
      : undefined
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined

  return (
    <div className="space-y-1.5">
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground"
        >
          ₦
        </span>
        <Input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(event) => onValueChange(sanitizeAmount(event.target.value))}
          className={cn('pl-7', className)}
        />
      </div>
      {preview ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          That&apos;s {preview}
        </p>
      ) : null}
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  )
}

function parseLocalizedNumber(value: string): number {
  const normalized = value.trim().replace(',', '.')
  return Number(normalized)
}

function sanitizeAmount(value: string): string {
  return value
    .replace(/[^\d.,]/g, '')
    .replace(',', '.')
    .replace(/\.(?=.*\.)/g, '')
    .replace(/^(\d+\.?\d{0,2}).*$/, '$1')
}
