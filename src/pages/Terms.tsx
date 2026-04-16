import React from 'react'
import { Shield } from 'lucide-react'

export function Terms() {
  return (
    <div className="container" style={{ paddingTop: 60, paddingBottom: 80 }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div className="icon-node" style={{ width: 48, height: 48, marginBottom: 20 }}>
          <Shield size={24} color="#F7931A" />
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '2.5rem', marginBottom: 24 }}>
          Terms of <span className="gradient-text">Service</span>
        </h1>

        <div style={{ color: '#94A3B8', lineHeight: 1.8, fontSize: '1rem' }}>
          <p style={{ marginBottom: 20 }}>
            Welcome to FateHub. By accessing our platform, you agree to play fair and follow our community guidelines.
          </p>

          <h2 style={{ color: '#fff', fontSize: '1.25rem', marginTop: 32, marginBottom: 12 }}>1. Account Eligibility</h2>
          <p>You must be a subscriber of the FateHub YouTube channel. Points are tied to your Firebase UID and are non-transferable.</p>

          <h2 style={{ color: '#fff', fontSize: '1.25rem', marginTop: 32, marginBottom: 12 }}>2. Point System & Exploits</h2>
          <p>Points found to be earned via scripts, automation, or security exploits will be wiped. We reserve the right to ban accounts that attempt to manipulate the point economy.</p>

          <h2 style={{ color: '#fff', fontSize: '1.25rem', marginTop: 32, marginBottom: 12 }}>3. Digital Goods</h2>
          <p>Rewards redeemed in the store are digital assets. All redemptions are final and non-refundable. Distribution of redeemed secret keys or private links is prohibited.</p>

          <h2 style={{ color: '#fff', fontSize: '1.25rem', marginTop: 32, marginBottom: 12 }}>4. Termination</h2>
          <p>We reserve the right to terminate access to the hub for any user who violates these terms or creates a toxic environment in the ticket system.</p>
        </div>
      </div>
    </div>
  )
}
