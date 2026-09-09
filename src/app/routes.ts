export interface NavItem {
  label: string
  href: string
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/' },
  { label: 'Accounts', href: '/accounts' },
  { label: 'Transactions', href: '/transactions' },
  { label: 'UI Gallery', href: '/ui' },
]
