import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { fetchSessions } from '../../utils/sessions';
import { fetchTestsForDropdown } from '../../utils/testDropdown';
import { formatDate, formatDateTime } from '../../utils/dateUtils';
import ConfirmModal from '../../components/ConfirmModal';

const PURPLE = '#7c3aed';
const PURPLE_LIGHT = '#a78bfa';

const StatusBadge = ({ status }) => {
  const common = { padding: '3px 12px', borderRadius: 99, fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 };
  if (status === 'upcoming') {
    return <span style={{ ...common, background: 'rgba(24,95,165,0.15)', color: '#378ADD', border: '1px solid rgba(24,95,165,0.3)' }}>Upcoming</span>;
  }
  if (status === 'active') {
    return (
      <span style={{ ...common, background: 'rgba(29,158,117,0.15)', color: '#1D9E75', border: '1px solid rgba(29,158,117,0.3)' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1D9E75', animation: 'onlineStatusPulse 2s infinite' }} />
        Active
      </span>
    );
  }
  if (status === 'expired' || status === 'cancelled') {
    return <span style={{ ...common, background: 'rgba(226,75,74,0.15)', color: '#E24B4A', border: '1px solid rgba(226,75,74,0.3)' }}>{status === 'cancelled' ? 'Cancelled' : 'Expired'}</span>;
  }
  return <span style={{ ...common, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>Completed</span>;
};

function buildSessionCodePreview(batchCode, dateFrom) {
  if (!batchCode || !dateFrom) return '';
  const d = new Date(dateFrom);
  if (isNaN(d)) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `SES-${batchCode}-${pad(d.getDate())}${pad(d.getMonth() + 1)}${d.getFullYear()}`;
}

export default function SessionsPanel({ apiPrefix = '/super', resultsPath = '/super/results', onActiveSessionsChange }) {
  const [sessions, setSessions] = useState([]);
  const [batches, setBatches] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirm, setConfirm] = useState(null); // { type, item, onConfirm }
  const [showCompleted, setShowCompleted] = useState(false);
  const navigate = useNavigate();

  // create form
  const [form, setForm] = useState({ name: '', batchId: '', testId: '', dateFrom: '', dateTo: '', tunnelType: 'lan', notes: '' });

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchSessions(apiPrefix);
    setSessions(data);
    setLoading(false);
    if (onActiveSessionsChange) onActiveSessionsChange(data.filter((s) => s.status === 'active'));
  }, [apiPrefix, onActiveSessionsChange]);

  useEffect(() => {
    load();
    api.get(`${apiPrefix}/batches`).then((r) => setBatches(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    const role = apiPrefix === '/super' ? 'super_admin' : 'admin';
    fetchTestsForDropdown(role).then((g) => {
      const flat = [...(g?.regular || []), ...(g?.interviewPrep || [])];
      setTests(flat);
    });
  }, [apiPrefix, load]);

  useEffect(() => {
    const id = setInterval(() => { load(); }, 120000);
    return () => clearInterval(id);
  }, [load]);

  const selectedBatch = useMemo(() => batches.find((b) => String(b.id) === String(form.batchId)), [batches, form.batchId]);
  const preview = useMemo(() => buildSessionCodePreview(selectedBatch?.code, form.dateFrom), [selectedBatch, form.dateFrom]);

  const handleSubmit = async () => {
    setError('');
    if (!form.name || !form.batchId || !form.testId || !form.dateFrom || !form.dateTo) {
      setError('All fields except notes are required');
      return;
    }
    if (new Date(form.dateTo) < new Date(form.dateFrom)) {
      setError('End date must be after start date');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post(`${apiPrefix}/sessions`, form);
      if (form.tunnelType === 'ngrok' && data?.id) {
        try { await api.post('/tunnel/ngrok/start', { sessionId: data.id }); } catch (e) { /* non-fatal */ }
      }
      setShowCreate(false);
      setForm({ name: '', batchId: '', testId: '', dateFrom: '', dateTo: '', tunnelType: 'lan', notes: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create session');
    } finally {
      setSubmitting(false);
    }
  };

  const doComplete = async (s) => {
    setBusyId(s.id);
    try {
      await api.put(`${apiPrefix}/sessions/${s.id}`, { status: 'completed' });
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to complete session');
    } finally {
      setBusyId(null);
      setConfirm(null);
    }
  };

  const doDelete = async (s) => {
    setBusyId(s.id);
    try {
      await api.delete(`${apiPrefix}/sessions/${s.id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete session');
    } finally {
      setBusyId(null);
      setConfirm(null);
    }
  };

  const handleComplete = (s) => setConfirm({
    type: 'complete', item: s, onConfirm: () => doComplete(s),
  });
  const handleDelete = (s) => setConfirm({
    type: 'delete', item: s, onConfirm: () => doDelete(s),
  });

  const viewResults = (s) => {
    navigate(`${resultsPath}?sessionId=${encodeURIComponent(s.id)}`);
  };

  const TD = { padding: '12px 14px', verticalAlign: 'middle', borderBottom: '0.5px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap' };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>Drive Sessions</h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Schedule assessment drives for a batch and track results</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {sessions.some(s => s.status === 'completed' || s.status === 'expired' || s.status === 'cancelled') && (
            <button
              onClick={() => setShowCompleted(v => !v)}
              style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                border: showCompleted ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.12)',
                background: showCompleted ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
                color: showCompleted ? '#a78bfa' : 'rgba(255,255,255,0.5)',
              }}
            >
              {showCompleted ? '🙈 Hide Completed' : '👁 Show Completed'}
            </button>
          )}
          <button className="btn btn-sm btn-outline" onClick={load} title="Refresh sessions">↻ Refresh</button>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)} style={{ background: PURPLE }}>
            + Create Session
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--surface, #0f1420)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="sf-table" style={{ width: '100%', minWidth: 1100, whiteSpace: 'nowrap' }}>
            <thead>
              <tr>
                <th>SESSION CODE</th>
                <th>SESSION NAME</th>
                <th>BATCH</th>
                <th>TEST</th>
                <th>DATE WINDOW</th>
                <th>TUNNEL</th>
                <th>STATUS</th>
                <th>CANDIDATES</th>
                <th>APPEARED</th>
                <th>PASS / FAIL</th>
                <th>AVG SCORE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan="12" style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.4)' }}>Loading sessions...</td></tr>}
              {!loading && sessions.filter(s => showCompleted || (s.status !== 'completed' && s.status !== 'expired' && s.status !== 'cancelled')).length === 0 && (
                <tr><td colSpan="12" style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.4)' }}>
                  {sessions.length === 0 ? 'No sessions yet. Click "Create Session" to schedule your first drive.'
                    : 'No active sessions. Click "Show Completed" to view past sessions.'}
                </td></tr>
              )}
              {!loading && [...sessions]
              .filter(s => showCompleted || (s.status !== 'completed' && s.status !== 'expired' && s.status !== 'cancelled'))
              .sort((a, b) => {
                const rank = (st) => st === 'active' ? 0 : st === 'upcoming' ? 1 : 2;
                return rank(a.status) - rank(b.status);
              }).map((s) => {
                const isCompleted = s.status === 'completed' || s.status === 'expired' || s.status === 'cancelled';
                const truncTest = s.testName && s.testName.length > 20 ? s.testName.slice(0, 20) + '…' : s.testName;
                const noSubs = (s.passed || 0) + (s.failed || 0) === 0;
                const avgColor = s.avgScore == null ? 'rgba(255,255,255,0.4)' : s.avgScore >= 60 ? '#1D9E75' : '#E24B4A';
                return (
                <tr key={s.id} style={isCompleted ? { opacity: 0.6 } : {}}>
                  <td style={{ ...TD }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: PURPLE_LIGHT, background: 'rgba(124,58,237,0.15)', padding: '3px 8px', borderRadius: 6 }}>{s.sessionCode}</span>
                  </td>
                  <td style={{ ...TD, fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>{s.name}</td>
                  <td style={{ ...TD }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600, color: PURPLE_LIGHT, background: 'rgba(124,58,237,0.12)', padding: '2px 8px', borderRadius: 6 }}>{s.batchCode}</span>
                  </td>
                  <td style={{ ...TD, fontSize: 12, color: 'rgba(255,255,255,0.7)' }} title={s.testName}>{truncTest}</td>
                  <td style={{ ...TD, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{formatDate(s.dateFrom)} → {formatDate(s.dateTo)}</td>
                  <td style={{ ...TD, fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>{s.tunnelType}</td>
                  <td style={TD}><StatusBadge status={s.status} /></td>
                  <td style={{ ...TD, fontFamily: 'monospace', fontSize: 13 }}>{s.totalCandidates}</td>
                  <td style={{ ...TD, fontFamily: 'monospace', fontSize: 13 }}>{s.appeared}</td>
                  <td style={{ ...TD, fontFamily: 'monospace', fontSize: 13 }}>
                    {noSubs ? (
                      <span style={{ color: 'rgba(255,255,255,0.3)' }}>-</span>
                    ) : (
                      <span>
                        <span style={{ color: '#1D9E75', fontWeight: 500 }}>{s.passed}</span>
                        <span style={{ color: 'rgba(255,255,255,0.3)' }}> / </span>
                        <span style={{ color: '#E24B4A', fontWeight: 500 }}>{s.failed}</span>
                      </span>
                    )}
                  </td>
                  <td style={{ ...TD, fontFamily: 'monospace', fontSize: 13, color: avgColor, fontWeight: 500 }}>
                    {s.avgScore != null ? `${Number(s.avgScore).toFixed(1)}%` : '-'}
                  </td>
                  <td style={TD}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm btn-outline" onClick={() => viewResults(s)} title="View Results">Results</button>
                      {s.status === 'active' && (
                        <button className="btn btn-sm btn-outline" disabled={busyId === s.id} onClick={() => handleComplete(s)} title="Complete">Complete</button>
                      )}
                      {s.status === 'upcoming' && (
                        <button className="btn btn-sm btn-outline" disabled={busyId === s.id} onClick={() => handleDelete(s)} title="Delete" style={{ borderColor: 'rgba(248,113,113,0.5)', color: '#f87171' }}>Delete</button>
                      )}
                      {s.status === 'active' && (
                        <button className="btn btn-sm btn-outline" disabled={busyId === s.id} onClick={() => handleDelete(s)} title="Delete" style={{ borderColor: 'rgba(248,113,113,0.5)', color: '#f87171' }}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => !submitting && setShowCreate(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h3 className="modal-title">Create Drive Session</h3>
              <button className="modal-close" onClick={() => !submitting && setShowCreate(false)}>&times;</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {error && <div className="login-error">{error}</div>}

              <Field label="Session Name">
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Oct Hiring Drive - Python Round 1" style={inputStyle} />
              </Field>

              <Field label="Batch">
                <select value={form.batchId} onChange={(e) => setForm({ ...form, batchId: e.target.value })} style={inputStyle}>
                  <option value="">Select a batch</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>{b.code} — {b.name} ({b.candidateCount || 0} candidates)</option>
                  ))}
                </select>
                {selectedBatch && (
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                    {selectedBatch.candidateCount || 0} candidate(s) will be auto-enrolled
                  </div>
                )}
              </Field>

              <Field label="Test">
                <select value={form.testId} onChange={(e) => setForm({ ...form, testId: e.target.value })} style={inputStyle}>
                  <option value="">Select a test</option>
                  {tests.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Date From">
                  <input type="datetime-local" value={form.dateFrom} onChange={(e) => setForm({ ...form, dateFrom: e.target.value })} style={inputStyle} />
                </Field>
                <Field label="Date To">
                  <input type="datetime-local" value={form.dateTo} onChange={(e) => setForm({ ...form, dateTo: e.target.value })} style={inputStyle} />
                </Field>
              </div>

              <Field label="Tunnel Type">
                <div style={{ display: 'flex', gap: 16 }}>
                  <label style={radioLabel}>
                    <input type="radio" value="lan" checked={form.tunnelType === 'lan'} onChange={() => setForm({ ...form, tunnelType: 'lan' })} /> LAN
                  </label>
                  <label style={radioLabel}>
                    <input type="radio" value="ngrok" checked={form.tunnelType === 'ngrok'} onChange={() => setForm({ ...form, tunnelType: 'ngrok' })} /> Ngrok
                  </label>
                </div>
              </Field>

              <Field label="Notes (optional)">
                <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any internal notes..." style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} />
              </Field>

              {preview && (
                <div style={{ padding: '10px 14px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', marginBottom: 4 }}>Session Code Preview</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 14, color: PURPLE_LIGHT, fontWeight: 700 }}>{preview}</div>
                </div>
              )}
            </div>
            <div className="modal-actions" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" disabled={submitting} onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={submitting} onClick={handleSubmit} style={{ background: PURPLE }}>
                {submitting ? 'Creating...' : 'Create Session'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirm}
        title={confirm?.type === 'complete' ? 'Complete Session' : 'Delete Session'}
        message={confirm?.type === 'complete'
          ? 'Mark this session as completed? This will lock all assigned permissions.'
          : 'Are you sure you want to delete this session? This action cannot be undone.'}
        itemName={confirm?.item ? `${confirm.item.sessionCode} · ${confirm.item.name || ''}` : ''}
        confirmText={confirm?.type === 'complete' ? 'Yes, Complete Session' : 'Yes, Delete Session'}
        confirmColor={confirm?.type === 'complete' ? '#BA7517' : '#E24B4A'}
        loading={busyId != null}
        onCancel={() => setConfirm(null)}
        onConfirm={() => confirm?.onConfirm && confirm.onConfirm()}
      />
    </div>
  );
}

const inputStyle = {
  width: '100%',
  height: 42,
  padding: '8px 12px',
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: 'rgba(255,255,255,0.9)',
  fontSize: 13,
  boxSizing: 'border-box',
};

const radioLabel = { display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.85)', fontSize: 13, cursor: 'pointer' };

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}
