import { useEffect, useState } from 'react'
import { Trophy, Zap, Crown, Medal } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

type Entry = { rank:number; displayName:string; lifetimePoints:number; tier:string; uid:string }

const TIER_COLORS: Record<string, string> = {
  legend:    '#F7931A',
  veteran:   '#FFD600',
  supporter: '#60A5FA',
  viewer:    '#94A3B8',
}

const RANK_ICONS = [
  <Crown size={16} color="#FFD600" />,
  <Medal size={16} color="#94A3B8" />,
  <Medal size={16} color="#CD7F32" />,
]

export function Leaderboard() {
  const { user } = useAuthStore()
  const [board, setBoard] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getLeaderboard()
      .then(b => setBoard(b as Entry[]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
      <div style={{ width:32, height:32, border:'2px solid #F7931A', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const myEntry = board.find(e => e.uid === user?.uid)

  return (
    <div className="container" style={{ paddingTop:40, paddingBottom:60 }}>

      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:48 }}>
        <div className="icon-node" style={{ width:56, height:56, margin:'0 auto 16px' }}>
          <Trophy size={24} color="#F7931A" />
        </div>
        <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.7rem', color:'#94A3B8', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>
          Hall of Fame
        </p>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:'clamp(1.75rem,4vw,2.5rem)' }}>
          Top <span className="gradient-text">Supporters</span>
        </h1>
        <p style={{ color:'#94A3B8', maxWidth:400, margin:'12px auto 0', fontSize:'0.875rem' }}>
          Ranked by lifetime points earned. Your rank is permanent — every point ever earned counts.
        </p>
      </div>

      {/* My rank spotlight (if not in top 10) */}
      {myEntry && myEntry.rank > 10 && (
        <div className="card-glow" style={{ padding:'16px 20px', marginBottom:24, display:'flex', alignItems:'center', gap:16 }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.7rem', color:'#94A3B8' }}>YOUR RANK</span>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:'1.25rem', color:'#F7931A' }}>#{myEntry.rank}</span>
          <span style={{ flex:1 }} />
          <Zap size={12} color="#F7931A" />
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.8rem', color:'#F7931A' }}>{myEntry.lifetimePoints.toLocaleString()} pts</span>
        </div>
      )}

      {/* Leaderboard list */}
      <div className="card" style={{ overflow:'hidden', padding:0 }}>
        {board.map((entry, i) => {
          const isMe = entry.uid === user?.uid
          const tierColor = TIER_COLORS[entry.tier] || '#94A3B8'
          const isTop3 = i < 3

          return (
            <div key={entry.uid} style={{
              display:'flex', alignItems:'center', gap:16, padding:'16px 24px',
              borderBottom: i < board.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              background: isMe
                ? 'rgba(247,147,26,0.06)'
                : isTop3 ? 'rgba(255,255,255,0.01)' : 'transparent',
              transition:'background 0.2s',
            }}>

              {/* Rank */}
              <div style={{ width:36, height:36, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                background: isTop3 ? 'rgba(255,255,255,0.06)' : 'transparent' }}>
                {i < 3 ? RANK_ICONS[i] : (
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.75rem', color:'#94A3B8' }}>#{entry.rank}</span>
                )}
              </div>

              {/* Avatar ring */}
              <div style={{
                width:38, height:38, borderRadius:'50%', flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                background: `linear-gradient(135deg, ${tierColor}33, ${tierColor}11)`,
                border: `2px solid ${tierColor}44`,
                fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:'0.875rem', color:tierColor,
              }}>
                {entry.displayName[0].toUpperCase()}
              </div>

              {/* Name */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontWeight:600, fontSize:'0.9rem', color: isMe ? '#F7931A' : '#fff' }}>
                    {entry.displayName}
                  </span>
                  {isMe && (
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.6rem', color:'#F7931A', background:'rgba(247,147,26,0.1)', border:'1px solid rgba(247,147,26,0.3)', borderRadius:9999, padding:'2px 8px' }}>
                      YOU
                    </span>
                  )}
                </div>
                <span className={`badge badge-${entry.tier}`} style={{ marginTop:4 }}>{entry.tier}</span>
              </div>

              {/* Points */}
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:4, justifyContent:'flex-end' }}>
                  <Zap size={12} color={isTop3 ? '#F7931A' : '#94A3B8'} fill={isTop3 ? '#F7931A' : 'none'} />
                  <span style={{
                    fontFamily:"'JetBrains Mono',monospace", fontWeight:500,
                    fontSize: isTop3 ? '1rem' : '0.875rem',
                    color: isTop3 ? '#F7931A' : '#fff',
                  }}>
                    {entry.lifetimePoints.toLocaleString()}
                  </span>
                </div>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.6rem', color:'#94A3B8' }}>lifetime pts</span>
              </div>

            </div>
          )
        })}
      </div>

      {/* Info */}
      <p style={{ textAlign:'center', marginTop:24, fontFamily:"'JetBrains Mono',monospace", fontSize:'0.65rem', color:'rgba(148,163,184,0.4)', letterSpacing:'0.05em' }}>
        LEADERBOARD UPDATES DAILY · LIFETIME POINTS NEVER DECREASE
      </p>
    </div>
  )
}
