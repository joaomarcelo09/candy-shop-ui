import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SessionPage } from './pages/SessionPage'
import { CandiesPage } from './pages/CandiesPage'
import { useAuthStore } from './stores/authStore'

function ProtectedRoutes() {
  const token = useAuthStore((state) => state.token)

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return (
    <AppLayout>
      <Routes>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/candies" element={<CandiesPage />} />
        <Route path="/session" element={<SessionPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  )
}

function PublicRoutes() {
  const token = useAuthStore((state) => state.token)

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  const token = useAuthStore((state) => state.token)

  return token ? <ProtectedRoutes /> : <PublicRoutes />
}
