import { useEffect, useState } from 'react'
import { Zap, TrendingUp, Clock, Trophy, ArrowUpRight, ArrowDownLeft, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { api, type Transaction } from '@/lib/api'
import { useNavigate } from 'react-router-dom'
import { WorkerBanner } from '@/components/WorkerBanner'

const TIER_CONFIG: Record<string, { label: string; color: string; next?: string; nextAt?: number }> = {
  viewer:    { label: 'Viewer',    color: '#94A3B8', next: 'Supporter', nextAt: 500   },
  supporter: { label: 'Supporter', color: '#60A5FA', next: 'Veteran',   nextAt: 2000  },
  veteran:   { label: 'Veteran',   color: '#FFD600', next: 'Legend',    nextAt: 10000 },
  legend:    { label: 'Legend',    color: '#F7931A' },
}

function relativeTime(ms: number) {
  const diff = Date.now() - ms
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

function reasonLabel(r: string) {
  const map: Record<string, string> = {
    code_claim: 'Video Code Claimed',
    redemption: 'Store Redemption',
    sub_verify: 'Subscription Verified',
    admin:      'Creator Granted',
  }
  return map[r] || r
}

export function Dashboard() {
  const { user, profile, refreshProfile } = useAuthStore()
  const navigate = useNavigate()
  const [txs, setTxs] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([refreshProfile(), api.getTransactions()])
      .then(([_, t]) => {
        setTxs(t)
        setApiError(null)
      })
      .catch(err => {
        setApiError(err.message || 'Failed to connect to Worker API')
      })
      .finally(() => setLoading(false))
  }, [])

  const tierCfg = profile ? (TIER_CONFIG[profile.tier] || TIER_CONFIG.viewer) : TIER_CONFIG.viewer
  const progressPct = profile && tierCfg.nextAt
    ? Math.min(100, Math.round((profile.lifetimePoints / tierCfg.nextAt) * 100))
    : 100

  const [claimingDaily, setClaimingDaily] = useState(false)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ width: 32, height: 32, border: '2px solid #F7931A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const handleDailyClaim = async () => {
    if (!profile) return
    setClaimingDaily(true)
    try {
      const res = await api.dailyClaim()
      import('react-hot-toast').then(m => m.default.success(`+${res.pointsAwarded} pts claimed!`))
      const [_, t] = await Promise.all([refreshProfile(), api.getTransactions()])
      setTxs(t)
    } catch (err: any) {
      import('react-hot-toast').then(m => m.default.error(err.message || 'Failed to claim'))
    } finally {
      setClaimingDaily(false)
    }
  }

  const nowMs = Date.now()
  const canClaimDaily = profile ? (nowMs - profile.dailyClaimAt >= 24 * 60 * 60 * 1000) : false
  const timeUntilNextClaim = profile ? (24 * 60 * 60 * 1000 - (nowMs - profile.dailyClaimAt)) : 0
  const hoursUntilNext = Math.floor(timeUntilNextClaim / 3600000)
  const minsUntilNext = Math.floor((timeUntilNextClaim % 3600000) / 60000)

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>

      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.75rem', color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
          Welcome back
        </p>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 'clamp(1.5rem,4vw,2.25rem)', letterSpacing: '-0.02em' }}>
          {user?.displayName || 'Anonymous'} <span className="gradient-text">⚡</span>
        </h1>
        {user?.email && (
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', color: '#94A3B8', marginTop: 4 }}>
            {user.email}
          </p>
        )}
      </div>

      {/* Worker banner if API unreachable */}
      {apiError && <WorkerBanner error={apiError} />}

      {/* Stats Row — only shown when API is working */}
      {profile && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>

          {/* Points balance */}
          <div className="card-glow" style={{ padding: 24, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="icon-node" style={{ width: 40, height: 40 }}><Zap size={18} color="#F7931A" /></div>
              <span className="badge badge-viewer" style={{ fontSize: '0.6rem' }}>SPENDABLE</span>
            </div>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', color: '#94A3B8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Points Balance</p>
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '2rem', color: '#F7931A' }}>
              {profile.points.toLocaleString()}
            </p>
          </div>

          {/* Lifetime points */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="icon-node" style={{ width: 40, height: 40 }}><TrendingUp size={18} color="#F7931A" /></div>
            </div>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', color: '#94A3B8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Lifetime Earned</p>
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '2rem' }}>
              {profile.lifetimePoints.toLocaleString()}
            </p>
          </div>

          {/* Tier card */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="icon-node" style={{ width: 40, height: 40 }}><Trophy size={18} color="#F7931A" /></div>
              <span className={`badge badge-${profile.tier}`}>{tierCfg.label}</span>
            </div>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', color: '#94A3B8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Current Tier</p>
            <div className="progress-bar" style={{ marginBottom: 8 }}>
              <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>
            {tierCfg.nextAt ? (
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', color: '#94A3B8' }}>
                {profile.lifetimePoints.toLocaleString()} / {tierCfg.nextAt.toLocaleString()} → {tierCfg.next}
              </p>
            ) : (
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', color: tierCfg.color }}>
                ✦ Maximum tier reached
              </p>
            )}
          </div>
        </div>
      )}

      {/* How to earn */}
      <div className="card" style={{ padding: 24, marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '1rem' }}>
            Earn Points
          </h2>
          <button 
            onClick={handleDailyClaim}
            disabled={!canClaimDaily || claimingDaily}
            className="btn btn-primary btn-sm"
            style={{ 
              opacity: canClaimDaily ? 1 : 0.5,
              padding: '6px 12px',
            }}
          >
            {claimingDaily ? 'Claiming...' : canClaimDaily ? 'Claim Daily (50 pts)' : `Next in ${hoursUntilNext}h ${minsUntilNext}m`}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
          {[
            { label: 'Find hidden video code', pts: '+50–500', icon: '🎬' },
            { label: 'Discord events',         pts: 'Varies',  icon: '🎮' },
            { label: 'Daily check-in',         pts: '+50',     icon: '📅' },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'rgba(247,147,26,0.05)', border: '1px solid rgba(247,147,26,0.1)',
              borderRadius: 10, padding: '12px 14px',
            }}>
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
              <div>
                <p style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 500, marginBottom: 2 }}>{item.label}</p>
                <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', color: '#F7931A' }}>{item.pts} pts</p>
              </div>
            </div>
          ))}
          <button onClick={() => navigate('/tickets')} style={{
            display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', cursor: 'pointer',
            background: 'rgba(247,147,26,0.05)', border: '1px solid rgba(247,147,26,0.1)',
            borderRadius: 10, padding: '12px 14px', transition: 'all 0.2s', width: '100%'
          }} className="hover-referral">
            <span style={{ fontSize: '1.25rem' }}>👥</span>
            <div>
              <p style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 500, marginBottom: 2 }}>Refer a friend</p>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', color: '#F7931A' }}>Open Ticket →</p>
            </div>
          </button>
        </div>
        <style>{`
          .hover-referral:hover {
            background: rgba(247,147,26,0.1) !important;
            border-color: rgba(247,147,26,0.3) !important;
            transform: translateY(-2px);
          }
        `}</style>
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={14} color="#F7931A" />
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', color: '#94A3B8' }}>
            Press <strong style={{ color: '#fff' }}>~</strong> to open the hidden terminal → type{' '}
            <strong style={{ color: '#F7931A' }}>/claim YOUR_CODE</strong>
          </span>
        </div>
      </div>

      {/* Transaction history */}
      {txs.length > 0 && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '1rem' }}>Recent Activity</h2>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', color: '#94A3B8' }}>LEDGER</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {txs.map((tx, i) => (
              <div key={tx.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
                borderBottom: i < txs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: tx.delta > 0 ? 'rgba(247,147,26,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${tx.delta > 0 ? 'rgba(247,147,26,0.25)' : 'rgba(239,68,68,0.25)'}`,
                }}>
                  {tx.delta > 0
                    ? <ArrowUpRight size={14} color="#F7931A" />
                    : <ArrowDownLeft size={14} color="#ef4444" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', color: '#fff', fontWeight: 500, marginBottom: 2 }}>{reasonLabel(tx.reason)}</p>
                  <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', color: '#94A3B8' }}>
                    <Clock size={9} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                    {relativeTime(tx.createdAt)}
                  </p>
                </div>
                <span style={{
                  fontFamily: "'JetBrains Mono',monospace", fontWeight: 500, fontSize: '0.9rem',
                  color: tx.delta > 0 ? '#F7931A' : '#ef4444',
                }}>
                  {tx.delta > 0 ? '+' : ''}{tx.delta.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
