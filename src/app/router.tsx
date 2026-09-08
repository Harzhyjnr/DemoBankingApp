import { Route, Routes } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import DashboardPage from '@/app/pages/DashboardPage'
import UiGalleryPage from '@/app/pages/UiGalleryPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="/ui" element={<UiGalleryPage />} />
      </Route>
    </Routes>
  )
}
