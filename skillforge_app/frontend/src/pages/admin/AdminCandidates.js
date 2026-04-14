import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useToast } from '../../context/ToastContext';

function CustomSelect({ value, onChange, options, placeholder, emptyMsg, navigate, navigateTo }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const selected = options.find(o => String(o.value) === String(value));
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, cursor: 'pointer', color: selected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)', fontSize: 14, userSelect: 'none' }}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points={open ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/></svg>
      </div>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: '#1a1f35', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, zIndex: 999, maxHeight: 240, overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          {options.length === 0 ? (
            <div style={{ padding: '12px 14px' }}>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 8 }}>{emptyMsg || 'No options available'}</div>
              {navigateTo && (
                <button onClick={() => { setOpen(false); navigate(navigateTo); }} style={{ fontSize: 12, padding: '6px 12px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                  Go to Design Test
                </button>
              )}
            </div>
          ) : options.map(o => (
            <div
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              style={{ padding: '10px 14px', cursor: 'pointer', color: String(o.value) === String(value) ? '#818cf8' : 'rgba(255,255,255,0.85)', background: String(o.value) === String(value) ? 'rgba(99,102,241,0.15)' : 'transparent', fontSize: 14, transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = String(o.value) === String(value) ? 'rgba(99,102,241,0.15)' : 'transparent'}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminCandidates() {
  const navigate = useNavigate();
  const toast = useToast();
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState(null);
  const [showResetPwd, setShowResetPwd] = useState(null);
  const [resetPwdForm, setResetPwdForm] = useState({ password: '', confirm: '' });
  const [resetPwdError, setResetPwdError] = useState('');
  const [confirmRevoke, setConfirmRevoke] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // candidate object {id, name}
  const [tests, setTests] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', testId: '', maxAttempts: 1 });
  const [assignForm, setAssignForm] = useState({ testId: '', maxAttempts: 1 });
  const [error, setError] = useState('');
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  // Per-permission management
  const [showPermissions, setShowPermissions] = useState(null); // candidate object
  const [permLoading, setPermLoading] = useState(false);

  // Bulk import state
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkPreview, setBulkPreview] = useState([]);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState('');

  const fetchCandidates = () => {
    setLoading(true);
    api.get('/admin/candidates')
      .then(r => { setCandidates(r.data.candidates || r.data); setError(''); })
      .catch(e => setError(e.response?.data?.error || 'Failed to load candidates'))
      .finally(() => setLoading(false));
  };

  const fetchTests = () => {
    api.get('/admin/tests')
      .then(r => setTests((r.data.tests || []).filter(t => t.is_custom)))
      .catch(() => {});
  };

  useEffect(() => { fetchCandidates(); fetchTests(); }, []);

  const filtered = candidates.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const createCandidate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/candidates', {
        name: form.name,
        email: form.email,
        password: form.password,
        testId: form.testId || undefined,
        maxAttempts: form.testId ? parseInt(form.maxAttempts) : undefined,
      });
      setShowCreate(false);
      setForm({ name: '', email: '', password: '', testId: '', maxAttempts: 1 });
      fetchCandidates();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create candidate');
    }
  };

  const assignTest = async (e) => {
    e.preventDefault();
    setAssignError(''); setAssignSuccess('');
    if (!assignForm.testId) { setAssignError('Please select a test first.'); return; }
    try {
      await api.post('/admin/permissions', {
        candidateId: showAssign,
        testId: assignForm.testId,
        maxAttempts: parseInt(assignForm.maxAttempts),
      });
      setAssignSuccess('Test assigned successfully!');
      setAssignForm({ testId: '', maxAttempts: 1 });
      fetchCandidates();
      setTimeout(() => { setShowAssign(null); setAssignSuccess(''); }, 1500);
    } catch (err) {
      setAssignError(err.response?.data?.error || 'Failed to assign test');
    }
  };

  const parseBulkCsv = (text) => {
    const lines = text.trim().split('\n').filter(l => l.trim());
    const parsed = [];
    for (const line of lines) {
      const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, '').trim());
      if (cols.length >= 3) {
        parsed.push({ name: cols[0], email: cols[1], password: cols[2] });
      }
    }
    return parsed;
  };

  const handleBulkCsvChange = (text) => {
    setBulkCsvText(text);
    setBulkPreview(parseBulkCsv(text));
    setBulkError('');
    setBulkResult(null);
  };

  const submitBulkImport = async () => {
    const candidates = parseBulkCsv(bulkCsvText);
    if (candidates.length === 0) { setBulkError('No valid rows found. Format: Name,Email,Password'); return; }
    setBulkLoading(true); setBulkError(''); setBulkResult(null);
    try {
      const { data } = await api.post('/admin/candidates/bulk-import', { candidates });
      setBulkResult(data);
      fetchCandidates();
    } catch (err) {
      setBulkError(err.response?.data?.error || 'Bulk import failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const openPermissions = async (c) => {
    setPermLoading(true);
    try {
      const { data } = await api.get(`/admin/candidates/${c.id}`);
      setShowPermissions({ ...c, permissions: data.permissions || [] });
    } catch { toast.error('Failed to load permissions'); }
    finally { setPermLoading(false); }
  };

  const revokePermission = async (permId) => {
    try {
      await api.put(`/admin/permissions/${permId}/revoke`);
      setShowPermissions(prev => ({ ...prev, permissions: prev.permissions.map(p => p.id === permId ? { ...p, status: 'revoked' } : p) }));
      fetchCandidates();
    } catch { toast.error('Failed to revoke permission'); }
  };

  const restorePermission = async (permId) => {
    try {
      await api.put(`/admin/permissions/${permId}/restore`);
      setShowPermissions(prev => ({ ...prev, permissions: prev.permissions.map(p => p.id === permId ? { ...p, status: 'granted' } : p) }));
      fetchCandidates();
    } catch { toast.error('Failed to restore permission'); }
  };

  const revokeAll = async (id) => {
    try {
      await api.put(`/admin/candidates/${id}/revoke`);
      fetchCandidates();
      setConfirmRevoke(null);
      toast.success('All test access revoked.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to revoke');
      setConfirmRevoke(null);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setResetPwdError('');
    if (resetPwdForm.password.length < 6) { setResetPwdError('Password must be at least 6 characters.'); return; }
    if (resetPwdForm.password !== resetPwdForm.confirm) { setResetPwdError('Passwords do not match.'); return; }
    try {
      await api.put(`/admin/candidates/${showResetPwd}/password`, { password: resetPwdForm.password });
      toast.success('Password reset successfully.');
      setShowResetPwd(null);
      setResetPwdForm({ password: '', confirm: '' });
    } catch (err) {
      setResetPwdError(err.response?.data?.error || 'Failed to reset password');
    }
  };

  const deleteCandidate = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/admin/candidates/${confirmDelete.id}`);
      toast.success(`${confirmDelete.name} deleted permanently.`);
      setConfirmDelete(null);
      fetchCandidates();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete candidate');
      setConfirmDelete(null);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const resetTest = async (id, testId) => {
    try {
      await api.put(`/admin/candidates/${id}/tests/${testId}/reset`);
      fetchCandidates();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset');
    }
  };

  if (loading && candidates.length === 0) return <div className="loading">Loading candidates...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>My Candidates</h1>
          <p className="page-sub">Manage your candidates and test assignments</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={() => { setShowBulkImport(true); setBulkCsvText(''); setBulkPreview([]); setBulkResult(null); setBulkError(''); }}>
            📥 Bulk Import
          </button>
          <button className="btn btn-primary btn-glow" onClick={() => { setForm({ name:'', email:'', password:'', testId:'', maxAttempts:1 }); setShowCreate(true); }}>
            <span style={{ marginRight: 6 }}>+</span> Create Candidate
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-container">
        <div className="table-toolbar">
          <div className="search-input-wrap">
            <span className="search-icon">&#128269;</span>
            <input
              className="form-input search-input"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="table-count">{filtered.length} candidate{filtered.length !== 1 ? 's' : ''}</div>
        </div>

        <table className="sf-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Tests</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td>
                  <div className="user-cell">
                    <div className="avatar-sm">{(c.name || '?')[0].toUpperCase()}</div>
                    <span className="user-name">{c.name}</span>
                  </div>
                </td>
                <td><span className="mono text-dim">{c.email}</span></td>
                <td>
                  <span className="badge badge-count">{c.permissions_count ?? c.test_count ?? 0}</span>
                </td>
                <td>
                  <span className={`badge ${c.status === 'active' ? 'badge-success' : c.status === 'revoked' ? 'badge-danger' : 'badge-active'}`}>
                    {c.status || 'active'}
                  </span>
                </td>
                <td>
                  <div className="btn-group">
                    <button className="btn btn-sm btn-primary" onClick={() => setShowAssign(c.id)}>Assign</button>
                    <button className="btn btn-sm btn-outline" onClick={() => openPermissions(c)} disabled={permLoading}>Permissions</button>
                    <button className="btn btn-sm btn-outline" onClick={() => { setShowResetPwd(c.id); setResetPwdForm({ password: '', confirm: '' }); setResetPwdError(''); }}>Reset Pwd</button>
                    <button className="btn btn-sm btn-danger" onClick={() => setConfirmRevoke(c.id)}>Revoke All</button>
                    <button className="btn btn-sm btn-danger" style={{ background: 'rgba(220,38,38,0.15)', borderColor: 'rgba(220,38,38,0.4)' }} onClick={() => setConfirmDelete({ id: c.id, name: c.name })}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-table-cell">
                  <div className="empty-state">
                    <span className="empty-icon">👤</span>
                    <p>No candidates found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content glass-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create Candidate</h3>
              <button className="modal-close" onClick={() => setShowCreate(false)}>&times;</button>
            </div>
            <form onSubmit={createCandidate} autoComplete="off">
              <input type="text" style={{display:'none'}} aria-hidden="true" autoComplete="username" readOnly tabIndex={-1}/>
              <input type="password" style={{display:'none'}} aria-hidden="true" autoComplete="current-password" readOnly tabIndex={-1}/>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" autoComplete="off" name="new-candidate-name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" autoComplete="off" name="new-candidate-email" />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Set a password" autoComplete="new-password" name="new-candidate-password" />
              </div>
              <div className="form-group">
                <label className="form-label">Assign Test <span className="text-dim">(optional)</span></label>
                <CustomSelect
                  value={form.testId}
                  onChange={v => setForm({ ...form, testId: v })}
                  options={[{ value: '', label: '-- None --' }, ...tests.map(t => ({ value: t.id, label: t.name + (t.test_type === 'coding' ? ' [Coding]' : t.test_type === 'hybrid' ? ' [Hybrid]' : '') }))]}
                  placeholder="-- None --"
                  emptyMsg="No designed tests yet."
                  navigate={navigate}
                  navigateTo="/admin/design-test"
                />
              </div>
              {form.testId && (
                <div className="form-group">
                  <label className="form-label">Max Attempts</label>
                  <input className="form-input" type="number" min="1" value={form.maxAttempts} onChange={e => setForm({ ...form, maxAttempts: e.target.value })} />
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Candidate</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssign && (
        <div className="modal-overlay" onClick={() => { setShowAssign(null); setAssignError(''); setAssignSuccess(''); }}>
          <div className="modal-content glass-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Assign Test</h3>
              <button className="modal-close" onClick={() => { setShowAssign(null); setAssignError(''); setAssignSuccess(''); }}>&times;</button>
            </div>
            {assignError && <div className="alert alert-error" style={{ margin: '0 0 12px', fontSize: 13 }}>{assignError}</div>}
            {assignSuccess && <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, color: '#34d399', fontSize: 13, marginBottom: 12 }}>{assignSuccess}</div>}
            <form onSubmit={assignTest} autoComplete="off">
              <div className="form-group">
                <label className="form-label">Test</label>
                <CustomSelect
                  value={assignForm.testId}
                  onChange={v => setAssignForm({ ...assignForm, testId: v })}
                  options={tests.map(t => ({ value: t.id, label: t.name + (t.test_type === 'coding' ? ' [Coding]' : t.test_type === 'hybrid' ? ' [Hybrid]' : '') }))}
                  placeholder="-- Select Test --"
                  emptyMsg="No designed tests yet. Create one first."
                  navigate={navigate}
                  navigateTo="/admin/design-test"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Max Attempts</label>
                <input className="form-input" type="number" min="1" value={assignForm.maxAttempts} onChange={e => setAssignForm({ ...assignForm, maxAttempts: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => { setShowAssign(null); setAssignError(''); setAssignSuccess(''); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Assign Test</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Revoke Modal */}
      {confirmRevoke && (
        <div className="modal-overlay" onClick={() => setConfirmRevoke(null)}>
          <div className="modal-content glass-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">⚠️ Revoke All Access</h3>
              <button className="modal-close" onClick={() => setConfirmRevoke(null)}>&times;</button>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
              This will remove all test assignments for this candidate. They will no longer be able to access any tests. This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setConfirmRevoke(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => revokeAll(confirmRevoke)}>Revoke All Access</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPwd && (
        <div className="modal-overlay" onClick={() => setShowResetPwd(null)}>
          <div className="modal-content glass-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🔑 Reset Password</h3>
              <button className="modal-close" onClick={() => setShowResetPwd(null)}>&times;</button>
            </div>
            {resetPwdError && <div className="alert alert-error" style={{ margin: '0 0 12px', fontSize: 13 }}>{resetPwdError}</div>}
            <form onSubmit={resetPassword} autoComplete="off">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" required value={resetPwdForm.password} onChange={e => setResetPwdForm({ ...resetPwdForm, password: e.target.value })} placeholder="Min. 6 characters" autoComplete="new-password" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input className="form-input" type="password" required value={resetPwdForm.confirm} onChange={e => setResetPwdForm({ ...resetPwdForm, confirm: e.target.value })} placeholder="Repeat password" autoComplete="new-password" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowResetPwd(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Reset Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissions && (
        <div className="modal-overlay" onClick={() => setShowPermissions(null)}>
          <div className="modal-content glass-modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🔐 Test Permissions — {showPermissions.name}</h3>
              <button className="modal-close" onClick={() => setShowPermissions(null)}>&times;</button>
            </div>
            {showPermissions.permissions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>No test permissions assigned yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
                {showPermissions.permissions.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{p.test_name}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                        Attempts: {p.used_attempts ?? 0}/{p.max_attempts} &nbsp;·&nbsp;
                        <span style={{ color: p.status === 'granted' ? '#34d399' : '#f87171' }}>{p.status}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {p.status === 'granted' ? (
                        <button className="btn btn-sm btn-danger" onClick={() => revokePermission(p.id)}>Revoke</button>
                      ) : (
                        <button className="btn btn-sm btn-outline" onClick={() => restorePermission(p.id)}>Restore</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-primary" onClick={() => { setShowPermissions(null); setShowAssign(showPermissions.id); }}>+ Assign New Test</button>
              <button className="btn btn-outline" onClick={() => setShowPermissions(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-content glass-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🗑️ Delete Candidate Permanently</h3>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}>&times;</button>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>
              You are about to permanently delete <strong style={{ color: '#f87171' }}>{confirmDelete.name}</strong>.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
              This will remove the candidate, all their test assignments, and all session history. <strong style={{ color: '#fca5a5' }}>This cannot be undone.</strong>
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={deleteCandidate}>Delete Permanently</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <div className="modal-overlay" onClick={() => setShowBulkImport(false)}>
          <div className="modal-content glass-modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">📥 Bulk Import Candidates</h3>
              <button className="modal-close" onClick={() => setShowBulkImport(false)}>&times;</button>
            </div>
            <div style={{ marginBottom: 12, padding: '10px 14px', background: 'rgba(99,102,241,0.08)', borderRadius: 8, fontSize: 13, color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(99,102,241,0.2)' }}>
              CSV format (one per line): <code style={{ color: '#818cf8' }}>Full Name, email@example.com, Password123</code><br />
              No header row needed. Existing emails will be skipped.
            </div>
            {bulkError && <div className="alert alert-error" style={{ margin: '0 0 12px', fontSize: 13 }}>{bulkError}</div>}
            <div className="form-group">
              <label className="form-label">Paste CSV Data</label>
              <textarea
                className="form-input"
                rows={8}
                style={{ fontFamily: 'monospace', fontSize: 13, resize: 'vertical' }}
                placeholder={"Alice Smith, alice@company.com, Pass@123\nBob Jones, bob@company.com, Pass@456"}
                value={bulkCsvText}
                onChange={e => handleBulkCsvChange(e.target.value)}
              />
            </div>
            {bulkPreview.length > 0 && !bulkResult && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{bulkPreview.length} candidate(s) ready to import:</div>
                <div style={{ maxHeight: 120, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '6px 10px' }}>
                  {bulkPreview.slice(0, 10).map((c, i) => (
                    <div key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', padding: '2px 0' }}>
                      {c.name} — {c.email}
                    </div>
                  ))}
                  {bulkPreview.length > 10 && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>...and {bulkPreview.length - 10} more</div>}
                </div>
              </div>
            )}
            {bulkResult && (
              <div style={{ marginBottom: 12, padding: '12px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, fontSize: 13 }}>
                <div style={{ color: '#34d399', fontWeight: 700, marginBottom: 6 }}>Import Complete</div>
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>✅ Created: {bulkResult.created?.length || 0}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)' }}>⏭ Skipped (existing): {bulkResult.skipped?.length || 0}</div>
                {bulkResult.errors?.length > 0 && <div style={{ color: '#f87171' }}>❌ Errors: {bulkResult.errors.length}</div>}
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowBulkImport(false)}>Close</button>
              {!bulkResult && (
                <button className="btn btn-primary" onClick={submitBulkImport} disabled={bulkLoading || bulkPreview.length === 0}>
                  {bulkLoading ? 'Importing...' : `Import ${bulkPreview.length} Candidate(s)`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
