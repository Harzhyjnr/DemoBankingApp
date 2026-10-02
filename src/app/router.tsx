import { Route, Routes } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import LoginPage from '@/app/pages/LoginPage'
import RegisterPage from '@/app/pages/RegisterPage'
import NotFoundPage from '@/app/pages/NotFoundPage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import PortfolioPage from '@/features/portfolio/pages/PortfolioPage'
import AccountsPage from '@/features/accounts/pages/AccountsPage'
import AccountDetailPage from '@/features/accounts/pages/AccountDetailPage'
import TransactionsPage from '@/features/transactions/pages/TransactionsPage'
import TransferPage from '@/features/transfers/pages/TransferPage'
import CardsPage from '@/features/cards/pages/CardsPage'
import InsightsPage from '@/features/insights/pages/InsightsPage'
import SettingsPage from '@/features/settings/pages/SettingsPage'
import UiGalleryPage from '@/app/pages/UiGalleryPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/accounts/:accountId" element={<AccountDetailPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/transfers" element={<TransferPage />} />
          <Route path="/cards" element={<CardsPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/ui" element={<UiGalleryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
