import { useState, useEffect } from 'react';
import api from '../../api';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';

const SUBJECT_COLORS = {
  Python: '#3b82f6', Python_Selenium: '#8b5cf6', Pytest: '#10b981',
  Manual_Testing: '#ef4444', API_Testing: '#f59e0b', Postman: '#06b6d4',
  Python_Requests: '#84cc16', SQL: '#d97706'
};

const SUBJECT_LABELS = {
  Python: 'Python', Python_Selenium: 'Python Selenium', Pytest: 'Pytest',
  Manual_Testing: 'Manual Testing', API_Testing: 'API Testing', Postman: 'Postman',
  Python_Requests: 'Python Requests', SQL: 'SQL'
};

export default function DesignTestPage({ apiPrefix = '/super' }) {
  const toast = useToast();
  const [tests, setTests] = useState([]);
  const [editingTest, setEditingTest] = useState(null);
  const [stats, setStats] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [pythonCodingAvailable, setPythonCodingAvailable] = useState(0);
  const [diffLocked, setDiffLocked] = useState(new Set());
  const [typeLocked, setTypeLocked] = useState(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deactivateConfirm, setDeactivateConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '',
    subjects: [],
    totalQuestions: 50,
    easy: 30, medium: 50, hard: 20,
    mcq: 50, output: 25, scenario: 15, code_completion: 10,
    durationMinutes: 60,
    passingPercentage: 60,
    codingProblemCount: 0,
  });

  const fetchData = async () => {
    try {
      const [testsRes, statsRes] = await Promise.all([
        api.get(`${apiPrefix}/design-tests`),
        api.get(`${apiPrefix}/question-stats`)
      ]);
      setTests(testsRes.data.tests || []);
      setStats(statsRes.data.subjects || []);
      setPythonCodingAvailable(statsRes.data.pythonCodingProblems || 0);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (testId, testName) => {
    setDeactivateConfirm({ id: testId, name: testName });
  };

  const doDeactivate = async () => {
    if (!deactivateConfirm) return;
    try {
      await api.delete(`${apiPrefix}/design-test/${deactivateConfirm.id}`);
      setDeactivateConfirm(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to deactivate test');
      setDeactivateConfirm(null);
    }
  };

  const handleHardDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await api.delete(`${apiPrefix}/design-test/${deleteConfirm.id}/hard`);
      toast.success(`${deleteConfirm.name} has been deleted`);
      setDeleteConfirm(null);
      setSuccess(`Test "${deleteConfirm.name}" permanently deleted.`);
      setTimeout(() => setSuccess(''), 3000);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to delete test';
      setError(msg);
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line

  const toggleSubject = (name) => {
    setForm(prev => ({
      ...prev,
      subjects: prev.subjects.includes(name)
        ? prev.subjects.filter(s => s !== name)
        : [...prev.subjects, name]
    }));
  };

  // Redistribute remaining 100% proportionally among unlocked, non-changed sliders
  const redistributeSliders = (form, changedKey, newVal, keys, lockedKeys) => {
    const clamped = Math.max(0, Math.min(100, newVal));
    // Keys that are locked (but not the one being changed)
    const lockedOthers = keys.filter(k => k !== changedKey && lockedKeys.has(k));
    // Keys free to redistribute into
    const freeKeys = keys.filter(k => k !== changedKey && !lockedKeys.has(k));

    const lockedSum = lockedOthers.reduce((s, k) => s + (form[k] || 0), 0);
    const remaining = Math.max(0, 100 - clamped - lockedSum);
    const newValues = { [changedKey]: clamped };

    if (freeKeys.length === 0) {
      // Nothing to redistribute into — just apply the change as-is
      return newValues;
    }

    const freeSum = freeKeys.reduce((s, k) => s + (form[k] || 0), 0);

    if (freeSum === 0) {
      // Distribute evenly among free keys
      const each = Math.floor(remaining / freeKeys.length);
      const leftover = remaining - each * freeKeys.length;
      freeKeys.forEach((k, i) => {
        newValues[k] = each + (i === freeKeys.length - 1 ? leftover : 0);
      });
    } else {
      // Distribute proportionally, last one absorbs rounding error
      let allocated = 0;
      freeKeys.forEach((k, i) => {
        if (i === freeKeys.length - 1) {
          newValues[k] = Math.max(0, remaining - allocated);
        } else {
          const val = Math.round(((form[k] || 0) / freeSum) * remaining);
          newValues[k] = Math.max(0, val);
          allocated += newValues[k];
        }
      });
    }
    return newValues;
  };

  const DIFF_KEYS = ['easy', 'medium', 'hard'];
  const TYPE_KEYS = ['mcq', 'output', 'scenario', 'code_completion'];

  const toggleLock = (key, allKeys, lockedSet, setLockedSet) => {
    setLockedSet(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        // Unlocking — just remove it
        next.delete(key);
      } else {
        // Locking this key — add it, then check if only 1 free remains
        next.add(key);
        const freeKeys = allKeys.filter(k => !next.has(k));
        if (freeKeys.length === 1) {
          // Auto-lock the last free one too — it's fully constrained by the others
          next.add(freeKeys[0]);
        }
      }
      return next;
    });
  };

  const handleDiffChange = (key, newVal) => {
    const updated = redistributeSliders(form, key, newVal, DIFF_KEYS, diffLocked);
    setForm(prev => ({ ...prev, ...updated }));
  };

  const handleTypeChange = (key, newVal) => {
    const updated = redistributeSliders(form, key, newVal, TYPE_KEYS, typeLocked);
    setForm(prev => ({ ...prev, ...updated }));
  };

  const selectedQuestionPool = stats
    .filter(s => form.subjects.includes(s.name))
    .reduce((sum, s) => sum + s.total, 0);

  const diffTotal = (form.easy || 0) + (form.medium || 0) + (form.hard || 0);
  const typeTotal = (form.mcq || 0) + (form.output || 0) + (form.scenario || 0) + (form.code_completion || 0);
  const diffValid = diffTotal === 100;
  const typeValid = typeTotal === 100;

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!form.name.trim()) return setError('Test name is required');
    const hasMcq = form.totalQuestions > 0;
    const hasCoding = (form.codingProblemCount || 0) > 0;
    if (!hasMcq && !hasCoding) return setError('Add MCQ questions or coding problems (or both)');
    if (hasMcq && !form.subjects.length) return setError('Select at least one subject for MCQ questions');
    if (hasMcq && form.totalQuestions < 5) return setError('Minimum 5 MCQ questions');
    if (hasMcq && form.totalQuestions > selectedQuestionPool) return setError(`Only ${selectedQuestionPool} questions available for selected subjects`);
    if (hasCoding && form.codingProblemCount > pythonCodingAvailable) return setError(`Only ${pythonCodingAvailable} Python coding problems available`);
    if (hasMcq && !diffValid) return setError(`Difficulty percentages must sum to 100 (currently ${diffTotal})`);
    if (hasMcq && !typeValid) return setError(`Question type percentages must sum to 100 (currently ${typeTotal})`);

    setCreating(true);
    try {
      const totalQ = form.totalQuestions;
      const payload = {
        name: form.name.trim(),
        description: (form.description || '').trim(),
        subjects: form.subjects,
        totalQuestions: totalQ,
        difficultyDistribution: { Easy: form.easy, Medium: form.medium, Hard: form.hard },
        typeQuotas: {
          mcq: Math.round((form.mcq / 100) * totalQ),
          output: Math.round((form.output / 100) * totalQ),
          scenario: Math.round((form.scenario / 100) * totalQ),
          code_completion: Math.round((form.code_completion / 100) * totalQ)
        },
        durationMinutes: Number(form.durationMinutes) || 60,
        passingPercentage: Number(form.passingPercentage) || 60,
        codingProblemCount: Number(form.codingProblemCount) || 0,
      };
      if (editingTest) {
        await api.put(`${apiPrefix}/design-test/${editingTest.id}`, payload);
        toast.success(`${form.name.trim()} has been updated`);
      } else {
        await api.post(`${apiPrefix}/design-test`, payload);
        toast.success(`${form.name.trim()} has been created successfully`);
      }
      setSuccess(editingTest ? 'Test updated!' : 'Test created successfully!');
      setShowCreate(false);
      setEditingTest(null);
      setForm({ name: '', description: '', subjects: [], totalQuestions: 50, easy: 30, medium: 50, hard: 20, mcq: 50, output: 25, scenario: 15, code_completion: 10, durationMinutes: 60, passingPercentage: 60, codingProblemCount: 0 });
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to save test';
      setError(msg);
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (t) => {
    const subjectsArr = t.subjects_json ? JSON.parse(t.subjects_json) : [];
    const diff = t.difficulty_json ? JSON.parse(t.difficulty_json) : { Easy: 30, Medium: 50, Hard: 20 };
    const typeQ = t.type_quotas_json ? JSON.parse(t.type_quotas_json) : {};
    const totalQ = t.total_questions || 0;
    const pct = (n) => totalQ ? Math.round((Number(n || 0) / totalQ) * 100) : 0;
    setForm({
      name: t.name ?? '',
      description: t.description ?? '',
      subjects: subjectsArr,
      totalQuestions: totalQ,
      easy: diff.Easy ?? 30, medium: diff.Medium ?? 50, hard: diff.Hard ?? 20,
      mcq: pct(typeQ.mcq) || 50,
      output: pct(typeQ.output) || 25,
      scenario: pct(typeQ.scenario) || 15,
      code_completion: pct(typeQ.code_completion) || 10,
      durationMinutes: t.duration_minutes ?? 60,
      passingPercentage: t.passing_percentage ?? 60,
      codingProblemCount: t.coding_problem_count ?? 0,
    });
    setEditingTest(t);
    setShowCreate(true);
    setError('');
  };

  const handleToggleStatus = async (t) => {
    try {
      const r = await api.put(`${apiPrefix}/design-test/${t.id}/toggle-status`);
      toast.success(r.data?.is_active ? `${t.name} is now active` : `${t.name} has been deactivated`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Loading...</div>;

  // Inject CSS to remove number input spinners
  const spinnerStyle = `
    input[type=number].no-spin::-webkit-outer-spin-button,
    input[type=number].no-spin::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    input[type=number].no-spin { -moz-appearance: textfield; }
  `;

  const S = {
    page: { padding: '0 0 40px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
    title: { fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.95)' },
    sub: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 },
    createBtn: { padding: '10px 24px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 },
    card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20, marginBottom: 16 },
    label: { fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 8, display: 'block' },
    input: { width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white', fontSize: 14, fontFamily: 'inherit', outline: 'none' },
    textarea: { width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white', fontSize: 14, fontFamily: 'inherit', outline: 'none', minHeight: 60, resize: 'vertical' },
    numInput: { width: 72, padding: '8px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'white', fontSize: 15, fontWeight: 600, fontFamily: 'monospace', textAlign: 'center', outline: 'none', boxSizing: 'border-box' },
    subjectChip: (selected, color) => ({
      padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all .2s', border: `1px solid ${selected ? color : 'rgba(255,255,255,0.1)'}`,
      background: selected ? color + '22' : 'rgba(255,255,255,0.03)', color: selected ? color : 'rgba(255,255,255,0.5)'
    }),
    error: { padding: '10px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', fontSize: 13, marginBottom: 16 },
    success: { padding: '10px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, color: '#34d399', fontSize: 13, marginBottom: 16 },
    distRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 },
    distLabel: { width: 130, fontSize: 13, color: 'rgba(255,255,255,0.6)' },
    distBar: (pct, color) => ({ height: 6, width: `${pct}%`, background: color, borderRadius: 3, transition: 'width .3s' }),
    badge: (color) => ({ padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 500, background: color + '22', color: color, border: `1px solid ${color}44` }),
  };

  return (
    <div className="page-enter" style={S.page}>
      <style>{spinnerStyle}</style>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>{editingTest ? `Edit Test — ${editingTest.name}` : 'Design Test'}</h1>
          <p style={S.sub}>{editingTest ? 'Update an existing test' : 'Create custom assessments from the question bank'}</p>
        </div>
        <button style={S.createBtn} onClick={() => { if (showCreate) { setEditingTest(null); } setShowCreate(!showCreate); }}>
          {showCreate ? 'Cancel' : '+ Create Test'}
        </button>
      </div>

      {error && <div style={S.error}>{error}</div>}
      {success && <div style={S.success}>{success}</div>}

      {/* ── Delete Confirmation Modal ─────────────────────────────── */}
      <ConfirmModal
        open={!!deleteConfirm}
        title="Delete Test"
        message={
          deleteConfirm && deleteConfirm.submittedCount > 0
            ? `Are you sure? This will permanently delete the test and all its data. ${deleteConfirm.submittedCount} submitted session${deleteConfirm.submittedCount > 1 ? 's' : ''} will also be deleted. This action cannot be undone.`
            : 'Are you sure? This will permanently delete the test and all its data — including questions, candidate sessions, and results. This action cannot be undone.'
        }
        itemName={deleteConfirm?.name || ''}
        confirmText="Yes, Delete Test"
        confirmColor="#E24B4A"
        loading={deleting}
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={handleHardDelete}
      />

      {/* ── Deactivate Confirmation Modal ─────────────────────────── */}
      <ConfirmModal
        open={!!deactivateConfirm}
        title="Deactivate Test"
        message="Are you sure you want to deactivate this test? It will no longer be available for new assignments, but existing data will be preserved."
        itemName={deactivateConfirm?.name || ''}
        confirmText="Yes, Deactivate Test"
        confirmColor="#BA7517"
        onCancel={() => setDeactivateConfirm(null)}
        onConfirm={doDeactivate}
      />

      {/* ===== CREATE FORM ===== */}
      {showCreate && (
        <form onSubmit={handleCreate} style={{ marginBottom: 32 }}>
          <div style={S.card}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div>
                <label style={S.label}>Test Name *</label>
                <input style={S.input} placeholder="e.g. Python + SQL Assessment" value={form.name ?? ''} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div>
                <label style={S.label}>Description</label>
                <input style={S.input} placeholder="Brief description..." value={form.description ?? ''} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} />
              </div>
            </div>

            {/* Subject Selection - only for MCQ */}
            <label style={S.label}>MCQ Subjects ({form.subjects.length} selected, {selectedQuestionPool} available) <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>— set Total Questions to 0 to skip MCQ</span></label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
              {stats.map(s => {
                const color = SUBJECT_COLORS[s.name] || '#6366f1';
                const selected = form.subjects.includes(s.name);
                return (
                  <button type="button" key={s.name} style={S.subjectChip(selected, color)} onClick={() => toggleSubject(s.name)}>
                    {selected ? '\u2713 ' : ''}{SUBJECT_LABELS[s.name] || s.name}
                    <span style={{ marginLeft: 6, opacity: 0.6, fontSize: 11 }}>({s.total})</span>
                  </button>
                );
              })}
            </div>

            {/* Configuration Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
              <div>
                <label style={S.label}>MCQ Questions</label>
                <input type="number" className="no-spin" style={S.numInput} min={0} max={500} value={form.totalQuestions ?? ''} onFocus={e => e.target.select()} onChange={e => { const v = e.target.value; setForm(prev => ({ ...prev, totalQuestions: v === '' ? '' : (parseInt(v) || 0) })); }} onBlur={e => { if (e.target.value === '') setForm(prev => ({ ...prev, totalQuestions: 0 })); }} />
                {form.totalQuestions > selectedQuestionPool && selectedQuestionPool > 0 && (
                  <div style={{ fontSize: 11, color: '#f87171', marginTop: 4 }}>Max: {selectedQuestionPool}</div>
                )}
              </div>
              <div>
                <label style={S.label}>Duration (min)</label>
                <input type="number" className="no-spin" style={S.numInput} min={1} max={480} value={form.durationMinutes ?? ''} onFocus={e => e.target.select()} onChange={e => { const v = e.target.value; setForm(prev => ({ ...prev, durationMinutes: v === '' ? '' : (parseInt(v) || 0) })); }} onBlur={e => { if (e.target.value === '') setForm(prev => ({ ...prev, durationMinutes: 60 })); }} />
              </div>
              <div>
                <label style={S.label}>Passing %</label>
                <input type="number" className="no-spin" style={S.numInput} min={1} max={100} value={form.passingPercentage ?? ''} onFocus={e => e.target.select()} onChange={e => { const v = e.target.value; setForm(prev => ({ ...prev, passingPercentage: v === '' ? '' : (parseInt(v) || 0) })); }} onBlur={e => { if (e.target.value === '') setForm(prev => ({ ...prev, passingPercentage: 60 })); }} />
              </div>
              <div>
                <label style={S.label}>Pool Available</label>
                <div style={{ fontSize: 20, fontWeight: 700, color: selectedQuestionPool >= form.totalQuestions ? '#10b981' : '#f87171', fontFamily: 'monospace', paddingTop: 6 }}>
                  {selectedQuestionPool}
                </div>
              </div>
            </div>

            {/* Difficulty Distribution */}
            <label style={{ ...S.label, marginBottom: 12 }}>
              Difficulty Distribution (must sum to 100%)
              <span style={{ float: 'right', color: diffValid ? '#10b981' : '#f87171', fontWeight: 700 }}>{diffTotal}%</span>
            </label>
            <div style={{ marginBottom: 24 }}>
              {[
                { key: 'easy', label: 'Easy', color: '#10b981' },
                { key: 'medium', label: 'Medium', color: '#f59e0b' },
                { key: 'hard', label: 'Hard', color: '#ef4444' },
              ].map(d => {
                const isLocked = diffLocked.has(d.key);
                return (
                  <div key={d.key} style={S.distRow}>
                    <button
                      type="button"
                      onClick={() => toggleLock(d.key, DIFF_KEYS, diffLocked, setDiffLocked)}
                      title={isLocked ? 'Unlock this slider' : 'Lock this slider'}
                      style={{
                        background: isLocked ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isLocked ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer', flexShrink: 0, padding: 0,
                        transition: 'all 0.15s',
                      }}
                    >
                      {isLocked ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                        </svg>
                      )}
                    </button>
                    <span style={{ ...S.distLabel, color: isLocked ? '#f59e0b' : d.color, opacity: isLocked ? 1 : undefined }}>{d.label}</span>
                    <input type="range" min={0} max={100} value={form[d.key]}
                      onChange={e => handleDiffChange(d.key, parseInt(e.target.value))}
                      disabled={isLocked}
                      style={{ flex: 1, accentColor: d.color, opacity: isLocked ? 0.45 : 1, cursor: isLocked ? 'not-allowed' : 'pointer' }} />
                    <input type="number" min={0} max={100} value={form[d.key]}
                      onChange={e => { const v = e.target.value; if (v === '' || v === '-') return; handleDiffChange(d.key, parseInt(v) || 0); }}
                      onBlur={e => { if (e.target.value === '') handleDiffChange(d.key, 0); }}
                      onFocus={e => e.target.select()}
                      disabled={isLocked}
                      className="no-spin" style={{ ...S.numInput, opacity: isLocked ? 0.5 : 1, cursor: isLocked ? 'not-allowed' : 'text' }} />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', width: 30 }}>{Math.round((form[d.key] / 100) * form.totalQuestions)}q</span>
                  </div>
                );
              })}
            </div>

            {/* Question Type Distribution */}
            <label style={{ ...S.label, marginBottom: 12 }}>
              Question Type Distribution (must sum to 100%)
              <span style={{ float: 'right', color: typeValid ? '#10b981' : '#f87171', fontWeight: 700 }}>{typeTotal}%</span>
            </label>
            <div style={{ marginBottom: 24 }}>
              {[
                { key: 'mcq', label: 'MCQ', color: '#3b82f6' },
                { key: 'output', label: 'Output Prediction', color: '#8b5cf6' },
                { key: 'scenario', label: 'Scenario', color: '#06b6d4' },
                { key: 'code_completion', label: 'Code Completion', color: '#84cc16' },
              ].map(t => {
                const isLocked = typeLocked.has(t.key);
                return (
                  <div key={t.key} style={S.distRow}>
                    <button
                      type="button"
                      onClick={() => toggleLock(t.key, TYPE_KEYS, typeLocked, setTypeLocked)}
                      title={isLocked ? 'Unlock this slider' : 'Lock this slider'}
                      style={{
                        background: isLocked ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isLocked ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer', flexShrink: 0, padding: 0,
                        transition: 'all 0.15s',
                      }}
                    >
                      {isLocked ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                        </svg>
                      )}
                    </button>
                    <span style={{ ...S.distLabel, color: isLocked ? '#f59e0b' : t.color }}>{t.label}</span>
                    <input type="range" min={0} max={100} value={form[t.key]}
                      onChange={e => handleTypeChange(t.key, parseInt(e.target.value))}
                      disabled={isLocked}
                      style={{ flex: 1, accentColor: t.color, opacity: isLocked ? 0.45 : 1, cursor: isLocked ? 'not-allowed' : 'pointer' }} />
                    <input type="number" min={0} max={100} value={form[t.key]}
                      onChange={e => { const v = e.target.value; if (v === '' || v === '-') return; handleTypeChange(t.key, parseInt(v) || 0); }}
                      onBlur={e => { if (e.target.value === '') handleTypeChange(t.key, 0); }}
                      onFocus={e => e.target.select()}
                      disabled={isLocked}
                      className="no-spin" style={{ ...S.numInput, opacity: isLocked ? 0.5 : 1, cursor: isLocked ? 'not-allowed' : 'text' }} />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', width: 30 }}>{Math.round((form[t.key] / 100) * form.totalQuestions)}q</span>
                  </div>
                );
              })}
            </div>

            {/* Python Coding Problems */}
            <label style={{ ...S.label, marginBottom: 12 }}>
              Python Coding Problems (Round 3 Style)
              <span style={{ float: 'right', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{pythonCodingAvailable} available</span>
            </label>
            <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 10, padding: 16, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', flex: 1 }}>
                  💻 Include Python coding problems with Monaco editor + automated test case evaluation (like Round 3). Candidates write real Python code.
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <label style={{ ...S.label, margin: 0, fontSize: 12 }}>Count:</label>
                  <input type="number" className="no-spin" style={S.numInput} min={0} max={Math.min(pythonCodingAvailable, 20)} value={form.codingProblemCount ?? ''} onFocus={e => e.target.select()} onChange={e => { const v = e.target.value; setForm(prev => ({ ...prev, codingProblemCount: v === '' ? '' : (parseInt(v) || 0) })); }} onBlur={e => { if (e.target.value === '') setForm(prev => ({ ...prev, codingProblemCount: 0 })); }} />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>/ {pythonCodingAvailable}</span>
                </div>
              </div>
              {form.codingProblemCount > 0 && (
                <div style={{ marginTop: 10, fontSize: 12, color: '#34d399' }}>
                  ✓ {form.codingProblemCount} coding {form.codingProblemCount === 1 ? 'problem' : 'problems'} will be randomly selected from the Python coding bank
                  {form.totalQuestions > 0 ? ' — combined with MCQ questions for a hybrid test' : ' — coding-only test'}
                </div>
              )}
            </div>

            {/* Preview Summary */}
            <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#a78bfa', marginBottom: 10 }}>Preview</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, fontSize: 13 }}>
                <div><span style={{ color: 'rgba(255,255,255,0.4)' }}>Subjects:</span> <span style={{ color: 'white' }}>{form.subjects.map(s => SUBJECT_LABELS[s] || s).join(', ') || '—'}</span></div>
                <div><span style={{ color: 'rgba(255,255,255,0.4)' }}>MCQ:</span> <span style={{ color: 'white', fontFamily: 'monospace' }}>{form.totalQuestions} q</span></div>
                <div><span style={{ color: 'rgba(255,255,255,0.4)' }}>Coding:</span> <span style={{ color: form.codingProblemCount > 0 ? '#10b981' : 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{form.codingProblemCount} problems</span></div>
                <div><span style={{ color: 'rgba(255,255,255,0.4)' }}>Duration:</span> <span style={{ color: 'white', fontFamily: 'monospace' }}>{form.durationMinutes} min</span></div>
              </div>
              {form.codingProblemCount > 0 && form.totalQuestions > 0 && <div style={{ marginTop: 8, fontSize: 12, color: '#a78bfa' }}>⚡ Hybrid test: MCQ + Python Coding sections</div>}
              {form.codingProblemCount > 0 && form.totalQuestions === 0 && <div style={{ marginTop: 8, fontSize: 12, color: '#10b981' }}>💻 Coding-only test</div>}
            </div>

            {error && <div style={{ ...S.error, marginBottom: 12 }}>{error}</div>}
            {!diffValid && <div style={{ ...S.error, marginBottom: 8 }}>⚠ Difficulty percentages must sum to 100 (currently {diffTotal}%)</div>}
            {!typeValid && <div style={{ ...S.error, marginBottom: 8 }}>⚠ Question type percentages must sum to 100 (currently {typeTotal}%)</div>}
            <button type="submit" disabled={creating} style={{ ...S.createBtn, opacity: creating ? 0.5 : 1, width: '100%', justifyContent: 'center', padding: '14px 24px', fontSize: 15 }}>
              {creating ? (editingTest ? 'Saving...' : 'Creating...') : (editingTest ? 'Save Changes' : 'Create Test')}
            </button>
          </div>
        </form>
      )}

      {/* ===== EXISTING TESTS LIST ===== */}
      {!showCreate && tests.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>&#128221;</div>
          <p style={{ fontSize: 16 }}>No tests created yet</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Click "+ Create Test" to get started.</p>
        </div>
      )}

      {!showCreate && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
        {tests.map(t => {
          const subjects = t.subjects_json ? JSON.parse(t.subjects_json) : [];
          const difficulty = t.difficulty_json ? JSON.parse(t.difficulty_json) : {};
          return (
            <div key={t.id} style={{ ...S.card, borderLeft: `3px solid ${t.is_active ? '#7c3aed' : '#64748b'}`, opacity: t.is_active ? 1 : 0.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>{t.name}</h3>
                  {t.description && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{t.description}</p>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
                  {t.is_active
                    ? <span style={{ padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 500, background: 'rgba(29,158,117,0.15)', color: '#1D9E75', border: '1px solid rgba(29,158,117,0.3)' }}>Active</span>
                    : <span style={{ padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 500, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)' }}>Inactive</span>}
                  <button onClick={() => openEdit(t)} style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#8B5CF6', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 }} title="Edit test">✏ Edit</button>
                  {t.is_active ? (
                    <button onClick={() => handleToggleStatus(t)} style={{ background: 'transparent', border: '1px solid rgba(186,117,23,0.4)', color: '#BA7517', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>Deactivate</button>
                  ) : (
                    <button onClick={() => handleToggleStatus(t)} style={{ background: 'rgba(29,158,117,0.15)', border: '1px solid rgba(29,158,117,0.3)', color: '#1D9E75', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>Activate</button>
                  )}
                  <button onClick={() => setDeleteConfirm({ id: t.id, name: t.name, submittedCount: t.submitted_count || 0 })} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', cursor: 'pointer', fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: 6 }} title="Permanently delete test and all its data">Delete</button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {subjects.map(s => (<span key={s} style={S.badge(SUBJECT_COLORS[s] || '#6366f1')}>{SUBJECT_LABELS[s] || s}</span>))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
                {[
                  { label: 'MCQ', value: t.total_questions || 0 },
                  { label: 'Coding', value: t.coding_problem_count || 0 },
                  { label: 'Duration', value: `${t.duration_minutes}m` },
                  { label: 'Pass %', value: `${t.passing_percentage}%` },
                ].map(m => (
                  <div key={m.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace' }}>{m.value}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{m.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 4, height: 4, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${difficulty.Easy || 30}%`, background: '#10b981' }} />
                <div style={{ width: `${difficulty.Medium || 50}%`, background: '#f59e0b' }} />
                <div style={{ width: `${difficulty.Hard || 20}%`, background: '#ef4444' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                <span>E: {difficulty.Easy || 30}%</span>
                <span>M: {difficulty.Medium || 50}%</span>
                <span>H: {difficulty.Hard || 20}%</span>
              </div>

              {t.avg_score !== null && t.avg_score !== undefined && (
                <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                  Avg Score: <span style={{ color: '#10b981', fontFamily: 'monospace' }}>{t.avg_score}%</span> | Submitted: {t.submitted_count || 0}
                </div>
              )}

              <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                Created by {t.creator_name || 'System'} | ID: {t.id}
              </div>
            </div>
          );
        })}
      </div>}
    </div>
  );
}
