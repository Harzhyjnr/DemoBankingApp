import { useState, type FormEvent } from 'react'
import { ShieldCheck, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { FieldError } from '@/components/shared/FieldError'
import { useUpdateSecurity } from '@/features/settings/api'

interface Session {
  id: string
  device: string
  lastActive: string
  current?: boolean
}

const INITIAL_SESSIONS: Session[] = [
  { id: 's1', device: 'Chrome on Windows', lastActive: 'Active now', current: true },
  { id: 's2', device: 'iPhone 15', lastActive: '2 days ago' },
  { id: 's3', device: 'Firefox on macOS', lastActive: '3 weeks ago' },
]

const PIN_PATTERN = /^\d{4}$/

export function SecurityForm() {
  const mutation = useUpdateSecurity()

  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [errors, setErrors] = useState<{
    currentPin?: string
    newPin?: string
    confirmPin?: string
  }>({})
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)
  const [sessions, setSessions] = useState(INITIAL_SESSIONS)

  function validate(): boolean {
    const nextErrors: typeof errors = {}

    if (!PIN_PATTERN.test(currentPin)) {
      nextErrors.currentPin = 'Current PIN must be 4 digits.'
    }
    if (!PIN_PATTERN.test(newPin)) {
      nextErrors.newPin = 'New PIN must be 4 digits.'
    }
    if (!PIN_PATTERN.test(confirmPin)) {
      nextErrors.confirmPin = 'Confirm your new PIN.'
    } else if (confirmPin !== newPin) {
      nextErrors.confirmPin = 'PINs do not match.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!validate()) return
    mutation.mutate({ currentPin, newPin })
  }

  function revokeSession(sessionId: string) {
    setSessions((current) => current.filter((session) => session.id !== sessionId))
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="currentPin">Current PIN</Label>
          <Input
            id="currentPin"
            type="password"
            inputMode="numeric"
            maxLength={4}
            autoComplete="current-password"
            value={currentPin}
            onChange={(event) => setCurrentPin(event.target.value)}
            aria-invalid={Boolean(errors.currentPin)}
            aria-describedby={errors.currentPin ? 'currentPin-error' : undefined}
          />
          <FieldError id="currentPin-error">{errors.currentPin}</FieldError>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="newPin">New PIN</Label>
            <Input
              id="newPin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              autoComplete="new-password"
              value={newPin}
              onChange={(event) => setNewPin(event.target.value)}
              aria-invalid={Boolean(errors.newPin)}
              aria-describedby={errors.newPin ? 'newPin-error' : undefined}
            />
            <FieldError id="newPin-error">{errors.newPin}</FieldError>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPin">Confirm new PIN</Label>
            <Input
              id="confirmPin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              autoComplete="new-password"
              value={confirmPin}
              onChange={(event) => setConfirmPin(event.target.value)}
              aria-invalid={Boolean(errors.confirmPin)}
              aria-describedby={errors.confirmPin ? 'confirmPin-error' : undefined}
            />
            <FieldError id="confirmPin-error">{errors.confirmPin}</FieldError>
          </div>
        </div>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Updating…' : 'Change PIN'}
        </Button>
      </form>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border/70 p-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="size-4 text-emerald-500" aria-hidden="true" />
              Two-factor authentication
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Require a code from your authenticator app when you sign in.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox
              checked={twoFactorEnabled}
              onChange={(event) => {
                setTwoFactorEnabled(event.target.checked)
              }}
            />
            <span>{twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
          </label>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Active sessions</h4>
          <ul className="mt-3 divide-y divide-border/70 border-y border-border/70">
            {sessions.map((session) => (
              <li key={session.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium">
                    {session.device}
                    {session.current ? (
                      <span className="ml-2 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500 ring-1 ring-emerald-500/20">
                        This device
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">{session.lastActive}</p>
                </div>
                {!session.current ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => revokeSession(session.id)}
                    aria-label={`Revoke ${session.device}`}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Revoke
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
