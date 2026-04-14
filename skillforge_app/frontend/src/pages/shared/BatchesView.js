import { useState, useEffect, useMemo } from 'react';
import api from '../../api';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatDateTime } from '../../utils/dateUtils';
import { fetchTestsForDropdown } from '../../utils/testDropdown';
import ConfirmModal from '../../components/ConfirmModal';

const codeBadgeStyle = {
  display: 'inline-block',
  padding: '3px 10px',
  borderRadius: 6,
  background: 'rgba(124,58,237,0.18)',
  color: '#a78bfa',
  fontFamily: 'monospace',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.04em',
};

const statusBadge = (active) => ({
  display: 'inline-block',
  padding: '3px 10px',
  borderRadius: 99,
  fontSize: 11,
  fontWeight: 600,
  background: active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
  color: active ? '#34d399' : '#f87171',
});

const countBadge = {
  display: 'inline-block',
  minWidth: 28,
  textAlign: 'center',
  padding: '3px 8px',
  borderRadius: 12,
  background: 'rgba(59,130,246,0.18)',
  color: '#60a5fa',
  fontSize: 12,
  fontWeight: 700,
};

const assignedBadge = (n) => ({
  display: 'inline-block',
  minWidth: 28,
  textAlign: 'center',
  padding: '3px 10px',
  borderRadius: 12,
  background: n > 0 ? 'rgba(139,92,246,0.18)' : 'transparent',
  color: n > 0 ? '#c4b5fd' : 'rgba(255,255,255,0.3)',
  fontSize: 12,
  fontWeight: 700,
});

const typeBadgeColor = (t) => {
  const tt = String(t || '').toLowerCase();
  if (tt === 'coding') return { bg: 'rgba(139,92,246,0.18)', fg: '#c4b5fd' };
  if (tt === 'hybrid') return { bg: 'rgba(20,184,166,0.18)', fg: '#5eead4' };
  if (tt === 'interview') return { bg: 'rgba(236,72,153,0.18)', fg: '#f9a8d4' };
  return { bg: 'rgba(59,130,246,0.18)', fg: '#93c5fd' }; // mcq / default
};

function TypeBadge({ type }) {
  const c = typeBadgeColor(type);
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 6,
      background: c.bg,
      color: c.fg,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    }}>{String(type || '').toUpperCase()}</span>
  );
}

// -----------------------------------------------------------------
// Assign Tests Modal (inline)
// -----------------------------------------------------------------
function AssignTestsModal({ batch, apiPrefix, role, onClose, onDone }) {
  const toast = useToast();
  const [grouped, setGrouped] = useState({ regular: [], interviewPrep: [] });
  const [assignedTests, setAssignedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableUntil, setAvailableUntil] = useState('');

  const [assignedOpen, setAssignedOpen] = useState(true);
  const [confirmRevoke, setConfirmRevoke] = useState(null);
  const [revokeLoading, setRevokeLoading] = useState(false);

  const [result, setResult] = useState(null); // success view payload

  const loadAssigned = () => {
    api.get(`${apiPrefix}/batches/${batch.id}/assigned-tests`)
      .then(r => setAssignedTests(Array.isArray(r.data) ? r.data : []))
      .catch(() => setAssignedTests([]));
  };

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([
      fetchTestsForDropdown(role),
      api.get(`${apiPrefix}/batches/${batch.id}/assigned-tests`).then(r => r.data).catch(() => []),
    ]).then(([g, a]) => {
      if (!alive) return;
      setGrouped(g || { regular: [], interviewPrep: [] });
      setAssignedTests(Array.isArray(a) ? a : []);
    }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [batch.id, apiPrefix, role]);

  const allTests = useMemo(() => [
    ...(grouped.regular || []).map(t => ({ ...t, _group: 'regular' })),
    ...(grouped.interviewPrep || []).map(t => ({ ...t, _group: 'interviewPrep' })),
  ], [grouped]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allTests;
    return allTests.filter(t => (t.name || '').toLowerCase().includes(q));
  }, [allTests, search]);

  const filteredRegular = filtered.filter(t => t._group === 'regular');
  const filteredPrep = filtered.filter(t => t._group === 'interviewPrep');

  const toggleOne = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const allFilteredSelected = filtered.length > 0 && filtered.every(t => selectedIds.includes(t.id));
  const toggleAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(prev => prev.filter(id => !filtered.some(t => t.id === id)));
    } else {
      const toAdd = filtered.map(t => t.id).filter(id => !selectedIds.includes(id));
      setSelectedIds(prev => [...prev, ...toAdd]);
    }
  };

  const selectedObjs = selectedIds.map(id => allTests.find(t => t.id === id)).filter(Boolean);
  const candidateCount = batch.candidateCount || 0;
  const totalPermissions = candidateCount * selectedIds.length;

  const submit = async () => {
    if (selectedIds.length === 0) return;
    setSubmitting(true);
    try {
      const r = await api.post(`${apiPrefix}/batches/${batch.id}/assign-tests`, {
        testIds: selectedIds,
        maxAttempts: Number(maxAttempts),
        availableFrom: availableFrom || undefined,
        availableUntil: availableUntil || undefined,
      });
      setResult(r.data);
      toast.success('Tests assigned');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to assign tests');
    } finally {
      setSubmitting(false);
    }
  };

  const doRevoke = async () => {
    if (!confirmRevoke) return;
    setRevokeLoading(true);
    try {
      const r = await api.delete(`${apiPrefix}/batches/${batch.id}/revoke-test`, { data: { testId: confirmRevoke.testId } });
      toast.success(`Revoked (${r.data?.revoked || 0} removed, ${r.data?.skipped || 0} kept)`);
      setConfirmRevoke(null);
      loadAssigned();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Revoke failed');
    } finally {
      setRevokeLoading(false);
    }
  };

  // Shell
  const shellStyle = {
    width: '600px', maxWidth: '95vw', maxHeight: '90vh',
    background: '#1a1a2e',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 0,
    overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'inherit',
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
  };
  const overlayStyle = {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(0,0,0,0.72)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 16,
  };
  const headerStyle = { flexShrink: 0, padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' };
  const bodyScroll = { flex: 1, overflowY: 'auto', padding: '1.5rem' };
  const footerStyle = { flexShrink: 0, padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '12px', justifyContent: 'flex-end' };

  // Success view
  if (result) {
    const statStyle = (color) => ({
      padding: '14px 12px',
      borderRadius: 10,
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${color}55`,
      textAlign: 'center',
    });
    return (
      <div style={overlayStyle} onClick={onClose}>
        <div style={shellStyle} onClick={e => e.stopPropagation()}>
          <div className="modal-body" style={bodyScroll}>
            <div style={{ textAlign: 'center', padding: '18px 0 4px' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(29,158,117,0.12)', border: '1px solid rgba(29,158,117,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Tests Assigned Successfully!</h3>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 6 }}>
                {batch.code} — {batch.name}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 18 }}>
              <div style={statStyle('#1D9E75')}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#1D9E75' }}>{result.totalAssigned}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Permissions Created</div>
              </div>
              <div style={statStyle('#BA7517')}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#BA7517' }}>{result.skipped}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Already Assigned / Skipped</div>
              </div>
              <div style={statStyle('#534AB7')}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#534AB7' }}>{result.totalCandidates}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Candidates Affected</div>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Per-test breakdown
              </div>
              <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden' }}>
                {(result.details || []).map((d, i) => (
                  <div key={d.testId} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px',
                    borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)',
                    fontSize: 13,
                  }}>
                    <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{d.testName}</div>
                    <div style={{ display: 'flex', gap: 14 }}>
                      <span style={{ color: '#1D9E75' }}>+{d.assigned} assigned</span>
                      <span style={{ color: '#BA7517' }}>{d.skipped} skipped</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={footerStyle}>
            <button
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', borderColor: 'transparent' }}
              onClick={() => { onClose(); if (onDone) onDone(); }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main view
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={shellStyle} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Assign Tests to Batch</h3>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>
              {batch.code} — {batch.name} · {candidateCount} candidates
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>&times;</button>
        </div>

        <div className="modal-body" style={bodyScroll}>
          {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Loading…</div> : (
            <>
              {/* Multi-select dropdown */}
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => setDropdownOpen(v => !v)}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    cursor: 'pointer',
                    fontSize: 13,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <span style={{ color: selectedIds.length ? '#fff' : 'rgba(255,255,255,0.5)' }}>
                    {selectedIds.length === 0 ? 'Select tests to assign…' : `${selectedIds.length} test${selectedIds.length === 1 ? '' : 's'} selected`}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>{dropdownOpen ? '▲' : '▼'}</span>
                </div>

                {dropdownOpen && (
                  <div style={{
                    marginTop: 4,
                    background: '#13132b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    overflow: 'hidden',
                  }}>
                    <div style={{ padding: 8, borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                      <input
                        type="text"
                        placeholder="Search tests…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: 8, padding: '8px 10px',
                          color: '#fff', fontSize: 12,
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div className="dropdown-scroll" style={{ maxHeight: '220px', overflowY: 'auto', overflowX: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }} onClick={toggleAll}>
                      <input type="checkbox" checked={allFilteredSelected} onChange={()=>{}} style={{ width: '16px', height: '16px', flexShrink: 0, cursor: 'pointer', accentColor: '#8B5CF6' }} />
                      <span style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.8)' }}>Select All ({filtered.length})</span>
                    </div>

                    {filteredRegular.length > 0 && (
                      <>
                        <div style={{ padding: '8px 16px 4px', fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(255,255,255,0.02)' }}>Regular Tests</div>
                        {filteredRegular.map(t => <TestRow key={t.id} test={t} selected={selectedIds.includes(t.id)} onToggle={() => toggleOne(t.id)} />)}
                      </>
                    )}
                    {filteredPrep.length > 0 && (
                      <>
                        <div style={{ padding: '8px 16px 4px', fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(255,255,255,0.02)' }}>Interview Prep Tests</div>
                        {filteredPrep.map(t => <TestRow key={t.id} test={t} selected={selectedIds.includes(t.id)} onToggle={() => toggleOne(t.id)} />)}
                      </>
                    )}
                    {filtered.length === 0 && (
                      <div style={{ padding: 16, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>No tests found</div>
                    )}
                    </div>
                  </div>
                )}
              </div>

              {/* Selected chips */}
              {selectedObjs.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {selectedObjs.map(t => (
                    <span key={t.id} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: 'rgba(139,92,246,0.18)',
                      border: '1px solid rgba(139,92,246,0.4)',
                      color: '#c4b5fd',
                      borderRadius: 99, padding: '4px 10px', fontSize: 12, fontWeight: 600,
                    }}>
                      {t.name}
                      <button onClick={() => toggleOne(t.id)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontSize: 14, lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                </div>
              )}

              {/* Settings grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '1.5rem' }}>
                <Field label="Max Attempts">
                  <select value={maxAttempts} onChange={e => setMaxAttempts(e.target.value)} style={selectStyle}>
                    {[1,2,3,5,99].map(n => <option key={n} value={n}>{n === 99 ? 'Unlimited (99)' : n}</option>)}
                  </select>
                </Field>
                <Field label="Available From">
                  <input type="datetime-local" value={availableFrom} onChange={e => setAvailableFrom(e.target.value)} style={selectStyle} />
                </Field>
                <Field label="Available Until">
                  <input type="datetime-local" value={availableUntil} onChange={e => setAvailableUntil(e.target.value)} style={selectStyle} />
                </Field>
              </div>

              {/* Preview */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', padding: '1.25rem', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px', marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{candidateCount}</div>
                  <div style={{ fontSize: 11, color: 'rgba(196,181,253,0.8)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Candidates</div>
                </div>
                <div style={{ color: 'rgba(196,181,253,0.5)', fontSize: 16 }}>×</div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{selectedIds.length}</div>
                  <div style={{ fontSize: 11, color: 'rgba(196,181,253,0.8)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Test{selectedIds.length === 1 ? '' : 's'}</div>
                </div>
                <div style={{ color: 'rgba(196,181,253,0.5)', fontSize: 16 }}>=</div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#c4b5fd' }}>{totalPermissions}</div>
                  <div style={{ fontSize: 11, color: 'rgba(196,181,253,0.8)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Permissions</div>
                </div>
              </div>

              {/* Currently Assigned */}
              <div style={{ marginTop: 18, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
                <div
                  onClick={() => setAssignedOpen(v => !v)}
                  style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, fontWeight: 600, background: 'rgba(255,255,255,0.03)' }}
                >
                  <span>Currently Assigned Tests ({assignedTests.length})</span>
                  <span style={{ color: 'rgba(255,255,255,0.45)' }}>{assignedOpen ? '▲' : '▼'}</span>
                </div>
                {assignedOpen && (
                  assignedTests.length === 0 ? (
                    <div style={{ padding: 16, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>No tests assigned to this batch yet.</div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                          <tr style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'left' }}>
                            <th style={thStyle}>Test</th>
                            <th style={thStyle}>Type</th>
                            <th style={thStyle}>Assigned</th>
                            <th style={thStyle}>Completed</th>
                            <th style={thStyle}>Pass Rate</th>
                            <th style={thStyle}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {assignedTests.map(at => {
                            const hasCompleted = (at.candidatesCompleted || 0) > 0;
                            return (
                              <tr key={at.testId} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <td style={tdStyle}>{at.testName}</td>
                                <td style={tdStyle}><TypeBadge type={at.testType} /></td>
                                <td style={tdStyle}>{at.candidatesAssigned}</td>
                                <td style={tdStyle}>{at.candidatesCompleted}</td>
                                <td style={tdStyle}>{at.passRate}%</td>
                                <td style={tdStyle}>
                                  {!hasCompleted && (
                                    <button
                                      onClick={() => setConfirmRevoke(at)}
                                      style={{
                                        background: 'rgba(186,117,23,0.15)',
                                        border: '1px solid rgba(186,117,23,0.45)',
                                        color: '#f59e0b',
                                        borderRadius: 6, padding: '3px 9px', fontSize: 11,
                                        cursor: 'pointer', fontWeight: 600,
                                      }}
                                    >
                                      Revoke
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <button className="btn btn-outline" onClick={onClose} disabled={submitting}>Cancel</button>
          <button
            className="btn btn-primary"
            style={{
              background: selectedIds.length === 0 ? 'rgba(139,92,246,0.3)' : 'linear-gradient(135deg,#7c3aed,#a78bfa)',
              borderColor: 'transparent',
              cursor: selectedIds.length === 0 ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
            disabled={selectedIds.length === 0 || submitting}
            onClick={submit}
          >
            {submitting ? 'Assigning…' : `Assign ${selectedIds.length} Test${selectedIds.length === 1 ? '' : 's'} to ${candidateCount} Candidate${candidateCount === 1 ? '' : 's'}`}
          </button>
        </div>
      </div>

      <ConfirmModal
        open={!!confirmRevoke}
        title="Revoke Test"
        message="Revoke this test from all eligible candidates? Candidates who have already attempted it will keep access."
        itemName={confirmRevoke ? confirmRevoke.testName : ''}
        confirmText="Yes, Revoke"
        confirmColor="#BA7517"
        onCancel={() => !revokeLoading && setConfirmRevoke(null)}
        onConfirm={doRevoke}
        loading={revokeLoading}
      />
    </div>
  );
}

const selectStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  padding: '8px 10px',
  color: '#fff',
  fontSize: 12,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const thStyle = { textAlign: 'left', padding: '8px 12px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', background: 'rgba(255,255,255,0.02)' };
const tdStyle = { padding: '8px 12px', color: 'rgba(255,255,255,0.85)' };

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.55)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</label>
      {children}
    </div>
  );
}

function badgeBg(type) {
  const t = String(type || '').toLowerCase();
  if (t === 'mcq') return '#E6F1FB';
  if (t === 'coding') return '#EEEDFE';
  if (t === 'hybrid') return '#E1F5EE';
  return '#FAEEDA';
}
function badgeFg(type) {
  const t = String(type || '').toLowerCase();
  if (t === 'mcq') return '#185FA5';
  if (t === 'coding') return '#534AB7';
  if (t === 'hybrid') return '#0F6E56';
  return '#854F0B';
}

function TestRow({ test, selected, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '10px 16px', cursor: 'pointer',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: selected ? 'rgba(139,92,246,0.12)' : 'transparent',
        transition: 'background 0.15s',
      }}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={()=>{}}
        style={{ width: '16px', height: '16px', flexShrink: 0, cursor: 'pointer', accentColor: '#8B5CF6' }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: '500', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{test.name}</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
          {String(test.test_type || '').toUpperCase()} · {test.total_questions || 0} questions
        </div>
      </div>
      <span style={{
        flexShrink: 0, fontSize: '11px', fontWeight: '500',
        padding: '3px 10px', borderRadius: '99px',
        background: badgeBg(test.test_type), color: badgeFg(test.test_type),
      }}>
        {String(test.test_type || '').toUpperCase()}
      </span>
    </div>
  );
}

// -----------------------------------------------------------------
// Main BatchesView
// -----------------------------------------------------------------
export default function BatchesView({ apiPrefix = '/super' }) {
  const toast = useToast();
  const role = apiPrefix === '/super' ? 'super_admin' : 'admin';
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', description: '', isActive: true });
  const [saveErr, setSaveErr] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [assignBatch, setAssignBatch] = useState(null);

  const fetchBatches = () => {
    setLoading(true);
    api.get(`${apiPrefix}/batches`)
      .then(r => { setBatches(Array.isArray(r.data) ? r.data : []); setError(''); })
      .catch(e => setError(e.response?.data?.error || 'Failed to load batches'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchBatches(); }, [apiPrefix]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', code: '', description: '', isActive: true });
    setSaveErr('');
    setShowModal(true);
  };
  const openEdit = (b) => {
    setEditing(b);
    setForm({ name: b.name || '', code: b.code || '', description: b.description || '', isActive: !!b.isActive });
    setSaveErr('');
    setShowModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaveErr('');
    try {
      if (editing) {
        await api.put(`${apiPrefix}/batches/${editing.id}`, {
          name: form.name.trim(),
          description: form.description.trim(),
          isActive: form.isActive ? 1 : 0,
        });
        toast.success(`Batch ${editing.code} updated`);
      } else {
        if (!/^[A-Z0-9-]+$/.test(form.code)) { setSaveErr('Code must contain only uppercase letters, numbers, and hyphens'); return; }
        await api.post(`${apiPrefix}/batches`, {
          name: form.name.trim(),
          code: form.code.trim(),
          description: form.description.trim(),
        });
        toast.success(`Batch ${form.code} created`);
      }
      setShowModal(false);
      fetchBatches();
    } catch (err) {
      setSaveErr(err.response?.data?.error || 'Failed to save batch');
    }
  };

  const toggleActive = async (b) => {
    try {
      await api.put(`${apiPrefix}/batches/${b.id}`, { isActive: b.isActive ? 0 : 1 });
      toast.success(`Batch ${b.code} ${b.isActive ? 'deactivated' : 'activated'}`);
      fetchBatches();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to update'); }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`${apiPrefix}/batches/${confirmDelete.id}`);
      toast.success(`Batch ${confirmDelete.code} deleted`);
      setConfirmDelete(null);
      fetchBatches();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete batch');
      setConfirmDelete(null);
    }
  };

  if (loading && batches.length === 0) return <div className="loading">Loading batches...</div>;

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Batches</h1>
          <p className="page-sub">Manage candidate batches and groups</p>
        </div>
        <button
          className="btn btn-primary"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', borderColor: 'transparent' }}
          onClick={openCreate}
        >
          + Create Batch
        </button>
      </div>

      {error && <div className="login-error">{error}</div>}

      <div className="table-container">
        <div className="table-scroll-wrapper" style={{ width:'100%', overflowX:'auto', display:'block' }}>
          <table className="sf-table" style={{ minWidth:'900px', whiteSpace:'nowrap' }}>
            <thead>
              <tr>
                <th>Batch Code</th>
                <th>Batch Name</th>
                <th>Candidates</th>
                <th>Assigned Tests</th>
                <th>Created At</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map(b => {
                const hasCandidates = (b.candidateCount || 0) > 0;
                const atc = b.assignedTestsCount || 0;
                return (
                  <tr key={b.id}>
                    <td><span style={codeBadgeStyle}>{b.code}</span></td>
                    <td style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{b.name}</td>
                    <td><span style={countBadge}>{b.candidateCount || 0}</span></td>
                    <td>
                      {atc > 0
                        ? <span style={assignedBadge(atc)}>{atc} test{atc === 1 ? '' : 's'}</span>
                        : <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>}
                    </td>
                    <td style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{formatDate(b.createdAt)}</td>
                    <td><span style={statusBadge(b.isActive)}>{b.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div className="btn-group">
                        <button
                          className="btn btn-sm"
                          style={{ background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', borderColor: 'transparent', color: '#fff' }}
                          onClick={() => setAssignBatch(b)}
                          disabled={!hasCandidates}
                          title={!hasCandidates ? 'Add candidates to this batch first' : 'Assign tests'}
                        >
                          Assign Tests
                        </button>
                        <button className="btn btn-sm btn-outline" onClick={() => openEdit(b)}>Edit</button>
                        <button className="btn btn-sm btn-outline" onClick={() => toggleActive(b)}>
                          {b.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          disabled={hasCandidates}
                          title={hasCandidates ? 'Remove all candidates first' : ''}
                          style={hasCandidates ? { opacity: 0.45, cursor: 'not-allowed', background: 'rgba(128,128,128,0.15)', borderColor: 'rgba(128,128,128,0.3)' } : {}}
                          onClick={() => !hasCandidates && setConfirmDelete(b)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {batches.length === 0 && (
                <tr>
                  <td colSpan="7" className="table-empty" style={{ textAlign: 'center', padding: '48px 20px', color: 'rgba(255,255,255,0.4)' }}>
                    No batches yet. Click "+ Create Batch" to add your first batch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? `Edit Batch ${editing.code}` : 'Create Batch'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={save} autoComplete="off" style={{ display:'contents' }}>
            <div className="modal-body">
            {saveErr && <div className="login-error" style={{ margin: '0 0 12px' }}>{saveErr}</div>}
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" required value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Q1 2026 Python Cohort" />
              </div>
              <div className="form-group">
                <label className="form-label">Code {editing && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>(cannot be changed)</span>}</label>
                <input className="form-input" required value={form.code}
                  disabled={!!editing}
                  style={{ fontFamily: 'monospace', letterSpacing: '0.04em', opacity: editing ? 0.5 : 1 }}
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="Q1-2026-PY" />
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                  Uppercase letters, numbers, and hyphens only.
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description" />
              </div>
              {editing && (
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                    <input type="checkbox" checked={form.isActive}
                      onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                    Active
                  </label>
                </div>
              )}
            </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', borderColor: 'transparent' }}>
                  {editing ? 'Save Changes' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assignBatch && (
        <AssignTestsModal
          batch={assignBatch}
          apiPrefix={apiPrefix}
          role={role}
          onClose={() => setAssignBatch(null)}
          onDone={() => { setAssignBatch(null); fetchBatches(); }}
        />
      )}

      <ConfirmModal
        open={!!confirmDelete}
        title="Delete Batch"
        message="Are you sure you want to delete this batch? This action cannot be undone."
        itemName={confirmDelete ? `${confirmDelete.code} · ${confirmDelete.name}` : ''}
        confirmText="Yes, Delete Batch"
        confirmColor="#E24B4A"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={doDelete}
      />
    </div>
  );
}
