import { useState, useEffect, useRef } from 'react'
import { Terminal as TerminalIcon, X, ChevronRight } from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'

const HELP_TEXT = `
╔════════════════════════════════════════╗
║       FATEHUB TERMINAL v1.0.0          ║
╚════════════════════════════════════════╝

Available commands:
  /claim <CODE>    — Redeem a hidden video code
  /balance         — Check your point balance
  /help            — Show this message
  /clear           — Clear terminal

Codes are hidden in videos. Find them. Claim them.
`

export function Terminal() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [lines, setLines] = useState<{ text: string; type: 'output' | 'input' | 'success' | 'error' | 'info' }[]>([
    { text: HELP_TEXT, type: 'info' },
  ])
  const [processing, setProcessing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const { user, refreshProfile } = useAuthStore()

  // ~ key opens terminal
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === '`' || e.key === '~') {
        e.preventDefault()
        setOpen(v => !v)
      }
      if (e.key === 'Escape' && open) setOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  const addLine = (text: string, type: typeof lines[0]['type'] = 'output') => {
    setLines(prev => [...prev, { text, type }])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const raw = input.trim()
    if (!raw) return
    setInput('')
    addLine(`> ${raw}`, 'input')

    if (!user) {
      addLine('ERROR: Not authenticated.', 'error')
      return
    }

    const [cmd, ...args] = raw.split(' ')

    if (cmd === '/help') {
      addLine(HELP_TEXT, 'info')
    } else if (cmd === '/clear') {
      setLines([])
    } else if (cmd === '/balance') {
      setProcessing(true)
      try {
        const profile = await api.getMe()
        addLine(`⚡ Current balance: ${profile.points.toLocaleString()} pts`, 'success')
        addLine(`✦ Lifetime earned:  ${profile.lifetimePoints.toLocaleString()} pts`, 'info')
      } catch {
        addLine('ERROR: Could not fetch balance.', 'error')
      } finally {
        setProcessing(false)
      }
    } else if (cmd === '/claim') {
      const code = args[0]
      if (!code) {
        addLine('Usage: /claim <CODE>', 'error')
        return
      }
      setProcessing(true)
      addLine(`Verifying code "${code.toUpperCase()}"...`, 'output')
      try {
        const result = await api.claimCode(code)
        addLine(`✓ SUCCESS! +${result.pointsAwarded} pts awarded.`, 'success')
        addLine(`New balance: ${result.newBalance.toLocaleString()} pts`, 'success')
        refreshProfile()
        toast.success(`+${result.pointsAwarded} pts claimed!`)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        addLine(`✗ FAILED: ${msg}`, 'error')
      } finally {
        setProcessing(false)
      }
    } else {
      addLine(`Unknown command: ${cmd}. Type /help for available commands.`, 'error')
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open terminal"
        data-tooltip="Press ~ to open"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9000,
          width: 44, height: 44,
          background: 'rgba(15,17,21,0.9)',
          border: '1px solid rgba(247,147,26,0.3)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 0 20px rgba(247,147,26,0.2)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(247,147,26,0.5)'
          ;(e.currentTarget as HTMLElement).style.borderColor = '#F7931A'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(247,147,26,0.2)'
          ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(247,147,26,0.3)'
        }}
      >
        <TerminalIcon size={18} color="#F7931A" />
      </button>
    )
  }

  return (
    <div className="terminal-overlay" style={{ animation: 'slide-up 0.2s ease forwards' }}>
      {/* Header */}
      <div style={{
        background: '#0F1115',
        borderBottom: '1px solid rgba(247,147,26,0.2)',
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TerminalIcon size={14} color="#F7931A" />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#F7931A', letterSpacing: '0.08em' }}>
            FATEHUB_TERMINAL
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: '#94A3B8' }}>v1.0.0</span>
        </div>
        <button onClick={() => setOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#94A3B8', padding:4 }}>
          <X size={14} />
        </button>
      </div>

      {/* Output */}
      <div style={{
        height: 280, overflowY: 'auto',
        padding: '12px 16px',
        background: '#030304',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.75rem',
        lineHeight: 1.7,
      }}>
        {lines.map((line, i) => (
          <pre key={i} style={{
            whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0,
            color: line.type === 'success' ? '#F7931A'
                 : line.type === 'error'   ? '#ef4444'
                 : line.type === 'input'   ? '#94A3B8'
                 : line.type === 'info'    ? 'rgba(247,147,26,0.7)'
                 : '#fff',
          }}>
            {line.text}
          </pre>
        ))}
        {processing && (
          <div style={{ color: '#F7931A', opacity: 0.7 }}>⠸ Processing...</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 16px',
        background: '#0F1115',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <ChevronRight size={14} color="#F7931A" style={{ flexShrink: 0 }} />
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={processing}
          placeholder="Type /help for commands..."
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: '#fff',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.75rem',
          }}
        />
      </form>
    </div>
  )
}
