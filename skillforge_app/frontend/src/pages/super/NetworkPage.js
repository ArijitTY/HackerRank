import { useState, useEffect } from 'react';
import api from '../../api';

export default function NetworkPage() {
  const [lanIp, setLanIp] = useState('');
  const [tunnelUrl, setTunnelUrl] = useState('');
  const [tunnelStatus, setTunnelStatus] = useState('stopped');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/tunnel/lan')
      .then(r => setLanIp(r.data.ip || r.data.lanIp || ''))
      .catch(() => {});
    api.get('/tunnel/status')
      .then(r => {
        setTunnelUrl(r.data.url || '');
        setTunnelStatus(r.data.status || 'stopped');
      })
      .catch(() => {});
  }, []);

  const startTunnel = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/tunnel/ngrok/start');
      setTunnelUrl(data.url || '');
      setTunnelStatus('running');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start tunnel');
    } finally {
      setLoading(false);
    }
  };

  const stopTunnel = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/tunnel/ngrok/stop');
      setTunnelUrl('');
      setTunnelStatus('stopped');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to stop tunnel');
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url).catch(() => {});
  };

  const lanUrl = lanIp ? `http://${lanIp}:3000` : '';

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Network Access</h1>
          <p className="page-sub">Configure LAN and tunnel access for candidates</p>
        </div>
      </div>

      {error && <div className="login-error">{error}</div>}

      <div className="network-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="test-card card-enter" style={{ borderLeft: '3px solid #2563eb' }}>
          <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
                </svg>
              </div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>LAN Access</h3>
            </div>
            {lanUrl ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em', marginBottom: 4 }}>Local IP</div>
                  <div style={{ fontSize: 20, fontFamily: 'monospace', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{lanIp}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: 8, marginBottom: 12 }}>
                  <code style={{ flex: 1, fontSize: 13, color: '#2563eb', fontFamily: 'monospace', wordBreak: 'break-all' }}>{lanUrl}</code>
                  <button className="btn btn-sm btn-outline" onClick={() => copyUrl(lanUrl)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    Copy
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Share this URL with candidates on the same network.</p>
              </>
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Unable to detect LAN IP address.</p>
            )}
          </div>
        </div>

        <div className="test-card card-enter" style={{ borderLeft: '3px solid #7c3aed' }}>
          <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Ngrok Tunnel</h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Status</span>
              <span className={`badge ${tunnelStatus === 'running' ? 'badge-active' : 'badge-muted'}`}>
                {tunnelStatus}
              </span>
            </div>

            {tunnelUrl && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: 8, marginBottom: 16 }}>
                <code style={{ flex: 1, fontSize: 13, color: '#7c3aed', fontFamily: 'monospace', wordBreak: 'break-all' }}>{tunnelUrl}</code>
                <button className="btn btn-sm btn-outline" onClick={() => copyUrl(tunnelUrl)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-success" onClick={startTunnel} disabled={loading || tunnelStatus === 'running'}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                {loading && tunnelStatus !== 'running' ? 'Starting...' : 'Start Tunnel'}
              </button>
              <button className="btn btn-danger" onClick={stopTunnel} disabled={loading || tunnelStatus === 'stopped'}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="6" y="6" width="12" height="12"/></svg>
                Stop Tunnel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
