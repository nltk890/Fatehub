import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function AppLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#030304' }}>
      <Navbar />
      <main style={{ flex: 1, paddingTop: '72px' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
