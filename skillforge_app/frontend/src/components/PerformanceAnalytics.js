import { useState, useEffect } from 'react';
import { formatIST, formatISTDate, nowLocalIso } from '../utils/dateUtils';

const BarChart = ({ data, height = 180 }) => {
  if (!data?.length) return null;
  const max = Math.max(...data.map(d => d.value), 100);
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <div style={{ minWidth: Math.max(300, data.length * 70), padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height, position: 'relative' }}>
          {[25, 50, 75, 100].map(pct => (
            <div key={pct} style={{ position: 'absolute', left: 0, right: 0, bottom: `${(pct / max) * 100}%`, borderTop: '1px dashed rgba(255,255,255,0.06)', zIndex: 0 }}>
              <span style={{ position: 'absolute', left: 0, top: -9, fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>{pct}%</span>
            </div>
          ))}
          {data.map((d, i) => {
            const c = d.value >= 80 ? '#10b981' : d.value >= 60 ? '#3b82f6' : '#ef4444';
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 1 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: c, fontFamily: "'JetBrains Mono',monospace" }}>{d.value}%</span>
                <div style={{ width: '100%', height: `${Math.max(4, (d.value / max) * 100)}%`, background: `linear-gradient(180deg,${c},${c}88)`, borderRadius: '6px 6px 0 0', boxShadow: `0 0 12px ${c}40`, transition: 'height 0.8s cubic-bezier(0.4,0,0.2,1)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(255,255,255,0.15),transparent)' }} />
                </div>
                {d.passed !== undefined && <span style={{ fontSize: 14 }}>{d.passed ? '\u2705' : '\u274C'}</span>}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          {data.map((d, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.label}</div>
              {d.date && <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>{d.date}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SubjectBar = ({ name, percentage, correct, total, rank, testNames }) => {
  const c = percentage >= 80 ? '#10b981' : percentage >= 60 ? '#3b82f6' : percentage >= 40 ? '#f59e0b' : '#ef4444';
  const l = percentage >= 80 ? 'Strong' : percentage >= 60 ? 'Good' : percentage >= 40 ? 'Average' : 'Weak';
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {rank && <span style={{ width: 22, height: 22, borderRadius: '50%', background: rank <= 3 ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: rank <= 3 ? 'white' : 'rgba(255,255,255,0.4)', flexShrink: 0 }}>{rank}</span>}
          <div>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{name}</span>
            {testNames?.length > 0 && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>from: {testNames.join(', ')}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: c, background: `${c}15`, border: `1px solid ${c}30` }}>{l}</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: c, fontFamily: "'JetBrains Mono',monospace", minWidth: 60, textAlign: 'right' }}>{correct}/{total}</span>
        </div>
      </div>
      <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 5, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 5, width: `${percentage}%`, background: `linear-gradient(90deg,${c},${c}bb)`, transition: 'width 1s cubic-bezier(0.4,0,0.2,1) 0.2s', boxShadow: `0 0 10px ${c}50`, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(255,255,255,0.15),transparent)', borderRadius: 5 }} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{percentage}% accuracy</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>{total} question{total !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
};

const InsightCard = ({ icon, title, value, sub, color }) => (
  <div style={{ background: '#0d1117', border: `1px solid ${color}25`, borderRadius: 14, padding: '18px 20px', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s,box-shadow 0.2s' }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${color}20`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
    <div style={{ width: 40, height: 40, borderRadius: 11, background: `${color}18`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 10 }}>{icon}</div>
    <div style={{ fontSize: 28, fontWeight: 900, color, fontFamily: "'JetBrains Mono',monospace", letterSpacing: '-1px', marginBottom: 3 }}>{value}</div>
    <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>{title}</div>
    {sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{sub}</div>}
    <div style={{ position: 'absolute', bottom: -20, right: -20, width: 70, height: 70, borderRadius: '50%', background: color, opacity: 0.05, filter: 'blur(20px)' }} />
  </div>
);

export default function PerformanceAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('sf_token');
      const res = await fetch('/api/candidate/analytics', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed');
      setData(await res.json());
    } catch (e) { setData({ hasData: false }); }
    finally { setLoading(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px 0' }}><div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} /><p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading analytics...</p></div>;
  if (!data?.hasData) return (
    <div style={{ marginTop: 32, background: '#0d1117', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 16, padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 56, marginBottom: 12 }}>{'\uD83D\uDCCA'}</div>
      <h3 style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>No Performance Data Yet</h3>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>Complete at least one assessment to see analytics</p>
    </div>
  );

  const { overview, trend, subjectBreakdown, strengths, weaknesses, sessions } = data;
  const impColor = overview.improvement > 0 ? '#10b981' : overview.improvement < 0 ? '#ef4444' : '#94a3b8';
  const tabs = [{ id: 'overview', label: '\uD83D\uDCCA Overview' }, { id: 'trend', label: '\uD83D\uDCC8 Score Trend' }, { id: 'subjects', label: '\uD83D\uDCDA Subjects' }, { id: 'history', label: '\uD83D\uDD70 History' }];

  return (
    <div style={{ marginTop: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 4, height: 28, background: 'linear-gradient(180deg,#7c3aed,#2563eb)', borderRadius: 2 }} />
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f8fafc', margin: 0 }}>Performance Analytics</h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>Based on {overview.totalAttempts} assessment{overview.totalAttempts !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button onClick={fetchData} style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>{'\uD83D\uDD04'} Refresh</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 4 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '9px 12px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.2s', background: tab === t.id ? '#1e293b' : 'transparent', color: tab === t.id ? '#f8fafc' : 'rgba(255,255,255,0.4)', boxShadow: tab === t.id ? '0 2px 8px rgba(0,0,0,0.3)' : 'none' }}>{t.label}</button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 24 }}>
          <InsightCard icon={'\uD83C\uDFC6'} title="Best Score" value={`${overview.bestScore}%`} color="#f59e0b" sub="All time high" />
          <InsightCard icon={'\uD83D\uDCCA'} title="Average" value={`${overview.avgScore}%`} color="#7c3aed" sub="Across all attempts" />
          <InsightCard icon={'\u2705'} title="Passed" value={`${overview.totalPassed}/${overview.totalAttempts}`} color="#10b981" sub={`${Math.round((overview.totalPassed / overview.totalAttempts) * 100)}% pass rate`} />
          <InsightCard icon={'\uD83D\uDCC8'} title="Change" value={`${overview.improvement > 0 ? '+' : ''}${overview.improvement}%`} color={impColor} sub={overview.improvement > 0 ? 'Improving!' : overview.improvement < 0 ? 'Dropped' : 'Steady'} />
          <InsightCard icon={'\uD83C\uDFAF'} title="Latest" value={`${overview.latestScore}%`} color="#06b6d4" sub="Most recent" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Pass rate ring */}
          <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 24 }}>
            <svg width="100" height="100" viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
              <circle cx="50" cy="50" r="40" fill="none" stroke={overview.totalPassed / overview.totalAttempts >= 0.6 ? '#10b981' : '#ef4444'} strokeWidth="10" strokeDasharray={`${2 * Math.PI * 40 * (overview.totalPassed / overview.totalAttempts)} ${2 * Math.PI * 40}`} strokeLinecap="round" transform="rotate(-90 50 50)" />
              <text x="50" y="47" textAnchor="middle" fill="white" fontSize="16" fontWeight="800">{Math.round((overview.totalPassed / overview.totalAttempts) * 100)}%</text>
              <text x="50" y="62" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">Pass Rate</text>
            </svg>
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 6 }}>Overall Pass Rate</h4>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>Passed <strong style={{ color: '#10b981' }}>{overview.totalPassed}</strong> of <strong style={{ color: 'white' }}>{overview.totalAttempts}</strong> assessments</p>
            </div>
          </div>
          {/* Insights */}
          <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>Quick Insights</h4>
            {strengths?.length > 0 && <div style={{ marginBottom: 12 }}><div style={{ fontSize: 11, color: '#34d399', fontWeight: 700, marginBottom: 6 }}>{'\uD83D\uDCAA'} Strengths</div>{strengths.map((s, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}><span>{'\u2022'} {s.name}</span><span style={{ color: '#34d399', fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{s.percentage}%</span></div>)}</div>}
            {weaknesses?.length > 0 && <div><div style={{ fontSize: 11, color: '#f87171', fontWeight: 700, marginBottom: 6 }}>{'\uD83D\uDCDA'} Needs Work</div>{weaknesses.map((w, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}><span>{'\u2022'} {w.name}</span><span style={{ color: '#f87171', fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{w.percentage}%</span></div>)}</div>}
            {!strengths?.length && !weaknesses?.length && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Complete more tests for insights</p>}
          </div>
        </div>
      </>}

      {/* TREND */}
      {tab === 'trend' && <>
        <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'white', margin: '0 0 4px' }}>Score Progression</h3>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>Scores across all attempts</p>
          <BarChart data={trend.map(t => ({ label: t.label, value: t.percentage, passed: t.passed, date: t.date }))} height={200} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[{ v: overview.bestScore, l: 'Personal Best', c: '#f59e0b' }, { v: overview.avgScore, l: 'Average', c: '#7c3aed' }, { v: `${overview.improvement > 0 ? '+' : ''}${overview.improvement}`, l: overview.improvement > 0 ? 'Improving!' : overview.improvement < 0 ? 'Dropped' : 'Steady', c: impColor }].map((s, i) => (
            <div key={i} style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.v}%</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </>}

      {/* SUBJECTS */}
      {tab === 'subjects' && (
        <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'white', margin: '0 0 4px' }}>Subject-wise Performance</h3>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>Accuracy per topic across all assessments</p>
          {subjectBreakdown.length === 0 ? <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No data yet</p>
            : subjectBreakdown.map((s, i) => <SubjectBar key={s.name} name={s.name} percentage={s.percentage} correct={s.correct} total={s.total} rank={i + 1} testNames={s.testNames} />)}
        </div>
      )}

      {/* HISTORY */}
      {tab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sessions.slice().reverse().map(s => (
            <div key={s.sessionId} style={{ background: '#0d1117', border: `1px solid ${s.passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, borderLeft: `3px solid ${s.passed ? '#10b981' : '#ef4444'}`, borderRadius: 12, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 32, flexShrink: 0 }}>{s.passed ? '\u2705' : '\u274C'}</div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 3 }}>{s.testName}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{s.submittedAt ? formatIST() : 'N/A'}</div>
              </div>
              <div style={{ textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontSize: 26, fontWeight: 900, fontFamily: "'JetBrains Mono',monospace", color: s.passed ? '#34d399' : '#f87171' }}>{s.percentage}%</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{s.score}/{s.total}</div>
              </div>
              <div style={{ textAlign: 'center', minWidth: 70 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.6)', fontFamily: "'JetBrains Mono',monospace" }}>{s.timeTaken}m</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Time</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {[{ l: 'Correct', v: s.correctCount, c: '#10b981' }, { l: 'Wrong', v: s.wrongCount, c: '#ef4444' }, { l: 'Skipped', v: s.skippedCount, c: '#94a3b8' }].map((m, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '6px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: m.c, fontFamily: "'JetBrains Mono',monospace" }}>{m.v ?? '\u2014'}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 0.4 }}>{m.l}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '6px 16px', borderRadius: 20, fontWeight: 800, fontSize: 12, background: s.percentage >= 80 ? 'rgba(245,158,11,0.15)' : s.passed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: s.percentage >= 80 ? '#f59e0b' : s.passed ? '#34d399' : '#f87171', border: `1px solid ${s.percentage >= 80 ? 'rgba(245,158,11,0.3)' : s.passed ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                {s.percentage >= 80 ? '\uD83C\uDFC6 Excellent' : s.passed ? '\u2705 Pass' : '\uD83D\uDCDA Needs Work'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
