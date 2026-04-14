import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', background: '#030712',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32
        }}>
          <div style={{ textAlign: 'center', maxWidth: 480 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>⚡</div>
            <h2 style={{ color: '#f87171', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              Something went wrong
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              {this.state.error?.message || 'An unexpected error occurred. Please refresh the page.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 24px', background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
                border: 'none', borderRadius: 8, color: 'white', fontSize: 14,
                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
