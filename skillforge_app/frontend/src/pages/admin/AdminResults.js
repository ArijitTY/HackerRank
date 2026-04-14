import { useState, useEffect } from 'react';
import api from '../../api';
import { useToast } from '../../context/ToastContext';

function fmtDateTime(raw) {
  if (!raw) return '-';
  const d = new Date(raw.includes('Z') || raw.includes('+') ? raw : raw + 'Z');
  if (isNaN(d)) return '-';
  return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [filterTest, setFilterTest] = useState('');
  const [filterPass, setFilterPass] = useState('');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    api.get('/admin/results')
      .then(r => setResults(r.data.results || r.data))
      .catch(e => setError(e.response?.data?.error || 'Failed to load results'))
      .finally(() => setLoading(false));
  }, []);

  const testNames = [...new Set(results.map(r => r.test_name).filter(Boolean))];

  const filtered = results.filter(r => {
    if (filterTest && r.test_name !== filterTest) return false;
    if (filterPass === 'pass' && !r.passed) return false;
    if (filterPass === 'fail' && r.passed) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!(r.candidate_name||r.name||'').toLowerCase().includes(q) && !(r.test_name||'').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleExport = () => {
    const token = localStorage.getItem('sf_token');
    fetch('/api/admin/results/export', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `skillforge_results_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
      .catch(() => toast.error('Export failed. Please try again.'));
  };

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
        <button className="btn btn-outline" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export CSV
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-container">
        <div className="table-toolbar filter-toolbar">
          <div className="search-input-wrap">
            <span className="search-icon">&#128269;</span>
            <input className="form-input search-input" placeholder="Search candidate or test..." value={search} onChange={e => setSearch(e.target.value)} style={{width:200}}/>
          </div>
          <select className="form-select" value={filterTest} onChange={e => setFilterTest(e.target.value)}>
            <option value="">All Tests</option>
            {testNames.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="form-select" value={filterPass} onChange={e => setFilterPass(e.target.value)}>
            <option value="">All Results</option>
            <option value="pass">Pass Only</option>
            <option value="fail">Fail Only</option>
          </select>
          <div className="table-count">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</div>
        </div>

        <table className="sf-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Test</th>
              <th>Started</th>
              <th>Completed</th>
              <th>Score</th>
              <th>%</th>
              <th>Grade</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.session_id || r.id || i}>
                <td>
                  <div className="user-cell">
                    <div className="avatar-sm">{((r.candidate_name || r.name || '?')[0]).toUpperCase()}</div>
                    <span>{r.candidate_name || r.name}</span>
                  </div>
                </td>
                <td><span className="text-dim">{r.test_name}</span></td>
                <td><span className="text-dim" style={{ fontSize: 12 }}>{fmtDateTime(r.start_time)}</span></td>
                <td><span className="text-dim" style={{ fontSize: 12 }}>{fmtDateTime(r.end_time || r.completed_at)}</span></td>
                <td><strong>{r.score ?? '-'}</strong><span className="text-dim">/{r.total_questions ?? r.total ?? '-'}</span></td>
                <td>
                  <span className={`percentage-pill ${r.passed ? 'pass' : 'fail'}`}>
                    {r.percentage != null ? `${r.percentage}%` : '-'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${r.passed ? 'badge-success' : 'badge-danger'}`}>
                    {r.grade || (r.passed ? 'Pass' : 'Fail')}
                  </span>
                </td>
                <td className="text-dim">{r.time_taken ? `${Math.round(r.time_taken / 60)}m` : '-'}</td>
                <td>
                  <button className="btn btn-sm btn-outline" onClick={() => viewDetail(r)}>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="9" className="empty-table-cell">
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
