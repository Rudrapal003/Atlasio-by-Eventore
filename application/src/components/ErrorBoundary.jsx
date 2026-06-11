import React from 'react';

// Class-based error boundary — React still requires this to use componentDidCatch.
// Catches render-time errors anywhere below it and shows an inline message
// instead of blanking the entire screen. Critical for live demos.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[Eventore ErrorBoundary]', error, info);
  }

  reset = () => {
    this.setState({ error: null });
    // Best-effort: also clear potentially-bad persisted state.
    try { localStorage.removeItem('eventore_state'); } catch (e) { /* ignore */ }
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{
        padding: 24, color: '#7F1D1D', background: '#FEF2F2', border: '1px solid #FECACA',
        borderRadius: 12, margin: 16, fontFamily: 'system-ui, sans-serif', fontSize: 13, lineHeight: 1.5
      }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15 }}>Something rendered wrong.</h3>
        <p style={{ margin: '0 0 8px' }}>
          {this.state.error.message || String(this.state.error)}
        </p>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#991B1B' }}>
          The rest of the app still works — go back or reset state below.
        </p>
        <button
          onClick={this.reset}
          style={{
            padding: '8px 14px', borderRadius: 8, border: '1px solid #7F1D1D',
            background: 'white', color: '#7F1D1D', fontWeight: 600, cursor: 'pointer', fontSize: 12
          }}
        >
          Reset & reload
        </button>
        <button
          onClick={() => { window.location.href = '/'; }}
          style={{
            marginLeft: 8, padding: '8px 14px', borderRadius: 8, border: 'none',
            background: '#7F1D1D', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 12
          }}
        >
          Go home
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
