import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/features/settings/api'
import type { NotificationPreferences } from '@/lib/api/types'

const OPTIONS: Array<{
  key: keyof NotificationPreferences
  title: string
  description: string
}> = [
  {
    key: 'transferAlerts',
    title: 'Transfer alerts',
    description: 'Notify me when money moves in or out of my accounts.',
  },
  {
    key: 'securityAlerts',
    title: 'Security alerts',
    description: 'Notify me about sign-ins, PIN changes and device activity.',
  },
  {
    key: 'promotions',
    title: 'Product updates & promotions',
    description: 'Occasional news about new features and offers.',
  },
]

export function NotificationsForm() {
  const { data: prefs, isPending } = useNotificationPreferences()
  const mutation = useUpdateNotificationPreferences()
  const [draft, setDraft] = useState<NotificationPreferences | null>(null)

  const current = draft ?? prefs
  const dirty = draft !== null

  function toggle(key: keyof NotificationPreferences, checked: boolean) {
    setDraft({ ...(current as NotificationPreferences), [key]: checked })
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!current) return
    mutation.mutate(current, {
      onSuccess: () => setDraft(null),
    })
  }

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
    )
  }

  if (!current) {
    return <p className="text-sm text-muted-foreground">We couldn't load your preferences.</p>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <ul className="space-y-3">
        {OPTIONS.map(({ key, title, description }) => (
          <li
            key={key}
            className="flex items-center justify-between gap-4 rounded-lg border border-border/70 p-4"
          >
            <div>
              <Label htmlFor={`pref-${key}`} className="text-sm font-medium">
                {title}
              </Label>
              <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            </div>
            <Checkbox
              id={`pref-${key}`}
              checked={current[key]}
              onChange={(event) => toggle(key, event.target.checked)}
            />
          </li>
        ))}
      </ul>

      <Button type="submit" disabled={!dirty || mutation.isPending}>
        {mutation.isPending ? 'Saving…' : 'Save preferences'}
      </Button>
    </form>
  )
}
