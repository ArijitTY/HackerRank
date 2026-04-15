import { useState, useEffect } from 'react';
import { formatIST, formatISTDate, nowLocalIso } from '../../utils/dateUtils';
import api from '../../api';
import ConfirmModal from '../../components/ConfirmModal';

export default function AdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Delete admin
  const [confirmDelete, setConfirmDelete] = useState(null); // admin object {id, name}

  // Reset password
  const [showResetPwd, setShowResetPwd] = useState(null);
  const [resetPwdForm, setResetPwdForm] = useState({ password: '', confirm: '' });
  const [resetPwdError, setResetPwdError] = useState('');
  const [resetPwdLoading, setResetPwdLoading] = useState(false);

  const fetchAdmins = () => {
    setLoading(true);
    api.get('/super/admins')
      .then(r => { setAdmins(r.data.admins || r.data); setError(''); })
      .catch(e => setError(e.response?.data?.error || 'Failed to load admins'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAdmins(); }, []);

  const createAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.post('/super/admins', form);
      setShowCreate(false);
      setForm({ name: '', email: '', password: '' });
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create admin');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const action = currentStatus === 'active' ? 'revoke' : 'restore';
    try {
      await api.put(`/super/admins/${id}/${action}`);
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${action} admin`);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setResetPwdError('');
    if (resetPwdForm.password.length < 6) { setResetPwdError('Password must be at least 6 characters.'); return; }
    if (resetPwdForm.password !== resetPwdForm.confirm) { setResetPwdError('Passwords do not match.'); return; }
    setResetPwdLoading(true);
    try {
      await api.put(`/super/users/${showResetPwd}/password`, { password: resetPwdForm.password });
      setShowResetPwd(null);
      setResetPwdForm({ password: '', confirm: '' });
    } catch (err) {
      setResetPwdError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setResetPwdLoading(false);
    }
  };

  const deleteAdmin = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/super/admins/${confirmDelete.id}`);
      setConfirmDelete(null);
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete admin');
      setConfirmDelete(null);
    }
  };

  const filtered = admins.filter(a =>
    (a.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.email || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading && admins.length === 0) return <div className="loading">Loading admins...</div>;

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admins</h1>
          <p className="page-sub">Manage administrator accounts</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ name:'', email:'', password:'' }); setShowCreate(true); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Admin
        </button>
      </div>

      {error && <div className="login-error">{error}</div>}

      <div className="table-container">
        <div className="table-toolbar">
          <div className="search-input-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              className="search-input"
              placeholder="Search admins..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-scroll-wrapper" style={{ width:'100%', overflowX:'auto', display:'block' }}>
        <table className="sf-table" style={{ minWidth:'900px', whiteSpace:'nowrap' }}>
          <thead>
            <tr>
              <th>Admin</th>
              <th>Created</th>
              <th>Last Login</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                      {(a.name || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>{a.name}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{a.email}</div>
                    </div>
                  </div>
                </td>
                <td>{a.created_at ? formatISTDate(a.created_at) : '-'}</td>
                <td>{a.last_login ? formatIST(a.last_login) : 'Never'}</td>
                <td>
                  <span className={`badge ${a.status === 'active' ? 'badge-active' : 'badge-revoked'}`}>
                    {a.status || 'active'}
                  </span>
                </td>
                <td>
                  <div className="btn-group">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => { setShowResetPwd(a.id); setResetPwdForm({ password: '', confirm: '' }); setResetPwdError(''); }}
                    >
                      Reset Password
                    </button>
                    {(a.status === 'active' || !a.status) ? (
                      <button className="btn btn-sm btn-danger" onClick={() => toggleStatus(a.id, a.status || 'active')}>
                        Revoke
                      </button>
                    ) : (
                      <button className="btn btn-sm btn-success" onClick={() => toggleStatus(a.id, a.status)}>
                        Restore
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-danger"
                      style={{ background: 'rgba(220,38,38,0.15)', borderColor: 'rgba(220,38,38,0.4)' }}
                      onClick={() => setConfirmDelete({ id: a.id, name: a.name, email: a.email })}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="5" className="table-empty">No admins found</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Permanent Delete Confirmation Modal */}
      <ConfirmModal
        open={!!confirmDelete}
        title="Delete Admin"
        message="Are you sure you want to delete this admin? This will also delete all candidates created by this admin along with their test history. This action cannot be undone."
        itemName={confirmDelete ? `${confirmDelete.name} · ${confirmDelete.email || ''}` : ''}
        confirmText="Yes, Delete Admin"
        confirmColor="#E24B4A"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={deleteAdmin}
      />

      {/* Reset Password Modal */}
      {showResetPwd && (
        <div className="modal-overlay" onClick={() => setShowResetPwd(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Reset Admin Password</h3>
              <button className="modal-close" onClick={() => setShowResetPwd(null)}>&times;</button>
            </div>
            <form onSubmit={resetPassword} autoComplete="off" style={{ display: 'contents' }}>
              <div className="modal-body">
              {resetPwdError && <div className="login-error" style={{ margin: '0 0 16px' }}>{resetPwdError}</div>}
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  className="form-input"
                  type="password"
                  required
                  value={resetPwdForm.password}
                  onChange={e => setResetPwdForm({ ...resetPwdForm, password: e.target.value })}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  className="form-input"
                  type="password"
                  required
                  value={resetPwdForm.confirm}
                  onChange={e => setResetPwdForm({ ...resetPwdForm, confirm: e.target.value })}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
              </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowResetPwd(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={resetPwdLoading}>
                  {resetPwdLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create Admin</h3>
              <button className="modal-close" onClick={() => setShowCreate(false)}>&times;</button>
            </div>
            <form onSubmit={createAdmin} autoComplete="off" style={{ display: 'contents' }}>
              <div className="modal-body">
              <input type="text" style={{display:'none'}} aria-hidden="true" autoComplete="username" readOnly tabIndex={-1}/>
              <input type="password" style={{display:'none'}} aria-hidden="true" autoComplete="current-password" readOnly tabIndex={-1}/>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" autoComplete="off" name="new-admin-name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="admin@example.com" autoComplete="off" name="new-admin-email" />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Secure password" autoComplete="new-password" name="new-admin-password" />
              </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
