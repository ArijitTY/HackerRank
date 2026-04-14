import { useState, useEffect } from 'react';
import api from '../../api';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.error || 'Failed to load dashboard'));
  }, []);

  if (error) return <div className="login-error">{error}</div>;
  if (!data) return <div className="loading">Loading dashboard...</div>;

  const stats = [
    { icon: '👥', value: data.candidates ?? 0, label: 'Candidates', color: '#2563eb' },
    { icon: '📋', value: data.testsAssigned ?? data.tests ?? 0, label: 'Tests Assigned', color: '#059669' },
    { icon: '🔴', value: data.liveSessions ?? 0, label: 'Live Now', color: '#dc2626' },
    { icon: '📊', value: data.passRate != null ? data.passRate + '%' : 'N/A', label: 'Pass Rate', color: '#d97706' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="page-sub">Your candidates overview</p>
      </div>

      <div className="stats-row">
        {stats.map((s, i) => (
          <div key={i} className="stat-card" style={{ '--accent': s.color }}>
            <div className="stat-icon" style={{ color: s.color }}>{s.icon}</div>
            <div className="stat-number" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-accent-line" style={{ background: s.color }}></div>
          </div>
        ))}
      </div>

      <div className="card activity-card">
        <div className="card-header">
          <h3 className="card-title">Recent Activity</h3>
        </div>
        <div className="activity-feed">
          {(data.recentActivity || []).length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>No recent activity</p>
            </div>
          )}
          {(data.recentActivity || []).map((entry, i) => (
            <div key={i} className="activity-item">
              <div className="activity-dot"></div>
              <div className="activity-content">
                <div className="activity-text">{entry.description || entry.action || JSON.stringify(entry)}</div>
                <div className="activity-time">{new Date(entry.timestamp || entry.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
