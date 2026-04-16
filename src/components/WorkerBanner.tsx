import { AlertCircle } from 'lucide-react'

interface Props {
  error: string
}

/**
 * Shows when the Cloudflare Worker API isn't reachable yet.
 * Guides the user to set up the worker.
 */
export function WorkerBanner({ error }: Props) {
  const isNotDeployed =
    error.includes('Failed to fetch') ||
    error.includes('Network') ||
    error.includes('ECONNREFUSED') ||
    error.includes('localhost:8787')

  return (
    <div style={{
      padding: '16px 20px', borderRadius: 12, marginBottom: 24,
      background: 'rgba(234,88,12,0.07)',
      border: '1px solid rgba(234,88,12,0.3)',
      display: 'flex', alignItems: 'flex-start', gap: 12,
    }}>
      <AlertCircle size={16} color="#EA580C" style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        {isNotDeployed ? (
          <>
            <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#fff', marginBottom: 4 }}>
              Cloudflare DB not running yet
            </p>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.6 }}>
              Point economy features (balances, store, leaderboard) might not work properly.
              Contact Admin on Discord for assistance.
            </p>
          </>
        ) : (
          <>
            <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#fff', marginBottom: 4 }}>API Error</p>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.75rem', color: '#EA580C' }}>{error}</p>
          </>
        )}
      </div>
    </div>
  )
}
