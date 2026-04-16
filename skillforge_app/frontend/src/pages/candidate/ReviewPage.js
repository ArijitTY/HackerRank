import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { formatDateTime } from '../../utils/dateUtils';

const GRADE_COLOR = { 'A+': '#a78bfa', A: '#34d399', B: '#60a5fa', C: '#facc15', D: '#fb923c', F: '#f87171' };
const computeGrade = (p) => (p >= 90 ? 'A+' : p >= 80 ? 'A' : p >= 70 ? 'B' : p >= 60 ? 'C' : p >= 50 ? 'D' : 'F');
const gradeBadge = (g) => {
  const c = GRADE_COLOR[g] || '#64748b';
  return { padding: '4px 12px', borderRadius: 20, background: c + '22', color: c, fontSize: 13, fontWeight: 700, display: 'inline-block' };
};
const formatTimeTaken = (secs) => {
  if (secs == null || isNaN(secs)) return '-';
  let s = Math.floor(Number(secs));
  if (s > 86400) s = Math.floor(s / 1000);
  if (s <= 0) return '-';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const pad = (x) => String(x).padStart(2, '0');
  if (h > 0) return `${h}h ${pad(m)}m`;
  if (m > 0) return `${m}m ${pad(r)}s`;
  return `${r}s`;
};

function StatCard({ label, value, color = 'rgba(255,255,255,0.9)', sub }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 18px' }}>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: 'monospace' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function ReviewPage() {
  const { testId, sessionId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [violationInfo, setViolationInfo] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/candidate/tests/${testId}/sessions/${sessionId}/review`)
      .then(r => setData(r.data))
      .catch(e => {
        if (e.response?.status === 403 && e.response?.data?.error === 'VIOLATION_BLOCKED') {
          setError('violation_blocked');
          setViolationInfo({ violationCount: e.response.data.violationCount || 3 });
        } else if (e.response?.status === 403) {
          setError('access_denied');
        } else {
          setError(e.response?.data?.error || 'Failed to load review');
        }
      })
      .finally(() => setLoading(false));
  }, [testId, sessionId]);

  const questions = useMemo(() => data?.questions || [], [data]);
  const summary = data?.summary || { mcqCorrect: 0, mcqWrong: 0, mcqSkipped: 0, mcqTotal: 0 };
  const codingProblems = useMemo(() => data?.codingProblems || [], [data]);
  const isHybrid = data?.testType === 'hybrid';

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return questions;
    return questions.filter(q => {
      if (activeFilter === 'correct') return q.isCorrect;
      if (activeFilter === 'wrong') return !q.isCorrect && !q.isSkipped;
      if (activeFilter === 'skipped') return q.isSkipped;
      return true;
    });
  }, [questions, activeFilter]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
        Loading review…
      </div>
    );
  }

  if (error === 'violation_blocked') {
    const vc = violationInfo?.violationCount || 3;
    return (
      <div style={{ minHeight: '100vh', background: '#030712', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(226,75,74,0.15)', border: '2px solid rgba(226,75,74,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: '1.5rem' }}>⚠</div>
        <h2 style={{ color: '#E24B4A', fontSize: 22, fontWeight: 500, marginBottom: 12 }}>Test Results Unavailable</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.7, maxWidth: 480, marginBottom: 8 }}>
          Your test was automatically submitted due to tab switching violations detected during the assessment.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: '2rem' }}>
          Violations recorded: <span style={{ color: '#E24B4A', fontWeight: 600 }}>{vc}</span>
        </p>
        <button onClick={() => navigate('/candidate')} style={{ padding: '10px 28px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 14 }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', background: '#030712', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <p style={{ color: '#f87171', marginBottom: 16 }}>{error || 'Failed to load review'}</p>
        <button onClick={() => navigate('/candidate')} style={{ padding: '10px 28px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 14 }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const pct = Math.round(Number(data.percentage) || 0);
  const grade = data.grade || computeGrade(pct);
  const passed = data.passed;
  const mcqPct = summary.mcqTotal > 0 ? Math.round((summary.mcqCorrect / summary.mcqTotal) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d1a', color: '#fff' }}>
      {/* HEADER */}
      <div style={{ background: '#13131f', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 18, fontWeight: 500, margin: 0 }}>Test Review — {data.testName || 'Assessment'}</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '2px 0 0' }}>
            Attempt {data.attemptNumber || 1} of {data.maxAttempts || 1}
            {data.startedAt ? ' · Started: ' + formatDateTime(data.startedAt) : ''}
            {data.submittedAt ? ' · Ended: ' + formatDateTime(data.submittedAt) : ''}
          </p>
        </div>
        <button onClick={() => navigate('/candidate')} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 13 }}>
          ← Back to Dashboard
        </button>
      </div>

      {/* SCORE SUMMARY */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) repeat(2, 1fr)', gap: 12, padding: '1.25rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
        <StatCard label="Score" value={`${data.score ?? '-'} / ${data.total ?? '-'}`} />
        <StatCard label="Percentage" value={`${pct}%`} color={passed ? '#34d399' : '#f87171'} />
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 18px' }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Grade</div>
          <span style={gradeBadge(grade)}>{grade}</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 18px' }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Result</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: passed ? '#34d399' : '#f87171' }}>{passed ? 'PASS' : 'FAIL'}</div>
        </div>
        {/* Start / End time cards spanning the last 2 columns */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 18px', gridColumn: 'span 2' }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Time Window</div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>Started</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: 'monospace' }}>{data.startedAt ? formatDateTime(data.startedAt) : '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>Submitted</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: 'monospace' }}>{data.submittedAt ? formatDateTime(data.submittedAt) : '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>Duration</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: 'monospace' }}>{formatTimeTaken(data.timeTaken)}</div>
            </div>
          </div>
        </div>
      </div>
      {/* Violations row */}
      {(data.violationCount || 0) > 0 && (
        <div style={{ padding: '8px 2rem', background: 'rgba(226,75,74,0.08)', borderBottom: '1px solid rgba(226,75,74,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: '#E24B4A', fontWeight: 600 }}>⚠ {data.violationCount} tab-switch violation{data.violationCount > 1 ? 's' : ''} recorded during this attempt.</span>
        </div>
      )}

      {/* MCQ PERFORMANCE BAR */}
      {summary.mcqTotal > 0 && (
        <div style={{ padding: '1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '2rem', background: 'rgba(255,255,255,0.01)' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{isHybrid ? 'MCQ:' : 'Performance:'}</span>
          <span style={{ color: '#1D9E75', fontSize: 13, fontWeight: 500 }}>✓ {summary.mcqCorrect} Correct</span>
          <span style={{ color: '#E24B4A', fontSize: 13, fontWeight: 500 }}>✗ {summary.mcqWrong} Wrong</span>
          <span style={{ color: '#BA7517', fontSize: 13, fontWeight: 500 }}>— {summary.mcqSkipped} Skipped</span>
          <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${mcqPct}%`, background: '#1D9E75', borderRadius: 99, transition: 'width 0.8s' }} />
          </div>
          <span style={{ color: '#fff', fontWeight: 500 }}>{mcqPct}%</span>
        </div>
      )}

      {/* CODING PERFORMANCE BAR (hybrid tests) */}
      {isHybrid && codingProblems.length > 0 && (
        <div style={{ padding: '1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: 12 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Coding:</span>
            <span style={{ color: '#7c3aed', fontSize: 13, fontWeight: 500 }}>
              {summary.codingEarned ?? codingProblems.reduce((s, p) => s + (p.earned || 0), 0)} / {summary.codingTotal ?? codingProblems.reduce((s, p) => s + (p.maxPoints || 0), 0)} pts
            </span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
              ({codingProblems.filter(p => p.status === 'accepted').length} / {codingProblems.length} problems accepted)
            </span>
            <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${summary.codingPercentage ?? 0}%`, background: '#7c3aed', borderRadius: 99, transition: 'width 0.8s' }} />
            </div>
            <span style={{ color: '#fff', fontWeight: 500 }}>{summary.codingPercentage ?? 0}%</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
            {codingProblems.map((p, i) => {
              const statusColor = p.status === 'accepted' ? '#1D9E75' : p.status === 'wrong_answer' ? '#E24B4A' : p.status === 'not_attempted' ? '#BA7517' : '#60a5fa';
              return (
                <div key={p.id || i} style={{ padding: '10px 14px', borderRadius: 8, background: statusColor + '11', border: '1px solid ' + statusColor + '44' }}>
                  <div style={{ fontSize: 12, color: statusColor, fontWeight: 600, marginBottom: 4 }}>
                    {p.status === 'accepted' ? '✓' : p.status === 'not_attempted' ? '—' : '✗'} {p.status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </div>
                  <div style={{ fontSize: 13, color: '#fff', fontWeight: 500, marginBottom: 2 }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                    {p.difficulty} · {p.earned || 0}/{p.maxPoints} pts
                    {p.totalCases > 0 && ` · ${p.passedCases}/${p.totalCases} cases`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FILTER TABS */}
      {summary.mcqTotal > 0 && (
        <div style={{ padding: '1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 8 }}>
          {[
            { key: 'all', label: `All (${questions.length})` },
            { key: 'correct', label: `✓ Correct (${summary.mcqCorrect})` },
            { key: 'wrong', label: `✗ Wrong (${summary.mcqWrong})` },
            { key: 'skipped', label: `— Skipped (${summary.mcqSkipped})` },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              style={{
                padding: '6px 16px', borderRadius: 99, cursor: 'pointer',
                border: '1px solid ' + (activeFilter === f.key ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.1)'),
                background: activeFilter === f.key ? 'rgba(139,92,246,0.2)' : 'transparent',
                color: activeFilter === f.key ? '#a78bfa' : 'rgba(255,255,255,0.5)',
                fontSize: 13, fontWeight: activeFilter === f.key ? 500 : 400,
                fontFamily: 'inherit',
              }}
            >{f.label}</button>
          ))}
        </div>
      )}

      {/* 2-COLUMN QUESTION GRID */}
      <div style={{ padding: '1.5rem 2rem' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: 40 }}>No questions in this filter</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 16 }}>
            {filtered.map((q, i) => {
              const cardBg = q.isSkipped ? 'rgba(186,117,23,0.07)' : q.isCorrect ? 'rgba(29,158,117,0.07)' : 'rgba(226,75,74,0.07)';
              const cardBorder = q.isSkipped ? 'rgba(186,117,23,0.3)' : q.isCorrect ? 'rgba(29,158,117,0.3)' : 'rgba(226,75,74,0.3)';
              return (
                <div key={q.id || i} style={{ padding: 16, background: cardBg, border: '1px solid ' + cardBorder, borderRadius: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Q{q.displayId || i + 1}</span>
                    {q.isSkipped && <span style={{ background: 'rgba(186,117,23,0.2)', color: '#BA7517', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>— Skipped</span>}
                    {!q.isSkipped && q.isCorrect && <span style={{ background: 'rgba(29,158,117,0.2)', color: '#1D9E75', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>✓ Correct</span>}
                    {!q.isSkipped && !q.isCorrect && <span style={{ background: 'rgba(226,75,74,0.2)', color: '#E24B4A', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>✗ Wrong</span>}
                    {q.subject && (
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginLeft: 'auto' }}>
                        {q.subject}{q.difficulty ? ' · ' + q.difficulty : ''}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 10, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{q.question}</div>
                  {q.code_snippet && (
                    <pre style={{ background: 'rgba(0,0,0,0.4)', padding: 10, borderRadius: 6, fontSize: 12, color: 'rgba(255,255,255,0.8)', overflowX: 'auto', margin: '0 0 10px', fontFamily: "'JetBrains Mono', monospace" }}>{q.code_snippet}</pre>
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
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(186,117,23,0.1)', border: '1px solid rgba(186,117,23,0.2)', fontSize: 12, color: '#BA7517', marginTop: 4 }}>
                      Not answered. Correct answer: {q.correctAnswerLetter}{q.correctAnswerText ? ' — ' + q.correctAnswerText : ''}
                    </div>
                  )}
                  {q.explanation && (
                    <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.03)', fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                      <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Explanation: </strong>{q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
