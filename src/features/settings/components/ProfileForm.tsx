import { useState, type FormEvent } from 'react'

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
import { FieldError } from '@/components/shared/FieldError'
import { useUpdateProfile } from '@/features/settings/api'
import { useAuthStore } from '@/lib/auth/authStore'
import { setTheme, type Theme } from '@/lib/theme'
import type { Currency } from '@/lib/api/types'
import { cn } from '@/lib/utils'

const CURRENCY_OPTIONS: Currency[] = ['NGN', 'USD', 'EUR', 'GBP']

export function ProfileForm() {
  const user = useAuthStore((state) => state.user)
  const mutation = useUpdateProfile()

  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [preferredCurrency, setPreferredCurrency] = useState<Currency>(
    user?.preferredCurrency ?? 'NGN',
  )
  const [selectedTheme, setSelectedTheme] = useState<Theme>(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  })
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string }>({})

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const nextErrors: typeof errors = {}
    if (!firstName.trim()) nextErrors.firstName = 'First name is required.'
    if (!lastName.trim()) nextErrors.lastName = 'Last name is required.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    mutation.mutate({ firstName, lastName, preferredCurrency })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
          />
          <FieldError id="firstName-error">{errors.firstName}</FieldError>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
          />
          <FieldError id="lastName-error">{errors.lastName}</FieldError>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="preferredCurrency">Preferred currency</Label>
          <Select
            value={preferredCurrency}
            onValueChange={(value) => setPreferredCurrency(value as Currency)}
          >
            <SelectTrigger id="preferredCurrency" aria-label="Preferred currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <span className="text-sm font-medium leading-none">Theme</span>
          <div
            role="group"
            aria-label="Theme"
            className="flex items-center rounded-lg border border-border/70 bg-muted/40 p-1"
          >
            {(['light', 'dark'] as const).map((option) => {
              const active = selectedTheme === option
              return (
                <Button
                  key={option}
                  size="sm"
                  variant={active ? 'default' : 'ghost'}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setSelectedTheme(option)
                    setTheme(option)
                  }}
                  className={cn('flex-1 capitalize')}
                >
                  {option}
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Saving…' : 'Save profile'}
      </Button>
    </form>
  )
}
