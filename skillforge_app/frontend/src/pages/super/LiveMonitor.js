import { useState, useEffect, useRef } from 'react';
import api from '../../api';

export default function LiveMonitor() {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');
  const intervalRef = useRef(null);

  const fetchLive = () => {
    api.get('/monitor/live')
      .then(r => { setSessions(r.data.sessions || r.data || []); setError(''); })
      .catch(e => setError(e.response?.data?.error || 'Failed to fetch live sessions'));
  };

  useEffect(() => {
    fetchLive();
    intervalRef.current = setInterval(fetchLive, 10000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const forceSubmit = async (session) => {
    if (!window.confirm(`Force submit for ${session.candidate_name || 'this candidate'}?`)) return;
    try {
      await api.post(`/candidate/tests/${session.test_id}/session/${session.session_id}/submit`, { force: true });
      fetchLive();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to force submit');
    }
  };

  const getTimeLeft = (s) => {
    if (!s.start_time || !s.duration) return '-';
    const end = new Date(s.start_time).getTime() + s.duration * 60000;
    const left = Math.max(0, end - Date.now());
    const mins = Math.floor(left / 60000);
    const secs = Math.floor((left % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (s) => {
    if (s.testType === 'coding') {
      const total = s.totalProblems || 1;
      return Math.round(((s.attempted || 0) / total) * 100);
    }
    const answered = s.answeredCount ?? s.answered ?? 0;
    const total = s.totalQuestions ?? s.total_questions ?? s.total ?? 1;
    return Math.round((answered / total) * 100);
  };

  const getProgressLabel = (s) => {
    if (s.testType === 'coding') {
      return `${s.solved || 0}/${s.totalProblems || 0} solved (${s.earnedPoints || 0} pts)`;
    }
    const answered = s.answeredCount ?? s.answered ?? 0;
    const total = s.totalQuestions ?? s.total_questions ?? s.total ?? 0;
    return `${answered}/${total} answered`;
  };

  const progressColor = (pct) => pct >= 70 ? '#10b981' : pct >= 40 ? '#d97706' : '#ef4444';

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Live Monitor</h1>
          <p className="page-sub">Real-time test session tracking</p>
        </div>
        <div className="live-indicator">
          <span className="live-dot"></span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', letterSpacing: '0.05em' }}>LIVE</span>
          <span className="live-count">{sessions.length}</span>
        </div>
      </div>

      {error && <div className="login-error">{error}</div>}

      {sessions.length === 0 ? (
        <div className="live-empty" style={{ textAlign: 'center', padding: 80 }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(255,255,255,0.15)', marginBottom: 20 }}>
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <div style={{ fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>No active sessions</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>Refreshing every 10 seconds...</div>
        </div>
      ) : (
        <div className="live-grid">
          {sessions.map((s, i) => {
            const pct = getProgress(s);
            const color = progressColor(pct);
            const timeLeft = getTimeLeft(s);
            return (
              <div key={s.session_id || i} className="live-card" style={{ borderTop: '3px solid #10b981' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div className="live-avatar" style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #059669, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                    {(s.candidate_name || s.name || '?')[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>{s.candidateName || s.candidate_name || s.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>{s.candidateEmail || s.email || ''}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
                  {s.testName || s.test_name}
                  {s.testType === 'coding' && <span style={{ padding: '1px 8px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 10, fontSize: 10, color: '#a78bfa' }}>Coding</span>}
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div className="live-progress-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{getProgressLabel(s)}</span>
                    <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'rgba(255,255,255,0.6)' }}>{pct}%</span>
                  </div>
                  <div className="live-progress-track" style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                    <div className="live-progress-fill" style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{timeLeft}</span>
                  </div>
                  <button className="btn btn-sm btn-danger" onClick={() => forceSubmit(s)}>Force Submit</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
