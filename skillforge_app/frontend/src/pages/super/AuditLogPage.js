import { useState, useEffect, useCallback } from 'react';
import api from '../../api';

const ACTION_COLORS = {
  login:          { bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)',  text: '#60a5fa',  icon: '🔐' },
  logout:         { bg: 'rgba(100,116,139,0.1)',  border: 'rgba(100,116,139,0.2)', text: '#94a3b8',  icon: '🚪' },
  create_user:    { bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.25)', text: '#34d399',  icon: '👤' },
  assign_test:    { bg: 'rgba(139,92,246,0.1)',   border: 'rgba(139,92,246,0.25)', text: '#a78bfa',  icon: '📋' },
  revoke_test:    { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)',  text: '#f87171',  icon: '🚫' },
  submit_test:    { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)', text: '#fbbf24',  icon: '✅' },
  start_test:     { bg: 'rgba(6,182,212,0.08)',   border: 'rgba(6,182,212,0.25)',  text: '#22d3ee',  icon: '▶️' },
  bulk_import:    { bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)',  text: '#6ee7b7',  icon: '📥' },
  reset_password: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', text: '#fcd34d',  icon: '🔑' },
};
const DEFAULT_ACTION = { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)', text: 'rgba(255,255,255,0.6)', icon: '📌' };

function ActionBadge({ action }) {
  const cfg = ACTION_COLORS[action] || DEFAULT_ACTION;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 20, fontSize: 12, color: cfg.text, fontWeight: 600 }}>
      <span>{cfg.icon}</span>{action?.replace(/_/g, ' ')}
    </span>
  );
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterAction, setFilterAction] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const limit = 50;

  const fetchLogs = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit, ...(filterAction && { action: filterAction }), ...(search && { search }) });
    api.get(`/super/audit-log?${params}`)
      .then(r => { setLogs(r.data.logs || []); setTotal(r.data.total || 0); })
      .catch(e => setError(e.response?.data?.error || 'Failed to load audit log'))
      .finally(() => setLoading(false));
  }, [page, filterAction, search]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.ceil(total / limit);

  const ACTION_OPTIONS = [
    'login','logout','create_user','assign_test','revoke_test',
    'submit_test','start_test','bulk_import','reset_password',
  ];

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Log</h1>
          <p className="page-sub">Track all system actions and events — {total} total entries</p>
        </div>
        <button className="btn btn-outline" onClick={fetchLogs}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Refresh
        </button>
      </div>

      {error && <div className="login-error">{error}</div>}

      <div className="table-container">
        <div className="table-toolbar" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div className="search-input-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="search-input" placeholder="Search actor or details..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ width: 220 }} />
          </div>
          <select className="form-select" value={filterAction} onChange={e => { setFilterAction(e.target.value); setPage(1); }}>
            <option value="">All Actions</option>
            {ACTION_OPTIONS.map(a => <option key={a} value={a}>{a.replace(/_/g,' ')}</option>)}
          </select>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginLeft: 'auto' }}>
            Page {page} of {totalPages || 1} · {total} entries
          </span>
        </div>

        <table className="sf-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Details</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="table-empty">
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>No audit log entries found</div>
                  </div>
                </td>
              </tr>
            ) : logs.map((log, i) => (
              <tr key={log.id || i}>
                <td>
                  <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'rgba(255,255,255,0.6)' }}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit' }) : '—'}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                      {(log.actor_name || log.actor_email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>{log.actor_name || '—'}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>{log.actor_email}</div>
                    </div>
                  </div>
                </td>
                <td><ActionBadge action={log.action} /></td>
                <td>
                  {(() => {
                    const d = log.details;
                    const str = d && typeof d === 'object' ? Object.entries(d).map(([k,v]) => `${k}: ${v}`).join(' · ') : (d || '—');
                    return <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', maxWidth: 300, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={str}>{str}</span>;
                  })()}
                </td>
                <td><span style={{ fontSize: 12, fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)' }}>{log.ip_address || '—'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button className="btn btn-sm btn-outline" disabled={page <= 1} onClick={() => setPage(1)}>«</button>
            <button className="btn btn-sm btn-outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const pg = start + i;
              return (
                <button key={pg} className={`btn btn-sm ${pg === page ? 'btn-primary' : 'btn-outline'}`} onClick={() => setPage(pg)}>{pg}</button>
              );
            })}
            <button className="btn btn-sm btn-outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next ›</button>
            <button className="btn btn-sm btn-outline" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>»</button>
          </div>
        )}
      </div>
    </div>
  );
}
