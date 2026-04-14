import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const scoreColor = (pct) => pct >= 70 ? '#a78bfa' : pct >= 50 ? '#34d399' : pct >= 30 ? '#fbbf24' : '#f87171';
const initialOf = (s) => (s || '?').trim().charAt(0).toUpperCase();
const avatarGradient = (seed) => {
  const palette = [
    'linear-gradient(135deg,#7c3aed,#2563eb)',
    'linear-gradient(135deg,#06b6d4,#3b82f6)',
    'linear-gradient(135deg,#10b981,#06b6d4)',
    'linear-gradient(135deg,#f59e0b,#ef4444)',
    'linear-gradient(135deg,#ec4899,#8b5cf6)',
  ];
  let h = 0; for (const c of String(seed || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return palette[h % palette.length];
};

const CARD_BASE = {
  background: '#0f1420',
  border: '0.5px solid rgba(255,255,255,0.08)',
  borderRadius: 14,
  padding: '1.25rem',
};
const STAT_CARD = { ...CARD_BASE, background: '#161b2c', padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', overflow: 'hidden' };

function StatCard({ icon, color, value, label, sub, pulse }) {
  return (
    <div style={STAT_CARD}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '22', color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, position: 'relative' }}>
          {icon}
          {pulse && <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 0 0 ${color}`, animation: 'sf-pulse 1.8s infinite' }} />}
        </div>
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, fontFamily: 'ui-monospace,monospace', color: '#fff', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.45)' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{sub}</div>}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: color }} />
    </div>
  );
}

function QuickAction({ icon, color, title, subtitle, onClick }) {
  return (
    <button onClick={onClick} style={{
      ...CARD_BASE, padding: '1rem', display: 'flex', alignItems: 'center', gap: 14,
      cursor: 'pointer', textAlign: 'left', color: '#fff',
      transition: 'transform 0.15s, border-color 0.15s',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = color + '66'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'none'; }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '22', color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{subtitle}</div>
      </div>
    </button>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [onlineStatus, setOnlineStatus] = useState({});
  const [error, setError] = useState('');
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  const fetchAll = () => {
    api.get('/super/dashboard').then(r => setData(r.data)).catch(e => setError(e.response?.data?.error || 'Failed to load dashboard'));
    api.get('/super/candidates').then(r => setCandidates(r.data.candidates || r.data || [])).catch(() => {});
    api.get('/super/candidates/online-status').then(r => setOnlineStatus(r.data || {})).catch(() => {});
  };

  useEffect(() => {
    fetchAll();
    intervalRef.current = setInterval(fetchAll, 30000);
    return () => clearInterval(intervalRef.current);
  }, []);

  if (error) return <div className="login-error">{error}</div>;
  if (!data) return <div className="loading">Loading dashboard...</div>;

  const stats = [
    { icon: '🛡', color: '#a78bfa', value: data.admins || 0, label: 'Admins' },
    { icon: '👥', color: '#14b8a6', value: data.candidates || 0, label: 'Candidates' },
    { icon: '📋', color: '#3b82f6', value: data.tests || 0, label: 'Tests' },
    { icon: '●',  color: '#ef4444', value: data.liveSessions || 0, label: 'Live Now', sub: data.liveSessions > 0 ? 'candidates testing' : 'no active tests', pulse: true },
    { icon: '📊', color: '#f59e0b', value: `${data.avgPassRate || 0}%`, label: 'Pass Rate' },
  ];

  const tests = (data.testStats || []).filter(t => t.totalAttempts > 0);

  const activeSessionIds = new Set(); // could enrich later; use onlineStatus for labels
  const candidateRows = candidates.slice(0, 10).map(c => {
    const s = onlineStatus[c.id] || { status: 'offline' };
    const inTest = c.active_session || c.in_test; // if backend provides
    const label = inTest ? 'In Test' : s.status === 'online' ? 'Online' : 'Offline';
    const color = inTest ? '#3b82f6' : s.status === 'online' ? '#10b981' : '#64748b';
    return { ...c, label, color };
  });

  return (
    <div className="page-enter">
      <style>{`@keyframes sf-pulse { 0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.6); } 70% { box-shadow: 0 0 0 10px rgba(239,68,68,0); } 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); } }`}</style>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Platform overview</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <div style={CARD_BASE}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Test performance</h3>
          {tests.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No attempts yet</div>
          ) : tests.map(t => (
            <div key={t.id} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{(t.test_type || 'mcq').toUpperCase()} · {t.total_questions || t.totalAttempts} questions</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: scoreColor(t.avgScore), fontFamily: 'ui-monospace,monospace' }}>{t.avgScore}%</div>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${t.avgScore}%`, background: scoreColor(t.avgScore), transition: 'width 0.4s' }} />
              </div>
            </div>
          ))}
        </div>

        <div style={CARD_BASE}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Candidates overview</h3>
          {candidateRows.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No candidates yet</div>
          ) : candidateRows.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: avatarGradient(c.id), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: 13, flexShrink: 0 }}>{initialOf(c.name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name || c.email}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.email}</div>
              </div>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: c.color + '22', color: c.color, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color }} /> {c.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...CARD_BASE, marginTop: 16 }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Quick actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <QuickAction icon="➕" color="#a78bfa" title="Add Candidate" subtitle="Create a new candidate account" onClick={() => navigate('/super/candidates')} />
          <QuickAction icon="🧩" color="#14b8a6" title="Design Test" subtitle="Build a custom test" onClick={() => navigate('/super/design-test')} />
          <QuickAction icon="📈" color="#3b82f6" title="View Results" subtitle="Review submitted sessions" onClick={() => navigate('/super/results')} />
          <QuickAction icon="🔴" color="#f59e0b" title="Live Monitor" subtitle="Watch in-progress tests" onClick={() => navigate('/super/live')} />
        </div>
      </div>
    </div>
  );
}
