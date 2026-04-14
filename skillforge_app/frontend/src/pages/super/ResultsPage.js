import { useState, useEffect } from 'react';
import api from '../../api';
import { useToast } from '../../context/ToastContext';
import { formatIST, nowLocalIso } from '../../utils/dateUtils';
import { fetchTestsForDropdown } from '../../utils/testDropdown';

const fmtDateTime = formatIST;

const GRADE_COLOR = {
  'A+': '#a78bfa', A: '#34d399', B: '#60a5fa', C: '#fbbf24', D: '#fb923c', F: '#f87171',
};
const gradeBadgeStyle = (grade) => {
  const c = GRADE_COLOR[grade] || '#64748b';
  return { padding: '3px 10px', borderRadius: 20, background: c + '22', color: c, fontSize: 12, fontWeight: 700 };
};

const csvEscape = (v) => {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export default function ResultsPage() {
  const [results, setResults] = useState([]);
  const [filterTest, setFilterTest] = useState('');
  const [filterPass, setFilterPass] = useState('');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const [qaStats, setQaStats] = useState(null);
  const [qaLoading, setQaLoading] = useState(false);
  const [qaTestId, setQaTestId] = useState('');
  const [showQA, setShowQA] = useState(false);
  const [tests, setTests] = useState([]);
  const [testsGrouped, setTestsGrouped] = useState({ regular: [], interviewPrep: [] });
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    api.get('/super/tests').then(r => setTests(r.data.tests || [])).catch(() => {});
    fetchTestsForDropdown('super_admin').then(setTestsGrouped);
  }, []);

  const loadQA = async (testId) => {
    setQaLoading(true);
    try {
      const { data } = await api.get('/super/results/question-analytics', { params: testId ? { testId } : {} });
      setQaStats(data.stats || []);
    } catch { toast.error('Failed to load question analytics'); }
    finally { setQaLoading(false); }
  };

  useEffect(() => {
    api.get('/super/results')
      .then(r => setResults(r.data.results || r.data))
      .catch(e => setError(e.response?.data?.error || 'Failed to load results'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = results.filter(r => {
    if (filterTest && r.test_id !== filterTest) return false;
    if (filterPass === 'pass' && !r.passed) return false;
    if (filterPass === 'fail' && r.passed) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!(r.candidate_name||r.name||'').toLowerCase().includes(q) &&
          !(r.candidate_email||r.email||'').toLowerCase().includes(q) &&
          !(r.test_name||'').toLowerCase().includes(q)) return false;
    }
    return true;
  }).slice().sort((a, b) => {
    const ta = new Date(b.end_time || b.completed_at || b.start_time || 0).getTime() -
               new Date(a.end_time || a.completed_at || a.start_time || 0).getTime();
    return ta;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pagedIds = pagedRows.map(r => r.session_id || r.id);
  const allOnPageSelected = pagedIds.length > 0 && pagedIds.every(id => selectedIds.has(id));

  const toggleSelect = (id) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const togglePageAll = () => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      if (allOnPageSelected) pagedIds.forEach(id => n.delete(id));
      else pagedIds.forEach(id => n.add(id));
      return n;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());

  const exportRows = (rows) => {
    const header = ['Candidate Name','Email','Test Name','Score','Total Questions','Percentage (%)','Grade','Result','Time Taken','Started At','Submitted At','Tab Violations'];
    const lines = rows.map(r => [
      r.candidate_name || r.name || '',
      r.candidate_email || r.email || '',
      r.test_name || '',
      r.score ?? '',
      r.total_questions ?? r.total ?? '',
      r.percentage ?? '',
      r.grade || '',
      r.passed ? 'Pass' : 'Fail',
      r.time_taken ? `${Math.round(r.time_taken / 60)}m` : '',
      fmtDateTime(r.start_time),
      fmtDateTime(r.end_time || r.completed_at),
      r.tab_violations ?? 0,
    ].map(csvEscape).join(','));
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    a.href = url;
    a.download = `skillforge_results_${pad(d.getDate())}-${pad(d.getMonth()+1)}-${d.getFullYear()}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportSelected = () => {
    const rows = filtered.filter(r => selectedIds.has(r.session_id || r.id));
    exportRows(rows);
  };

  const viewDetail = async (result) => {
    try {
      const { data } = await api.get(`/super/results/${result.session_id || result.id}`);
      setDetail(data);
    } catch {
      setDetail({ ...result, questions: [] });
    }
  };

  if (loading) return <div className="loading">Loading results...</div>;

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Results</h1>
          <p className="page-sub">View all test submissions and scores</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={() => { setShowQA(true); setQaStats(null); loadQA(qaTestId); }} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Q Analytics
          </button>
          <button className="btn btn-outline" onClick={exportSelected} disabled={selectedIds.size === 0} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: selectedIds.size === 0 ? 0.4 : 1 }}>
            Export Selected ({selectedIds.size})
          </button>
          <button className="btn btn-outline" onClick={() => exportRows(filtered)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export All
          </button>
        </div>
      </div>

      {error && <div className="login-error">{error}</div>}

      <div className="table-container">
        <div className="table-toolbar">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Search by candidate name or email</label>
              <div className="search-input-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input className="search-input" placeholder="Search by candidate name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{width:240}}/>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Filter by test</label>
              <select className="form-select" value={filterTest} onChange={e => { setFilterTest(e.target.value); setPage(1); }}>
                <option value="">All Tests</option>
                {testsGrouped.regular?.length > 0 && (
                  <optgroup label="Regular Tests">
                    {testsGrouped.regular.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </optgroup>
                )}
                {testsGrouped.interviewPrep?.length > 0 && (
                  <optgroup label="Interview Prep Tests">
                    {testsGrouped.interviewPrep.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </optgroup>
                )}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Filter by status</label>
              <select className="form-select" value={filterPass} onChange={e => setFilterPass(e.target.value)}>
                <option value="">All Results</option>
                <option value="pass">Pass Only</option>
                <option value="fail">Fail Only</option>
              </select>
            </div>
            <span style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>
              {filtered.length === 0 ? '0 results' : `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filtered.length)} of ${filtered.length} results`}
              {selectedIds.size > 0 && <span style={{ marginLeft: 10, color: '#a78bfa' }}>· {selectedIds.size} selected <button onClick={clearSelection} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', textDecoration: 'underline', fontSize: 12 }}>clear</button></span>}
            </span>
          </div>
        </div>

        <div className="table-scroll-wrapper" style={{ width:'100%', overflowX:'auto', display:'block' }}>
        <table className="sf-table" style={{ minWidth:'1000px', whiteSpace:'nowrap' }}>
          <thead>
            <tr>
              <th style={{ width: 36 }}><input type="checkbox" checked={allOnPageSelected} onChange={togglePageAll} /></th>
              <th>Candidate</th>
              <th>Test</th>
              <th>Score</th>
              <th>%</th>
              <th>Grade</th>
              <th>Result</th>
              <th>Time</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((r, i) => {
              const rid = r.session_id || r.id;
              return (
              <tr key={rid || i}>
                <td><input type="checkbox" checked={selectedIds.has(rid)} onChange={() => toggleSelect(rid)} /></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                      {(r.candidate_name || r.name || '?')[0].toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 500, color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>{r.candidate_name || r.name}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{r.candidate_email || r.email}</div>
                    </div>
                  </div>
                </td>
                <td>{r.test_name}</td>
                <td><span style={{ fontFamily: 'monospace', fontSize: 13 }}>{r.score ?? '-'}/{r.total_questions ?? r.total ?? '-'}</span></td>
                <td><span style={{ fontFamily: 'monospace', fontSize: 13 }}>{r.percentage != null ? `${r.percentage}%` : '-'}</span></td>
                <td>{r.grade ? <span style={gradeBadgeStyle(r.grade)}>{r.grade}</span> : <span style={{ color: 'rgba(255,255,255,0.35)' }}>-</span>}</td>
                <td>
                  <span style={r.passed
                    ? { background: '#EAF3DE', color: '#3B6D11', padding: '2px 12px', borderRadius: 99, fontWeight: 500, fontSize: 12 }
                    : { background: '#FCEBEB', color: '#A32D2D', padding: '2px 12px', borderRadius: 99, fontWeight: 500, fontSize: 12 }}>
                    {r.passed ? 'Pass' : 'Fail'}
                  </span>
                </td>
                <td><span style={{ fontFamily: 'monospace', fontSize: 13 }}>{r.time_taken ? `${Math.round(r.time_taken / 60)}m` : '-'}</span></td>
                <td><span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{fmtDateTime(r.end_time || r.completed_at || r.start_time)}</span></td>
                <td>
                  <button className="btn btn-sm btn-outline" onClick={() => viewDetail(r)}>View Details</button>
                </td>
              </tr>
            );})}
            {filtered.length === 0 && (
              <tr><td colSpan="10" className="table-empty">No results found</td></tr>
            )}
          </tbody>
        </table>
        </div>
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button className="btn btn-sm btn-outline" disabled={currentPage <= 1} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', alignSelf: 'center' }}>Page {currentPage} of {totalPages}</span>
            <button className="btn btn-sm btn-outline" disabled={currentPage >= totalPages} onClick={() => setPage(p => p + 1)}>Next ›</button>
          </div>
        )}
      </div>

      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 800, maxHeight: '85vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h3 className="modal-title">Session Detail</h3>
              <button className="modal-close" onClick={() => setDetail(null)}>&times;</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>Score</div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.9)' }}>{detail.score ?? '-'}/{detail.total_questions ?? detail.total ?? '-'}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>Percentage</div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.9)' }}>{detail.percentage ?? '-'}%</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>Grade</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{detail.grade || '-'}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Started At</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.75)' }}>{fmtDateTime(detail.start_time)}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Completed At</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.75)' }}>{fmtDateTime(detail.end_time || detail.completed_at)}</div>
              </div>
            </div>

            {(detail.subjects || detail.breakdown || []).length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subject Breakdown</h4>
                {(detail.subjects || detail.breakdown || []).map((s, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{s.subject || s.name}</span>
                      <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>{s.correct ?? 0}/{s.total ?? 0}</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${s.total ? (s.correct / s.total) * 100 : 0}%`, background: '#10b981', borderRadius: 3, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(detail.questions || []).length > 0 && (
              <div>
                <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Question Review</h4>
                {(detail.questions || []).map((q, i) => (
                  <div key={i} style={{ padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Q{q.displayId || i + 1}</span>
                      {q.difficulty && <span className={`badge badge-${(q.difficulty || '').toLowerCase()}`}>{q.difficulty}</span>}
                      <span className={`badge ${(q.isCorrect || q.is_correct) ? 'badge-success' : 'badge-danger'}`}>
                        {(q.isCorrect || q.is_correct) ? 'Correct' : q.userAnswer == null && q.selected_option == null ? 'Skipped' : 'Wrong'}
                      </span>
                    </div>
                    {q.code_snippet && (
                      <pre style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 6, fontSize: 12, fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)', overflowX: 'auto', margin: '0 0 10px', whiteSpace: 'pre-wrap' }}>{q.code_snippet}</pre>
                    )}
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 10, lineHeight: 1.5 }}>{q.question || q.question_text || q.text}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {(q.options || []).map((opt, oi) => {
                        const correct = q.correctAnswer ?? q.correct_answer ?? q.answer_index;
                        const selected = q.userAnswer ?? q.selected_option;
                        let bg = 'rgba(255,255,255,0.02)';
                        let border = 'rgba(255,255,255,0.06)';
                        if (oi === correct) { bg = 'rgba(16,185,129,0.08)'; border = 'rgba(16,185,129,0.3)'; }
                        if (oi === selected && oi !== correct) { bg = 'rgba(239,68,68,0.08)'; border = 'rgba(239,68,68,0.3)'; }
                        return (
                          <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: bg, border: `1px solid ${border}`, borderRadius: 6, fontSize: 13 }}>
                            <span style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>{String.fromCharCode(65 + oi)}</span>
                            <span style={{ color: 'rgba(255,255,255,0.75)' }}>{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Question Analytics Modal */}
      {showQA && (
        <div className="modal-overlay" onClick={() => setShowQA(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 760, maxHeight: '85vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h3 className="modal-title">📊 Question-Level Analytics</h3>
              <button className="modal-close" onClick={() => setShowQA(false)}>&times;</button>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
              <select className="form-select" value={qaTestId} onChange={e => { setQaTestId(e.target.value); loadQA(e.target.value); }}>
                <option value="">All Tests</option>
                {tests.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{qaStats ? `${qaStats.length} questions` : ''}</span>
            </div>
            {qaLoading && <div style={{ textAlign: 'center', padding: 32, color: 'rgba(255,255,255,0.4)' }}>Loading analytics...</div>}
            {!qaLoading && qaStats && qaStats.length === 0 && (
              <div style={{ textAlign: 'center', padding: 32, color: 'rgba(255,255,255,0.3)' }}>No completed sessions found for this test.</div>
            )}
            {!qaLoading && qaStats && qaStats.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', gap: 8, padding: '6px 10px', fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <span>Question</span><span style={{ textAlign: 'right' }}>Attempts</span><span style={{ textAlign: 'right', color: '#34d399' }}>Correct</span><span style={{ textAlign: 'right', color: '#f87171' }}>Wrong</span><span style={{ textAlign: 'right' }}>Accuracy</span>
                </div>
                {qaStats.map((s, i) => (
                  <div key={s.id || i} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.question}>{s.question}</span>
                      <span style={{ fontSize: 13, fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)', textAlign: 'right' }}>{s.attempts}</span>
                      <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#34d399', textAlign: 'right' }}>{s.correct}</span>
                      <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#f87171', textAlign: 'right' }}>{s.wrong}</span>
                      <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: s.accuracy >= 70 ? '#34d399' : s.accuracy >= 40 ? '#fbbf24' : '#f87171', textAlign: 'right' }}>{s.accuracy}%</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${s.accuracy}%`, background: s.accuracy >= 70 ? '#10b981' : s.accuracy >= 40 ? '#f59e0b' : '#ef4444', borderRadius: 2, transition: 'width 0.5s' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                      {s.subject && <span>{s.subject}</span>}
                      {s.difficulty && <span>{s.difficulty}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
