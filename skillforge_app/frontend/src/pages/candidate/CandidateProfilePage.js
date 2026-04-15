import { useState, useEffect } from 'react';
import { formatIST, formatISTDate, nowLocalIso } from '../../utils/dateUtils';
import api from '../../api';
import { useToast } from '../../context/ToastContext';

export default function CandidateProfilePage({ user }) {
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit name
  const [editName, setEditName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [nameSaving, setNameSaving] = useState(false);

  // Change password
  const [pwdForm, setPwdForm] = useState({ current: '', new: '', confirm: '' });
  const [pwdError, setPwdError] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);

  useEffect(() => {
    api.get('/candidate/profile')
      .then(r => { setProfile(r.data); setNameValue(r.data.name || ''); })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [toast]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveName = async (e) => {
    e.preventDefault();
    if (!nameValue.trim()) { toast.error('Name cannot be empty'); return; }
    setNameSaving(true);
    try {
      await api.put('/candidate/profile', { name: nameValue.trim() });
      setProfile(p => ({ ...p, name: nameValue.trim() }));
      setEditName(false);
      toast.success('Name updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update name');
    } finally { setNameSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    if (pwdForm.new.length < 6) { setPwdError('New password must be at least 6 characters.'); return; }
    if (pwdForm.new !== pwdForm.confirm) { setPwdError('Passwords do not match.'); return; }
    setPwdSaving(true);
    try {
      await api.put('/candidate/profile/password', { currentPassword: pwdForm.current, newPassword: pwdForm.new });
      setPwdForm({ current: '', new: '', confirm: '' });
      toast.success('Password changed successfully!');
    } catch (err) {
      setPwdError(err.response?.data?.error || 'Failed to change password');
    } finally { setPwdSaving(false); }
  };

  if (loading) return (
    <div style={S.center}>
      <div style={S.spin}/>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 16, fontSize: 14 }}>Loading profile...</p>
    </div>
  );

  const name = profile?.name || user?.name || 'Candidate';

  return (
    <div style={S.page}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f8fafc', margin: 0 }}>My Profile</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: '4px 0 0' }}>Manage your account settings</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 900 }}>

        {/* Profile Card */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <div style={S.avatarLg}>{name[0].toUpperCase()}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#f8fafc' }}>{name}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{profile?.email}</div>
              <span style={{ display: 'inline-block', marginTop: 6, padding: '3px 10px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 20, fontSize: 11, color: '#a78bfa', fontWeight: 600 }}>Candidate</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, marginTop: 16 }}>
            <div style={S.statRow}>
              <span style={S.statLabel}>Tests Completed</span>
              <span style={S.statVal}>{profile?.completed_tests ?? 0}</span>
            </div>
            <div style={S.statRow}>
              <span style={S.statLabel}>Avg Score</span>
              <span style={{ ...S.statVal, color: '#60a5fa' }}>{profile?.avg_score != null ? `${Math.round(profile.avg_score)}%` : '—'}</span>
            </div>
            <div style={S.statRow}>
              <span style={S.statLabel}>Best Score</span>
              <span style={{ ...S.statVal, color: '#34d399' }}>{profile?.best_score != null ? `${Math.round(profile.best_score)}%` : '—'}</span>
            </div>
            <div style={S.statRow}>
              <span style={S.statLabel}>Member Since</span>
              <span style={S.statVal}>{profile?.created_at ? formatISTDate(profile.created_at) : '—'}</span>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Edit Name */}
          <div style={S.card}>
            <h3 style={S.sectionTitle}>Display Name</h3>
            {editName ? (
              <form onSubmit={saveName} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  style={S.input}
                  value={nameValue}
                  onChange={e => setNameValue(e.target.value)}
                  placeholder="Your name"
                  autoFocus
                />
                <button type="submit" disabled={nameSaving} style={S.btnPrimary}>{nameSaving ? '...' : 'Save'}</button>
                <button type="button" onClick={() => { setEditName(false); setNameValue(profile?.name || ''); }} style={S.btnOutline}>Cancel</button>
              </form>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{name}</span>
                <button onClick={() => setEditName(true)} style={S.btnOutline}>Edit</button>
              </div>
            )}
          </div>

          {/* Change Password */}
          <div style={S.card}>
            <h3 style={S.sectionTitle}>Change Password</h3>
            {pwdError && <div style={S.error}>{pwdError}</div>}
            <form onSubmit={changePassword} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={S.label}>Current Password</label>
                <input style={S.input} type="password" required value={pwdForm.current} onChange={e => setPwdForm({ ...pwdForm, current: e.target.value })} autoComplete="current-password" placeholder="Enter current password" />
              </div>
              <div>
                <label style={S.label}>New Password</label>
                <input style={S.input} type="password" required value={pwdForm.new} onChange={e => setPwdForm({ ...pwdForm, new: e.target.value })} autoComplete="new-password" placeholder="Min. 6 characters" />
              </div>
              <div>
                <label style={S.label}>Confirm New Password</label>
                <input style={S.input} type="password" required value={pwdForm.confirm} onChange={e => setPwdForm({ ...pwdForm, confirm: e.target.value })} autoComplete="new-password" placeholder="Repeat new password" />
              </div>
              <button type="submit" disabled={pwdSaving} style={{ ...S.btnPrimary, alignSelf: 'flex-start' }}>
                {pwdSaving ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { minHeight: '100vh', background: '#030712', padding: '28px 32px 48px' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#030712', color: 'white' },
  spin: { width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  card: { background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 22px' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 16 },
  avatarLg: { width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg,#7c3aed,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, color: 'white', flexShrink: 0, boxShadow: '0 0 24px rgba(124,58,237,0.3)' },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 14px' },
  statRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  statLabel: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  statVal: { fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: "'JetBrains Mono',monospace" },
  input: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '9px 12px', color: 'white', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' },
  btnPrimary: { padding: '9px 18px', background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', border: 'none', borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  btnOutline: { padding: '9px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  error: { padding: '8px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 7, color: '#f87171', fontSize: 13, marginBottom: 12 },
};
