import './data.js'
import '../image-slot.js'
import './styles.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ position: 'fixed', inset: 0, background: '#0a0a0a', color: '#ff1f8f', fontFamily: 'monospace', padding: '2rem', zIndex: 9999, overflow: 'auto' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>GRINLOUD — Render Error</div>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', color: '#fff' }}>{String(this.state.error)}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem', color: '#aaa', marginTop: '1rem' }}>{this.state.error?.stack}</pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: '2rem', padding: '0.5rem 1.5rem', background: '#ff1f8f', color: '#000', border: 'none', cursor: 'pointer', fontFamily: 'monospace' }}>RELOAD</button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary><App /></ErrorBoundary>
)
