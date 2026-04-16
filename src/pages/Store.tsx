import { useEffect, useState } from 'react'
import { ShoppingBag, Zap, Lock, CheckCircle, Package, Music, Image, Key, Star } from 'lucide-react'
import { api, type Reward } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'
import { WorkerBanner } from '@/components/WorkerBanner'
import toast from 'react-hot-toast'

const TYPE_ICONS: Record<string, React.ReactNode> = {
  wallpaper:    <Image size={20} color="#F7931A" />,
  music:        <Music size={20} color="#F7931A" />,
  avatar_token: <Star size={20} color="#FFD600" />,
  beta_key:     <Key size={20} color="#60A5FA" />,
  discord_role: <CheckCircle size={20} color="#a78bfa" />,
}

export function Store() {
  const navigate = useNavigate()
  const { user, profile, refreshProfile } = useAuthStore()
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [redeeming, setRedeeming] = useState<number | null>(null)
  const [redeemed, setRedeemed] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!user) return
    Promise.all([api.getRewards(), refreshProfile(), api.getInventory()])
      .then(([r, _, inv]) => {
        setRewards(r)
        setRedeemed(new Set(inv.map(i => i.rewardId)))
        setApiError(null)
      })
      .catch(err => setApiError(err.message || 'Failed to connect to Worker API'))
      .finally(() => setLoading(false))
  }, [user, refreshProfile])

  const handleRedeem = async (reward: Reward) => {
    if (!profile || profile.points < reward.cost) {
      toast.error(`Not enough points! Need ${(reward.cost - (profile?.points ?? 0)).toLocaleString()} more.`)
      return
    }
    setRedeeming(reward.id)
    try {
      await api.redeem(reward.id)
      refreshProfile()
      setRedeemed(prev => new Set(prev).add(reward.id))
      toast.success(`🎁 "${reward.name}" redeemed!`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Redemption failed')
    } finally {
      setRedeeming(null)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ width: 32, height: 32, border: '2px solid #F7931A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
            Rewards Store
          </p>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 'clamp(1.5rem,3vw,2rem)' }}>
            Spend Your <span className="gradient-text">Points</span>
          </h1>
        </div>
        {profile && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(247,147,26,0.08)', border: '1px solid rgba(247,147,26,0.3)',
            borderRadius: 9999, padding: '8px 16px',
          }}>
            <Zap size={14} color="#F7931A" fill="#F7931A" />
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.85rem', fontWeight: 500, color: '#F7931A' }}>
              {profile.points.toLocaleString()} pts available
            </span>
          </div>
        )}
      </div>

      {apiError && <WorkerBanner error={apiError} />}

      {/* Rewards grid */}
      {rewards.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, marginBottom: 32 }}>
          {rewards.map(reward => {
            const canAfford = profile !== null && profile.points >= reward.cost
            const isDone = redeemed.has(reward.id)
            const isLoading = redeeming === reward.id

            return (
              <div key={reward.id} className="card" style={{ padding: 0, overflow: 'hidden', opacity: !canAfford && !isDone ? 0.65 : 1 }}>
                <div style={{
                  height: 4,
                  background: isDone
                    ? 'linear-gradient(to right, #22c55e, #4ade80)'
                    : canAfford
                    ? 'linear-gradient(to right, #EA580C, #F7931A)'
                    : 'rgba(255,255,255,0.1)',
                }} />
                {reward.imageUrl && (
                  <div style={{ width: '100%', height: 240, overflow: 'hidden', position: 'relative' }}>
                    <img 
                      src={reward.imageUrl} 
                      alt={reward.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <div style={{ 
                      position: 'absolute', inset: 0, 
                      background: 'linear-gradient(to top, rgba(10,10,12,0.8), transparent)' 
                    }} />
                  </div>
                )}
                <div style={{ padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div className="icon-node" style={{ width: 44, height: 44 }}>
                      {TYPE_ICONS[reward.type] || <Package size={20} color="#F7931A" />}
                    </div>
                    {!canAfford && !isDone && <Lock size={14} color="#94A3B8" />}
                    {isDone && <CheckCircle size={14} color="#22c55e" />}
                  </div>
                  <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '1rem', marginBottom: 6 }}>{reward.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: 20 }}>{reward.description}</p>
                  {reward.stock > 0 && (
                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', color: '#60A5FA', marginBottom: 12 }}>
                      ⚠ Only {reward.stock} left in stock
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Zap size={12} color="#F7931A" fill="#F7931A" />
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 500, fontSize: '1rem', color: '#F7931A' }}>
                        {reward.cost.toLocaleString()}
                      </span>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', color: '#94A3B8' }}>pts</span>
                    </div>
                    <button
                      onClick={() => isDone ? navigate('/inventory') : handleRedeem(reward)}
                      disabled={(!canAfford && !isDone) || isLoading}
                      className={`btn btn-sm ${isDone ? '' : canAfford ? 'btn-primary' : 'btn-outline'}`}
                      style={{
                        background: isDone ? 'rgba(34,197,94,0.15)' : undefined,
                        border: isDone ? '1px solid rgba(34,197,94,0.4)' : undefined,
                        color: isDone ? '#22c55e' : undefined, flexShrink: 0,
                      }}
                    >
                      {isLoading ? '...' : isDone ? 'Inventory' : canAfford ? 'Redeem' : 'Need More Pts'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(247,147,26,0.05)', border: '1px solid rgba(247,147,26,0.15)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <ShoppingBag size={16} color="#F7931A" />
        <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.5 }}>
          All redemptions are processed securely server-side. Points are deducted instantly via SQL transaction and cannot be refunded.
        </p>
      </div>
    </div>
  )
}
