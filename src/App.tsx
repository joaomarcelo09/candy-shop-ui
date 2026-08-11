import { lazy, Suspense } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { MobileAppShell } from './layouts/MobileAppShell'
import { useAuthStore } from './stores/authStore'

const InventoryPage = lazy(() =>
  import('./pages/InventoryPage').then((module) => ({ default: module.InventoryPage })),
)
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })),
)
const SalesPage = lazy(() =>
  import('./pages/SalesPage').then((module) => ({ default: module.SalesPage })),
)
const SaleSessionPage = lazy(() =>
  import('./pages/SaleSessionPage').then((module) => ({ default: module.SaleSessionPage })),
)
const SalesHistoryPage = lazy(() =>
  import('./pages/SalesHistoryPage').then((module) => ({ default: module.SalesHistoryPage })),
)

function ProtectedApp() {
  const token = useAuthStore((state) => state.token)

  return token ? <Outlet /> : <Navigate to="/login" replace />
}

export default function App() {
  const token = useAuthStore((state) => state.token)

  return (
    <Suspense
      fallback={
        <div className="grid min-h-dvh place-items-center px-4 text-sm font-bold text-cocoa-800/55">
          Carregando painel...
        </div>
      }
    >
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/vendas" replace /> : <LoginPage />} />
        <Route element={<ProtectedApp />}>
          <Route path="/vendas/sessao/:sessionId" element={<SaleSessionPage />} />
          <Route element={<MobileAppShell />}>
            <Route index element={<Navigate to="/vendas" replace />} />
            <Route path="/vendas" element={<SalesPage />} />
            <Route path="/vendas/historico" element={<SalesHistoryPage />} />
            <Route path="/estoque" element={<InventoryPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to={token ? '/vendas' : '/login'} replace />} />
      </Routes>
    </Suspense>
  )
}
