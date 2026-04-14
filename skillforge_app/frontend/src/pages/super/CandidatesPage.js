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

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState(null);
  const [showResetPwd, setShowResetPwd] = useState(null); // candidateId
  const [resetPwdForm, setResetPwdForm] = useState({ password: '', confirm: '' });
  const [resetPwdError, setResetPwdError] = useState('');
  const [confirmRevoke, setConfirmRevoke] = useState(null); // candidateId
  const [confirmDelete, setConfirmDelete] = useState(null); // candidate object {id, name}
  const [tests, setTests] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', testId: '', maxAttempts: 1 });
  const [assignForm, setAssignForm] = useState({ testId: '', maxAttempts: 1 });
  const [error, setError] = useState('');
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  // Bulk import state
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkPreview, setBulkPreview] = useState([]);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState('');

  const fetchCandidates = () => {
    setLoading(true);
    api.get('/super/candidates')
      .then(r => { setCandidates(r.data.candidates || r.data); setError(''); })
      .catch(e => setError(e.response?.data?.error || 'Failed to load candidates'))
      .finally(() => setLoading(false));
  };

  const fetchTests = () => {
    api.get('/super/tests')
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
      await api.post('/super/candidates', {
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
      await api.post('/super/permissions', {
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
    return lines.map(line => {
      const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, '').trim());
      return cols.length >= 3 ? { name: cols[0], email: cols[1], password: cols[2] } : null;
    }).filter(Boolean);
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
      const { data } = await api.post('/super/candidates/bulk-import', { candidates });
      setBulkResult(data);
      fetchCandidates();
    } catch (err) {
      setBulkError(err.response?.data?.error || 'Bulk import failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const revokeAll = async (id) => {
    try {
      await api.put(`/super/candidates/${id}/revoke`);
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
      await api.put(`/super/users/${showResetPwd}/password`, { password: resetPwdForm.password });
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
      await api.delete(`/super/candidates/${confirmDelete.id}`);
      toast.success(`${confirmDelete.name} deleted permanently.`);
      setConfirmDelete(null);
      fetchCandidates();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete candidate');
      setConfirmDelete(null);
    }
  };

  if (loading && candidates.length === 0) return <div className="loading">Loading candidates...</div>;

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Candidates</h1>
          <p className="page-sub">Manage candidate accounts and test assignments</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={() => { setShowBulkImport(true); setBulkCsvText(''); setBulkPreview([]); setBulkResult(null); setBulkError(''); }}>
            📥 Bulk Import
          </button>
          <button className="btn btn-primary" onClick={() => { setForm({ name:'', email:'', password:'', testId:'', maxAttempts:1 }); setShowCreate(true); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create Candidate
          </button>
        </div>
      </div>

      {error && <div className="login-error">{error}</div>}

      <div className="table-container">
        <div className="table-toolbar">
          <div className="search-input-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              className="search-input"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="sf-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Created By</th>
              <th>Tests</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                      {(c.name || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{c.email}</div>
                    </div>
                  </div>
                </td>
                <td>{c.created_by_name || c.created_by || '-'}</td>
                <td><span className="badge badge-count">{c.permissions_count ?? c.test_count ?? 0}</span></td>
                <td>
                  <span className={`badge ${c.status === 'active' ? 'badge-active' : 'badge-revoked'}`}>
                    {c.status || 'active'}
                  </span>
                </td>
                <td>
                  <div className="btn-group">
                    <button className="btn btn-sm btn-outline" onClick={() => navigate(`/super/candidates/${c.id}`)}>View</button>
                    <button className="btn btn-sm btn-primary" onClick={() => setShowAssign(c.id)}>Assign Test</button>
                    <button className="btn btn-sm btn-outline" onClick={() => { setShowResetPwd(c.id); setResetPwdForm({ password: '', confirm: '' }); setResetPwdError(''); }}>Reset Pwd</button>
                    <button className="btn btn-sm btn-danger" onClick={() => setConfirmRevoke(c.id)}>Revoke All</button>
                    <button className="btn btn-sm btn-danger" style={{ background: 'rgba(220,38,38,0.15)', borderColor: 'rgba(220,38,38,0.4)' }} onClick={() => setConfirmDelete({ id: c.id, name: c.name })}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="5" className="table-empty">No candidates found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
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
                <input className="form-input" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="candidate@example.com" autoComplete="off" name="new-candidate-email" />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Secure password" autoComplete="new-password" name="new-candidate-password" />
              </div>
              <div className="form-group">
                <label className="form-label">Assign Test <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>(optional)</span></label>
                <CustomSelect
                  value={form.testId}
                  onChange={v => setForm({ ...form, testId: v })}
                  options={[{ value: '', label: '-- None --' }, ...tests.map(t => ({ value: t.id, label: t.name + (t.test_type === 'coding' ? ' [Coding]' : t.test_type === 'hybrid' ? ' [Hybrid]' : '') }))]}
                  placeholder="-- None --"
                  emptyMsg="No designed tests yet."
                  navigate={navigate}
                  navigateTo="/super/design-test"
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

      {showAssign && (
        <div className="modal-overlay" onClick={() => { setShowAssign(null); setAssignError(''); setAssignSuccess(''); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Assign Test</h3>
              <button className="modal-close" onClick={() => { setShowAssign(null); setAssignError(''); setAssignSuccess(''); }}>&times;</button>
            </div>
            {assignError && <div className="alert alert-error" style={{ margin: '0 0 12px', fontSize: 13 }}>{assignError}</div>}
            {assignSuccess && <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, color: '#34d399', fontSize: 13, marginBottom: 12 }}>{assignSuccess}</div>}
            <form onSubmit={assignTest}>
              <div className="form-group">
                <label className="form-label">Test</label>
                <CustomSelect
                  value={assignForm.testId}
                  onChange={v => setAssignForm({ ...assignForm, testId: v })}
                  options={tests.map(t => ({ value: t.id, label: t.name + (t.test_type === 'coding' ? ' [Coding]' : t.test_type === 'hybrid' ? ' [Hybrid]' : '') }))}
                  placeholder="-- Select Test --"
                  emptyMsg="No designed tests yet. Create one first."
                  navigate={navigate}
                  navigateTo="/super/design-test"
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
          <div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
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
          <div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🔑 Reset Password</h3>
              <button className="modal-close" onClick={() => setShowResetPwd(null)}>&times;</button>
            </div>
            {resetPwdError && <div className="login-error" style={{ margin: '0 0 12px', fontSize: 13 }}>{resetPwdError}</div>}
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

      {/* Permanent Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
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
          <div className="modal-content" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">📥 Bulk Import Candidates</h3>
              <button className="modal-close" onClick={() => setShowBulkImport(false)}>&times;</button>
            </div>
            <div style={{ marginBottom: 12, padding: '10px 14px', background: 'rgba(99,102,241,0.08)', borderRadius: 8, fontSize: 13, color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(99,102,241,0.2)' }}>
              CSV format (one per line): <code style={{ color: '#818cf8' }}>Full Name, email@example.com, Password123</code><br />
              No header row needed. Existing emails will be skipped.
            </div>
            {bulkError && <div className="login-error" style={{ margin: '0 0 12px' }}>{bulkError}</div>}
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
                    <div key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', padding: '2px 0' }}>{c.name} — {c.email}</div>
                  ))}
                  {bulkPreview.length > 10 && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>...and {bulkPreview.length - 10} more</div>}
                </div>
              </div>
            )}
            {bulkResult && (
              <div style={{ marginBottom: 12, padding: '12px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, fontSize: 13 }}>
                <div style={{ color: '#34d399', fontWeight: 700, marginBottom: 6 }}>Import Complete</div>
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>✅ Created: {bulkResult.created?.length || 0}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)' }}>⏭ Skipped: {bulkResult.skipped?.length || 0}</div>
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
