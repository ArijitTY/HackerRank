import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import api from '../../api';
import { useToast } from '../../context/ToastContext';
import CandidatePerformance from '../../components/CandidatePerformance';
import ConfirmModal from '../../components/ConfirmModal';
import DuplicateWarningModal from '../../components/DuplicateWarningModal';
import OnlineStatusBadge from '../../components/OnlineStatusBadge';
import { EmailField, PasswordField, validateEmail } from '../../components/CandidateFormFields';

// Convert parsed rows (array of arrays or array of objects) to "Name,Email,Password" CSV text.
function rowsToCsvText(rows) {
  if (!rows || rows.length === 0) return '';
  const isObj = !Array.isArray(rows[0]);
  const pickField = (row, candidates) => {
    for (const k of candidates) {
      const found = Object.keys(row).find(rk => rk.toLowerCase().trim() === k);
      if (found && row[found] != null && String(row[found]).trim() !== '') return String(row[found]).trim();
    }
    return '';
  };
  return rows.map(r => {
    if (isObj) {
      const batchCode = pickField(r, ['batchcode','batch code','batch_code','batch']);
      const name = pickField(r, ['name','full name','fullname','candidate']);
      const email = pickField(r, ['email','email address','e-mail']);
      const password = pickField(r, ['password','pass','pwd']);
      return `${batchCode},${name},${email},${password}`;
    }
    const cells = r.map(c => String(c == null ? '' : c).trim());
    // If 4+ cols assume BatchCode,Name,Email,Password; else 3-col legacy
    if (cells.length >= 4) return cells.slice(0, 4).join(',');
    return ',' + cells.slice(0, 3).join(',');
  }).filter(line => line.replace(/,/g,'').trim()).join('\n');
}

async function parseUploadedFile(file) {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (ext === 'xlsx' || ext === 'xls') {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }).filter(r => r.some(c => String(c).trim()));
    if (rows.length === 0) return '';
    const header = rows[0].map(c => String(c).toLowerCase().trim());
    const hasHeader = header.some(h => h === 'name' || h === 'email' || h === 'password' || h === 'full name' || h === 'batchcode' || h === 'batch code');
    return rowsToCsvText(hasHeader ? rows.slice(1) : rows);
  }
  // CSV / TSV
  const text = await file.text();
  return new Promise((resolve) => {
    Papa.parse(text, {
      skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data;
        if (rows.length === 0) return resolve('');
        const header = (rows[0] || []).map(c => String(c).toLowerCase().trim());
        const hasHeader = header.some(h => h === 'name' || h === 'email' || h === 'password' || h === 'full name' || h === 'batchcode' || h === 'batch code');
        resolve(rowsToCsvText(hasHeader ? rows.slice(1) : rows));
      },
    });
  });
}

function downloadTemplateCsv() {
  const csv = 'BatchCode,Name,Email,Password\nQ1-2026-PY,Alice Smith,alice@company.com,Pass@123\nQ1-2026-PY,Bob Jones,bob@company.com,Pass@456\n,Charlie No-Batch,charlie@company.com,Pass@789\n';
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'candidates_template.csv'; document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

const batchBadgeStyle = {
  display: 'inline-block', padding: '2px 8px', borderRadius: 5,
  background: 'rgba(124,58,237,0.18)', color: '#a78bfa',
  fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
};

function BulkImportSummary({ result }) {
  const [showSkipped, setShowSkipped] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const created = result.created?.length || 0;
  const skipped = result.skipped || [];
  const errors  = result.errors || [];
  return (
    <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, fontSize: 13, color: '#34d399', fontWeight: 600 }}>
        ✅ {created} imported successfully
      </div>
      {skipped.length > 0 && (
        <div style={{ padding: '10px 14px', background: 'rgba(186,117,23,0.08)', border: '1px solid rgba(186,117,23,0.35)', borderRadius: 8, fontSize: 13 }}>
          <div onClick={() => setShowSkipped(s => !s)} style={{ cursor: 'pointer', color: '#F0B429', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠ {skipped.length} skipped — already exist</span>
            <span style={{ fontSize: 11 }}>{showSkipped ? '▲ Hide' : '▼ Show'}</span>
          </div>
          {showSkipped && (
            <div style={{ maxHeight: 140, overflowY: 'auto', marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
              {skipped.map((s, i) => (
                <div key={i} style={{ padding: '2px 0', fontFamily: 'monospace' }}>
                  Row {s.row || '?'}: {s.email}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {errors.length > 0 && (
        <div style={{ padding: '10px 14px', background: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.35)', borderRadius: 8, fontSize: 13 }}>
          <div onClick={() => setShowErrors(s => !s)} style={{ cursor: 'pointer', color: '#f87171', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>✗ {errors.length} failed</span>
            <span style={{ fontSize: 11 }}>{showErrors ? '▲ Hide' : '▼ Show'}</span>
          </div>
          {showErrors && (
            <div style={{ maxHeight: 160, overflowY: 'auto', marginTop: 8, fontSize: 12, color: '#fca5a5' }}>
              {errors.map((e, i) => (
                <div key={i} style={{ padding: '2px 0', fontFamily: 'monospace' }}>
                  row {e.row || '?'}: {e.reason}{e.email ? ` (${e.email})` : ''}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
        <div className="custom-dropdown" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, zIndex: 999, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
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
  const [perfCandidateId, setPerfCandidateId] = useState(null);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState(null);
  const [showResetPwd, setShowResetPwd] = useState(null); // candidateId
  const [resetPwdForm, setResetPwdForm] = useState({ password: '', confirm: '' });
  const [resetPwdError, setResetPwdError] = useState('');
  const [confirmRevoke, setConfirmRevoke] = useState(null); // candidate {id, name, email}
  const [confirmDelete, setConfirmDelete] = useState(null); // candidate object {id, name, email}
  const [duplicateInfo, setDuplicateInfo] = useState(null); // { errorCode, message, existingCandidate }
  const [tests, setTests] = useState([]);
  const [batches, setBatches] = useState([]);
  const [filterBatch, setFilterBatch] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', testId: '', maxAttempts: 1, batch_id: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const handleSort = (col) => {
    if (sortBy === col) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortOrder('asc'); }
  };
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
  const [bulkFileName, setBulkFileName] = useState('');
  const [bulkDragOver, setBulkDragOver] = useState(false);
  const bulkFileRef = useRef(null);

  const fetchCandidates = () => {
    setLoading(true);
    api.get('/super/candidates')
      .then(r => { setCandidates(r.data.candidates || r.data); setError(''); })
      .catch(e => setError(e.response?.data?.error || 'Failed to load candidates'))
      .finally(() => setLoading(false));
  };

  const fetchTests = () => {
    api.get('/super/tests/all-for-dropdown')
      .then(r => {
        const reg = (r.data.regular || []).map(t => ({ ...t, _group: 'Regular' }));
        const ivp = (r.data.interviewPrep || []).map(t => ({ ...t, _group: 'Interview Prep' }));
        setTests([...reg, ...ivp]);
      })
      .catch(() => {});
  };

  const [onlineStatus, setOnlineStatus] = useState({});
  const fetchOnlineStatus = () => {
    api.get('/super/candidates/online-status')
      .then(r => setOnlineStatus(r.data || {}))
      .catch(() => {});
  };
  const fetchBatches = () => {
    api.get('/super/batches').then(r => setBatches(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  };
  useEffect(() => { fetchCandidates(); fetchTests(); fetchBatches(); fetchOnlineStatus(); }, []);
  useEffect(() => {
    const id = setInterval(fetchOnlineStatus, 30000);
    return () => clearInterval(id);
  }, []);

  const filtered = candidates.filter(c => {
    if (filterBatch && String(c.batch_id || '') !== String(filterBatch)) return false;
    const q = search.toLowerCase();
    return (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q);
  });
  const sortedCandidates = [...filtered].sort((a, b) => {
    const key = sortBy === 'batch' ? (x => (x.batch_code || x.batchCode || '').toLowerCase())
                                    : (x => (x.name || '').toLowerCase());
    const av = key(a), bv = key(b);
    if (av < bv) return sortOrder === 'asc' ? -1 : 1;
    if (av > bv) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const createCandidate = async (e) => {
    e.preventDefault();
    setError('');
    const newErrors = {};
    if (!form.name?.trim()) newErrors.name = 'Full name is required';
    else if (form.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    const emailErr = validateEmail(form.email);
    if (emailErr) newErrors.email = emailErr;
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!form.batch_id) newErrors.batch_id = 'Please select a batch';
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      toast.error('Please fix the errors before submitting');
      return;
    }
    try {
      const res = await api.post('/super/candidates', {
        name: form.name,
        email: form.email,
        password: form.password,
        testId: form.testId || undefined,
        maxAttempts: form.testId ? parseInt(form.maxAttempts) : undefined,
        batch_id: form.batch_id,
      });
      const batchCode = res.data?.batchCode || (batches.find(b => b.id === form.batch_id)?.code) || '';
      toast.success(`${form.name} added${batchCode ? ' to batch ' + batchCode : ''} successfully`);
      setShowCreate(false); setFieldErrors({});
      setForm({ name: '', email: '', password: '', testId: '', maxAttempts: 1, batch_id: '' });
      setFieldErrors({});
      fetchCandidates();
    } catch (err) {
      const data = err.response?.data || {};
      if (data.error === 'INVALID_EMAIL') setFieldErrors(prev => ({ ...prev, email: data.message }));
      if (data.error === 'PASSWORD_REQUIRED' || data.error === 'INVALID_PASSWORD') setFieldErrors(prev => ({ ...prev, password: data.message }));
      if (err.response?.status === 409 && (data.error === 'DUPLICATE_CANDIDATE' || data.error === 'EMAIL_EXISTS')) {
        const existingBatch = data.existingCandidate?.batchCode || 'No batch';
        toast.error(data.error === 'DUPLICATE_CANDIDATE'
          ? `${form.name} with this email already exists in batch ${existingBatch}`
          : `A candidate with email ${form.email} already exists in batch ${existingBatch}`);
        setDuplicateInfo({
          errorCode: data.error,
          message: data.message,
          existingCandidate: data.existingCandidate || null,
        });
        return;
      }
      if (data.error === 'BATCH_NOT_FOUND') toast.error('Selected batch does not exist. Please refresh and try again.');
      else if (data.error === 'BATCH_REQUIRED') toast.error('Batch is required to create a candidate.');
      else toast.error(data.message || data.error || 'Failed to create candidate');
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
      const cand = candidates.find(c => c.id === showAssign);
      toast.success(`Test assigned to ${cand?.name || 'candidate'} successfully`);
      setAssignForm({ testId: '', maxAttempts: 1 });
      fetchCandidates();
      setTimeout(() => { setShowAssign(null); setAssignSuccess(''); }, 1500);
    } catch (err) {
      setAssignError(err.response?.data?.error || 'Failed to assign test');
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to assign test');
    }
  };

  const parseBulkCsv = (text) => {
    const lines = text.trim().split('\n').filter(l => l.trim());
    if (lines.length === 0) return [];
    // detect header
    const firstCols = lines[0].split(',').map(c => c.trim());
    const hasHeader = /^batch/i.test(firstCols[0] || '') || firstCols.some(c => /^(name|email|password|batchcode)$/i.test(c));
    const dataLines = hasHeader ? lines.slice(1) : lines;
    return dataLines.map(line => {
      const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, '').trim());
      // 4-col format: BatchCode,Name,Email,Password
      if (cols.length >= 4) return { batchCode: cols[0], name: cols[1], email: cols[2], password: cols[3] };
      // legacy 3-col: Name,Email,Password
      if (cols.length >= 3) return { batchCode: '', name: cols[0], email: cols[1], password: cols[2] };
      return null;
    }).filter(Boolean);
  };

  const handleBulkCsvChange = (text) => {
    setBulkCsvText(text);
    setBulkPreview(parseBulkCsv(text));
    setBulkError('');
    setBulkResult(null);
  };

  const handleBulkFile = async (file) => {
    if (!file) return;
    setBulkError(''); setBulkResult(null);
    try {
      const csvText = await parseUploadedFile(file);
      if (!csvText.trim()) { setBulkError('No valid rows found in file.'); return; }
      setBulkFileName(file.name);
      handleBulkCsvChange(csvText);
    } catch (err) { setBulkError('Failed to parse file: ' + err.message); }
  };

  const clearBulkFile = () => {
    setBulkFileName(''); setBulkCsvText(''); setBulkPreview([]); setBulkError(''); setBulkResult(null);
    if (bulkFileRef.current) bulkFileRef.current.value = '';
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

  const revokeAll = async () => {
    if (!confirmRevoke) return;
    try {
      await api.put(`/super/candidates/${confirmRevoke.id}/revoke`);
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
          <button className="btn btn-primary" onClick={() => { setForm({ name:'', email:'', password:'', testId:'', maxAttempts:1, batch_id:'' }); setShowCreate(true); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create Candidate
          </button>
        </div>
      </div>

      {error && <div className="login-error">{error}</div>}

      <div className="table-container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, alignItems: 'center', marginBottom: '1rem' }}>
          <input
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', height: 40, padding: '10px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', boxSizing: 'border-box', fontSize: 13, outline: 'none' }}
          />
          <select value={filterBatch} onChange={e => setFilterBatch(e.target.value)}
            style={{ width: '100%', height: 40, padding: '10px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', boxSizing: 'border-box', fontSize: 13, outline: 'none' }}>
            <option value="">All Batches</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.code} — {b.name}</option>)}
          </select>
        </div>

        <div className="table-scroll-wrapper" style={{ width:'100%', overflowX:'auto', display:'block' }}>
        <table className="sf-table" style={{ minWidth:'900px', whiteSpace:'nowrap' }}>
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} style={{ cursor: 'pointer', userSelect: 'none', color: sortBy === 'name' ? '#8B5CF6' : undefined }}>
                Candidate <span style={{ marginLeft: 6, fontSize: 11, color: sortBy === 'name' ? '#8B5CF6' : 'rgba(255,255,255,0.25)' }}>{sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : '⇅'}</span>
              </th>
              <th>Created By</th>
              <th onClick={() => handleSort('batch')} style={{ cursor: 'pointer', userSelect: 'none', color: sortBy === 'batch' ? '#8B5CF6' : undefined }}>
                Batch <span style={{ marginLeft: 6, fontSize: 11, color: sortBy === 'batch' ? '#8B5CF6' : 'rgba(255,255,255,0.25)' }}>{sortBy === 'batch' ? (sortOrder === 'asc' ? '↑' : '↓') : '⇅'}</span>
              </th>
              <th>Tests</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCandidates.map(c => (
              <tr
                key={c.id}
                onClick={(e) => { if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a')) return; setPerfCandidateId(c.id); }}
                style={{ cursor: 'pointer' }}
              >
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
                <td>{c.batch_code ? <span style={batchBadgeStyle}>{c.batch_code}</span> : <span style={{ color: 'rgba(255,255,255,0.25)' }}>-</span>}</td>
                <td><span className="badge badge-count">{c.permissions_count ?? c.test_count ?? 0}</span></td>
                <td>
                  {(() => {
                    const s = onlineStatus[c.id] || { status: 'offline', lastSeenRelative: null };
                    return <OnlineStatusBadge status={s.status} lastSeenRelative={s.lastSeenRelative} size="md" />;
                  })()}
                </td>
                <td>
                  <div className="btn-group">
                    <button className="btn btn-sm btn-outline" onClick={() => navigate(`/super/candidates/${c.id}`)}>View</button>
                    <button className="btn btn-sm btn-primary" onClick={() => setShowAssign(c.id)}>Assign Test</button>
                    <button className="btn btn-sm btn-outline" onClick={() => { setShowResetPwd(c.id); setResetPwdForm({ password: '', confirm: '' }); setResetPwdError(''); }}>Reset Pwd</button>
                    <button className="btn btn-sm btn-danger" onClick={() => setConfirmRevoke({ id: c.id, name: c.name, email: c.email })}>Revoke All</button>
                    <button className="btn btn-sm btn-danger" style={{ background: 'rgba(220,38,38,0.15)', borderColor: 'rgba(220,38,38,0.4)' }} onClick={() => setConfirmDelete({ id: c.id, name: c.name, email: c.email })}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="6" className="table-empty">No candidates found</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => { setShowCreate(false); setFieldErrors({}); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create Candidate</h3>
              <button className="modal-close" onClick={() => { setShowCreate(false); setFieldErrors({}); }}>&times;</button>
            </div>
            <form onSubmit={createCandidate} autoComplete="off" style={{ display: 'contents' }}>
              <div className="modal-body">
              <input type="text" style={{display:'none'}} aria-hidden="true" autoComplete="username" readOnly tabIndex={-1}/>
              <input type="password" style={{display:'none'}} aria-hidden="true" autoComplete="current-password" readOnly tabIndex={-1}/>
              {batches.filter(b => b.isActive).length === 0 && (
                <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(186,117,23,0.1)', border: '1px solid rgba(186,117,23,0.3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: '#BA7517' }}>⚠</span>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                    No batches available.
                    <a href="/super/batches" style={{ color: '#8B5CF6', marginLeft: 4 }}>Create a batch first</a>
                  </span>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Name <span style={{ color: '#E24B4A' }}>*</span></label>
                <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" autoComplete="off" name="new-candidate-name" />
              </div>
              <div className="form-group">
                <EmailField
                  value={form.email}
                  onChange={v => setForm(prev => ({ ...prev, email: v }))}
                  error={fieldErrors.email}
                  onError={err => setFieldErrors(prev => ({ ...prev, email: err }))}
                />
              </div>
              <div className="form-group">
                <PasswordField
                  value={form.password}
                  onChange={v => setForm(prev => ({ ...prev, password: v }))}
                  error={fieldErrors.password}
                  onError={err => setFieldErrors(prev => ({ ...prev, password: err }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Batch <span style={{ color: '#E24B4A' }}>*</span></label>
                <select
                  className="form-select"
                  required
                  value={form.batch_id}
                  onChange={e => setForm({ ...form, batch_id: e.target.value })}
                  style={{ width: '100%', border: !form.batch_id ? '1px solid rgba(226,75,74,0.4)' : undefined }}
                >
                  <option value="" disabled>-- Select Batch (Required) --</option>
                  {batches.filter(b => b.isActive).length === 0 && (
                    <option disabled>No batches available - Create a batch first</option>
                  )}
                  {batches.filter(b => b.isActive).map(b => (
                    <option key={b.id} value={b.id}>
                      {b.code} — {b.name}{b.candidateCount != null ? ` (${b.candidateCount} candidates)` : ''}
                    </option>
                  ))}
                </select>
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
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => { setShowCreate(false); setFieldErrors({}); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={batches.filter(b => b.isActive).length === 0}>Create Candidate</button>
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
            <form onSubmit={assignTest} style={{ display: 'contents' }}>
              <div className="modal-body">
              {assignError && <div className="alert alert-error" style={{ margin: '0 0 12px', fontSize: 13 }}>{assignError}</div>}
              {assignSuccess && <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, color: '#34d399', fontSize: 13, marginBottom: 12 }}>{assignSuccess}</div>}
              <div className="form-group">
                <label className="form-label">Test</label>
                <CustomSelect
                  value={assignForm.testId}
                  onChange={v => setAssignForm({ ...assignForm, testId: v })}
                  options={tests.map(t => ({ value: t.id, label: `${t.name}  [${t._group || t.test_type || 'Test'}]` }))}
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
      <ConfirmModal
        open={!!confirmRevoke}
        title="Revoke All Access"
        message="Are you sure? This will remove all test assignments for this candidate. They will no longer be able to access any tests. This action cannot be undone."
        itemName={confirmRevoke ? `${confirmRevoke.name} · ${confirmRevoke.email || ''}` : ''}
        confirmText="Yes, Revoke All Access"
        confirmColor="#BA7517"
        onCancel={() => setConfirmRevoke(null)}
        onConfirm={revokeAll}
      />

      {/* Reset Password Modal */}
      {showResetPwd && (
        <div className="modal-overlay" onClick={() => setShowResetPwd(null)}>
          <div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🔑 Reset Password</h3>
              <button className="modal-close" onClick={() => setShowResetPwd(null)}>&times;</button>
            </div>
            <form onSubmit={resetPassword} autoComplete="off" style={{ display: 'contents' }}>
              <div className="modal-body">
              {resetPwdError && <div className="login-error" style={{ margin: '0 0 12px', fontSize: 13 }}>{resetPwdError}</div>}
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" required value={resetPwdForm.password} onChange={e => setResetPwdForm({ ...resetPwdForm, password: e.target.value })} placeholder="Min. 6 characters" autoComplete="new-password" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input className="form-input" type="password" required value={resetPwdForm.confirm} onChange={e => setResetPwdForm({ ...resetPwdForm, confirm: e.target.value })} placeholder="Repeat password" autoComplete="new-password" />
              </div>
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
      <ConfirmModal
        open={!!confirmDelete}
        title="Delete Candidate"
        message="Are you sure you want to delete this candidate? This action cannot be undone and will remove all their test data."
        itemName={confirmDelete ? `${confirmDelete.name} · ${confirmDelete.email || ''}` : ''}
        confirmText="Yes, Delete Candidate"
        confirmColor="#E24B4A"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={deleteCandidate}
      />

      {/* Duplicate Warning Modal (intercepts 409 from Create flow) */}
      {duplicateInfo && (
        <DuplicateWarningModal
          errorCode={duplicateInfo.errorCode}
          message={duplicateInfo.message}
          existingCandidate={duplicateInfo.existingCandidate}
          onGoBack={() => setDuplicateInfo(null)}
          onDismiss={() => { setDuplicateInfo(null); setShowCreate(false); setFieldErrors({}); }}
        />
      )}

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <div className="modal-overlay" onClick={() => setShowBulkImport(false)}>
          <div className="modal-content" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">📥 Bulk Import Candidates</h3>
              <button className="modal-close" onClick={() => setShowBulkImport(false)}>&times;</button>
            </div>
            <div className="modal-body">
            <div style={{ marginBottom: 12, padding: '10px 14px', background: 'rgba(99,102,241,0.08)', borderRadius: 8, fontSize: 13, color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(99,102,241,0.2)' }}>
              CSV format: <code style={{ color: '#818cf8' }}>BatchCode,Name,Email,Password</code><br />
              Header row is auto-detected. BatchCode is optional (leave empty for unassigned). Unknown batch codes are rejected. Existing emails are skipped.
            </div>
            {bulkError && <div className="login-error" style={{ margin: '0 0 12px' }}>{bulkError}</div>}

            {/* File upload dropzone */}
            <div
              onDragOver={e => { e.preventDefault(); setBulkDragOver(true); }}
              onDragLeave={() => setBulkDragOver(false)}
              onDrop={e => { e.preventDefault(); setBulkDragOver(false); handleBulkFile(e.dataTransfer.files?.[0]); }}
              onClick={() => bulkFileRef.current?.click()}
              style={{
                cursor: 'pointer', textAlign: 'center', padding: '20px 16px', marginBottom: 12,
                border: `2px dashed ${bulkDragOver ? '#7c3aed' : 'rgba(255,255,255,0.18)'}`,
                background: bulkDragOver ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.02)',
                borderRadius: 10, transition: 'all 0.15s',
              }}
            >
              <input ref={bulkFileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }}
                onChange={e => handleBulkFile(e.target.files?.[0])} />
              <div style={{ fontSize: 28, marginBottom: 6 }}>📤</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
                {bulkFileName ? <span style={{ color: '#34d399' }}>{bulkFileName} ✓ {bulkPreview.length} candidates found</span> : 'Drag & drop CSV or Excel file here'}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                {bulkFileName ? 'Click to choose another file' : 'OR click to browse (.csv, .xlsx, .xls)'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button type="button" className="btn btn-outline" style={{ fontSize: 12, padding: '6px 12px' }} onClick={downloadTemplateCsv}>⬇ Download Template</button>
              {(bulkFileName || bulkCsvText) && <button type="button" className="btn btn-outline" style={{ fontSize: 12, padding: '6px 12px' }} onClick={clearBulkFile}>✕ Clear</button>}
            </div>

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
            {bulkPreview.length > 0 && !bulkResult && (() => {
              const knownCodes = new Set(batches.map(b => b.code));
              const validCount = bulkPreview.filter(c => !c.batchCode || knownCodes.has(c.batchCode.toUpperCase())).length;
              const unknownCount = bulkPreview.length - validCount;
              return (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>
                    <span style={{ color: '#34d399' }}>{validCount} valid row{validCount!==1?'s':''}</span>
                    {unknownCount > 0 && <span style={{ color: '#f87171' }}>, {unknownCount} row{unknownCount!==1?'s':''} with unknown batch codes</span>}
                  </div>
                  <div className="dropdown-scroll" style={{ maxHeight: 160, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '6px 10px' }}>
                    {bulkPreview.slice(0, 20).map((c, i) => {
                      const unknown = c.batchCode && !knownCodes.has(c.batchCode.toUpperCase());
                      return (
                        <div key={i} style={{ fontSize: 12, color: unknown ? '#f87171' : 'rgba(255,255,255,0.7)', padding: '2px 0', background: unknown ? 'rgba(239,68,68,0.08)' : 'transparent' }}>
                          {c.batchCode ? <span style={batchBadgeStyle}>{c.batchCode.toUpperCase()}</span> : <span style={{ color: 'rgba(255,255,255,0.3)' }}>(no batch)</span>}
                          {' '}{c.name} — {c.email}
                          {unknown && ' ⚠ unknown batch'}
                        </div>
                      );
                    })}
                    {bulkPreview.length > 20 && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>...and {bulkPreview.length - 20} more</div>}
                  </div>
                </div>
              );
            })()}
            {bulkResult && (
              <BulkImportSummary result={bulkResult} />
            )}
            </div>
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
      {perfCandidateId && (
        <CandidatePerformance
          candidateId={perfCandidateId}
          apiPrefix="/super"
          onClose={() => setPerfCandidateId(null)}
        />
      )}
    </div>
  );
}
