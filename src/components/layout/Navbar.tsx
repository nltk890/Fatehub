import { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingBag, MessageSquare,
  Trophy, Shield, LogOut, Zap, Menu, X
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

const NAV_ITEMS = [
  { to: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/store',       label: 'Store',        icon: ShoppingBag },
  { to: '/inventory',   label: 'Inventory',    icon: ShoppingBag },
  { to: '/tickets',     label: 'Messages',     icon: MessageSquare },
  { to: '/leaderboard', label: 'Leaderboard',  icon: Trophy },
  { to: '/admin',       label: 'Admin',        icon: Shield },
]

export function Navbar() {
  const { user, isAdmin, profile, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 72,
      background: 'rgba(3,3,4,0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>

        {/* Logo */}
        <NavLink to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #EA580C, #F7931A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(247,147,26,0.4)',
          }}>
            <Zap size={16} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#fff', letterSpacing: '-0.01em' }}>
            Fate<span className="gradient-text">Hub</span>
          </span>
        </NavLink>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center' }}
             className="desktop-nav">
          {NAV_ITEMS.filter(({ to }) => to !== '/admin' || isAdmin).map(({ to, label }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{ padding: '6px 12px' }}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {/* Points badge */}
          {profile && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(247,147,26,0.1)',
              border: '1px solid rgba(247,147,26,0.3)',
              borderRadius: 9999,
              padding: '4px 12px',
            }}>
              <Zap size={12} color="#F7931A" fill="#F7931A" />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', fontWeight: 500, color: '#F7931A' }}>
                {profile.points.toLocaleString()} pts
              </span>
            </div>
          )}

          {/* Avatar */}
          {user && (
            <div style={{ position:'relative', display:'flex', alignItems:'center', gap:8 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg, #EA580C, #FFD600)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
                fontSize: '0.875rem', color: '#fff',
                border: '2px solid rgba(247,147,26,0.4)',
              }}>
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </div>
            </div>
          )}

          {/* Sign out */}
          <button onClick={handleSignOut} className="btn btn-ghost btn-sm"
            style={{ gap: 6, padding: '0 12px', minHeight: 34 }}
            aria-label="Sign out">
            <LogOut size={14} />
            <span className="desktop-nav">Out</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="btn btn-ghost btn-sm mobile-menu-btn"
            aria-label="Open menu"
            style={{ minHeight: 34, padding: '0 10px' }}>
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <div ref={menuRef} style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'rgba(15,17,21,0.98)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '12px 16px',
        }}>
          {NAV_ITEMS.filter(({ to }) => to !== '/admin' || isAdmin).map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to} to={to}
              onClick={() => setMobileOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 8px',
                       textDecoration: 'none', color: '#94A3B8', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            >
              <Icon size={16} color="#F7931A" />
              <span className="nav-link" style={{ color: 'inherit' }}>{label}</span>
            </NavLink>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </header>
  )
}
