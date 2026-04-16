import React from 'react'
import { Link } from 'react-router-dom'
import { Twitter, Youtube } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '40px 0 60px',
      marginTop: 'auto',
      background: '#030304'
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 24
        }}>
          <div>
            <p style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontWeight: 700,
              fontSize: '1.25rem',
              marginBottom: 8
            }}>
              Fate<span className="gradient-text">Hub</span>
            </p>
            <p style={{ color: '#64748b', fontSize: '0.8rem', maxWidth: 300, lineHeight: 1.5 }}>
              The exclusive digital home for the FateHub subscriber community.
              Earn, redeem, and connect.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', color: '#94A3B8', textTransform: 'uppercase' }}>Platform</span>
              <Link to="/terms" style={{ color: '#94A3B8', fontSize: '0.8rem', textDecoration: 'none' }} className="hover-orange">Terms of Service</Link>
              <Link to="/privacy" style={{ color: '#94A3B8', fontSize: '0.8rem', textDecoration: 'none' }} className="hover-orange">Privacy Policy</Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', color: '#94A3B8', textTransform: 'uppercase' }}>Social</span>
              <div style={{ display: 'flex', gap: 16 }}>
                <a href="https://www.youtube.com/@ShadowsFate" style={{ color: '#94A3B8' }} className="hover-orange"><Youtube size={18} /></a>
                <a href="https://x.com/DevanshMistry3" style={{ color: '#94A3B8' }} className="hover-orange"><Twitter size={18} /></a>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          marginTop: 40,
          paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#475569',
          fontSize: '0.7rem'
        }}>
          <p>© {currentYear} FateHub. All rights reserved.</p>
          <p style={{ fontFamily: "'JetBrains Mono',monospace" }}>BUILD.v1.0.0-PROD</p>
        </div>
      </div>

      <style>{`
        .hover-orange:hover { color: #F7931A !important; }
      `}</style>
    </footer>
  )
}
