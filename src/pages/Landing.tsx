import { useNavigate } from 'react-router-dom'
import { Zap, Shield, MessageSquare, Trophy, Star, ArrowRight, Play } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

const FEATURES = [
  { icon: Zap, title: 'Point Economy', desc: 'Earn points by watching videos, subscribing, and finding hidden codes. Spend them on exclusive rewards.' },
  { icon: Shield, title: 'Fair Play', desc: 'Built on a secure, server-validated system to ensure every rank and point is earned fairly by real viewers.' },
  { icon: MessageSquare, title: 'Direct Access', desc: 'Open a private ticket to chat directly with me. Request videos, share ideas, or just say hello.' },
  { icon: Trophy, title: 'Leaderboard Rank', desc: 'Compete for the top spot. Your lifetime points determine your community rank and tier badge forever.' },
  { icon: Star, title: 'Exclusive Store', desc: 'Redeem your points for wallpapers, music files, shoutouts, beta access keys, and other merch.' },
  { icon: Play, title: 'Hunt Easter Eggs', desc: 'Secret codes lurk in every video. Find them, open the hidden terminal, and claim massive point bonuses.' },
]

const TIERS = [
  { tier: 'Viewer', pts: '0+', color: '#94A3B8', glow: 'rgba(148,163,184,0.2)' },
  { tier: 'Supporter', pts: '500+', color: '#60A5FA', glow: 'rgba(96,165,250,0.2)' },
  { tier: 'Veteran', pts: '2,000+', color: '#FFD600', glow: 'rgba(255,214,0,0.2)' },
  { tier: 'Legend', pts: '10,000+', color: '#F7931A', glow: 'rgba(247,147,26,0.3)' },
]

export function Landing() {
  const { user, signInWithGoogle } = useAuthStore()
  const navigate = useNavigate()

  const handleCTA = async () => {
    if (user) { navigate('/dashboard'); return }
    await signInWithGoogle()
    navigate('/dashboard')
  }

  return (
    <div style={{ background: '#030304', minHeight: '100vh' }}>

      {/* ─── Nav ─────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(3,3,4,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div className="container" style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #EA580C, #F7931A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(247,147,26,0.4)',
            }}>
              <Zap size={16} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>
              Fate<span className="gradient-text">Hub</span>
            </span>
          </div>
          <button onClick={handleCTA} className="btn btn-primary btn-sm">
            {user ? 'Go to Dashboard' : 'Sign In with Google'}
          </button>
        </div>
      </header>

      {/* ─── Hero ────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', paddingTop: 80, paddingBottom: 80 }}>
        {/* Grid bg */}
        <div className="bg-grid-pattern" style={{
          position: 'absolute', inset: 0, opacity: 0.6, pointerEvents: 'none',
        }} />
        {/* Ambient glows */}
        <div style={{
          position: 'absolute', top: '10%', left: '20%', width: 400, height: 400,
          background: '#F7931A', opacity: 0.06, borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '15%', width: 350, height: 350,
          background: '#FFD600', opacity: 0.04, borderRadius: '50%', filter: 'blur(150px)', pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>


          {/* User Photo / Avatar */}
          <div style={{
            position: 'relative', width: 180, height: 180, margin: '0 auto 32px',
            animation: 'float 6s ease-in-out infinite',
            borderRadius: '50%',
            // Premium multi-layer shadow spread
            boxShadow: '0 0 60px -10px rgba(247,147,26,0.5), 0 0 120px -30px rgba(247,147,26,0.2)'
          }}>
            {/* Ambient background glow */}
            <div style={{
              position: 'absolute', inset: -40, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(247,147,26,0.15) 0%, transparent 70%)',
              animation: 'pulse-glow 4s ease-in-out infinite',
              pointerEvents: 'none'
            }} />
            <div style={{
              position: 'absolute', inset: -2, borderRadius: '50%',
              padding: 3, background: 'linear-gradient(135deg, #F7931A, #EA580C)',
            }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
                border: '4px solid #030304', background: '#0F1115'
              }}>
                <img
                  src={`${import.meta.env.BASE_URL}red.jpg`}
                  alt="Creator"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
            {/* Status dot */}
            <div style={{
              position: 'absolute', bottom: 12, right: 12, width: 24, height: 24,
              background: '#22c55e', borderRadius: '50%', border: '4px solid #030304',
              boxShadow: '0 0 15px rgba(34,197,94,0.5)'
            }} />
          </div>

          <h1 style={{
            fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
            fontSize: 'clamp(2.5rem, 7vw, 5rem)', lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.02em',
            animation: 'reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}>
            Welcome to <br />
            <span className="gradient-text" style={{ textShadow: '0 0 30px rgba(247,147,26,0.2)' }}>Shadow's Fate</span>
            <br /> Community.
          </h1>

          <p style={{
            color: '#94A3B8', fontSize: 'clamp(1rem, 2vw, 1.2rem)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7,
            animation: 'reveal 1s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both'
          }}>
            Earn points by engaging with my content. Redeem exclusive rewards, climb the leaderboard, and unlock a direct line to the creator.
          </p>

          {/* Live badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(247,147,26,0.08)', border: '1px solid rgba(247,147,26,0.25)',
            borderRadius: 9999, padding: '6px 16px', marginBottom: 32
          }}>
            <span style={{ position: 'relative', display: 'inline-block', width: 8, height: 8 }}>
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#F7931A', animation: 'ping 1.5s ease infinite' }} />
              <span style={{ position: 'relative', display: 'block', width: 8, height: 8, borderRadius: '50%', background: '#F7931A' }} />
            </span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', letterSpacing: '0.1em', color: '#F7931A', textTransform: 'uppercase' }}>
              Exclusive Community Rewards
            </span>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleCTA} className="btn btn-primary" style={{ gap: 8, fontSize: '0.9rem', padding: '0 28px', minHeight: 48 }}>
              <Zap size={16} />
              {user ? 'Open Dashboard' : 'Join Free with Google'}
              <ArrowRight size={16} />
            </button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn btn-outline" style={{ padding: '0 28px', minHeight: 48 }}>
              See Features
            </button>
          </div>

          {/* Floating stat cards */}
          <div style={{ marginTop: 64, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, maxWidth: 600, margin: '64px auto 0' }}>
            {[
              { label: 'Subscribers', value: '3.4K', icon: '📡' },
              { label: 'Store Items', value: '12+', icon: '🎁' },
              { label: 'Point Types', value: '5', icon: '⚡' },
            ].map((s, i) => (
              <div key={s.label} className="glass-light" style={{
                borderRadius: 12, padding: '20px 16px', textAlign: 'center',
                animation: `float ${6 + i}s ease-in-out ${i * 1.5}s infinite`,
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '1.5rem', color: '#fff' }}>{s.value}</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────── */}
      <section id="features" style={{ padding: '96px 0', background: '#0F1115' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 'clamp(1.75rem,4vw,2.75rem)', marginBottom: 12 }}>
              Everything in <span className="gradient-text">One Place</span>
            </h2>
            <p style={{ color: '#94A3B8', maxWidth: 480, margin: '0 auto' }}>
              Built from the ground up for this community. Not a generic platform — a custom-engineered hub.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card" style={{ padding: 28, position: 'relative', overflow: 'hidden' }}>
                {/* Corner accents */}
                <div style={{
                  position: 'absolute', top: 12, left: 12, width: 16, height: 16,
                  borderTop: '1.5px solid rgba(247,147,26,0.5)', borderLeft: '1.5px solid rgba(247,147,26,0.5)'
                }} />
                <div style={{
                  position: 'absolute', bottom: 12, right: 12, width: 16, height: 16,
                  borderBottom: '1.5px solid rgba(247,147,26,0.5)', borderRight: '1.5px solid rgba(247,147,26,0.5)'
                }} />
                <div className="icon-node" style={{ width: 44, height: 44, marginBottom: 16 }}>
                  <Icon size={20} color="#F7931A" />
                </div>
                <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '1rem', marginBottom: 8 }}>{title}</h3>
                <p style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Tiers ───────────────────────────────────────────── */}
      <section style={{ padding: '96px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 'clamp(1.75rem,4vw,2.75rem)', marginBottom: 12 }}>
              Rise Through the <span className="gradient-text">Ranks</span>
            </h2>
            <p style={{ color: '#94A3B8', maxWidth: 480, margin: '0 auto' }}>
              Lifetime points never decrease. Your rank is permanent, earned by engagement over time.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
            {TIERS.map(({ tier, pts, color, glow }, i) => (
              <div key={tier} className="card" style={{
                padding: '28px 20px', textAlign: 'center',
                transform: i === 3 ? 'scale(1.04)' : undefined,
                border: i === 3 ? '1px solid rgba(247,147,26,0.4)' : undefined,
                boxShadow: i === 3 ? `0 0 40px -10px ${glow}` : undefined,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', margin: '0 auto 16px',
                  background: `${glow}`,
                  border: `2px solid ${color}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 20px ${glow}`,
                }}>
                  <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '0.75rem', color, letterSpacing: '0.05em' }}>#{i + 1}</span>
                </div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '1.1rem', color, marginBottom: 4 }}>{tier}</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.75rem', color: '#94A3B8' }}>{pts} lifetime pts</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0', background: '#0F1115', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 'clamp(1.5rem,4vw,2.5rem)', marginBottom: 16 }}>
            Ready to <span className="gradient-text">Join?</span>
          </h2>
          <p style={{ color: '#94A3B8', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
            One click. No password. Your Google account is all you need.
          </p>
          <button onClick={handleCTA} className="btn btn-primary" style={{ padding: '0 36px', minHeight: 52, fontSize: '0.95rem' }}>
            <Zap size={18} />
            {user ? 'Open Dashboard' : 'Get Started — It\'s Free'}
          </button>
          <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.75rem', marginTop: 16, fontFamily: "'JetBrains Mono',monospace" }}>
            Press <kbd style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, fontSize: '0.7rem' }}>~</kbd> anywhere to open the hidden terminal
          </p>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px 0', textAlign: 'center' }}>
        <div className="container">
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', color: 'rgba(148,163,184,0.4)', letterSpacing: '0.05em' }}>
            © 2026 FateHub · Built with ⚡ for the community · Secured by Cloudflare
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; transform: scale(1); filter: blur(20px); }
          50% { opacity: 1; transform: scale(1.3); filter: blur(40px); }
        }
        @keyframes reveal {
          0% { opacity: 0; transform: translateY(30px); filter: blur(10px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        
        .card {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(255,255,255,0.06) !important;
        }
        .card:hover {
          transform: translateY(-8px);
          border-color: rgba(247,147,26,0.3) !important;
          box-shadow: 0 20px 40px -20px rgba(0,0,0,0.5), 0 0 20px rgba(247,147,26,0.05);
          background: rgba(247,147,26,0.02) !important;
        }
        .icon-node {
          transition: all 0.3s ease;
        }
        .card:hover .icon-node {
          transform: scale(1.1) rotate(5deg);
          background: rgba(247,147,26,0.15) !important;
        }
        
        .glass-light {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.05);
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  )
}
