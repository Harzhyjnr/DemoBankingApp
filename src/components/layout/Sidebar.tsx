import { NavLink } from 'react-router-dom'
import { Landmark } from 'lucide-react'
import { navItems } from '@/app/routes'
import { cn } from '@/lib/utils'

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-muted/40 md:block">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Landmark className="h-5 w-5" aria-hidden="true" />
        <span className="font-semibold">Banking App</span>
      </div>
      <nav className="space-y-1 p-4" aria-label="Primary">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              cn(
                'block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                isActive && 'bg-accent text-accent-foreground',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
