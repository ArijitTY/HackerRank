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

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [tests, setTests] = useState([]);
  const [testsGrouped, setTestsGrouped] = useState({ regular: [], interviewPrep: [] });
  const [filterTest, setFilterTest] = useState('');
  const [filterPass, setFilterPass] = useState('');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [page, setPage] = useState(1);
  const pageSize = 20;
  // eslint-disable-next-line no-unused-vars
  const toast = useToast();

  useEffect(() => {
    api.get('/admin/results')
      .then(r => setResults(r.data.results || r.data))
      .catch(e => setError(e.response?.data?.error || 'Failed to load results'))
      .finally(() => setLoading(false));
    api.get('/admin/tests').then(r => setTests(r.data.tests || [])).catch(() => {});
    fetchTestsForDropdown('admin').then(setTestsGrouped);
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
  }).slice().sort((a, b) =>
    new Date(b.end_time || b.completed_at || b.start_time || 0).getTime() -
    new Date(a.end_time || a.completed_at || a.start_time || 0).getTime()
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pagedIds = pagedRows.map(r => r.session_id || r.id);
  const allOnPageSelected = pagedIds.length > 0 && pagedIds.every(id => selectedIds.has(id));

  const toggleSelect = (id) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const togglePageAll = () => setSelectedIds(prev => {
    const n = new Set(prev);
    if (allOnPageSelected) pagedIds.forEach(id => n.delete(id));
    else pagedIds.forEach(id => n.add(id));
    return n;
  });
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
  const exportSelected = () => exportRows(filtered.filter(r => selectedIds.has(r.session_id || r.id)));

  const viewDetail = async (result) => {
    try {
      const { data } = await api.get(`/admin/results/${result.session_id || result.id}`);
      setDetail(data);
    } catch {
      setDetail({ ...result, questions: [] });
    }
  };

  if (loading) return <div className="loading">Loading results...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Results</h1>
          <p className="page-sub">View and analyze candidate test results</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={exportSelected} disabled={selectedIds.size === 0} style={{ opacity: selectedIds.size === 0 ? 0.4 : 1 }}>
            Export Selected ({selectedIds.size})
          </button>
          <button className="btn btn-outline" onClick={() => exportRows(filtered)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export All
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-container">
        <div className="table-toolbar filter-toolbar" style={{ alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Search by candidate name or email</label>
            <div className="search-input-wrap">
              <span className="search-icon">&#128269;</span>
              <input className="form-input search-input" placeholder="Search by candidate name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{width:240}}/>
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
            <select className="form-select" value={filterPass} onChange={e => { setFilterPass(e.target.value); setPage(1); }}>
              <option value="">All Results</option>
              <option value="pass">Pass Only</option>
              <option value="fail">Fail Only</option>
            </select>
          </div>
          <div className="table-count">
            {filtered.length === 0 ? '0 results' : `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filtered.length)} of ${filtered.length}`}
            {selectedIds.size > 0 && <span style={{ marginLeft: 10, color: '#a78bfa' }}>· {selectedIds.size} selected <button onClick={clearSelection} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', textDecoration: 'underline', fontSize: 12 }}>clear</button></span>}
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
                  <div className="user-cell">
                    <div className="avatar-sm">{((r.candidate_name || r.name || '?')[0]).toUpperCase()}</div>
                    <div>
                      <div>{r.candidate_name || r.name}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{r.candidate_email || r.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className="text-dim">{r.test_name}</span></td>
                <td><strong>{r.score ?? '-'}</strong><span className="text-dim">/{r.total_questions ?? r.total ?? '-'}</span></td>
                <td>
                  <span className={`percentage-pill ${r.passed ? 'pass' : 'fail'}`}>
                    {r.percentage != null ? `${r.percentage}%` : '-'}
                  </span>
                </td>
                <td>{r.grade ? <span style={gradeBadgeStyle(r.grade)}>{r.grade}</span> : <span className="text-dim">-</span>}</td>
                <td>
                  <span style={r.passed
                    ? { background: '#EAF3DE', color: '#3B6D11', padding: '2px 12px', borderRadius: 99, fontWeight: 500, fontSize: 12 }
                    : { background: '#FCEBEB', color: '#A32D2D', padding: '2px 12px', borderRadius: 99, fontWeight: 500, fontSize: 12 }}>
                    {r.passed ? 'Pass' : 'Fail'}
                  </span>
                </td>
                <td className="text-dim">{r.time_taken ? `${Math.round(r.time_taken / 60)}m` : '-'}</td>
                <td><span className="text-dim" style={{ fontSize: 12 }}>{fmtDateTime(r.end_time || r.completed_at || r.start_time)}</span></td>
                <td>
                  <button className="btn btn-sm btn-outline" onClick={() => viewDetail(r)}>View Details</button>
                </td>
              </tr>
            );})}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="10" className="empty-table-cell">
                  <div className="empty-state">
                    <span className="empty-icon">📊</span>
                    <p>No results found</p>
                  </div>
                </td>
              </tr>
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

      {/* Detail Modal */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal-content modal-xl glass-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Session Detail</h3>
              <button className="modal-close" onClick={() => setDetail(null)}>&times;</button>
            </div>

            <div className="detail-summary">
              <div className="detail-stat">
                <span className="detail-stat-label">Score</span>
                <span className="detail-stat-value">{detail.score ?? '-'}/{detail.total_questions ?? detail.total ?? '-'}</span>
              </div>
              <div className="detail-stat">
                <span className="detail-stat-label">Percentage</span>
                <span className="detail-stat-value">{detail.percentage ?? '-'}%</span>
              </div>
              <div className="detail-stat">
                <span className="detail-stat-label">Grade</span>
                <span className={`badge ${detail.passed ? 'badge-success' : 'badge-danger'}`}>{detail.grade || '-'}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Started At</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.75)' }}>{fmtDateTime(detail.start_time)}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Completed At</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.75)' }}>{fmtDateTime(detail.end_time || detail.completed_at)}</div>
              </div>
            </div>

            {(detail.subjects || detail.breakdown || []).length > 0 && (
              <div className="subject-breakdown">
                {(detail.subjects || detail.breakdown || []).map((s, i) => (
                  <div key={i} className="subject-bar">
                    <div className="subject-bar-header">
                      <span className="label">{s.subject || s.name}</span>
                      <span className="value">{s.correct ?? 0}/{s.total ?? 0}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill green" style={{ width: `${s.total ? (s.correct / s.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="questions-review">
              {(detail.questions || []).map((q, i) => (
                <div key={i} className="question-card">
                  <div className="question-header">
                    <span className="question-num">Q{q.displayId || i + 1}</span>
                    <span className={`badge badge-${(q.difficulty || '').toLowerCase()}`}>{q.difficulty}</span>
                    <span className={`badge ${(q.isCorrect || q.is_correct) ? 'badge-success' : 'badge-danger'}`}>
                      {(q.isCorrect || q.is_correct) ? 'Correct' : q.userAnswer == null && q.selected_option == null ? 'Skipped' : 'Wrong'}
                    </span>
                  </div>
                  <div className="question-text">{q.question || q.question_text || q.text}</div>
                  {q.code_snippet && <div className="code-block">{q.code_snippet}</div>}
                  <div className="option-list">
                    {(q.options || []).map((opt, oi) => {
                      const correct = q.correctAnswer ?? q.correct_answer ?? q.answer_index;
                      const selected = q.userAnswer ?? q.selected_option;
                      let cls = 'option-item';
                      if (oi === correct) cls += ' correct';
                      if (oi === selected) cls += ' user-selected';
                      if (oi === selected && oi !== correct) cls += ' wrong';
                      return (
                        <div key={oi} className={cls}>
                          <span className="opt-label">{String.fromCharCode(65 + oi)}</span>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
