import './data.js'
import '../image-slot.js'
import './styles.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { crashed: false }; }
  static getDerivedStateFromError() { return { crashed: true }; }
  componentDidCatch(e, info) { console.error('[GRINLOUD]', e, info); }
  render() {
    if (this.state.crashed) {
      return (
        <div style={{ position: 'fixed', inset: 0, background: '#0a0a0a', color: '#fff', fontFamily: 'var(--mono, monospace)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.12em', color: '#ff1f8f' }}>GRINLOUD</div>
          <div style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>Something went wrong.</div>
          <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1.5rem', background: '#ff1f8f', color: '#000', border: 'none', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.08em', fontSize: '0.75rem' }}>RELOAD</button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary><App /></ErrorBoundary>
)
