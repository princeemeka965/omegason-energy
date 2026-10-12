import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AdminShell from '../../components/admin/AdminShell'
import { AdminProvider, useAdmin } from '../../lib/adminContext'
import CategoriesPage from './CategoriesPage'
import LoginPage from './LoginPage'
import ProductFormPage from './ProductFormPage'
import ProductsPage from './ProductsPage'
import QuotesPage from './QuotesPage'
import SettingsPage from './SettingsPage'

function AdminRouter() {
  const { session, ready, loadError } = useAdmin()
  const { pathname } = useLocation()
  const atLogin = pathname === '/auth/admin'

  if (!ready) {
    return <div className="grid min-h-screen place-items-center bg-paper font-semibold text-navy">Loading admin…</div>
  }
  if (loadError) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper px-6">
        <div className="max-w-md border border-line bg-white p-8">
          <h1 className="font-display text-2xl font-semibold text-navy">Admin API unavailable</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">{loadError}</p>
        </div>
      </div>
    )
  }

  if (!session && !atLogin) return <Navigate to="/auth/admin" replace />
  if (!session) return <LoginPage />
  if (atLogin) return <Navigate to="/auth/admin/products" replace />

  return (
    <AdminShell>
      <Routes>
        <Route path="/auth/admin/products/new" element={<ProductFormPage />} />
        <Route path="/auth/admin/products/:id" element={<ProductFormPage />} />
        <Route path="/auth/admin/products" element={<ProductsPage />} />
        <Route path="/auth/admin/categories" element={<CategoriesPage />} />
        <Route path="/auth/admin/quotes" element={<QuotesPage />} />
        <Route path="/auth/admin/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/auth/admin/products" replace />} />
      </Routes>
    </AdminShell>
  )
}

export default function AdminApp() {
  return (
    <AdminProvider>
      <AdminRouter />
    </AdminProvider>
  )
}
