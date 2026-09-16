import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import MobileNav from '@/components/layout/MobileNav'
import { BottomTabs } from '@/components/layout/BottomTabs'

export default function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="relative flex min-h-screen overflow-x-clip bg-background text-foreground">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 right-0 size-[32rem] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute top-1/3 -left-40 size-[28rem] rounded-full bg-teal-500/10 blur-[120px]" />
        <div className="absolute right-1/4 -bottom-40 size-[30rem] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 pb-20 md:pb-0">
          <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomTabs />
      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
    </div>
  )
}
