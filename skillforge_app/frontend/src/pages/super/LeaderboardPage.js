import { useState, useEffect } from 'react';
import api from '../../api';
import { formatDateTime, parseStamp } from '../../utils/dateUtils';

const GRADE_STYLE = {
  'A+': { background: '#EEEDFE', color: '#534AB7' },
  A:    { background: '#EAF3DE', color: '#3B6D11' },
  B:    { background: '#E6F1FB', color: '#185FA5' },
  C:    { background: '#FAEEDA', color: '#854F0B' },
  D:    { background: '#FAEEDA', color: '#854F0B' },
  F:    { background: '#FCEBEB', color: '#A32D2D' },
};
const gradeBadge = (grade) => ({
  ...(GRADE_STYLE[grade] || { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }),
  padding: '3px 12px', borderRadius: 99, fontWeight: 500, fontSize: 12, display: 'inline-block',
});
const passBadge = (passed) => ({
  background: passed ? '#EAF3DE' : '#FCEBEB',
  color: passed ? '#3B6D11' : '#A32D2D',
  padding: '2px 12px', borderRadius: 99, fontWeight: 500, fontSize: 12, display: 'inline-block',
});
const statusBadge = (active) => ({
  background: active ? '#EAF3DE' : '#FCEBEB',
  color: active ? '#3B6D11' : '#A32D2D',
  padding: '2px 10px', borderRadius: 99, fontWeight: 500, fontSize: 12, display: 'inline-block',
});

const formatTimeTaken = (seconds) => {
  if (!seconds || seconds <= 0) return '-';
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${r}s`;
  return `${r}s`;
};

const csvEscape = (v) => {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const TD_STYLE = { padding: '12px 16px', verticalAlign: 'middle', borderBottom: '0.5px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap' };

export default function LeaderboardPage() {
  return <LeaderboardView apiPrefix="/super" />;
}

export function LeaderboardView({ apiPrefix = '/super' }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchData = (testId) => {
    setLoading(true);
    const url = testId ? `${apiPrefix}/leaderboard?testId=${testId}` : `${apiPrefix}/leaderboard`;
    api.get(url)
      .then(r => { setTests(r.data.tests || []); setLeaderboard(r.data.leaderboard || []); })
      .catch(e => setError(e.response?.data?.error || 'Failed to load leaderboard'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(''); }, []); // eslint-disable-line

  const filtered = leaderboard.filter(e => {
    if (dateFrom && e.completed_at && parseStamp(e.completed_at) < new Date(dateFrom)) return false;
    if (dateTo && e.completed_at && parseStamp(e.completed_at) > new Date(dateTo + 'T23:59:59')) return false;
    return true;
  });

  const selectedTestObj = tests.find(t => String(t.id) === String(selectedTest));

  const getMedalIcon = (rank) => rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;

  const exportCSV = () => {
    const header = ['Rank','Candidate Name','Email','Test Name','Score','Total','Percentage','Grade','Result','Time Taken','Date'];
    const lines = filtered.map(r => [
      r.rank,
      r.candidate_name || '',
      r.candidate_email || '',
      r.test_name || '',
      r.score ?? '',
      r.total_questions ?? '',
      r.percentage ?? '',
      r.grade || '',
      r.passed ? 'Pass' : 'Fail',
      formatTimeTaken(r.time_taken_seconds),
      formatDateTime(r.completed_at),
    ].map(csvEscape).join(','));
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    a.href = url;
    a.download = `skillforge_leaderboard_${pad(d.getDate())}-${pad(d.getMonth()+1)}-${d.getFullYear()}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leaderboard</h1>
          <p className="page-sub">Top performing candidates ranked by score</p>
        </div>
        <button className="btn btn-outline" onClick={exportCSV}>Export CSV</button>
      </div>

      {error && <div className="login-error">{error}</div>}

      <div style={{ background: 'var(--surface, #0f1420)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'visible' }}>
        <div className="table-toolbar">
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Filter by test</label>
              <select className="form-select" value={selectedTest} onChange={e => { setSelectedTest(e.target.value); fetchData(e.target.value); }}>
                <option value="">All Tests</option>
                {tests.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.is_active ? '● ' : '○ '}{t.name} ({t.is_active ? 'Active' : 'Inactive'})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>From</label>
              <input type="date" className="form-input" style={{ width: 150, padding: '7px 10px', fontSize: 13 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>To</label>
              <input type="date" className="form-input" style={{ width: 150, padding: '7px 10px', fontSize: 13 }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            {(dateFrom || dateTo) && (
              <button className="btn btn-sm btn-outline" onClick={() => { setDateFrom(''); setDateTo(''); }}>Clear</button>
            )}
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', alignSelf: 'center' }}>
              {selectedTestObj && <span style={{ ...statusBadge(selectedTestObj.is_active), marginRight: 10 }}>{selectedTestObj.is_active ? 'Active' : 'Inactive'}</span>}
              {filtered.length} candidate{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="loading" style={{ padding: '48px 0' }}>Loading leaderboard...</div>
        ) : (
          <div className="leaderboard-scroll-wrapper leaderboard-table-wrapper table-scroll-wrapper" style={{ width:'100%', overflowX:'auto', display:'block' }}>
          <table className="sf-table" style={{ minWidth:'1100px', whiteSpace:'nowrap' }}>
            <colgroup>
              <col style={{ width: 60 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 180 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 70 }} />
              <col style={{ width: 70 }} />
              <col style={{ width: 60 }} />
              <col style={{ width: 80 }} />
              <col style={{ width: 80 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: 150 }} />
            </colgroup>
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>Rank</th>
                <th>Candidate</th>
                <th>Email</th>
                <th>Test</th>
                <th style={{ textAlign: 'center' }}>Score</th>
                <th style={{ textAlign: 'center' }}>Total</th>
                <th style={{ textAlign: 'center' }}>%</th>
                <th style={{ textAlign: 'center' }}>Grade</th>
                <th style={{ textAlign: 'center' }}>Result</th>
                <th style={{ textAlign: 'center' }}>Time Taken</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, i) => (
                <tr key={entry.session_id || i}>
                  <td style={TD_STYLE}>
                    {getMedalIcon(entry.rank) ? <span style={{ fontSize: 18 }}>{getMedalIcon(entry.rank)}</span> : <span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>#{entry.rank}</span>}
                  </td>
                  <td style={TD_STYLE}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {(entry.candidate_name || '?')[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500, color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>{entry.candidate_name}</span>
                    </div>
                  </td>
                  <td style={{ ...TD_STYLE, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{entry.candidate_email}</td>
                  <td style={{ ...TD_STYLE, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{entry.test_name || '-'}</td>
                  <td style={{ ...TD_STYLE, fontFamily: 'monospace', fontSize: 13 }}>{entry.score ?? '-'}</td>
                  <td style={{ ...TD_STYLE, fontFamily: 'monospace', fontSize: 13 }}>{entry.total_questions ?? '-'}</td>
                  <td style={{ ...TD_STYLE, fontFamily: 'monospace', fontSize: 13 }}>{entry.percentage}%</td>
                  <td style={TD_STYLE}>{entry.grade ? <span style={gradeBadge(entry.grade)}>{entry.grade}</span> : <span style={{ color: 'rgba(255,255,255,0.35)' }}>-</span>}</td>
                  <td style={TD_STYLE}><span style={passBadge(entry.passed)}>{entry.passed ? 'Pass' : 'Fail'}</span></td>
                  <td style={{ ...TD_STYLE, fontFamily: 'monospace', fontSize: 13 }}>{formatTimeTaken(entry.time_taken_seconds)}</td>
                  <td style={{ ...TD_STYLE, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{entry.submitted_at_ist || formatDateTime(entry.completed_at)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="11" className="table-empty">
                    <div style={{ padding: '40px 0', textAlign: 'center' }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>No results yet. Complete some tests to see the leaderboard!</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
