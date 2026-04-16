import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api';
import { formatDateTime, parseStamp } from '../../utils/dateUtils';
import { fetchTestsForDropdown } from '../../utils/testDropdown';
import { fetchSessions } from '../../utils/sessions';

const GRADE_COLOR = {
  'A+': '#a78bfa', A: '#34d399', B: '#60a5fa', C: '#facc15', D: '#fb923c', F: '#f87171',
};
const computeGrade = (p) => {
  if (p >= 90) return 'A+';
  if (p >= 80) return 'A';
  if (p >= 70) return 'B';
  if (p >= 60) return 'C';
  if (p >= 50) return 'D';
  return 'F';
};
const gradeBadgeStyle = (grade) => {
  const c = GRADE_COLOR[grade] || '#64748b';
  return { padding: '3px 10px', borderRadius: 20, background: c + '22', color: c, fontSize: 12, fontWeight: 700, display: 'inline-block' };
};
const passBadge = (passed) => ({
  background: passed ? '#EAF3DE' : '#FCEBEB',
  color: passed ? '#3B6D11' : '#A32D2D',
  padding: '2px 12px', borderRadius: 99, fontWeight: 500, fontSize: 12, display: 'inline-block',
});
const csvEscape = (v) => {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const formatTimeTaken = (secs) => {
  if (secs == null || isNaN(secs)) return '-';
  let s = Math.floor(Number(secs));
  if (s > 86400) s = Math.floor(s / 1000);
  if (s <= 0 || s > 86400) return '-';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const pad = (x) => String(x).padStart(2, '0');
  if (h > 0) return `${h}h ${pad(m)}m`;
  if (m > 0) return `${m}m ${pad(r)}s`;
  return `${r}s`;
};
const computeTimeSeconds = (r) => {
  if (r.time_taken_seconds != null && r.time_taken_seconds > 0) return r.time_taken_seconds;
  if (r.time_taken != null && r.time_taken > 0) return r.time_taken;
  const start = parseStamp(r.start_time || r.started_at);
  const end = parseStamp(r.end_time || r.submitted_at || r.completed_at);
  if (start && end) return Math.round((end - start) / 1000);
  return null;
};
const TD = { padding: '12px 16px', verticalAlign: 'middle', borderBottom: '0.5px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap' };
const LABEL = { display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 };

export default function ResultsView({ apiPrefix = '/super' }) {
  const [results, setResults] = useState([]);
  const [testsGrouped, setTestsGrouped] = useState({ regular: [], interviewPrep: [] });
  const [testsFlat, setTestsFlat] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [filterBatch, setFilterBatch] = useState('');
  const [filterSession, setFilterSession] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null);

  // filters
  const [search, setSearch] = useState('');
  const [filterTest, setFilterTest] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // sorting
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // selection + pagination
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    const role = apiPrefix === '/super' ? 'super_admin' : 'admin';
    fetchTestsForDropdown(role).then((g) => {
      setTestsGrouped(g || { regular: [], interviewPrep: [] });
      const flat = [...(g?.regular || []), ...(g?.interviewPrep || [])];
      setTestsFlat(flat);
    });
    api.get(`${apiPrefix}/batches`).then((r) => setBatches(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    fetchSessions(apiPrefix).then((s) => setSessions(s));
  }, [apiPrefix]);

  // Pre-apply sessionId from query string on mount
  useEffect(() => {
    const sid = searchParams.get('sessionId');
    if (sid) setFilterSession(sid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filterBatch) params.batchId = filterBatch;
    if (filterSession) params.sessionId = filterSession;
    api.get(`${apiPrefix}/results`, { params })
      .then((r) => setResults(Array.isArray(r.data) ? r.data : (r.data.results || [])))
      .catch((e) => setError(e.response?.data?.error || 'Failed to load results'))
      .finally(() => setLoading(false));
  }, [apiPrefix, filterBatch, filterSession]);

  const selectedTest = useMemo(() => testsFlat.find((t) => String(t.id) === String(filterTest)), [testsFlat, filterTest]);

  // filter
  const filtered = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo + 'T23:59:59') : null;
    const q = search.trim().toLowerCase();
    return results.filter((r) => {
      if (filterTest && String(r.test_id) !== String(filterTest)) return false;
      if (filterBatch && String(r.batch_id || '') !== String(filterBatch)) return false;
      if (filterSession && String(r.drive_session_id || r.session_id_ref || '') !== String(filterSession)) return false;
      if (filterStatus === 'pass' && !r.passed) return false;
      if (filterStatus === 'fail' && r.passed) return false;
      if (q) {
        const name = (r.candidate_name || r.name || '').toLowerCase();
        const email = (r.candidate_email || r.email || '').toLowerCase();
        if (!name.includes(q) && !email.includes(q)) return false;
      }
      const d = parseStamp(r.submitted_at || r.end_time || r.completed_at || r.start_time);
      if (from && d && d < from) return false;
      if (to && d && d > to) return false;
      return true;
    });
  }, [results, filterTest, filterBatch, filterSession, filterStatus, search, dateFrom, dateTo]);

  // ranking (always by percentage desc, separate pass)
  const ranked = useMemo(() => {
    const withRank = filtered
      .slice()
      .sort((a, b) => (Number(b.percentage) || 0) - (Number(a.percentage) || 0))
      .map((r, i) => ({ ...r, _rank: i + 1 }));
    const byId = new Map(withRank.map((r) => [r.session_id || r.id, r._rank]));
    return filtered.map((r) => ({ ...r, _rank: byId.get(r.session_id || r.id) }));
  }, [filtered]);

  // sort
  const sorted = useMemo(() => {
    const arr = ranked.slice();
    const dir = sortOrder === 'asc' ? 1 : -1;
    const getVal = (r) => {
      switch (sortBy) {
        case 'rank': return r._rank || 0;
        case 'candidate': return (r.candidate_name || r.name || '').toLowerCase();
        case 'email': return (r.candidate_email || r.email || '').toLowerCase();
        case 'test': return (r.test_name || '').toLowerCase();
        case 'score': return Number(r.score) || 0;
        case 'total': return Number(r.total_questions || r.total) || 0;
        case 'percentage': return Number(r.percentage) || 0;
        case 'result': return r.passed ? 1 : 0;
        case 'time': return computeTimeSeconds(r) || 0;
        case 'date':
        default: {
          const d = parseStamp(r.submitted_at || r.end_time || r.completed_at || r.start_time);
          return d ? d.getTime() : 0;
        }
      }
    };
    arr.sort((a, b) => {
      const va = getVal(a);
      const vb = getVal(b);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return arr;
  }, [ranked, sortBy, sortOrder]);

  // stats
  const stats = useMemo(() => {
    const total = filtered.length;
    const passed = filtered.filter((r) => r.passed).length;
    const failed = total - passed;
    const avg = total ? Math.round(filtered.reduce((s, r) => s + (Number(r.percentage) || 0), 0) / total) : 0;
    return { total, passed, failed, avg };
  }, [filtered]);

  const gradeDist = useMemo(() => {
    const dist = { 'A+': 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
    filtered.forEach((r) => {
      const g = r.grade || computeGrade(Number(r.percentage) || 0);
      if (dist[g] != null) dist[g]++;
    });
    return dist;
  }, [filtered]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pagedIds = pagedRows.map((r) => r.session_id || r.id);
  const allOnPageSelected = pagedIds.length > 0 && pagedIds.every((id) => selected.has(id));
  const someOnPageSelected = pagedIds.some((id) => selected.has(id)) && !allOnPageSelected;

  const toggleOne = (id) => setSelected((prev) => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
  const togglePageAll = () => setSelected((prev) => {
    const n = new Set(prev);
    if (allOnPageSelected) pagedIds.forEach((id) => n.delete(id));
    else pagedIds.forEach((id) => n.add(id));
    return n;
  });

  const toggleSort = (key) => {
    if (sortBy === key) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(key); setSortOrder(key === 'date' ? 'desc' : 'asc'); }
  };
  const sortInd = (key) => sortBy === key ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : '';

  const clearFilters = () => {
    setSearch(''); setFilterTest(''); setFilterBatch(''); setFilterSession(''); setFilterStatus('');
    setDateFrom(''); setDateTo(''); setPage(1);
    if (searchParams.get('sessionId')) {
      const next = new URLSearchParams(searchParams);
      next.delete('sessionId');
      setSearchParams(next);
    }
  };

  const exportRows = (rows) => {
    const header = ['Rank', 'Candidate Name', 'Email', 'Test Name', 'Score', 'Total Questions', 'Percentage (%)', 'Grade', 'Result', 'Time Taken', 'Started At', 'Submitted At'];
    const lines = rows.map((r) => [
      r._rank ?? '',
      r.candidate_name || r.name || '',
      r.candidate_email || r.email || '',
      r.test_name || '',
      r.score ?? '',
      r.total_questions ?? r.total ?? '',
      r.percentage ?? '',
      r.grade || computeGrade(Number(r.percentage) || 0),
      r.passed ? 'Pass' : 'Fail',
      formatTimeTaken(computeTimeSeconds(r)),
      formatDateTime(r.start_time || r.started_at),
      formatDateTime(r.end_time || r.submitted_at || r.completed_at),
    ].map(csvEscape).join(','));
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    a.href = url;
    a.download = `skillforge_results_${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const exportAll = () => exportRows(sorted);
  const exportSelected = () => exportRows(sorted.filter((r) => selected.has(r.session_id || r.id)));

  const viewDetail = async (r) => {
    try {
      const { data } = await api.get(`${apiPrefix}/results/${r.session_id || r.id}`);
      setDetail(data);
    } catch {
      setDetail({ ...r, questions: [] });
    }
  };

  // top performers (only when specific test selected)
  const topPerformers = useMemo(() => {
    if (!filterTest) return [];
    return ranked
      .slice()
      .sort((a, b) => (Number(b.percentage) || 0) - (Number(a.percentage) || 0))
      .slice(0, 3);
  }, [ranked, filterTest]);

  const passingPct = selectedTest?.passing_percentage || 60;

  const medal = (rank) => rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

  if (loading) return <div className="loading">Loading results...</div>;

  const page_numbers = (() => {
    const max = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + max - 1);
    start = Math.max(1, end - max + 1);
    const arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  })();

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Results</h1>
          <p className="page-sub">All test submissions, scores and rankings</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={() => setShowAnalytics((v) => !v)}>Analytics</button>
          <button className="btn btn-outline" disabled={!selected.size} onClick={exportSelected} style={{ opacity: selected.size ? 1 : 0.4 }}>
            Export Selected ({selected.size})
          </button>
          <button className="btn btn-primary" onClick={exportAll}>Export All</button>
        </div>
      </div>

      {error && <div className="login-error">{error}</div>}

      {showAnalytics && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, marginBottom: 16, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Pass Rate</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#34d399' }}>
              {stats.total ? Math.round((stats.passed / stats.total) * 100) : 0}%
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(gradeDist).map(([g, c]) => (
              <span key={g} style={{ ...gradeBadgeStyle(g), padding: '6px 12px', fontSize: 13 }}>{g}: {c}</span>
            ))}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Submissions', value: stats.total, iconColor: '#185FA5', bg: '#E6F1FB',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2h6a1 1 0 0 1 1 1v2H8V3a1 1 0 0 1 1-1z"/><rect x="4" y="5" width="16" height="17" rx="2"/><path d="M9 12h6M9 16h6"/></svg> },
          { label: 'Passed', value: stats.passed, iconColor: '#3B6D11', bg: '#EAF3DE',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
          { label: 'Failed', value: stats.failed, iconColor: '#A32D2D', bg: '#FCEBEB',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> },
          { label: 'Avg Score', value: stats.avg + '%', iconColor: '#534AB7', bg: '#EEEDFE',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
        ].map((s) => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, color: s.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {s.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'rgba(255,255,255,0.95)', lineHeight: 1.1 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters - two rows */}
      <FilterPanel
        search={search} setSearch={setSearch}
        filterTest={filterTest} setFilterTest={setFilterTest}
        filterBatch={filterBatch} setFilterBatch={setFilterBatch}
        filterSession={filterSession} setFilterSession={setFilterSession}
        filterStatus={filterStatus} setFilterStatus={setFilterStatus}
        dateFrom={dateFrom} setDateFrom={setDateFrom}
        dateTo={dateTo} setDateTo={setDateTo}
        setPage={setPage}
        testsGrouped={testsGrouped}
        batches={batches}
        sessions={sessions}
        clearFilters={clearFilters}
      />

      {/* Table */}
      <div style={{ background: 'var(--surface, #0f1420)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'visible' }}>
        <div className="table-scroll-wrapper" style={{ width: '100%', overflowX: 'auto', display: 'block' }}>
          <table className="sf-table" style={{ minWidth: '1300px', whiteSpace: 'nowrap', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    ref={(el) => { if (el) el.indeterminate = someOnPageSelected; }}
                    onChange={togglePageAll}
                  />
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('rank')}>RANK{sortInd('rank')}</th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('candidate')}>CANDIDATE{sortInd('candidate')}</th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('email')}>EMAIL{sortInd('email')}</th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('test')}>TEST{sortInd('test')}</th>
                <th>SESSION</th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('score')}>SCORE{sortInd('score')}</th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('total')}>TOTAL{sortInd('total')}</th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('percentage')}>%{sortInd('percentage')}</th>
                <th>GRADE</th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('result')}>RESULT{sortInd('result')}</th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('time')}>TIME TAKEN{sortInd('time')}</th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('date')}>STARTED AT{sortInd('date')}</th>
                <th>SUBMITTED AT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((r, i) => {
                const rid = r.session_id || r.id;
                const pct = Number(r.percentage) || 0;
                const grade = r.grade || computeGrade(pct);
                const passThresh = r.passing_percentage ?? passingPct;
                const passed = r.passed != null ? r.passed : pct >= passThresh;
                const name = r.candidate_name || r.name || '?';
                return (
                  <tr key={rid || i}>
                    <td style={TD}><input type="checkbox" checked={selected.has(rid)} onChange={() => toggleOne(rid)} /></td>
                    <td style={TD}>
                      {r._rank <= 3
                        ? <span style={{ fontSize: 18 }}>{medal(r._rank)}</span>
                        : <span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>#{r._rank}</span>}
                    </td>
                    <td style={TD}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {name[0].toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 500, color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>{name}</span>
                          {r.batch_code && (
                            <span style={{ display: 'inline-block', marginTop: 2, padding: '1px 6px', borderRadius: 4, background: 'rgba(124,58,237,0.18)', color: '#a78bfa', fontFamily: 'monospace', fontSize: 10, fontWeight: 700, alignSelf: 'flex-start' }}>
                              {r.batch_code}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ ...TD, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{r.candidate_email || r.email}</td>
                    <td style={{ ...TD, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{r.test_name || '-'}</td>
                    <td style={TD}>
                      {r.session_code ? (
                        <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#a78bfa', background: 'rgba(124,58,237,0.15)', padding: '2px 8px', borderRadius: 6 }}>{r.session_code}</span>
                      ) : (
                        <span style={{ color: 'rgba(255,255,255,0.35)' }}>-</span>
                      )}
                    </td>
                    <td style={{ ...TD, fontFamily: 'monospace', fontSize: 13 }}>{r.score ?? '-'}</td>
                    <td style={{ ...TD, fontFamily: 'monospace', fontSize: 13 }}>{r.total_questions ?? r.total ?? '-'}</td>
                    <td style={{ ...TD, fontFamily: 'monospace', fontSize: 13 }}>{pct}%</td>
                    <td style={TD}><span style={gradeBadgeStyle(grade)}>{grade}</span></td>
                    <td style={TD}>
                      <span style={passBadge(passed)}>{passed ? 'Pass' : 'Fail'}</span>
                      {(r.auto_submitted === 1 || r.violation_blocked === 1 || (r.tab_violations || 0) >= 3) && (
                        <span title="Auto-submitted due to tab switching violations" style={{ display: 'inline-block', fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(226,75,74,0.15)', color: '#E24B4A', marginLeft: 4, fontWeight: 600 }}>
                          Auto-submitted ({r.tab_violations || 0} violation{(r.tab_violations || 0) === 1 ? '' : 's'})
                        </span>
                      )}
                    </td>
                    <td style={{ ...TD, fontFamily: 'monospace', fontSize: 13 }}>{formatTimeTaken(computeTimeSeconds(r))}</td>
                    <td style={{ ...TD, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{formatDateTime(r.start_time || r.started_at)}</td>
                    <td style={{ ...TD, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{formatDateTime(r.submitted_at || r.end_time || r.completed_at)}</td>
                    <td style={TD}>
                      <button className="btn btn-sm btn-outline" onClick={() => viewDetail(r)}>View Details</button>
                    </td>
                  </tr>
                );
              })}
              {sorted.length === 0 && (
                <tr><td colSpan="15" className="table-empty" style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.4)' }}>No results found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            {sorted.length === 0 ? '0 results' : `Showing ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, sorted.length)} of ${sorted.length} results`}
          </span>
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-sm btn-outline" disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)}>‹ Prev</button>
              {page_numbers.map((n) => (
                <button key={n} className={`btn btn-sm ${n === currentPage ? 'btn-primary' : 'btn-outline'}`} onClick={() => setPage(n)}>{n}</button>
              ))}
              <button className="btn btn-sm btn-outline" disabled={currentPage >= totalPages} onClick={() => setPage((p) => p + 1)}>Next ›</button>
            </div>
          )}
        </div>
      </div>

      {/* Top performers */}
      {filterTest && topPerformers.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>Top Performers</h3>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {topPerformers.map((r, i) => {
              const name = r.candidate_name || r.name || '?';
              const pct = Number(r.percentage) || 0;
              const grade = r.grade || computeGrade(pct);
              return (
                <div key={r.session_id || r.id || i} style={{ flex: '1 1 200px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 28 }}>{medal(i + 1)}</div>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff' }}>{name[0].toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, color: 'rgba(255,255,255,0.9)', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>{pct}%</div>
                  </div>
                  <span style={gradeBadgeStyle(grade)}>{grade}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* placeholder to anchor detail modal marker */}
      {/* Detail modal */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 800, maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="modal-header" style={{ flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 className="modal-title">Session Detail</h3>
                {detail.test_type === 'hybrid' && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(96,165,250,0.15)', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hybrid</span>
                )}
              </div>
              <button className="modal-close" onClick={() => setDetail(null)}>&times;</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
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
                <div style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{detail.grade || computeGrade(Number(detail.percentage) || 0)}</div>
              </div>
            </div>
            <div className="modal-body" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '16px 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Started At</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{formatDateTime(detail.start_time || detail.started_at)}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Completed At</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{formatDateTime(detail.end_time || detail.submitted_at || detail.completed_at)}</div>
              </div>
            </div>
            {detail.summary && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: detail.test_type === 'hybrid' ? 10 : 0, fontSize: 13, flexWrap: 'wrap' }}>
                  {detail.test_type === 'hybrid' && <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', alignSelf: 'center', marginRight: 4 }}>MCQ:</span>}
                  <span style={{ color: '#1D9E75' }}>✓ {detail.summary.mcqCorrect} Correct</span>
                  <span style={{ color: '#E24B4A' }}>✗ {detail.summary.mcqWrong} Wrong</span>
                  <span style={{ color: '#BA7517' }}>— {detail.summary.mcqSkipped} Skipped</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>· {detail.summary.mcqTotal} Total</span>
                  {detail.test_type === 'hybrid' && <span style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace' }}>{detail.summary.mcqPercentage}%</span>}
                </div>
                {detail.test_type === 'hybrid' && detail.summary.codingTotal > 0 && (
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginRight: 4 }}>Coding:</span>
                    <span style={{ color: '#60a5fa' }}>⬡ {detail.summary.codingEarned}/{detail.summary.codingTotal} pts</span>
                    <span style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace' }}>{detail.summary.codingPercentage}%</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>· {detail.summary.codingProblems} problem{detail.summary.codingProblems !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            )}
            {detail.test_type === 'hybrid' && (detail.codingProblems || []).length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Coding Problems</h4>
                {(detail.codingProblems || []).map((cp, i) => {
                  const accepted = cp.status === 'accepted' || cp.earned >= cp.maxPoints;
                  const attempted = cp.status !== 'not_attempted';
                  const cardBg = !attempted ? 'rgba(255,255,255,0.02)' : accepted ? 'rgba(29,158,117,0.07)' : 'rgba(226,75,74,0.07)';
                  const cardBorder = !attempted ? 'rgba(255,255,255,0.08)' : accepted ? 'rgba(29,158,117,0.25)' : 'rgba(226,75,74,0.25)';
                  const statusLabel = !attempted ? 'Not Attempted' : accepted ? 'Accepted' : 'Wrong Answer';
                  const statusColor = !attempted ? 'rgba(255,255,255,0.35)' : accepted ? '#1D9E75' : '#E24B4A';
                  const diffColor = cp.difficulty === 'hard' ? '#f87171' : cp.difficulty === 'medium' ? '#facc15' : '#34d399';
                  return (
                    <div key={cp.id || i} style={{ padding: '12px 14px', background: cardBg, border: '1px solid ' + cardBorder, borderRadius: 8, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>P{i + 1}</span>
                      <span style={{ flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{cp.title}</span>
                      {cp.difficulty && <span style={{ fontSize: 11, color: diffColor, textTransform: 'capitalize', flexShrink: 0 }}>{cp.difficulty}</span>}
                      <span style={{ fontSize: 12, color: statusColor, flexShrink: 0 }}>{statusLabel}</span>
                      {attempted && cp.totalCases > 0 && (
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', flexShrink: 0 }}>{cp.passedCases}/{cp.totalCases} cases</span>
                      )}
                      <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#60a5fa', fontWeight: 700, flexShrink: 0 }}>{cp.earned}/{cp.maxPoints} pts</span>
                    </div>
                  );
                })}
              </div>
            )}
            {(detail.questions || []).length > 0 && (
              <div>
                <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Question Review</h4>
                {(detail.questions || []).map((q, i) => {
                  const cardBg = q.isSkipped ? 'rgba(186,117,23,0.07)' : q.isCorrect ? 'rgba(29,158,117,0.07)' : 'rgba(226,75,74,0.07)';
                  const cardBorder = q.isSkipped ? 'rgba(186,117,23,0.25)' : q.isCorrect ? 'rgba(29,158,117,0.25)' : 'rgba(226,75,74,0.25)';
                  return (
                  <div key={i} style={{ padding: 16, background: cardBg, border: '1px solid ' + cardBorder, borderRadius: 8, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Q{q.displayId || i + 1}</span>
                      {q.isSkipped && <span style={{ background: 'rgba(186,117,23,0.2)', color: '#BA7517', padding: '2px 8px', borderRadius: 99, fontSize: 11 }}>— Skipped</span>}
                      {!q.isSkipped && q.isCorrect && <span style={{ background: 'rgba(29,158,117,0.2)', color: '#1D9E75', padding: '2px 8px', borderRadius: 99, fontSize: 11 }}>✓ Correct</span>}
                      {!q.isSkipped && !q.isCorrect && <span style={{ background: 'rgba(226,75,74,0.2)', color: '#E24B4A', padding: '2px 8px', borderRadius: 99, fontSize: 11 }}>✗ Wrong</span>}
                      {q.subject && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginLeft: 'auto' }}>{q.subject}{q.difficulty ? ' · ' + q.difficulty : ''}</span>}
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 10, whiteSpace: 'pre-wrap' }}>{q.question}</div>
                    {q.code_snippet && (
                      <pre style={{ background: 'rgba(0,0,0,0.4)', padding: 10, borderRadius: 6, fontSize: 12, color: 'rgba(255,255,255,0.8)', overflowX: 'auto', margin: '0 0 10px' }}>{q.code_snippet}</pre>
                    )}
                    {Array.isArray(q.options) && q.options.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                        {q.options.map((opt, j) => {
                          const isCorrectOpt = j === q.correctAnswerIndex;
                          const isUserOpt = !q.isSkipped && j === q.userAnswerIndex;
                          let bg = 'rgba(255,255,255,0.03)', border = 'rgba(255,255,255,0.08)', color = 'rgba(255,255,255,0.7)';
                          if (isCorrectOpt) { bg = 'rgba(29,158,117,0.15)'; border = 'rgba(29,158,117,0.4)'; color = '#1D9E75'; }
                          else if (isUserOpt && !isCorrectOpt) { bg = 'rgba(226,75,74,0.15)'; border = 'rgba(226,75,74,0.4)'; color = '#E24B4A'; }
                          return (
                            <div key={j} style={{ padding: '8px 12px', borderRadius: 6, background: bg, border: '1px solid ' + border, color, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 600, opacity: 0.7 }}>{String.fromCharCode(65 + j)}.</span>
                              <span style={{ flex: 1 }}>{opt}</span>
                              {isUserOpt && <span style={{ fontSize: 11, opacity: 0.8 }}>Your answer</span>}
                              {isCorrectOpt && <span style={{ fontSize: 11, opacity: 0.8 }}>Correct</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {q.isSkipped && (
                      <div style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(186,117,23,0.1)', border: '1px solid rgba(186,117,23,0.2)', fontSize: 12, color: '#BA7517' }}>
                        Not answered. Correct answer: {q.correctAnswerLetter}{q.correctAnswerText ? ' — ' + q.correctAnswerText : ''}
                      </div>
                    )}
                    {q.explanation && (
                      <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.03)', fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                        <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Explanation: </strong>{q.explanation}
                      </div>
                    )}
                  </div>
                );})}
              </div>
            )}
            </div>
            <div className="modal-actions" style={{ flexShrink: 0, padding: '12px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="btn btn-outline" onClick={() => setDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------
// FilterPanel — two-row filter layout with inline styles (no .form-* classes)
// ----------------------------------------------------------------
const FILTER_LABEL = { display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 };
const FILTER_INPUT = { width: '100%', height: 42, padding: '0 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'rgba(255,255,255,0.9)', fontSize: 13, boxSizing: 'border-box' };

function FilterField({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={FILTER_LABEL}>{label}</label>
      {children}
    </div>
  );
}

function FilterPanel({
  search, setSearch, filterTest, setFilterTest, filterBatch, setFilterBatch,
  filterSession, setFilterSession, filterStatus, setFilterStatus,
  dateFrom, setDateFrom, dateTo, setDateTo, setPage,
  testsGrouped, batches, sessions, clearFilters,
}) {
  const handle = (setter) => (e) => { setter(e.target.value); setPage(1); };
  return (
    <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <FilterField label="Search by Candidate Name or Email">
          <input placeholder="Search by candidate name or email..." value={search} onChange={handle(setSearch)} style={FILTER_INPUT} />
        </FilterField>
        <FilterField label="Filter by Test">
          <select value={filterTest} onChange={handle(setFilterTest)} style={FILTER_INPUT}>
            <option value="">All Tests</option>
            {testsGrouped.regular?.length > 0 && (
              <optgroup label="Regular Tests">
                {testsGrouped.regular.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </optgroup>
            )}
            {testsGrouped.interviewPrep?.length > 0 && (
              <optgroup label="Interview Prep Tests">
                {testsGrouped.interviewPrep.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </optgroup>
            )}
          </select>
        </FilterField>
        <FilterField label="Filter by Batch">
          <select value={filterBatch} onChange={handle(setFilterBatch)} style={FILTER_INPUT}>
            <option value="">All Batches</option>
            {batches.map((b) => <option key={b.id} value={b.id}>{b.code} — {b.name}</option>)}
          </select>
        </FilterField>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: 12, alignItems: 'end' }}>
        <FilterField label="Filter by Session">
          <select value={filterSession} onChange={handle(setFilterSession)} style={FILTER_INPUT}>
            <option value="">All Sessions</option>
            {sessions.map((s) => <option key={s.id} value={s.id}>{s.sessionCode} — {s.name}</option>)}
          </select>
        </FilterField>
        <FilterField label="Filter by Status">
          <select value={filterStatus} onChange={handle(setFilterStatus)} style={FILTER_INPUT}>
            <option value="">All Results</option>
            <option value="pass">Pass</option>
            <option value="fail">Fail</option>
          </select>
        </FilterField>
        <FilterField label="From Date">
          <input type="date" value={dateFrom} onChange={handle(setDateFrom)} style={FILTER_INPUT} />
        </FilterField>
        <FilterField label="To Date">
          <input type="date" value={dateTo} onChange={handle(setDateTo)} style={FILTER_INPUT} />
        </FilterField>
        <button onClick={clearFilters} style={{ height: 42, padding: '0 18px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.9)', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 13, fontWeight: 500 }}>Clear Filters</button>
      </div>
    </div>
  );
}
