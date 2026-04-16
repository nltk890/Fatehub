import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'
import { AppLayout } from '@/components/layout/AppLayout'
import { Landing } from '@/pages/Landing'
import { Dashboard } from '@/pages/Dashboard'
import { Store } from '@/pages/Store'
import { Inventory } from '@/pages/Inventory'
import { Tickets } from '@/pages/Tickets'
import { Terms } from '@/pages/Terms'
import { Privacy } from '@/pages/Privacy'
import { Leaderboard } from '@/pages/Leaderboard'
import { Admin } from '@/pages/Admin'
import { Terminal } from '@/components/Terminal'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore()
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#030304' }}>
      <div style={{ width:40, height:40, border:'2px solid #F7931A', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
  if (!user) return <Navigate to="/" replace />
  return <>{children}</>
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuthStore()
  if (loading) return null
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  const { initAuth } = useAuthStore()

  useEffect(() => {
    const unsub = initAuth()
    return unsub
  }, [initAuth])

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0F1115',
            color: '#fff',
            border: '1px solid rgba(247,147,26,0.25)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#F7931A', secondary: '#030304' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#030304' } },
        }}
      />
      <Terminal />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
          <Route path="/dashboard"   element={<Dashboard />} />
          <Route path="/store"       element={<Store />} />
          <Route path="/inventory"   element={<Inventory />} />
          <Route path="/tickets"     element={<Tickets />} />
          <Route path="/terms"       element={<Terms />} />
          <Route path="/privacy"     element={<Privacy />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin"       element={<AdminGuard><Admin /></AdminGuard>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
