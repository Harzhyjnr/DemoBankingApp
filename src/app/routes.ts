import {
  ArrowLeftRight,
  CreditCard,
  LayoutDashboard,
  Palette,
  PieChart,
  ReceiptText,
  Settings,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon?: LucideIcon
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Portfolio', href: '/portfolio', icon: PieChart },
  { label: 'Activity', href: '/transactions', icon: ReceiptText },
  { label: 'Send', href: '/transfers', icon: ArrowLeftRight },
  { label: 'Cards', href: '/cards', icon: CreditCard },
  { label: 'Insights', href: '/insights', icon: TrendingUp },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'UI Gallery', href: '/ui', icon: Palette },
]
