import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { LogOut, Settings, User } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { logoutUser } from '@/lib/auth/authApi'
import { useAuthStore } from '@/lib/auth/authStore'
import { queryClient } from '@/app/queryClient'

function initials(firstName?: string, lastName?: string): string {
  const first = firstName?.trim().charAt(0) ?? ''
  const last = lastName?.trim().charAt(0) ?? ''
  return `${first}${last}`.toUpperCase() || 'GU'
}

export function ProfileMenu() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: logoutUser,
    onSettled: () => {
      logout()
      queryClient.clear()
      navigate('/login', { replace: true })
    },
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Account menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {initials(user?.firstName, user?.lastName)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <span className="block">{user ? `${user.firstName} ${user.lastName}` : 'Guest'}</span>
          <span className="block text-xs font-normal text-muted-foreground">{user?.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <User className="h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Settings className="h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
