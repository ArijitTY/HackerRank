import { useState, useEffect } from 'react';
import api from '../../api';

function fmtDate(raw) {
  if (!raw) return '-';
  const d = new Date(raw.includes('Z') || raw.includes('+') ? raw : raw + 'Z');
  return isNaN(d) ? '-' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/super/leaderboard')
      .then(r => {
        setTests(r.data.tests || []);
        setLeaderboard(r.data.leaderboard || []);
      })
      .catch(e => setError(e.response?.data?.error || 'Failed to load leaderboard'))
      .finally(() => setLoading(false));
  }, []);

  const handleTestChange = (testId) => {
    setSelectedTest(testId);
    setLoading(true);
    const url = testId ? `/super/leaderboard?testId=${testId}` : '/super/leaderboard';
    api.get(url)
      .then(r => {
        setTests(r.data.tests || []);
        setLeaderboard(r.data.leaderboard || []);
      })
      .catch(e => setError(e.response?.data?.error || 'Failed to load leaderboard'))
      .finally(() => setLoading(false));
  };

  const getMedalColor = (rank) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return 'rgba(255,255,255,0.3)';
  };

  const getMedalIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const filteredLeaderboard = leaderboard.filter(e => {
    if (dateFrom && e.completed_at && new Date(e.completed_at) < new Date(dateFrom)) return false;
    if (dateTo && e.completed_at && new Date(e.completed_at) > new Date(dateTo + 'T23:59:59')) return false;
    return true;
  });

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leaderboard</h1>
          <p className="page-sub">Top performing candidates ranked by score</p>
        </div>
      </div>

      {error && <div className="login-error">{error}</div>}

      <div className="table-container">
        <div className="table-toolbar">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              value={selectedTest}
              onChange={e => handleTestChange(e.target.value)}
            >
              <option value="">All Tests</option>
              {tests.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <input type="date" className="form-input" style={{ width: 150, padding: '7px 10px', fontSize: 13 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} title="From date" />
            <input type="date" className="form-input" style={{ width: 150, padding: '7px 10px', fontSize: 13 }} value={dateTo} onChange={e => setDateTo(e.target.value)} title="To date" />
            {(dateFrom || dateTo) && (
              <button className="btn btn-sm btn-outline" onClick={() => { setDateFrom(''); setDateTo(''); }}>Clear dates</button>
            )}
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              {filteredLeaderboard.length} candidate{filteredLeaderboard.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="loading" style={{ padding: '48px 0' }}>Loading leaderboard...</div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {filteredLeaderboard.length >= 3 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 16, padding: '32px 0 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 24 }}>
                {/* 2nd Place */}
                {filteredLeaderboard[1] && (
                  <div style={{ textAlign: 'center', flex: 1, maxWidth: 160 }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🥈</div>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #C0C0C0, #808080)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 auto 8px' }}>
                      {(filteredLeaderboard[1].candidate_name || '?')[0].toUpperCase()}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 2 }}>{filteredLeaderboard[1].candidate_name}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'monospace', color: '#C0C0C0' }}>{filteredLeaderboard[1].percentage}%</div>
                    <div style={{ height: 60, background: 'rgba(192,192,192,0.1)', border: '1px solid rgba(192,192,192,0.2)', borderRadius: '4px 4px 0 0', marginTop: 8 }} />
                  </div>
                )}
                {/* 1st Place */}
                {filteredLeaderboard[0] && (
                  <div style={{ textAlign: 'center', flex: 1, maxWidth: 160 }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>🥇</div>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #FFD700, #FFA500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 auto 8px', boxShadow: '0 0 20px rgba(255,215,0,0.3)' }}>
                      {(filteredLeaderboard[0].candidate_name || '?')[0].toUpperCase()}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.95)', marginBottom: 2 }}>{filteredLeaderboard[0].candidate_name}</div>
                    <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'monospace', color: '#FFD700' }}>{filteredLeaderboard[0].percentage}%</div>
                    <div style={{ height: 90, background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '4px 4px 0 0', marginTop: 8 }} />
                  </div>
                )}
                {/* 3rd Place */}
                {filteredLeaderboard[2] && (
                  <div style={{ textAlign: 'center', flex: 1, maxWidth: 160 }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🥉</div>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #CD7F32, #8B4513)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 auto 8px' }}>
                      {(filteredLeaderboard[2].candidate_name || '?')[0].toUpperCase()}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 2 }}>{filteredLeaderboard[2].candidate_name}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'monospace', color: '#CD7F32' }}>{filteredLeaderboard[2].percentage}%</div>
                    <div style={{ height: 40, background: 'rgba(205,127,50,0.1)', border: '1px solid rgba(205,127,50,0.2)', borderRadius: '4px 4px 0 0', marginTop: 8 }} />
                  </div>
                )}
              </div>
            )}

            {/* Full Rankings Table */}
            <table className="sf-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Rank</th>
                  <th>Candidate</th>
                  <th>Test</th>
                  <th>Score</th>
                  <th>%</th>
                  <th>Grade</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaderboard.map((entry, i) => (
                  <tr key={entry.session_id || i} style={i < 3 ? { background: `rgba(${i === 0 ? '255,215,0' : i === 1 ? '192,192,192' : '205,127,50'}, 0.04)` } : {}}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {getMedalIcon(entry.rank) ? (
                          <span style={{ fontSize: 18 }}>{getMedalIcon(entry.rank)}</span>
                        ) : (
                          <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>
                            {entry.rank}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${getMedalColor(entry.rank)}, rgba(255,255,255,0.1))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {(entry.candidate_name || '?')[0].toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500, color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>{entry.candidate_name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{entry.test_name || '-'}</td>
                    <td><span style={{ fontFamily: 'monospace', fontSize: 13 }}>{entry.score ?? '-'}/{entry.total_questions ?? entry.total ?? '-'}</span></td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        background: entry.passed ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                        color: entry.passed ? '#10b981' : '#ef4444',
                        border: `1px solid ${entry.passed ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`
                      }}>
                        {entry.percentage}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${entry.passed ? 'badge-success' : 'badge-danger'}`}>
                        {entry.grade || (entry.passed ? 'Pass' : 'Fail')}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                      {fmtDate(entry.completed_at || entry.end_time)}
                    </td>
                  </tr>
                ))}
                {filteredLeaderboard.length === 0 && (
                  <tr>
                    <td colSpan="7" className="table-empty">
                      <div style={{ padding: '40px 0', textAlign: 'center' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>No results yet. Complete some tests to see the leaderboard!</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
