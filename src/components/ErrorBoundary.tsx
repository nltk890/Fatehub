import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#030304',
          color: '#fff',
          textAlign: 'center',
          padding: 20,
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '2rem', marginBottom: 12 }}>
            Something went <span style={{ color: '#ef4444' }}>wrong</span>
          </h1>
          <p style={{ color: '#94A3B8', maxWidth: 400, marginBottom: 32, fontSize: '0.95rem', lineHeight: 1.6 }}>
            The application encountered an unexpected error. This has been logged, but you may need to reload the page to continue.
          </p>
          
          {this.state.error && (
            <pre style={{ 
              background: 'rgba(0,0,0,0.3)', 
              padding: 16, 
              borderRadius: 8, 
              fontSize: '0.75rem', 
              color: '#ef4444',
              maxWidth: '100%',
              overflowX: 'auto',
              marginBottom: 32,
              textAlign: 'left',
              fontFamily: "'JetBrains Mono',monospace",
              border: '1px solid rgba(239, 68, 68, 0.1)'
            }}>
              {this.state.error.toString()}
            </pre>
          )}
          
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-primary"
            style={{ padding: '12px 24px' }}
          >
            Reload Website
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
