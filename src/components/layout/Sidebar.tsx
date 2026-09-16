import { NavLink } from 'react-router-dom'
import { Wallet } from 'lucide-react'

import { navItems } from '@/app/routes'
import { Logo } from '@/components/shared/Logo'
import { Money } from '@/components/shared/Money'
import { usePortfolio } from '@/features/portfolio/api'
import { useAuthStore } from '@/lib/auth/authStore'
import { cn } from '@/lib/utils'

export default function Sidebar() {
  const user = useAuthStore((state) => state.user)
  const portfolioQuery = usePortfolio()

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-16 items-center border-b px-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Primary">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accentForeground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <span
                      aria-hidden="true"
                      className="absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full bg-emerald-400 shadow-[0_0_12px_0] shadow-emerald-400/60"
                    />
                  ) : null}
                  {Icon ? <Icon className="size-5 shrink-0" aria-hidden="true" /> : null}
                  {item.label}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
      <div className="border-t p-3">
        <div className="card-crypto space-y-2 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 p-4">
          <p className="text-xs text-muted-foreground">
            {user ? `${user.firstName}'s wallet` : 'Your wallet'}
          </p>
          {portfolioQuery.isPending ? (
            <div className="h-6 w-32 animate-pulse rounded-lg bg-foreground/10" />
          ) : portfolioQuery.data ? (
            <p className="flex items-center gap-1.5 font-display text-lg font-bold tabular-nums">
              <Wallet className="size-4 text-emerald-400" aria-hidden="true" />
              <Money
                amount={portfolioQuery.data.summary.totalValue}
                currency={portfolioQuery.data.summary.currency}
              />
            </p>
          ) : null}
          <p className="text-[11px] text-muted-foreground">
            Naira + crypto, <span className="text-emerald-400">in motion.</span>
          </p>
        </div>
      </div>
    </aside>
  )
}
