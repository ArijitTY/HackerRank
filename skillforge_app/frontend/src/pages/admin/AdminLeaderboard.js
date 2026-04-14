import { useState, useEffect } from 'react';
import api from '../../api';

export default function AdminLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/admin/leaderboard')
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
    const url = testId ? `/admin/leaderboard?testId=${testId}` : '/admin/leaderboard';
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

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Leaderboard</h1>
          <p className="page-sub">Top performing candidates ranked by score</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-container">
        <div className="table-toolbar filter-toolbar">
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
          <div className="table-count">
            {leaderboard.length} candidate{leaderboard.length !== 1 ? 's' : ''}
          </div>
        </div>

        {loading ? (
          <div className="loading" style={{ padding: '48px 0' }}>Loading leaderboard...</div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 16, padding: '32px 0 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 24 }}>
                {/* 2nd Place */}
                {leaderboard[1] && (
                  <div style={{ textAlign: 'center', flex: 1, maxWidth: 160 }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🥈</div>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #C0C0C0, #808080)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 auto 8px' }}>
                      {(leaderboard[1].candidate_name || '?')[0].toUpperCase()}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 2 }}>{leaderboard[1].candidate_name}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'monospace', color: '#C0C0C0' }}>{leaderboard[1].percentage}%</div>
                    <div style={{ height: 60, background: 'rgba(192,192,192,0.1)', border: '1px solid rgba(192,192,192,0.2)', borderRadius: '4px 4px 0 0', marginTop: 8 }} />
                  </div>
                )}
                {/* 1st Place */}
                {leaderboard[0] && (
                  <div style={{ textAlign: 'center', flex: 1, maxWidth: 160 }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>🥇</div>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #FFD700, #FFA500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 auto 8px', boxShadow: '0 0 20px rgba(255,215,0,0.3)' }}>
                      {(leaderboard[0].candidate_name || '?')[0].toUpperCase()}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.95)', marginBottom: 2 }}>{leaderboard[0].candidate_name}</div>
                    <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'monospace', color: '#FFD700' }}>{leaderboard[0].percentage}%</div>
                    <div style={{ height: 90, background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '4px 4px 0 0', marginTop: 8 }} />
                  </div>
                )}
                {/* 3rd Place */}
                {leaderboard[2] && (
                  <div style={{ textAlign: 'center', flex: 1, maxWidth: 160 }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🥉</div>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #CD7F32, #8B4513)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 auto 8px' }}>
                      {(leaderboard[2].candidate_name || '?')[0].toUpperCase()}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 2 }}>{leaderboard[2].candidate_name}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'monospace', color: '#CD7F32' }}>{leaderboard[2].percentage}%</div>
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
                {leaderboard.map((entry, i) => (
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
                      <div className="user-cell">
                        <div className="avatar-sm" style={{ background: `linear-gradient(135deg, ${getMedalColor(entry.rank)}, rgba(255,255,255,0.1))` }}>
                          {(entry.candidate_name || '?')[0].toUpperCase()}
                        </div>
                        <span>{entry.candidate_name}</span>
                      </div>
                    </td>
                    <td><span className="text-dim">{entry.test_name || '-'}</span></td>
                    <td><strong>{entry.score ?? '-'}</strong><span className="text-dim">/{entry.total_questions ?? entry.total ?? '-'}</span></td>
                    <td>
                      <span className={`percentage-pill ${entry.passed ? 'pass' : 'fail'}`}>
                        {entry.percentage}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${entry.passed ? 'badge-success' : 'badge-danger'}`}>
                        {entry.grade || (entry.passed ? 'Pass' : 'Fail')}
                      </span>
                    </td>
                    <td className="text-dim">
                      {entry.completed_at ? new Date(entry.completed_at).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan="7" className="empty-table-cell">
                      <div className="empty-state">
                        <span className="empty-icon">🏆</span>
                        <p>No results yet. Complete some tests to see the leaderboard!</p>
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
