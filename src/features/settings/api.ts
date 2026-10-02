import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { apiClient } from '@/lib/api/client'
import { useAuthStore } from '@/lib/auth/authStore'
import type { NotificationPreferences, ProfileUpdate, User } from '@/lib/api/types'

interface UserResponse {
  user: User
}

function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  return apiClient<NotificationPreferences>('/settings/notifications')
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['settings', 'notifications'],
    queryFn: fetchNotificationPreferences,
  })
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (prefs: NotificationPreferences) =>
      apiClient<NotificationPreferences>('/settings/notifications', {
        method: 'PATCH',
        body: JSON.stringify(prefs),
      }),
    onSuccess: (prefs) => {
      queryClient.setQueryData(['settings', 'notifications'], prefs)
      toast('Notification preferences updated.')
    },
  })
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (patch: ProfileUpdate) =>
      apiClient<UserResponse>('/settings/profile', {
        method: 'PATCH',
        body: JSON.stringify(patch),
      }),
    onSuccess: ({ user }) => {
      useAuthStore.setState({ user })
      toast('Profile updated.')
    },
  })
}

export function useUpdateSecurity() {
  return useMutation({
    mutationFn: (body: { currentPin: string; newPin: string }) =>
      apiClient<{ ok: boolean }>('/settings/security', {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: () => toast('Security settings updated.'),
  })
}
