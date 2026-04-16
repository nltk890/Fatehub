import { useEffect, useState, useRef } from 'react'
import {
  Shield, Zap, Key, Users, CheckCircle, BarChart2,
  MessageSquare, Send, ChevronRight, RefreshCw, Copy
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { api, type UserProfile } from '@/lib/api'
import { db } from '@/lib/firebase'
import {
  collection, onSnapshot, orderBy, query, addDoc, serverTimestamp, Timestamp
} from 'firebase/firestore'
import toast from 'react-hot-toast'
import { Navigate } from 'react-router-dom'

interface AdminStats {
  totalUsers: number; codesClaimed: number; pointsCirculating: number; activeCodes: number; adminUid: string
}
interface FsTicket {
  id: string; uid: string; subject: string; status: 'open' | 'closed'; createdAt: Timestamp | null
}
interface FsMessage {
  id: string; senderUid: string; text: string; timestamp: Timestamp | null
}

const TABS = ['Overview', 'Create Code', 'Adjust Points', 'Tickets', 'Users', 'Store'] as const
type Tab = typeof TABS[number]

export function Admin() {
  const { user, isAdmin } = useAuthStore()

  // Hard-block non-admins at render time too
  if (!isAdmin) return <Navigate to="/dashboard" replace />

  const [tab, setTab] = useState<Tab>('Overview')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  // Code form
  const [codeInput, setCodeInput] = useState('')
  const [ptsInput, setPtsInput] = useState('100')
  const [usesInput, setUsesInput] = useState('1')
  const [expInput, setExpInput] = useState('24')
  const [codeResult, setCodeResult] = useState<string | null>(null)
  const [codeLoading, setCodeLoading] = useState(false)

  // Adjust form
  const [targetUid, setTargetUid] = useState('')
  const [adjustAmt, setAdjustAmt] = useState('')
  const [adjustReason, setAdjustReason] = useState('admin')
  const [adjustLoading, setAdjustLoading] = useState(false)

  // Users
  const [users, setUsers] = useState<UserProfile[]>([])
  const [usersLoading, setUsersLoading] = useState(false)

  // Store
  const [rewards, setRewards] = useState<any[]>([])
  const [rewardsLoading, setRewardsLoading] = useState(false)
  const [storeForm, setStoreForm] = useState({ id: 0, name: '', description: '', cost: 100, type: 'digital', stock: -1, content: '', instructions: '', imageUrl: '', isActive: true })

  // Tickets
  const [tickets, setTickets] = useState<FsTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [messages, setMessages] = useState<FsMessage[]>([])
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load stats on mount
  useEffect(() => {
    api.admin.getStats()
      .then(s => setStats(s))
      .catch(e => toast.error(`Stats: ${e.message}`))
      .finally(() => setStatsLoading(false))
  }, [])

  // Load all Firestore tickets for admin
  useEffect(() => {
    const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => {
      setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() } as FsTicket)))
    }, e => toast.error(`Tickets: ${e.message}`))
  }, [])

  // Load messages for selected ticket
  useEffect(() => {
    if (!selectedTicket) return
    const q = query(collection(db, 'tickets', selectedTicket, 'messages'), orderBy('timestamp', 'asc'))
    return onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as FsMessage)))
    })
  }, [selectedTicket])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Load users when tab switches
  useEffect(() => {
    if (tab !== 'Users') return
    setUsersLoading(true)
    api.admin.getUsers()
      .then(setUsers)
      .catch(e => toast.error(e.message))
      .finally(() => setUsersLoading(false))
  }, [tab])

  // Load rewards when tab switches
  const loadRewards = () => {
    setRewardsLoading(true)
    api.admin.getRewards()
      .then(setRewards)
      .catch(e => toast.error(e.message))
      .finally(() => setRewardsLoading(false))
  }
  
  useEffect(() => {
    if (tab === 'Store') loadRewards()
  }, [tab])

  const handleSaveReward = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeForm.name || !storeForm.description) return toast.error('Name & description required')
    try {
      if (storeForm.id === 0) {
        await api.admin.createReward(storeForm)
        toast.success('Reward created!')
      } else {
        await api.admin.updateReward(storeForm)
        toast.success('Reward updated!')
      }
      setStoreForm({ id: 0, name: '', description: '', cost: 100, type: 'digital', stock: -1, content: '', instructions: '', imageUrl: '', isActive: true })
      loadRewards()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save reward')
    }
  }

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setCodeLoading(true)
    setCodeResult(null)
    try {
      const res = await api.admin.createCode({
        code: codeInput || undefined,
        pointsValue: Number(ptsInput),
        usesRemaining: Number(usesInput),
        expiresInHours: expInput ? Number(expInput) : undefined,
      })
      setCodeResult(res.code)
      setCodeInput('')
      toast.success(`Code "${res.code}" created!`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    } finally {
      setCodeLoading(false)
    }
  }

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetUid || !adjustAmt) return
    setAdjustLoading(true)
    try {
      const res = await api.admin.adjustPoints(targetUid, Number(adjustAmt), adjustReason)
      toast.success(`Done! New balance: ${res.newBalance.toLocaleString()} pts`)
      setTargetUid('')
      setAdjustAmt('')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    } finally {
      setAdjustLoading(false)
    }
  }

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reply.trim() || !selectedTicket || !user) return
    setSending(true)
    try {
      await addDoc(collection(db, 'tickets', selectedTicket, 'messages'), {
        senderUid: user.uid,
        text: reply.trim(),
        timestamp: serverTimestamp(),
      })
      
      const tData = tickets.find(t => t.id === selectedTicket)
      if (tData) {
        api.admin.notifyUser(tData.uid, tData.subject, reply.trim()).catch(e => console.warn('Email notify failed:', e))
      }

      setReply('')
    } catch (err) {
      toast.error('Send failed — check Firestore rules')
    } finally {
      setSending(false)
    }
  }

  const selectedTicketData = tickets.find(t => t.id === selectedTicket)

  // ── Shared style helpers ───────────────────────────────────────
  const label = (text: string) => (
    <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.65rem', color:'#94A3B8',
      textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:6 }}>
      {text}
    </p>
  )

  return (
    <div className="container" style={{ paddingTop:40, paddingBottom:60 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
        <div className="icon-node" style={{ width:44, height:44 }}>
          <Shield size={20} color="#F7931A" />
        </div>
        <div>
          <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.7rem', color:'#94A3B8',
            letterSpacing:'0.08em', textTransform:'uppercase' }}>Creator Control</p>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:'clamp(1.25rem,3vw,1.75rem)' }}>
            Admin <span className="gradient-text">Hub</span>
          </h1>
        </div>
        {/* Live badge */}
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6,
          background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.25)',
          borderRadius:9999, padding:'4px 12px' }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e',
            boxShadow:'0 0 6px #22c55e' }} />
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.65rem', color:'#22c55e' }}>LIVE</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:28, overflowX:'auto',
        background:'rgba(255,255,255,0.03)', borderRadius:12, padding:4, border:'1px solid rgba(255,255,255,0.06)' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              flex:1, minWidth:80, padding:'8px 12px', borderRadius:8, border:'none', cursor:'pointer',
              fontFamily:"'JetBrains Mono',monospace", fontSize:'0.7rem', letterSpacing:'0.04em',
              background: tab === t ? 'linear-gradient(135deg,#EA580C,#F7931A)' : 'transparent',
              color: tab === t ? '#fff' : '#94A3B8', fontWeight: tab === t ? 600 : 400,
              transition:'all 0.2s', whiteSpace:'nowrap',
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Overview ────────────────────────────────────────────── */}
      {tab === 'Overview' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16 }}>
          {statsLoading ? (
            Array.from({length:4}).map((_, i) => (
              <div key={i} className="card" style={{ padding:24, height:100,
                background:'linear-gradient(90deg,rgba(255,255,255,0.02),rgba(255,255,255,0.05),rgba(255,255,255,0.02))',
                animation:'shimmer 1.5s infinite' }}>
                <style>{`@keyframes shimmer{0%,100%{opacity:0.5}50%{opacity:1}}`}</style>
              </div>
            ))
          ) : stats ? [
            { label:'Total Users',          value: stats.totalUsers.toLocaleString(),           note:'registered', icon: <Users size={16} color="#F7931A" /> },
            { label:'Codes Claimed',         value: stats.codesClaimed.toLocaleString(),         note:'all time',   icon: <Key size={16} color="#F7931A" /> },
            { label:'Points Circulating',    value: stats.pointsCirculating.toLocaleString(),    note:'spendable',  icon: <Zap size={16} color="#F7931A" /> },
            { label:'Active Codes',          value: stats.activeCodes.toLocaleString(),          note:'redeemable', icon: <BarChart2 size={16} color="#F7931A" /> },
            { label:'Open Tickets',          value: tickets.filter(t => t.status === 'open').length.toLocaleString(), note:'unresolved', icon: <MessageSquare size={16} color="#F7931A" /> },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding:24 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                <div className="icon-node" style={{ width:36,height:36 }}>{s.icon}</div>
              </div>
              <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.65rem', color:'#94A3B8',
                textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{s.label}</p>
              <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:'1.75rem' }}>{s.value}</p>
              <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.6rem', color:'rgba(148,163,184,0.5)', marginTop:4 }}>{s.note}</p>
            </div>
          )) : (
            <p style={{ color:'#94A3B8', fontSize:'0.875rem' }}>Failed to load stats — is the Worker running?</p>
          )}
        </div>
      )}

      {/* ── Create Code ─────────────────────────────────────────── */}
      {tab === 'Create Code' && (
        <div className="card" style={{ padding:28, maxWidth:520 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
            <div className="icon-node" style={{ width:36,height:36 }}><Key size={16} color="#F7931A" /></div>
            <div>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:'0.95rem' }}>Generate Video Code</h2>
              <p style={{ fontSize:'0.75rem', color:'#94A3B8' }}>Creates a code in D1 — actually redeemable in the terminal</p>
            </div>
          </div>
          <form onSubmit={handleCreateCode} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              {label('Code (blank = auto-generate)')}
              <input className="input" value={codeInput} onChange={e => setCodeInput(e.target.value)}
                placeholder="SATOSHI21" style={{ borderRadius:8 }} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
              <div>
                {label('Points Value')}
                <input className="input" type="number" min="1" value={ptsInput}
                  onChange={e => setPtsInput(e.target.value)} style={{ borderRadius:8 }} />
              </div>
              <div>
                {label('# Uses (-1 = unlimited)')}
                <input className="input" type="number" value={usesInput}
                  onChange={e => setUsesInput(e.target.value)} style={{ borderRadius:8 }} />
              </div>
              <div>
                {label('Expires In (hrs, 0=never)')}
                <input className="input" type="number" min="0" value={expInput}
                  onChange={e => setExpInput(e.target.value)} style={{ borderRadius:8 }} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-sm" disabled={codeLoading}>
              <Key size={14} />
              {codeLoading ? 'Creating...' : 'Create Code in D1'}
            </button>
            {codeResult && (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
                padding:'12px 16px', background:'rgba(247,147,26,0.08)',
                border:'1px solid rgba(247,147,26,0.3)', borderRadius:10 }}>
                <div>
                  <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.65rem', color:'#94A3B8', marginBottom:4 }}>CODE CREATED</p>
                  <p style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:'1.1rem', color:'#F7931A' }}>{codeResult}</p>
                </div>
                <button type="button" onClick={() => { navigator.clipboard.writeText(codeResult); toast.success('Copied!') }}
                  className="btn btn-ghost btn-sm" style={{ flexShrink:0 }}>
                  <Copy size={14} />
                </button>
                <CheckCircle size={16} color="#22c55e" />
              </div>
            )}
          </form>
        </div>
      )}

      {/* ── Adjust Points ────────────────────────────────────────── */}
      {tab === 'Adjust Points' && (
        <div className="card" style={{ padding:28, maxWidth:520 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
            <div className="icon-node" style={{ width:36,height:36 }}><Zap size={16} color="#F7931A" /></div>
            <div>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:'0.95rem' }}>Adjust User Points</h2>
              <p style={{ fontSize:'0.75rem', color:'#94A3B8' }}>Grant or deduct points via SQL transaction in D1</p>
            </div>
          </div>
          <form onSubmit={handleAdjust} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              {label('Firebase UID')}
              <input className="input" value={targetUid} onChange={e => setTargetUid(e.target.value)}
                placeholder="user-firebase-uid" style={{ borderRadius:8 }} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                {label('Points (+ grant / − deduct)')}
                <input className="input" type="number" value={adjustAmt}
                  onChange={e => setAdjustAmt(e.target.value)}
                  placeholder="+500 or -200" style={{ borderRadius:8 }} />
              </div>
              <div>
                {label('Reason')}
                <select value={adjustReason} onChange={e => setAdjustReason(e.target.value)}
                  style={{ width:'100%', height:48, padding:'0 12px', background:'rgba(0,0,0,0.4)',
                    border:'none', borderBottom:'2px solid rgba(255,255,255,0.15)', borderRadius:'8px 8px 0 0',
                    color:'#fff', fontFamily:"'Inter',sans-serif", fontSize:'0.875rem', outline:'none' }}>
                  <option value="admin">admin</option>
                  <option value="giveaway">giveaway</option>
                  <option value="correction">correction</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-outline btn-sm"
              disabled={adjustLoading || !adjustAmt || !targetUid}>
              {adjustLoading ? 'Processing...' : 'Apply Adjustment'}
            </button>
          </form>
          <div style={{ marginTop:20, padding:'12px 16px', borderRadius:8,
            background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.65rem', color:'rgba(148,163,184,0.5)' }}>
              TIP: Use the Users tab to find UIDs. Points changes are permanent SQL transactions.
            </p>
          </div>
        </div>
      )}

      {/* ── Tickets ──────────────────────────────────────────────── */}
      {tab === 'Tickets' && (
        <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:16, height:'calc(100vh - 320px)', minHeight:400 }}>

          {/* Ticket list */}
          <div style={{ display:'flex', flexDirection:'column', gap:6, overflowY:'auto' }}>
            {tickets.length === 0 ? (
              <div style={{ padding:24, textAlign:'center', background:'rgba(255,255,255,0.02)',
                borderRadius:12, border:'1px solid rgba(255,255,255,0.06)' }}>
                <MessageSquare size={24} color="#94A3B8" style={{ margin:'0 auto 8px' }} />
                <p style={{ fontSize:'0.8rem', color:'#94A3B8' }}>No tickets yet</p>
              </div>
            ) : tickets.map(t => (
              <button key={t.id} onClick={() => setSelectedTicket(t.id)} style={{
                background: selectedTicket === t.id ? 'rgba(247,147,26,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${selectedTicket === t.id ? 'rgba(247,147,26,0.35)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius:10, padding:'12px 14px', cursor:'pointer', textAlign:'left', transition:'all 0.2s',
              }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, marginBottom:4 }}>
                  <span style={{ fontSize:'0.8rem', color:'#fff', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {t.subject}
                  </span>
                  <ChevronRight size={12} color="#94A3B8" style={{ flexShrink:0 }} />
                </div>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.6rem',
                  color: t.status === 'open' ? '#22c55e' : '#94A3B8',
                  textTransform:'uppercase', letterSpacing:'0.06em' }}>● {t.status}</span>
                <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.55rem', color:'rgba(148,163,184,0.4)', marginTop:4 }}>
                  {t.uid.slice(0,12)}...
                </p>
              </button>
            ))}
          </div>

          {/* Chat panel */}
          <div className="card" style={{ padding:0, overflow:'hidden', display:'flex', flexDirection:'column' }}>
            {!selectedTicket ? (
              <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, padding:40 }}>
                <MessageSquare size={40} color="rgba(148,163,184,0.3)" />
                <p style={{ color:'#94A3B8', fontSize:'0.9rem' }}>Select a ticket to reply</p>
              </div>
            ) : (
              <>
                <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)',
                  display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <p style={{ fontWeight:600, fontSize:'0.9rem' }}>{selectedTicketData?.subject}</p>
                    <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.6rem', color:'#94A3B8' }}>
                      {selectedTicketData?.uid}
                    </p>
                  </div>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.6rem',
                    color: selectedTicketData?.status === 'open' ? '#22c55e' : '#94A3B8',
                    textTransform:'uppercase' }}>● {selectedTicketData?.status}</span>
                </div>
                <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:12 }}>
                  {messages.length === 0 && (
                    <p style={{ textAlign:'center', color:'rgba(148,163,184,0.4)', fontSize:'0.8rem', paddingTop:32 }}>No messages yet</p>
                  )}
                  {messages.map(msg => {
                    const isMe = msg.senderUid === user?.uid
                    return (
                      <div key={msg.id} style={{ display:'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          maxWidth:'72%', padding:'10px 14px',
                          borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          background: isMe ? 'linear-gradient(135deg,#EA580C,#F7931A)' : 'rgba(255,255,255,0.05)',
                          border: isMe ? 'none' : '1px solid rgba(255,255,255,0.08)',
                        }}>
                          {!isMe && (
                            <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.6rem',
                              color:'rgba(148,163,184,0.6)', marginBottom:4 }}>USER</p>
                          )}
                          {isMe && (
                            <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.6rem',
                              color:'rgba(255,255,255,0.7)', marginBottom:4 }}>CREATOR</p>
                          )}
                          <p style={{ fontSize:'0.875rem', lineHeight:1.5, color:'#fff' }}>{msg.text}</p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={bottomRef} />
                </div>
                <form onSubmit={sendReply} style={{ padding:'12px 16px',
                  borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', gap:8 }}>
                  <input className="input" value={reply} onChange={e => setReply(e.target.value)}
                    placeholder="Reply as creator..." disabled={sending} style={{ flex:1, borderRadius:8 }} />
                  <button type="submit" disabled={sending || !reply.trim()}
                    className="btn btn-primary btn-sm" style={{ padding:'0 16px', flexShrink:0 }}>
                    <Send size={14} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Users ────────────────────────────────────────────────── */}
      {tab === 'Users' && (
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)',
            display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:'0.95rem' }}>All Users</h2>
            <button onClick={() => { setUsersLoading(true); api.admin.getUsers().then(setUsers).finally(() => setUsersLoading(false)) }}
              className="btn btn-ghost btn-sm">
              <RefreshCw size={14} />
            </button>
          </div>
          {usersLoading ? (
            <div style={{ padding:40, textAlign:'center' }}>
              <div style={{ width:24, height:24, border:'2px solid #F7931A', borderTopColor:'transparent',
                borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'rgba(255,255,255,0.02)' }}>
                    {['Display Name','Email','Points','Lifetime','Tier','UID'].map(h => (
                      <th key={h} style={{ padding:'10px 16px', textAlign:'left',
                        fontFamily:"'JetBrains Mono',monospace", fontSize:'0.6rem',
                        color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.06em',
                        borderBottom:'1px solid rgba(255,255,255,0.06)', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.uid} style={{ borderBottom: i < users.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      transition:'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background='rgba(255,255,255,0.02)')}
                      onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                      <td style={{ padding:'12px 16px', fontSize:'0.875rem', fontWeight:500 }}>{u.displayName}</td>
                      <td style={{ padding:'12px 16px', fontFamily:"'JetBrains Mono',monospace", fontSize:'0.7rem', color:'#94A3B8' }}>{u.email}</td>
                      <td style={{ padding:'12px 16px', fontFamily:"'JetBrains Mono',monospace", fontSize:'0.85rem', color:'#F7931A', fontWeight:500 }}>{u.points.toLocaleString()}</td>
                      <td style={{ padding:'12px 16px', fontFamily:"'JetBrains Mono',monospace", fontSize:'0.85rem' }}>{u.lifetimePoints.toLocaleString()}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <span className={`badge badge-${u.tier}`} style={{ fontSize:'0.55rem' }}>{u.tier}</span>
                      </td>
                      <td style={{ padding:'12px 16px', fontFamily:"'JetBrains Mono',monospace", fontSize:'0.65rem', color:'rgba(148,163,184,0.5)' }}>
                        <button onClick={() => { navigator.clipboard.writeText(u.uid); toast.success('UID copied!') }}
                          style={{ background:'none', border:'none', color:'inherit', cursor:'pointer', fontFamily:'inherit', fontSize:'inherit' }}>
                          {u.uid.slice(0,14)}… <Copy size={9} style={{ display:'inline' }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Store Management ───────────────────────────────────── */}
      {tab === 'Store' && (
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, auto)' }}>
          {/* List of Rewards */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Active Rewards</h2>
              <button className="btn btn-ghost btn-sm" onClick={loadRewards}><RefreshCw size={14} /></button>
            </div>
            {rewardsLoading ? <p>Loading...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {rewards.map(r => (
                  <div key={r.id} style={{
                    padding: 16, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12,
                    background: r.isActive ? 'rgba(255,255,255,0.02)' : 'rgba(239,68,68,0.05)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {r.imageUrl ? (
                        <img src={r.imageUrl} alt={r.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Shield size={16} color="#444" />
                        </div>
                      )}
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 4 }}>{r.name}</p>
                        <p style={{ color: '#F7931A', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.75rem', marginBottom: 4 }}>{r.cost} pts • Stock: {r.stock === -1 ? '∞' : r.stock}</p>
                        <p style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Active: {r.isActive ? 'Ye' : 'No'}</p>
                      </div>
                    </div>
                    <button onClick={() => setStoreForm({ ...r })} className="btn btn-outline btn-sm">Edit</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 20 }}>
              {storeForm.id === 0 ? 'Create New Reward' : `Edit Reward #${storeForm.id}`}
            </h2>
            <form onSubmit={handleSaveReward} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: 4 }}>Name</label>
                <input required className="input" value={storeForm.name} onChange={e => setStoreForm({...storeForm, name: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: 4 }}>Description</label>
                <textarea required className="input" style={{ minHeight: 60 }} value={storeForm.description} onChange={e => setStoreForm({...storeForm, description: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: 4 }}>Cost (Pts)</label>
                  <input type="number" required className="input" value={storeForm.cost} onChange={e => setStoreForm({...storeForm, cost: Number(e.target.value)})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: 4 }}>Stock (-1 for ∞)</label>
                  <input type="number" required className="input" value={storeForm.stock} onChange={e => setStoreForm({...storeForm, stock: Number(e.target.value)})} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: 4 }}>Secret Content (Shown only after purchase)</label>
                <textarea className="input" style={{ minHeight: 60, fontFamily: "'JetBrains Mono',monospace", fontSize: '0.8rem' }} placeholder="https://mega.nz/file/... or ACT-CODE-123" value={storeForm.content} onChange={e => setStoreForm({...storeForm, content: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: 4 }}>Instructions (Optional)</label>
                <input className="input" value={storeForm.instructions} onChange={e => setStoreForm({...storeForm, instructions: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: 4 }}>Thumbnail URL (Imgur/Drive)</label>
                <input className="input" placeholder="https://i.imgur.com/..." value={storeForm.imageUrl} onChange={e => setStoreForm({...storeForm, imageUrl: e.target.value})} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 8 }}>
                <input type="checkbox" checked={storeForm.isActive} onChange={e => setStoreForm({...storeForm, isActive: e.target.checked})} />
                <span style={{ fontSize: '0.9rem', color: '#fff' }}>Is Active (Visible in Store)</span>
              </label>
              
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{storeForm.id === 0 ? 'Create' : 'Save'}</button>
                {storeForm.id !== 0 && (
                  <button type="button" className="btn btn-outline" onClick={() => setStoreForm({ id: 0, name: '', description: '', cost: 100, type: 'digital', stock: -1, content: '', instructions: '', imageUrl: '', isActive: true })}>Cancel</button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
