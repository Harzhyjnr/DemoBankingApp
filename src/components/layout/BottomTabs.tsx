import { NavLink } from 'react-router-dom'
import { ArrowLeftRight, LayoutDashboard, PieChart, ReceiptText } from 'lucide-react'

import { cn } from '@/lib/utils'

const TABS = [
  { label: 'Home', href: '/', icon: LayoutDashboard, end: true },
  { label: 'Portfolio', href: '/portfolio', icon: PieChart, end: false },
  { label: 'Activity', href: '/transactions', icon: ReceiptText, end: false },
  { label: 'Send', href: '/transfers', icon: ArrowLeftRight, end: false },
]

export function BottomTabs() {
  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border/70 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <div className="grid grid-cols-4">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <NavLink
              key={tab.href}
              to={tab.href}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
                  isActive ? 'text-emerald-400' : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'size-5',
                      isActive && 'drop-shadow-[0_0_6px_hsl(158_84%_55%/0.7)]',
                    )}
                    aria-hidden="true"
                  />
                  {tab.label}
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
