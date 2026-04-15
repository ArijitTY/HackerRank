import { useState, useEffect, useRef } from 'react';
import api from '../../api';
import { formatTime } from '../../utils/dateUtils';
import OnlineStatusBadge from '../../components/OnlineStatusBadge';

const formatTimeTaken = (seconds) => {
  if (!seconds || seconds <= 0) return '0s';
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${r}s`;
  return `${r}s`;
};

const violationBadge = (n) => ({
  background: n > 0 ? '#FCEBEB' : '#EAF3DE',
  color: n > 0 ? '#A32D2D' : '#3B6D11',
  padding: '2px 10px', borderRadius: 99, fontSize: 12, fontWeight: 500,
});

const TD = { padding: '14px 16px', verticalAlign: 'middle', borderBottom: '0.5px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap' };

export default function LiveMonitor() {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);
  const [tick, setTick] = useState(0); // used to re-render elapsed time every second
  const intervalRef = useRef(null);
  const tickRef = useRef(null);

  const fetchLive = () => {
    api.get('/monitor/live')
      .then(r => { setSessions(r.data.sessions || r.data || []); setLastRefresh(new Date()); setError(''); })
      .catch(e => setError(e.response?.data?.error || 'Failed to fetch live sessions'));
  };

  useEffect(() => {
    fetchLive();
    intervalRef.current = setInterval(fetchLive, 30000);
    tickRef.current = setInterval(() => setTick(t => t + 1), 1000);
    return () => { clearInterval(intervalRef.current); clearInterval(tickRef.current); };
  }, []);

  const liveCount = sessions.length;

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Live Monitor</h1>
          <p className="page-sub">Candidates currently taking tests{lastRefresh ? ` · Last updated: ${formatTime(lastRefresh)}` : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99, background: liveCount > 0 ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)', color: liveCount > 0 ? '#34d399' : 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: liveCount > 0 ? '#10b981' : '#64748b', animation: liveCount > 0 ? 'sf-pulse 1.8s infinite' : 'none' }} />
            {liveCount} Live Now
          </span>
          <button className="btn btn-sm btn-outline" onClick={fetchLive}>Refresh</button>
        </div>
      </div>

      <style>{`@keyframes sf-pulse { 0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.6); } 70% { box-shadow: 0 0 0 8px rgba(16,185,129,0); } 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); } }`}</style>

      {error && <div className="login-error">{error}</div>}

      {sessions.length === 0 ? (
        <div style={{ background: '#0f1420', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🟢</div>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>No candidates are currently taking tests</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Active sessions will appear here automatically</div>
        </div>
      ) : (
        <div className="table-container" style={{ background: '#0f1420', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'visible' }}>
          <div className="leaderboard-scroll-wrapper table-scroll-wrapper" style={{ width:'100%', overflowX:'auto', display:'block' }}>
            <table className="sf-table" style={{ minWidth: '1000px', width: '100%', borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
              <colgroup>
                <col style={{ width: 40 }} />
                <col style={{ width: 180 }} />
                <col style={{ width: 180 }} />
                <col style={{ width: 150 }} />
                <col style={{ width: 150 }} />
                <col style={{ width: 110 }} />
                <col style={{ width: 160 }} />
                <col style={{ width: 100 }} />
                <col style={{ width: 100 }} />
                <col style={{ width: 150 }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>#</th>
                  <th>Candidate</th>
                  <th>Email</th>
                  <th>Test</th>
                  <th>Started At</th>
                  <th style={{ textAlign: 'center' }}>Time Elapsed</th>
                  <th>Progress</th>
                  <th style={{ textAlign: 'center' }}>Violations</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th>Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s, i) => {
                  void tick; // re-render each second to refresh live elapsed timer
                  const elapsedLive = s.timeElapsedSeconds + Math.floor((Date.now() - (lastRefresh?.getTime() || Date.now())) / 1000);
                  const progressPct = s.totalQuestions > 0 ? Math.round((s.questionsAnswered / s.totalQuestions) * 100) : 0;
                  return (
                    <tr key={s.sessionId || i} style={i % 2 === 1 ? { background: 'rgba(255,255,255,0.02)' } : {}}>
                      <td style={{ ...TD, textAlign: 'center', fontFamily: 'monospace', color: 'rgba(255,255,255,0.45)' }}>{i + 1}</td>
                      <td style={TD}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                            {(s.candidateName || '?')[0].toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 500, color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>{s.candidateName}</span>
                        </div>
                      </td>
                      <td style={{ ...TD, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{s.email}</td>
                      <td style={{ ...TD, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{s.testName}</td>
                      <td style={{ ...TD, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{s.startedAt}</td>
                      <td style={{ ...TD, textAlign: 'center', fontFamily: 'monospace', fontSize: 13, color: '#34d399' }}>{formatTimeTaken(elapsedLive)}</td>
                      <td style={TD}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 90, height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${progressPct}%`, background: '#a78bfa' }} />
                          </div>
                          <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)' }}>{s.questionsAnswered}/{s.totalQuestions}</span>
                        </div>
                      </td>
                      <td style={{ ...TD, textAlign: 'center' }}><span style={violationBadge(s.violations)}>{s.violations}</span></td>
                      <td style={{ ...TD, textAlign: 'center' }}>
                        <OnlineStatusBadge status={s.status === 'idle' ? 'idle' : 'in_test'} lastSeenRelative={s.lastActivity} size="md" />
                      </td>
                      <td style={{ ...TD, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{s.lastActivity || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
