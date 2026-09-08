import { Menu, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProfileMenu } from '@/components/auth/ProfileMenu'
import { useTheme } from '@/hooks/useTheme'

interface TopbarProps {
  onMenuClick: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-2 border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
          onClick={onMenuClick}
        >
          <Menu className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground md:inline hidden">Overview</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <ProfileMenu />
      </div>
    </header>
  )
}
