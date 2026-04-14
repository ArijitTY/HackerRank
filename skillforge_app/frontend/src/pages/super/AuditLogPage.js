import { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import { formatIST } from '../../utils/dateUtils';

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
const formatAction = (action) => (action || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const getActionBadgeColor = (action) => {
  const a = action || '';
  if (/login|logout/.test(a))                          return { bg: '#EAF3DE', color: '#3B6D11' };
  if (/grant|assign|restore/.test(a))                  return { bg: '#E6F1FB', color: '#185FA5' };
  if (/revoke|delete|remove|auto_submit|failed/.test(a)) return { bg: '#FCEBEB', color: '#A32D2D' };
  if (/create|update|edit|reset/.test(a))              return { bg: '#FAEEDA', color: '#854F0B' };
  if (/bulk|import/.test(a))                           return { bg: '#EEEDFE', color: '#534AB7' };
  return { bg: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' };
};

function ActionBadge({ action }) {
  const c = getActionBadgeColor(action);
  return (
    <span style={{ display: 'inline-block', padding: '3px 12px', background: c.bg, color: c.color, borderRadius: 99, fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}>
      {formatAction(action)}
    </span>
  );
}

const ROLE_LABEL = { super_admin: 'Super Admin', admin: 'Admin', candidate: 'Candidate' };

export default function AuditLogPage({ apiPrefix = '/super' }) {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterAction, setFilterAction] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const limit = 50;

  const fetchLogs = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit,
      ...(filterAction && { action: filterAction }),
      ...(filterCategory && { category: filterCategory }),
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
      ...(search && { search }) });
    api.get(`${apiPrefix}/audit-log?${params}`)
      .then(r => { setLogs(r.data.logs || []); setTotal(r.data.total || 0); })
      .catch(e => setError(e.response?.data?.error || 'Failed to load audit log'))
      .finally(() => setLoading(false));
  }, [page, filterAction, filterCategory, dateFrom, dateTo, search]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.ceil(total / limit);

  const ACTION_OPTIONS = [
    'login','logout','login_failed',
    'grant_permission','assign_test','revoke_permission','restore_permission','bulk_grant_permissions','reset_attempts','analysis_only',
    'create_candidate','delete_candidate','bulk_import_candidates','reset_password',
    'create_test','edit_test','update_test','delete_test','start_test','submit_test','auto_submit',
    'create_interview_test','assign_interview','evaluate_interview','approve_interview',
  ];

  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 };

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
        <div className="table-toolbar" style={{ flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          <div>
            <label style={labelStyle}>Search by name, email or action details</label>
            <div className="search-input-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input className="search-input" placeholder="Search by actor name, email or details..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ width: 260 }} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Filter by category</label>
            <select className="form-select" value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1); }}>
              <option value="">All Categories</option>
              <option value="login">Login &amp; Auth</option>
              <option value="permission">Permission Management</option>
              <option value="candidate">Candidate Management</option>
              <option value="test">Test Management</option>
              <option value="interview">Interview Management</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Filter by action</label>
            <select className="form-select" value={filterAction} onChange={e => { setFilterAction(e.target.value); setPage(1); }}>
              <option value="">All Actions</option>
              {ACTION_OPTIONS.map(a => <option key={a} value={a}>{formatAction(a)}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>From date</label>
            <input type="date" className="form-input" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} style={{ width: 150 }} />
          </div>
          <div>
            <label style={labelStyle}>To date</label>
            <input type="date" className="form-input" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} style={{ width: 150 }} />
          </div>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginLeft: 'auto', alignSelf: 'center' }}>
            Page {page} of {totalPages || 1} · {total} entries
          </span>
        </div>

        <div className="leaderboard-scroll-wrapper table-scroll-wrapper" style={{ width:'100%', overflowX:'auto', display:'block' }}>
        <table className="sf-table" style={{ minWidth: '900px', width: '100%', borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
          <thead>
            <tr>
              <th style={{ whiteSpace: 'nowrap' }}>Timestamp</th>
              <th style={{ whiteSpace: 'nowrap' }}>Actor</th>
              <th style={{ whiteSpace: 'nowrap' }}>Action</th>
              <th>Details</th>
              <th style={{ whiteSpace: 'nowrap' }}>IP</th>
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
                <td style={{ whiteSpace: 'nowrap' }}>
                  <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'rgba(255,255,255,0.6)' }}>
                    {log.timestamp_ist || formatIST(log.timestamp) || '—'}
                  </div>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                      {(log.actor_name || log.actor_email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>{log.actor_name || '—'}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>{log.actor_email}</div>
                      {log.actor_role && <div style={{ fontSize: 10, color: '#a78bfa', marginTop: 2, fontWeight: 600 }}>{ROLE_LABEL[log.actor_role] || log.actor_role}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}><ActionBadge action={log.action} /></td>
                <td style={{ whiteSpace: 'normal', minWidth: 250, maxWidth: 400, wordBreak: 'break-word' }}>
                  {(() => {
                    const d = log.details;
                    const raw = d && typeof d === 'object' ? Object.entries(d).map(([k,v]) => `${k}: ${v}`).join(' · ') : (d || '');
                    const primary = log.message || raw || '—';
                    return <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }} title={raw || primary}>{primary}</span>;
                  })()}
                </td>
                <td style={{ whiteSpace: 'nowrap' }}><span style={{ fontSize: 12, fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)' }}>{log.ip_address || '—'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

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
