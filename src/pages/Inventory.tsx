import { useEffect, useState } from 'react'
import { Package, Search, Image, Music, Key, Star, CheckCircle, ExternalLink, Download } from 'lucide-react'
import { api, type InventoryItem } from '@/lib/api'
import { WorkerBanner } from '@/components/WorkerBanner'

const TYPE_ICONS: Record<string, React.ReactNode> = {
  wallpaper:    <Image size={24} color="#F7931A" />,
  music:        <Music size={24} color="#F7931A" />,
  avatar_token: <Star size={24} color="#FFD600" />,
  beta_key:     <Key size={24} color="#60A5FA" />,
  discord_role: <CheckCircle size={24} color="#a78bfa" />,
}

function relativeTime(ms: number) {
  const diff = Date.now() - ms
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return new Date(ms).toLocaleDateString()
}

export function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    api.getInventory()
      .then(i => {
        setItems(i)
        setApiError(null)
      })
      .catch(err => setApiError(err.message || 'Failed to load inventory'))
      .finally(() => setLoading(false))
  }, [])

  const handleDownload = async (item: InventoryItem) => {
    try {
      const blob = await api.downloadInventoryItem(item.inventoryId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      // Use the name + a generic extension if we can't detect it, or just rely on browser
      a.download = item.name.replace(/\s+/g, '_')
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      import('react-hot-toast').then(m => m.default.error(`Download failed: ${err.message}`))
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
            Your Rewards
          </p>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 'clamp(1.5rem,3vw,2rem)' }}>
            Digital <span className="gradient-text">Inventory</span>
          </h1>
        </div>
      </div>

      {apiError && <WorkerBanner error={apiError} />}

      {items.length === 0 && !apiError ? (
        <div style={{ padding: '64px 20px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 16 }}>
          <Search size={40} color="#94A3B8" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <p style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 500, marginBottom: 8 }}>Your inventory is empty</p>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', maxWidth: 400, margin: '0 auto' }}>
            Head over to the store to redeem your hard-earned points for exclusive rewards.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.map(item => {
            const isFile = item.type === 'wallpaper' || item.type === 'music' || item.type === 'digital'
            const isLink = item.content && item.content.startsWith('http')
            
            return (
              <div key={item.inventoryId} className="card" style={{ padding: 24, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div className="icon-node" style={{ width: 56, height: 56, flexShrink: 0, background: 'rgba(247,147,26,0.06)' }}>
                  {TYPE_ICONS[item.type] || <Package size={24} color="#F7931A" />}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
                    <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '1.25rem' }}>{item.name}</h3>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', color: '#60A5FA', textTransform: 'uppercase', padding: '4px 8px', background: 'rgba(96,165,250,0.1)', borderRadius: 6 }}>
                      {item.type}
                    </span>
                  </div>
                  
                  <p style={{ fontSize: '0.875rem', color: '#94A3B8', marginBottom: 16, lineHeight: 1.6 }}>
                    {item.instructions}
                  </p>
                  
                  {/* Delivery payload box */}
                  {(item.content || isFile) && (
                    <div style={{ 
                      background: 'rgba(3,3,4,0.5)', border: '1px solid rgba(255,255,255,0.08)', 
                      borderRadius: 8, padding: 16, display: 'flex', alignItems: 'center', gap: 16,
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', color: '#94A3B8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {isFile ? 'Secured File' : 'Payload'}
                        </p>
                        {isFile ? (
                          <p style={{ color: '#fff', fontSize: '0.85rem' }}>Authenticating your ownership...</p>
                        ) : isLink ? (
                          <a 
                            href={item.content} target="_blank" rel="noopener noreferrer"
                            style={{ 
                              color: '#F7931A', textDecoration: 'none', wordBreak: 'break-all', 
                              fontFamily: "'Inter',sans-serif", fontWeight: 500
                            }}
                          >
                            {item.content}
                          </a>
                        ) : (
                          <p style={{ 
                            fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: '#fff', 
                            fontSize: '1.1rem', letterSpacing: '1px' 
                          }}>
                            {item.content}
                          </p>
                        )}
                      </div>
                      
                      <div style={{ flexShrink: 0 }}>
                        {isFile ? (
                          <button onClick={() => handleDownload(item)} className="btn btn-primary btn-sm">
                            <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <Download size={14} /> Download Now
                            </span>
                          </button>
                        ) : isLink ? (
                          <a href={item.content} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                            <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <ExternalLink size={14} /> Open Link
                            </span>
                          </a>
                        ) : (
                          <button 
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                              navigator.clipboard.writeText(item.content)
                              import('react-hot-toast').then(m => m.default.success('Copied to clipboard!'))
                            }}
                          >
                            Copy Code
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', color: '#64748b', marginTop: 16 }}>
                    Acquired {relativeTime(item.acquiredAt)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
