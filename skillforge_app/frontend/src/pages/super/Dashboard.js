import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef(null);

  const fetchData = () => {
    api.get('/super/dashboard')
      .then(r => { setData(r.data); setLastRefresh(new Date()); })
      .catch(e => setError(e.response?.data?.error || 'Failed to load dashboard'));
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchData, 30000); // 30s auto-refresh
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh]);

  if (error) return <div className="login-error">{error}</div>;
  if (!data) return <div className="loading">Loading dashboard...</div>;

  const stats = [
    { icon: '\u{1F6E1}', label: 'Admins', value: data.admins || 0, color: '#7c3aed' },
    { icon: '\u{1F465}', label: 'Candidates', value: data.candidates || 0, color: '#2563eb' },
    { icon: '\u{1F4CB}', label: 'Tests', value: data.tests || 0, color: '#059669' },
    { icon: '\u{1F534}', label: 'Live Now', value: data.liveSessions || 0, color: '#dc2626', sub: data.liveSessions > 0 ? 'candidates testing' : 'no active tests' },
    { icon: '\u{1F4CA}', label: 'Pass Rate', value: `${data.avgPassRate || 0}%`, color: '#d97706' },
  ];

  const formatActivity = (entry) => {
    const time = new Date(entry.timestamp || entry.created_at).toLocaleString();
    return { text: entry.description || entry.action || JSON.stringify(entry), time };
  };

  const chartData = (data.testStats || []).map(t => ({
    name: t.name?.substring(0, 12),
    attempts: t.attempts || 0,
    avgScore: t.avgScore || 0,
  }));

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Platform overview{lastRefresh ? ` · Updated ${lastRefresh.toLocaleTimeString()}` : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn btn-sm btn-outline" onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Refresh
          </button>
          <button onClick={() => setAutoRefresh(a => !a)} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${autoRefresh ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'}`, background: autoRefresh ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)', color: autoRefresh ? '#34d399' : 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {autoRefresh ? '⏱ Auto: ON' : '⏱ Auto: OFF'}
          </button>
        </div>
      </div>

      <div className="stats-row">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: `${s.color}18`, color: s.color, width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              {s.icon}
            </div>
            <div className="stat-number" style={{ fontSize: 28, fontFamily: 'monospace', fontWeight: 700 }}>{s.value}</div>
            <div className="stat-label" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            <div className="stat-accent-line" style={{ background: s.color }}></div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '65% 35%', gap: 24, marginTop: 24 }}>
        <div className="test-card card-enter">
          <div style={{ padding: 20 }}>
            <h3 style={{ margin: '0 0 16px', color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: 600 }}>Test Performance</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
                <Tooltip
                  contentStyle={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                <Bar dataKey="attempts" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgScore" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="activity-feed">
          <div className="activity-header">
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Recent Activity</h3>
          </div>
          {(data.recentActivity || []).length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No recent activity</div>
          )}
          {(data.recentActivity || []).map((entry, i) => {
            const { text, time } = formatActivity(entry);
            const initial = (entry.name || entry.user || text || '?')[0].toUpperCase();
            return (
              <div key={i} className="activity-item">
                <div className="activity-avatar" style={{ background: `linear-gradient(135deg, #7c3aed, #2563eb)`, width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                  {initial}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="activity-text">{text}</div>
                  <div className="activity-time">{time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
