import { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import SessionsPanel from '../shared/SessionsPanel';

export default function NetworkPage({ apiPrefix = '/super', resultsPath = '/super/results' }) {
  const [lanIp, setLanIp] = useState('');
  const [tunnelUrl, setTunnelUrl] = useState('');
  const [tunnelStatus, setTunnelStatus] = useState('stopped');
  const [activeSession, setActiveSession] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [pollAttempt, setPollAttempt] = useState(0);
  const [authToken, setAuthToken] = useState('');
  const [tokenSaving, setTokenSaving] = useState(false);
  const [tokenMsg, setTokenMsg] = useState('');

  const refreshStatus = useCallback(async () => {
    try {
      const { data } = await api.get('/tunnel/status');
      const url = data.ngrokUrl || data.url || '';
      const running = data.ngrokRunning || data.status === 'running' || false;
      setTunnelUrl(url);
      setTunnelStatus(running ? 'running' : 'stopped');
      setActiveSession(data.activeSession || null);
    } catch (e) {}
  }, []);

  useEffect(() => {
    api.get('/tunnel/lan').then(r => setLanIp(r.data.ip || r.data.lanIp || '')).catch(() => {});
    refreshStatus();
  }, [refreshStatus]);

  const startTunnel = async () => {
    if (activeSessions.length === 0) return;
    setLoading(true); setError(''); setTunnelStatus('starting'); setPolling(true); setPollAttempt(0);
    try {
      // Pick the most recent active session for binding. SessionsPanel may handle its own start via the create flow;
      // here on the Network page, we bind to the latest active drive session.
      const latest = activeSessions[0];
      await api.post('/tunnel/ngrok/start', latest ? { sessionId: latest.id } : {});
      for (let i = 1; i <= 20; i++) {
        setPollAttempt(i);
        await new Promise(r => setTimeout(r, 2000));
        try {
          const { data } = await api.get('/tunnel/status');
          const url = data.ngrokUrl || data.url;
          if (url) {
            setTunnelUrl(url);
            setTunnelStatus('running');
            setActiveSession(data.activeSession || null);
            setPolling(false); setLoading(false);
            return;
          }
        } catch(e) {}
      }
      setTunnelStatus('failed');
      setError('Tunnel failed to start. Make sure ngrok is authenticated — run "ngrok config add-authtoken YOUR_TOKEN" in terminal, or set the token below.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start tunnel');
      setTunnelStatus('stopped');
    } finally {
      setPolling(false); setLoading(false);
    }
  };

  const stopTunnel = async () => {
    setLoading(true); setError('');
    try {
      await api.post('/tunnel/ngrok/stop');
      setTunnelUrl(''); setTunnelStatus('stopped'); setActiveSession(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to stop tunnel');
    } finally { setLoading(false); }
  };

  const copyText = (text) => { navigator.clipboard.writeText(text).catch(() => {}); };

  const lanUrl = lanIp ? `http://${lanIp}:3000` : '';

  const statusStyle = (() => {
    switch (tunnelStatus) {
      case 'running': return { backgroundColor: 'rgba(52,211,153,0.15)', color: '#34d399' };
      case 'starting': return { backgroundColor: 'rgba(250,204,21,0.15)', color: '#facc15' };
      case 'failed': return { backgroundColor: 'rgba(248,113,113,0.15)', color: '#f87171' };
      default: return { backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' };
    }
  })();

  const ngrokStartDisabled = loading || tunnelStatus === 'running' || activeSessions.length === 0;
  const ngrokCopyPayload = activeSession ? `Session: ${activeSession.code} | URL: ${tunnelUrl}` : tunnelUrl;

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Network Access</h1>
          <p className="page-sub">Manage drive sessions and network access for candidates</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
            Development: <code style={{ color: '#a78bfa' }}>http://localhost:3001</code>
            &nbsp;·&nbsp; Production / Candidates: <code style={{ color: '#34d399' }}>http://localhost:3000</code>
          </p>
        </div>
      </div>

      {error && <div className="login-error">{error}</div>}

      <SessionsPanel apiPrefix={apiPrefix} resultsPath={resultsPath} onActiveSessionsChange={setActiveSessions} />

      <div className="network-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="test-card card-enter" style={{ borderLeft: '3px solid #2563eb' }}>
          <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
                  </svg>
                </div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>LAN Access</h3>
              </div>
              {activeSession && (
                <span style={{ padding: '3px 10px', borderRadius: 6, background: 'rgba(124,58,237,0.15)', color: '#a78bfa', fontFamily: 'monospace', fontSize: 11, fontWeight: 700 }}>
                  Active Session: {activeSession.code}
                </span>
              )}
            </div>
            {lanUrl ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em', marginBottom: 4 }}>Local IP</div>
                  <div style={{ fontSize: 20, fontFamily: 'monospace', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{lanIp}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: 8, marginBottom: 12 }}>
                  <code style={{ flex: 1, fontSize: 13, color: '#2563eb', fontFamily: 'monospace', wordBreak: 'break-all' }}>{lanUrl}</code>
                  <button className="btn btn-sm btn-outline" onClick={() => copyText(lanUrl)}>Copy</button>
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
              <span className="badge" style={{ ...statusStyle, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {tunnelStatus === 'running' && <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#34d399', animation: 'pulse 2s infinite' }} />}
                {tunnelStatus === 'starting' && <span style={{ width: 10, height: 10, border: '2px solid rgba(250,204,21,0.3)', borderTopColor: '#facc15', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
                {tunnelStatus}
              </span>
            </div>

            {tunnelUrl && tunnelStatus === 'running' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: 8, marginBottom: 8 }}>
                  <code style={{ flex: 1, fontSize: 13, color: '#7c3aed', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {activeSession ? `Session: ${activeSession.code} | URL: ${tunnelUrl}` : tunnelUrl}
                  </code>
                  <button className="btn btn-sm btn-outline" onClick={() => copyText(ngrokCopyPayload)}>Copy</button>
                </div>
                <p style={{ margin: '0 0 12px', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Share this URL with candidates outside your network</p>
              </>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-success" onClick={startTunnel} disabled={ngrokStartDisabled}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                {loading && tunnelStatus !== 'running' ? 'Starting...' : 'Start Tunnel'}
              </button>
              <button className="btn btn-danger" onClick={stopTunnel} disabled={loading || tunnelStatus === 'stopped'}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="6" y="6" width="12" height="12"/></svg>
                Stop Tunnel
              </button>
            </div>

            {activeSessions.length === 0 && (
              <p style={{ margin: '10px 0 0', fontSize: 11, color: 'rgba(250,204,21,0.7)' }}>
                Create a session first to start tunnel
              </p>
            )}
            {polling && (
              <p style={{ margin: '10px 0 0', fontSize: 12, color: 'rgba(250,204,21,0.8)' }}>
                Getting tunnel URL... attempt {pollAttempt}/20
              </p>
            )}
            <p style={{ margin: '8px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
              Requires ngrok account (free). Get your token at ngrok.com
            </p>

            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display:'block', marginBottom: 6 }}>Ngrok Auth Token (optional)</label>
              <div style={{ display:'flex', gap: 8 }}>
                <input
                  type="password"
                  value={authToken}
                  onChange={e=>setAuthToken(e.target.value)}
                  placeholder="Paste your ngrok authtoken"
                  style={{ flex: 1, padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'rgba(255,255,255,0.9)', fontSize: 13 }}
                />
                <button className="btn btn-outline" disabled={tokenSaving || !authToken} onClick={async () => {
                  setTokenSaving(true); setTokenMsg('');
                  try { await api.post('/tunnel/ngrok/auth-token', { token: authToken }); setTokenMsg('Saved'); setAuthToken(''); }
                  catch(err) { setTokenMsg(err.response?.data?.error || 'Failed'); }
                  finally { setTokenSaving(false); }
                }}>{tokenSaving ? 'Saving...' : 'Save'}</button>
              </div>
              {tokenMsg && <div style={{ fontSize: 11, marginTop: 6, color: tokenMsg === 'Saved' ? '#34d399' : '#f87171' }}>{tokenMsg}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
