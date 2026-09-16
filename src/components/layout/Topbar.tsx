import { useLocation } from 'react-router-dom'
import { Menu, Moon, Search, Sun } from 'lucide-react'
import { navItems } from '@/app/routes'
import { Button } from '@/components/ui/button'
import { ProfileMenu } from '@/components/auth/ProfileMenu'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

interface TopbarProps {
  onMenuClick: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, toggleTheme } = useTheme()
  const { pathname } = useLocation()

  const current = navItems.find((item) =>
    item.href === '/' ? pathname === '/' : pathname.startsWith(item.href),
  )

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-2 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 md:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
          onClick={onMenuClick}
        >
          <Menu className="h-4 w-4" />
        </Button>
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-sm">
            <li className="hidden text-muted-foreground sm:inline">Home</li>
            <li aria-hidden="true" className="hidden text-muted-foreground sm:inline">
              /
            </li>
            <li className={cn('font-medium', current && 'text-foreground')}>
              {current?.label ?? 'Overview'}
            </li>
          </ol>
        </nav>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="mr-1 hidden items-center gap-2 rounded-full border border-border/70 bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground lg:flex">
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Search assets</span>
          <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
        </div>
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
