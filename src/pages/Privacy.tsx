import { Lock } from 'lucide-react'

export function Privacy() {
  return (
    <div className="container" style={{ paddingTop: 60, paddingBottom: 80 }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div className="icon-node" style={{ width: 48, height: 48, marginBottom: 20 }}>
          <Lock size={24} color="#F7931A" />
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '2.5rem', marginBottom: 24 }}>
          Privacy <span className="gradient-text">Policy</span>
        </h1>

        <div style={{ color: '#94A3B8', lineHeight: 1.8, fontSize: '1rem' }}>
          <p style={{ marginBottom: 20 }}>
            Your privacy is important to us. Here is how we handle your data in FateHub.
          </p>

          <h2 style={{ color: '#fff', fontSize: '1.25rem', marginTop: 32, marginBottom: 12 }}>1. Information We Collect</h2>
          <p>We store your Google Display Name, Email, and Profile Picture provided via Firebase Auth. We also track your point transactions and ticket messages on our backend.</p>

          <h2 style={{ color: '#fff', fontSize: '1.25rem', marginTop: 32, marginBottom: 12 }}>2. How We Use Data</h2>
          <p>Your email is used strictly for authentication and ticket notifications. We do not sell your data or use it for marketing outside of FateHub updates.</p>

          <h2 style={{ color: '#fff', fontSize: '1.25rem', marginTop: 32, marginBottom: 12 }}>3. Data Storage</h2>
          <p>Messages and ticket data are stored in Firebase Firestore. Point balances and inventory are stored in secure DB. All data is transferred securely via HTTPS.</p>

          <h2 style={{ color: '#fff', fontSize: '1.25rem', marginTop: 32, marginBottom: 12 }}>4. Data Deletion</h2>
          <p>If you wish to have your FateHub account and data permanently deleted, please open a ticket with the subject "Data Deletion Request".</p>
        </div>
      </div>
    </div>
  )
}
