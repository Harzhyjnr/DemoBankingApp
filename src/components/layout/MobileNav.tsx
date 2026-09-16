import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { navItems } from '@/app/routes'
import { Logo } from '@/components/shared/Logo'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function MobileNav({ open, onOpenChange }: MobileNavProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="top-0 left-0 h-full max-h-full w-72 translate-x-0 translate-y-0 rounded-none border-r p-0 sm:rounded-none"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="flex h-16 items-center justify-between border-b px-5">
          <Logo />
          <DialogTitle className="sr-only">Navigation menu</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close menu"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <nav className="space-y-1 p-3" aria-label="Primary mobile">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/'}
                onClick={() => onOpenChange(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accentForeground'
                      : 'text-foreground/70 hover:bg-muted hover:text-foreground',
                  )
                }
              >
                {Icon ? <Icon className="size-5 shrink-0" aria-hidden="true" /> : null}
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </DialogContent>
    </Dialog>
  )
}
