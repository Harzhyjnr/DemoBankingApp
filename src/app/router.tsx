import { Route, Routes } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import LoginPage from '@/app/pages/LoginPage'
import RegisterPage from '@/app/pages/RegisterPage'
import DashboardPage from '@/app/pages/DashboardPage'
import UiGalleryPage from '@/app/pages/UiGalleryPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="/ui" element={<UiGalleryPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
