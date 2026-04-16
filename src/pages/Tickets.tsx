import { useEffect, useState, useRef } from 'react'
import {
  MessageSquare, Send, Plus, ChevronRight, Clock,
  Wifi, Sparkles, CheckCircle, ArrowRight
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { db } from '@/lib/firebase'
import {
  collection, addDoc, onSnapshot, query,
  serverTimestamp, Timestamp, where
} from 'firebase/firestore'
import toast from 'react-hot-toast'

interface Message {
  id: string; senderUid: string; text: string; timestamp: Timestamp | null
}
interface Ticket {
  id: string; uid: string; subject: string; status: 'open' | 'closed'; createdAt: Timestamp | null
}

const ADMIN_UID = import.meta.env.VITE_ADMIN_UID as string | undefined

// Onboarding step info
const ONBOARDING_STEPS = [
  { icon: <Sparkles size={20} color="#F7931A" />, title: 'Direct line to the creator', desc: "Open a ticket and I'll reply personally — not a bot." },
  { icon: <MessageSquare size={20} color="#F7931A" />, title: 'Real-time messaging', desc: 'Messages are live via Firebase Firestore — no refreshing needed.' },
  { icon: <CheckCircle size={20} color="#F7931A" />, title: 'Your tickets stay private', desc: 'Only you and the creator can see your conversation.' },
]

export function Tickets() {
  const { user } = useAuthStore()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [hasLoaded, setHasLoaded] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [newSubject, setNewSubject] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [sending, setSending] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showMobileList, setShowMobileList] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load tickets — uid-filtered for users (KEY: no composite index needed without orderBy)
  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'tickets'),
      where('uid', '==', user.uid)
    )
    const unsub = onSnapshot(q,
      snap => {
        const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() } as Ticket))
        // Sort client-side — avoids needing a Firestore composite index
        loaded.sort((a, b) => {
          const aMs = a.createdAt?.toMillis() ?? 0
          const bMs = b.createdAt?.toMillis() ?? 0
          return bMs - aMs
        })
        setTickets(loaded)
        setHasLoaded(true)
      },
      err => {
        console.error('Tickets error:', err)
        toast.error('Could not load tickets — publish Firestore rules in Firebase Console')
      }
    )
    return unsub
  }, [user])

  // Messages for selected ticket
  useEffect(() => {
    if (!selected) return
    const q = query(
      collection(db, 'tickets', selected, 'messages')
    )
    return onSnapshot(q, snap => {
      const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message))
      loaded.sort((a, b) => {
        const aMs = a.timestamp?.toMillis() ?? 0
        const bMs = b.timestamp?.toMillis() ?? 0
        return aMs - bMs // ascending order
      })
      setMessages(loaded)
    })
  }, [selected])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMsg.trim() || !selected || !user) return
    setSending(true)
    try {
      await addDoc(collection(db, 'tickets', selected, 'messages'), {
        senderUid: user.uid,
        text: newMsg.trim(),
        timestamp: serverTimestamp(),
      })
      setNewMsg('')
    } catch (err) {
      console.error(err)
      toast.error('Send failed — check Firestore rules')
    } finally {
      setSending(false)
    }
  }

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubject.trim() || !user) return
    try {
      const ref = await addDoc(collection(db, 'tickets'), {
        uid: user.uid,
        subject: newSubject.trim(),
        status: 'open',
        createdAt: serverTimestamp(),
      })
      setSelected(ref.id)
      setShowNew(false)
      setShowOnboarding(false)
      setShowMobileList(false)
      setNewSubject('')
      toast.success('Ticket opened!')
    } catch (err) {
      console.error(err)
      toast.error('Could not create ticket — publish your Firestore rules first')
    }
  }

  const selectedTicket = tickets.find(t => t.id === selected)

  // ── Onboarding screen (shown when user has no tickets yet) ─────
  if (hasLoaded && tickets.length === 0 && !showOnboarding && !showNew) {
    return (
      <div className="container" style={{ paddingTop:60, paddingBottom:60 }}>
        <div style={{ maxWidth:560, margin:'0 auto', textAlign:'center' }}>
          {/* Icon */}
          <div style={{ width:72, height:72, borderRadius:20,
            background:'linear-gradient(135deg,rgba(234,88,12,0.15),rgba(247,147,26,0.08))',
            border:'1px solid rgba(247,147,26,0.25)',
            display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
            <MessageSquare size={32} color="#F7931A" />
          </div>

          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700,
            fontSize:'clamp(1.5rem,4vw,2rem)', marginBottom:12 }}>
            Talk directly to the <span className="gradient-text">Creator</span>
          </h1>
          <p style={{ fontSize:'0.9rem', color:'#94A3B8', lineHeight:1.7, marginBottom:36, maxWidth:420, margin:'0 auto 36px' }}>
            Got a question, collab idea, or feedback? Open a ticket and get a real reply — not an auto-response.
          </p>

          {/* Feature list */}
          <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:36, textAlign:'left' }}>
            {ONBOARDING_STEPS.map((step, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:14,
                padding:'14px 16px', borderRadius:12,
                background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width:36, height:36, borderRadius:10, flexShrink:0,
                  background:'rgba(247,147,26,0.08)', border:'1px solid rgba(247,147,26,0.15)',
                  display:'flex', alignItems:'center', justifyContent:'center' }}>{step.icon}</div>
                <div>
                  <p style={{ fontWeight:600, fontSize:'0.875rem', marginBottom:3 }}>{step.title}</p>
                  <p style={{ fontSize:'0.8rem', color:'#94A3B8' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setShowOnboarding(true)}
            className="btn btn-primary" style={{ gap:10, padding:'14px 32px', fontSize:'0.95rem' }}>
            <MessageSquare size={16} />
            Open My First Ticket
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  // ── New ticket form (full page when coming from onboarding) ────
  if (showOnboarding) {
    return (
      <div className="container" style={{ paddingTop:60, paddingBottom:60 }}>
        <div style={{ maxWidth:480, margin:'0 auto' }}>
          <button onClick={() => setShowOnboarding(false)}
            style={{ background:'none', border:'none', color:'#94A3B8', cursor:'pointer',
              fontFamily:"'JetBrains Mono',monospace", fontSize:'0.7rem', marginBottom:24,
              display:'flex', alignItems:'center', gap:6 }}>
            ← Back
          </button>
          <div className="icon-node" style={{ width:48, height:48, marginBottom:20 }}>
            <MessageSquare size={22} color="#F7931A" />
          </div>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:'1.5rem', marginBottom:8 }}>
            What's on your mind?
          </h2>
          <p style={{ color:'#94A3B8', fontSize:'0.875rem', marginBottom:32, lineHeight:1.6 }}>
            Give your ticket a short subject. You can write your full message inside after opening.
          </p>
          <form onSubmit={createTicket} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.65rem', color:'#94A3B8',
                textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:8 }}>
                Ticket Subject
              </label>
              <input className="input" value={newSubject} onChange={e => setNewSubject(e.target.value)}
                placeholder="e.g. Collab idea, Question about video, Contest entry..."
                style={{ borderRadius:10 }} autoFocus />
            </div>
            {/* Suggested subjects */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {['Collab idea 🎬','Contest entry 🏆','Feedback 💬','Help needed 🙋'].map(s => (
                <button key={s} type="button" onClick={() => setNewSubject(s.split(' ').slice(0,-1).join(' '))}
                  style={{ padding:'6px 12px', borderRadius:9999, background:'rgba(247,147,26,0.07)',
                    border:'1px solid rgba(247,147,26,0.2)', color:'#94A3B8', cursor:'pointer',
                    fontFamily:"'JetBrains Mono',monospace", fontSize:'0.7rem', transition:'all 0.2s' }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.color='#F7931A' }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.color='#94A3B8' }}>
                  {s}
                </button>
              ))}
            </div>
            <button type="submit" className="btn btn-primary" disabled={!newSubject.trim()}
              style={{ gap:8, marginTop:8 }}>
              <Send size={16} />
              Open Ticket
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── Main tickets view ──────────────────────────────────────────
  return (
    <div className="container" style={{ paddingTop:40, paddingBottom:60 }}>
      <div style={{ marginBottom:24 }}>
        <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.7rem', color:'#94A3B8',
          letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>Direct Messages</p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:'clamp(1.5rem,3vw,2rem)' }}>
            {(!showMobileList && selected) ? 'Conversation' : 'Your '} <span className="gradient-text">Tickets</span>
          </h1>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ display:'none', md: 'flex', alignItems:'center', gap:6 }} className="live-badge">
              <Wifi size={12} color="#22c55e" />
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.65rem', color:'#22c55e', letterSpacing:'0.05em' }}>
                LIVE
              </span>
            </div>
            <button onClick={() => setShowOnboarding(true)} className="btn btn-primary btn-sm" style={{ gap:6 }}>
              <Plus size={14} /> New Ticket
            </button>
          </div>
        </div>
      </div>

      <div className="tickets-layout" style={{ 
        display:'grid', 
        gridTemplateColumns: 'minmax(0, 1fr)',
        md: '280px 1fr', 
        gap:16, 
        height:'calc(100vh - 280px)', 
        minHeight:400 
      }}>
        <style>{`
          .tickets-layout { grid-template-columns: 1fr; }
          .sidebar { display: \${showMobileList ? 'flex' : 'none'}; }
          .chat-area { display: \${!showMobileList ? 'flex' : 'none'}; }
          .live-badge { display: none; }
          
          @media (min-width: 768px) {
            .tickets-layout { grid-template-columns: 280px 1fr !important; }
            .sidebar { display: flex !important; }
            .chat-area { display: flex !important; }
            .live-badge { display: flex !important; }
            .mobile-back { display: none !important; }
          }
        `}</style>

        {/* Sidebar */}
        <div className="sidebar" style={{ flexDirection:'column', gap:6, overflowY:'auto' }}>
          {showNew && (
            <form onSubmit={createTicket} style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:8,
              padding:12, background:'rgba(247,147,26,0.05)', borderRadius:10, border:'1px solid rgba(247,147,26,0.2)' }}>
              <input className="input" value={newSubject} onChange={e => setNewSubject(e.target.value)}
                placeholder="Ticket subject..." style={{ borderRadius:8 }} autoFocus />
              <div style={{ display:'flex', gap:8 }}>
                <button type="submit" className="btn btn-primary btn-sm" style={{ flex:1 }}>Open</button>
                <button type="button" onClick={() => setShowNew(false)} className="btn btn-ghost btn-sm" style={{ flex:1 }}>Cancel</button>
              </div>
            </form>
          )}

          {tickets.map(t => (
            <button key={t.id} onClick={() => { setSelected(t.id); setShowMobileList(false); }} style={{
              background: selected === t.id ? 'rgba(247,147,26,0.08)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${selected === t.id ? 'rgba(247,147,26,0.35)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius:10, padding:'12px 14px', cursor:'pointer', textAlign:'left', transition:'all 0.2s',
              width: '100%'
            }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, marginBottom:4 }}>
                <span style={{ fontSize:'0.8rem', color:'#fff', fontWeight:500,
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.subject}</span>
                <ChevronRight size={12} color="#94A3B8" style={{ flexShrink:0 }} />
              </div>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.6rem',
                color: t.status === 'open' ? '#22c55e' : '#94A3B8',
                textTransform:'uppercase', letterSpacing:'0.06em' }}>● {t.status}</span>
            </button>
          ))}
          {tickets.length === 0 && !showNew && (
            <div style={{ padding: 20, textAlign: 'center', opacity: 0.5 }}>
              <p style={{ fontSize: '0.8rem' }}>No tickets yet</p>
            </div>
          )}
        </div>

        {/* Chat */}
        <div className="chat-area card" style={{ padding:0, overflow:'hidden', flexDirection:'column' }}>
          {!selected ? (
            <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center',
              justifyContent:'center', gap:12, padding:40 }}>
              <MessageSquare size={40} color="rgba(148,163,184,0.3)" />
              <p style={{ color:'#94A3B8', fontSize:'0.9rem' }}>Select a ticket to view the conversation</p>
            </div>
          ) : (
            <>
              <div style={{ padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)',
                display:'flex', alignItems:'center', gap: 12 }}>
                <button 
                  onClick={() => setShowMobileList(true)}
                  className="mobile-back btn btn-ghost btn-sm"
                  style={{ padding: '4px 8px', height: 'auto', borderRadius: 6 }}
                >
                  ←
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight:600, fontSize:'0.9rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {selectedTicket?.subject}
                  </p>
                  <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.55rem',
                    color: selectedTicket?.status === 'open' ? '#22c55e' : '#94A3B8', textTransform:'uppercase' }}>
                    ● {selectedTicket?.status}
                  </p>
                </div>
              </div>

              <div style={{ flex:1, overflowY:'auto', padding:'16px 20px',
                display:'flex', flexDirection:'column', gap:12 }}>
                {messages.length === 0 && (
                  <div style={{ textAlign:'center', paddingTop:32 }}>
                    <p style={{ color:'rgba(148,163,184,0.4)', fontSize:'0.8rem' }}>
                      Ticket opened — say hello 👋
                    </p>
                    <p style={{ color:'rgba(148,163,184,0.3)', fontSize:'0.72rem', marginTop:6 }}>
                      The creator will reply here
                    </p>
                  </div>
                )}
                {messages.map(msg => {
                  const isCreator = msg.senderUid === ADMIN_UID
                  const isMe = msg.senderUid === user?.uid
                  return (
                    <div key={msg.id} style={{ display:'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth:'72%', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        padding:'10px 14px',
                        background: isCreator
                          ? 'linear-gradient(135deg,#EA580C,#F7931A)'
                          : isMe
                          ? 'rgba(255,255,255,0.07)'
                          : 'rgba(255,255,255,0.05)',
                        border: isMe && !isCreator ? '1px solid rgba(255,255,255,0.1)' : 'none',
                      }}>
                        {isCreator && (
                          <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.6rem',
                            color:'rgba(255,255,255,0.8)', marginBottom:4, letterSpacing:'0.05em' }}>⚡ CREATOR</p>
                        )}
                        <p style={{ fontSize:'0.875rem', lineHeight:1.5, color:'#fff' }}>{msg.text}</p>
                        {msg.timestamp && (
                          <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:4, justifyContent:'flex-end' }}>
                            <Clock size={9} color="rgba(255,255,255,0.4)" />
                            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.6rem', color:'rgba(255,255,255,0.4)' }}>
                              {new Date(msg.timestamp.toMillis()).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={sendMessage} style={{ padding:'12px 16px',
                borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', gap:8 }}>
                <input className="input" value={newMsg} onChange={e => setNewMsg(e.target.value)}
                  placeholder="Type a message..." disabled={sending}
                  style={{ flex:1, borderRadius:8 }} />
                <button type="submit" disabled={sending || !newMsg.trim()}
                  className="btn btn-primary btn-sm" style={{ padding:'0 16px', flexShrink:0 }}>
                  <Send size={14} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
