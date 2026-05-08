import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { LandingPage } from './pages/LandingPage'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { AppPage } from './pages/AppPage'
import { FinancialPage } from './pages/FinancialPage'
import { StrategicPage } from './pages/StrategicPage'
import { CapabilitiesPage } from './pages/CapabilitiesPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0D1E' }}>
      <div className="auth-spin w-8 h-8 rounded-full" style={{ border: '2px solid rgba(155,143,228,0.2)', borderTopColor: '#9B8FE4' }} />
    </div>
  )
  if (!user) return <Navigate to="/auth" replace />
  return <>{children}</>
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/app" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthRoute><AuthPage /></AuthRoute>} />
          <Route path="/app" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/app/negocio" element={<ProtectedRoute><AppPage /></ProtectedRoute>} />
          <Route path="/app/financiero" element={<ProtectedRoute><FinancialPage /></ProtectedRoute>} />
          <Route path="/app/estrategico" element={<ProtectedRoute><StrategicPage /></ProtectedRoute>} />
          <Route path="/app/capacidades" element={<ProtectedRoute><CapabilitiesPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
