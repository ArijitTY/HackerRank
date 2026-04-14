import { useState, useEffect } from 'react';
import api from '../../api';
import { useToast } from '../../context/ToastContext';

function fmtDateTime(raw) {
  if (!raw) return '-';
  const d = new Date(raw.includes('Z') || raw.includes('+') ? raw : raw + 'Z');
  if (isNaN(d)) return '-';
  return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

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

  useEffect(() => {
    api.get('/super/tests').then(r => setTests(r.data.tests || [])).catch(() => {});
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
    const a = document.createElement('a');
    a.href = `/api/super/results/export`;
    a.setAttribute('download', '');
    // Use fetch to get with auth header
    fetch('/api/super/results/export', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
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
          <button className="btn btn-outline" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
        </div>
      </div>

      {error && <div className="login-error">{error}</div>}

      <div className="table-container">
        <div className="table-toolbar">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-input-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input className="search-input" placeholder="Search candidate or test..." value={search} onChange={e => setSearch(e.target.value)} style={{width:200}}/>
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
            <span style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>{filtered.length} result{filtered.length!==1?'s':''}</span>
          </div>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                      {(r.candidate_name || r.name || '?')[0].toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500, color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>{r.candidate_name || r.name}</span>
                  </div>
                </td>
                <td>{r.test_name}</td>
                <td><span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{fmtDateTime(r.start_time)}</span></td>
                <td><span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{fmtDateTime(r.end_time || r.completed_at)}</span></td>
                <td><span style={{ fontFamily: 'monospace', fontSize: 13 }}>{r.score ?? '-'}/{r.total_questions ?? r.total ?? '-'}</span></td>
                <td><span style={{ fontFamily: 'monospace', fontSize: 13 }}>{r.percentage != null ? `${r.percentage}%` : '-'}</span></td>
                <td>
                  <span className={`badge ${r.passed ? 'badge-success' : 'badge-danger'}`}>
                    {r.grade || (r.passed ? 'Pass' : 'Fail')}
                  </span>
                </td>
                <td><span style={{ fontFamily: 'monospace', fontSize: 13 }}>{r.time_taken ? `${Math.round(r.time_taken / 60)}m` : '-'}</span></td>
                <td>
                  <button className="btn btn-sm btn-outline" onClick={() => viewDetail(r)}>View Details</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="9" className="table-empty">No results found</td></tr>
            )}
          </tbody>
        </table>
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
