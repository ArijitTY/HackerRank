import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../../api';

const SECTION_COLORS = {
  'Core Java': '#8b5cf6', 'Selenium WebDriver': '#3b82f6',
  'RestAssured & API Testing': '#84cc16', 'SQL': '#f59e0b',
  'Python Coding': '#10b981'
};
const DIFF_COLORS = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };

const STATUS_ICONS = {
  accepted: '✅', wrong_answer: '❌', compile_error: '⚠️',
  runtime_error: '💥', time_limit_exceeded: '⏱️', not_attempted: '⬜', attempted: '✏️'
};

const STATUS_LABELS = {
  accepted: 'ACCEPTED', wrong_answer: 'WRONG ANSWER', compile_error: 'COMPILE ERROR',
  runtime_error: 'RUNTIME ERROR', time_limit_exceeded: 'TIME LIMIT EXCEEDED'
};

const STATUS_COLORS = {
  accepted: '#10b981', wrong_answer: '#ef4444', compile_error: '#f59e0b',
  runtime_error: '#f97316', time_limit_exceeded: '#a78bfa'
};

function parseTime(t) {
  if (!t) return Date.now();
  if (typeof t === 'number') return t;
  const s = String(t);
  if (!s.includes('Z') && !s.includes('T') && !s.includes('+')) return new Date(s + 'Z').getTime();
  return new Date(s).getTime();
}

function TimeBadge({ ms }) {
  if (!ms && ms !== 0) return null;
  const label = ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  return <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace', marginLeft: 6 }}>⚡ {label}</span>;
}

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || '#64748b';
  const label = STATUS_LABELS[status] || (status || '').toUpperCase().replace(/_/g, ' ');
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 4, fontSize: 12,
      fontWeight: 700, letterSpacing: 0.5,
      background: color + '1a', color, border: `1px solid ${color}44`
    }}>{label}</span>
  );
}

// ──────── Execution Result Panel ────────
function ErrorBlock({ text }) {
  if (!text) return null;
  return (
    <pre style={{
      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
      borderRadius: 6, padding: '10px 14px', color: '#fca5a5', fontSize: 12,
      fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'pre-wrap',
      wordBreak: 'break-all', margin: '8px 0 0', maxHeight: 200, overflowY: 'auto'
    }}>{text}</pre>
  );
}

function IOBlock({ label, value, color }) {
  if (value === undefined || value === null) return null;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: color || 'rgba(255,255,255,0.4)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <pre style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 6, padding: '8px 12px', margin: 0, color: 'rgba(255,255,255,0.8)',
        fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
        whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 120, overflowY: 'auto'
      }}>{value === '' ? <span style={{ color: '#475569', fontStyle: 'italic' }}>(empty)</span> : value}</pre>
    </div>
  );
}

// ──────── Sample Case Card ────────
function SampleCaseResult({ r, idx }) {
  const [open, setOpen] = useState(true);
  const color = r.passed ? '#10b981' : STATUS_COLORS[r.status] || '#ef4444';
  return (
    <div style={{
      border: `1px solid ${color}33`, borderRadius: 8, marginBottom: 8, overflow: 'hidden'
    }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
          background: color + '0d', cursor: 'pointer', userSelect: 'none'
        }}
      >
        <span style={{ fontSize: 14 }}>{r.passed ? '✅' : STATUS_ICONS[r.status] || '❌'}</span>
        <span style={{ fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,0.85)', flex: 1 }}>
          Sample Case {idx + 1}
        </span>
        <StatusBadge status={r.passed ? 'accepted' : r.status} />
        {r.timeTaken !== undefined && <TimeBadge ms={r.timeTaken} />}
        <span style={{ color: '#475569', fontSize: 12, marginLeft: 4 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ padding: '10px 12px' }}>
          {r.status === 'compile_error' || r.status === 'runtime_error' ? (
            <>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#fca5a5', marginBottom: 4, textTransform: 'uppercase' }}>
                {r.status === 'compile_error' ? 'Compilation Error' : 'Runtime Error / Stderr'}
              </div>
              <ErrorBlock text={r.output || r.error || 'Unknown error'} />
            </>
          ) : (
            <>
              <IOBlock label="Input" value={r.input} color="#60a5fa" />
              <IOBlock label="Your Output" value={r.output} color={r.passed ? '#34d399' : '#f87171'} />
              {!r.passed && <IOBlock label="Expected Output" value={r.expectedOutput} color="#34d399" />}
              {r.explanation && (
                <div style={{ marginTop: 6, fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
                  💡 {r.explanation}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ──────── Hidden Case Card (submit) ────────
function HiddenCaseResult({ r, idx, scorePerCase }) {
  const [open, setOpen] = useState(false);
  const color = r.passed ? '#10b981' : STATUS_COLORS[r.status] || '#ef4444';
  return (
    <div style={{
      border: `1px solid ${color}33`, borderRadius: 8, marginBottom: 8, overflow: 'hidden'
    }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
          background: color + '0d', cursor: 'pointer', userSelect: 'none'
        }}
      >
        <span style={{ fontSize: 14 }}>{r.passed ? '✅' : STATUS_ICONS[r.status] || '❌'}</span>
        <span style={{ fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,0.85)', flex: 1 }}>
          🔒 Hidden Case {idx + 1}
        </span>
        <StatusBadge status={r.passed ? 'accepted' : r.status} />
        {r.timeTaken !== undefined && <TimeBadge ms={r.timeTaken} />}
        <span style={{ color: r.passed ? '#10b981' : '#64748b', fontSize: 12, fontFamily: 'monospace', marginLeft: 4 }}>
          {r.passed ? `+${scorePerCase}pts` : '0pts'}
        </span>
        <span style={{ color: '#475569', fontSize: 12 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && !r.passed && (r.output || r.error) && (
        <div style={{ padding: '10px 12px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 4, textTransform: 'uppercase' }}>
            Your Output {r.status === 'runtime_error' ? '(stderr)' : ''}
          </div>
          <ErrorBlock text={r.error || r.output} />
        </div>
      )}
      {open && r.passed && (
        <div style={{ padding: '8px 12px', fontSize: 12, color: '#34d399' }}>Test case passed ✓</div>
      )}
    </div>
  );
}

export default function CodingTestPage({ user, testId, sessionId, problems, totalPoints, startTime, durationMinutes, resumeData }) {
  const navigate = useNavigate();
  const durationSeconds = (durationMinutes || 90) * 60;

  const [currentProblem, setCurrentProblem] = useState(0);
  const [codeMap, setCodeMap] = useState(() => {
    const m = {};
    problems.forEach(p => {
      m[p.id] = resumeData?.codeMap?.[p.id] ?? (p.starterCode || '');
    });
    return m;
  });

  const [runResults, setRunResults] = useState({});       // sample run results per problem
  const [submitResults, setSubmitResults] = useState(() => {
    if (!resumeData?.codingResults) return {};
    const r = {};
    Object.entries(resumeData.codingResults).forEach(([pid, d]) => { r[parseInt(pid)] = d; });
    return r;
  });
  const [customInput, setCustomInput] = useState({});     // custom stdin per problem
  const [customResults, setCustomResults] = useState({}); // custom run results per problem

  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runningCustom, setRunningCustom] = useState(false);

  const [showFinish, setShowFinish] = useState(false);
  const [showResumeBanner, setShowResumeBanner] = useState(!!resumeData?.codeMap);
  const [sidebar, setSidebar] = useState(true);
  // activeTab: 'problem' | 'custom' | 'run' | 'submit'
  const [activeTab, setActiveTab] = useState('problem');
  const [result, setResult] = useState(null);
  const submitted = useRef(false);

  const calcTimeLeft = useCallback(() => {
    const start = parseTime(startTime);
    const elapsed = Math.floor((Date.now() - start) / 1000);
    return Math.max(0, durationSeconds - elapsed);
  }, [startTime, durationSeconds]);

  const [timeLeft, setTimeLeft] = useState(calcTimeLeft);

  const problem = problems[currentProblem];
  const code = codeMap[problem.id] || '';
  const isPython = problem.evaluationType === 'python' || problem.section === 'Python Coding';
  const isSql = problem.evaluationType === 'sql' || problem.section === 'SQL';
  const lang = isPython ? 'python' : isSql ? 'sql' : 'java';

  const doFinish = useCallback(async () => {
    if (submitted.current) return;
    submitted.current = true;
    try {
      const res = await api.post(`/candidate/tests/${testId}/session/${sessionId}/submit`);
      setResult(res.data);
    } catch (e) {
      console.error('Submit error:', e);
      submitted.current = false;
    }
  }, [testId, sessionId]);

  useEffect(() => { if (calcTimeLeft() <= 0) doFinish(); }, []); // eslint-disable-line

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); doFinish(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [doFinish]);

  useEffect(() => {
    if (showResumeBanner) {
      const t = setTimeout(() => setShowResumeBanner(false), 8000);
      return () => clearTimeout(t);
    }
  }, [showResumeBanner]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const timePercent = timeLeft / durationSeconds;
  const timerClass = timePercent <= 0.15 ? 'timer-danger' : timePercent <= 0.30 ? 'timer-warn' : '';

  // ── Run against sample cases ──
  const handleRun = async () => {
    setRunning(true);
    setActiveTab('run');
    try {
      const res = await api.post(`/candidate/tests/${testId}/run`, { sessionId, problemId: problem.id, code });
      setRunResults(prev => ({ ...prev, [problem.id]: res.data }));
    } catch (e) {
      setRunResults(prev => ({ ...prev, [problem.id]: { status: 'runtime_error', results: [{ passed: false, output: e.message, status: 'runtime_error' }], passedCases: 0, totalCases: 1 } }));
    }
    setRunning(false);
  };

  // ── Submit against hidden cases ──
  const handleSubmitCode = async () => {
    setSubmitting(true);
    setActiveTab('submit');
    try {
      const res = await api.post(`/candidate/tests/${testId}/submit-code`, { sessionId, problemId: problem.id, code });
      setSubmitResults(prev => ({ ...prev, [problem.id]: res.data }));
    } catch (e) {
      setSubmitResults(prev => ({ ...prev, [problem.id]: { status: 'runtime_error', passedCases: 0, totalCases: 0, score: 0 } }));
    }
    setSubmitting(false);
  };

  // ── Run with custom input ──
  const handleRunCustom = async () => {
    setRunningCustom(true);
    setActiveTab('custom');
    try {
      const res = await api.post(`/candidate/tests/${testId}/run-custom`, {
        sessionId, problemId: problem.id, code, customInput: customInput[problem.id] || ''
      });
      setCustomResults(prev => ({ ...prev, [problem.id]: res.data }));
    } catch (e) {
      setCustomResults(prev => ({ ...prev, [problem.id]: { status: 'runtime_error', output: '', error: e.message } }));
    }
    setRunningCustom(false);
  };

  const currentScore = Object.values(submitResults).reduce((s, r) => s + (r.score || 0), 0);

  // Group problems by section for sidebar
  const sections = {};
  problems.forEach((p, idx) => {
    if (!sections[p.section]) sections[p.section] = [];
    sections[p.section].push({ ...p, idx });
  });

  const getStatus = (pid) => {
    if (submitResults[pid]) return submitResults[pid].status;
    if (codeMap[pid] && codeMap[pid] !== problems.find(p => p.id === pid)?.starterCode) return 'attempted';
    return 'not_attempted';
  };

  // ──────────────────── RESULT SCREEN ────────────────────
  if (result) {
    const pct = result.percentage || 0;
    const earnedPts = result.earnedPoints || 0;
    const totalPts = result.totalPoints || totalPoints;
    const grade = result.grade || 'F';
    const sectionScores = result.sectionScores || {};
    const problemSummary = result.problemSummary || [];
    const timeTakenMin = Math.floor((result.timeTaken || 0) / 60);
    const timeTakenSec = (result.timeTaken || 0) % 60;
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (pct / 100) * circumference;
    const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#3b82f6' : '#ef4444';

    return (
      <div style={{ background: '#030712', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 800, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <svg width="140" height="140" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#1e293b" strokeWidth="8" />
              <circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
              <text x="60" y="55" textAnchor="middle" fill={color} fontSize="28" fontWeight="800">{Math.round(pct)}%</text>
              <text x="60" y="75" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="600">{grade}</text>
            </svg>
            <h2 style={{ color: 'white', margin: '12px 0 4px' }}>{pct >= 60 ? '🎉 Congratulations!' : '📚 Keep Practicing!'}</h2>
            <p style={{ color: '#94a3b8' }}>Score: {earnedPts}/{totalPts} points &nbsp;|&nbsp; Time: {timeTakenMin}m {timeTakenSec}s</p>
          </div>

          <div style={{ background: '#111827', borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <h3 style={{ color: 'white', marginBottom: 16, fontSize: 16 }}>Section Breakdown</h3>
            {Object.entries(sectionScores).map(([sec, s]) => {
              const secPct = s.total > 0 ? Math.round((s.earned / s.total) * 100) : 0;
              return (
                <div key={sec} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: SECTION_COLORS[sec] || '#e2e8f0', fontWeight: 600, fontSize: 13 }}>{sec}</span>
                    <span style={{ color: '#94a3b8', fontSize: 13 }}>{s.earned}/{s.total} pts ({secPct}%)</span>
                  </div>
                  <div style={{ height: 6, background: '#1e293b', borderRadius: 3 }}>
                    <div style={{ height: '100%', width: `${secPct}%`, background: SECTION_COLORS[sec] || '#3b82f6', borderRadius: 3, transition: 'width 0.8s' }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ background: '#111827', borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <h3 style={{ color: 'white', marginBottom: 16, fontSize: 16 }}>Problem Results</h3>
            {problemSummary.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #1e293b' }}>
                <span style={{ fontSize: 16 }}>{STATUS_ICONS[p.status] || '⬜'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#e2e8f0', fontSize: 14 }}>{p.title}</div>
                  <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>{p.section} &nbsp;·&nbsp; {p.difficulty}</div>
                </div>
                {p.passedCases !== undefined && (
                  <span style={{ fontSize: 12, color: '#64748b' }}>{p.passedCases}/{p.totalCases} cases</span>
                )}
                <span style={{ color: p.earned > 0 ? '#10b981' : '#64748b', fontSize: 13, fontFamily: 'monospace', minWidth: 50, textAlign: 'right' }}>{p.earned}/{p.maxPoints}</span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button onClick={() => navigate('/candidate')} style={{ padding: '12px 32px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────── CODING TEST UI ────────────────────
  const runData = runResults[problem.id];
  const submitData = submitResults[problem.id];
  const customData = customResults[problem.id];

  // Score-per-case for hidden results
  const scorePerCase = submitData
    ? (submitData.totalCases > 0 ? Math.round((submitData.maxScore || problem.points) / submitData.totalCases) : 0)
    : 0;

  const timeLimitSec = problem.timeLimit ? (problem.timeLimit / 1000) : 10;

  return (
    <div className="coding-screen">
      {showResumeBanner && (
        <div className="resume-banner">
          <span>🔄 Session Restored — Welcome back! Your code and progress have been recovered.</span>
          <button className="resume-dismiss" onClick={() => setShowResumeBanner(false)}>✕</button>
        </div>
      )}

      <header className="coding-header">
        <div className="coding-header-left">
          <button className="btn-sidebar-toggle" onClick={() => setSidebar(!sidebar)}>{sidebar ? '◀' : '▶'}</button>
          <span className="brand-icon-sm">⚡</span>
          <span className="brand-text-sm">SkillForge</span>
          <span className="header-sep">|</span>
          <span className="candidate-name">{user?.name}</span>
        </div>
        <div className="coding-header-center">
          <span className="score-display mono">Score: <strong>{currentScore}</strong>/{totalPoints}</span>
        </div>
        <div className="coding-header-right">
          <div className={`timer ${timerClass}`}><span className="mono">{formatTime(timeLeft)}</span></div>
          <button className="btn btn-danger btn-sm" onClick={() => setShowFinish(true)}>End Exam</button>
        </div>
      </header>

      <div className="coding-body">
        {sidebar && (
          <aside className="problem-sidebar">
            {Object.entries(sections).map(([sec, probs]) => (
              <div key={sec} className="sidebar-section">
                <div className="sidebar-section-title" style={{ color: SECTION_COLORS[sec] }}>{sec}</div>
                {probs.map(p => {
                  const st = getStatus(p.id);
                  const isCurrent = p.idx === currentProblem;
                  return (
                    <button key={p.id} className={`sidebar-problem ${isCurrent ? 'sp-active' : ''}`} onClick={() => setCurrentProblem(p.idx)}>
                      <span className="sp-status">{STATUS_ICONS[st] || '⬜'}</span>
                      <span className="sp-title">{p.idx + 1}. {p.title}</span>
                      <span className="sp-pts mono">{p.points}pt</span>
                      <span className="sp-diff" style={{ color: DIFF_COLORS[p.difficulty] }}>{p.difficulty[0]}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </aside>
        )}

        <div className="split-pane">
          {/* ──── LEFT PANE: Problem Statement ──── */}
          <div className="pane-left">
            {/* Problem Header */}
            <div className="problem-header">
              <h2>{currentProblem + 1}. {problem.title}</h2>
              <div className="problem-badges" style={{ flexWrap: 'wrap', gap: 6 }}>
                <span className="badge" style={{ background: (SECTION_COLORS[problem.section] || '#6366f1') + '22', color: SECTION_COLORS[problem.section] || '#6366f1', border: `1px solid ${SECTION_COLORS[problem.section] || '#6366f1'}44` }}>{problem.section}</span>
                <span className="badge" style={{ background: DIFF_COLORS[problem.difficulty] + '22', color: DIFF_COLORS[problem.difficulty], border: `1px solid ${DIFF_COLORS[problem.difficulty]}44` }}>{problem.difficulty}</span>
                <span className="badge badge-pts">{problem.points} pts</span>
                <span className="badge" style={{ background: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.3)' }}>⏱ {timeLimitSec}s</span>
                <span className="badge" style={{ background: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.3)' }}>🐍 {isPython ? 'Python 3' : isSql ? 'SQL' : 'Java'}</span>
              </div>
            </div>

            <div className="problem-body">
              {/* Description */}
              <div className="problem-desc">
                {problem.description.split('\n').map((line, i) => <p key={i}>{line || <br />}</p>)}
              </div>

              {/* Input Format */}
              {problem.inputFormat && (
                <div className="problem-section">
                  <h4>📥 Input Format</h4>
                  <p>{problem.inputFormat}</p>
                </div>
              )}

              {/* Output Format */}
              {problem.outputFormat && (
                <div className="problem-section">
                  <h4>📤 Output Format</h4>
                  <p>{problem.outputFormat}</p>
                </div>
              )}

              {/* Constraints */}
              {problem.constraints && (
                <div className="problem-section">
                  <h4>📐 Constraints</h4>
                  <pre className="constraints-pre">{problem.constraints}</pre>
                </div>
              )}

              {/* Sample Test Cases */}
              {problem.sampleTestCases && problem.sampleTestCases.length > 0 && (
                <div className="problem-section">
                  <h4>🧪 Sample Test Cases</h4>
                  {problem.sampleTestCases.map((tc, i) => (
                    <div key={i} className="sample-case">
                      <div className="sample-label">Sample {i + 1}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {tc.input && (
                          <div className="sample-block">
                            <span className="sample-tag">Input</span>
                            <pre>{tc.input}</pre>
                          </div>
                        )}
                        <div className="sample-block">
                          <span className="sample-tag">Expected Output</span>
                          <pre>{tc.expectedOutput}</pre>
                        </div>
                      </div>
                      {tc.explanation && (
                        <div className="sample-explanation">💡 {tc.explanation}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ──── RIGHT PANE: Editor + Output ──── */}
          <div className="pane-right">
            {/* Editor */}
            <div className="editor-container">
              <div className="editor-header">
                <span className="editor-lang">{isPython ? '🐍 Python 3' : isSql ? '🗄 SQL' : '☕ Java'}</span>
                <span style={{ fontSize: 11, color: '#475569' }}>Time limit: {timeLimitSec}s &nbsp;|&nbsp; Max code: 50KB</span>
              </div>
              <Editor
                height="100%"
                language={lang}
                theme="vs-dark"
                value={code}
                onChange={(val) => setCodeMap(prev => ({ ...prev, [problem.id]: val || '' }))}
                options={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  automaticLayout: true,
                  tabSize: 4,
                  lineNumbers: 'on',
                  renderLineHighlight: 'all',
                }}
              />
            </div>

            {/* Output Panel */}
            <div className="output-panel">
              {/* Tabs */}
              <div className="output-tabs">
                <button
                  className={`output-tab ${activeTab === 'problem' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('problem')}
                >Console</button>
                <button
                  className={`output-tab ${activeTab === 'custom' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('custom')}
                  title="Run code with your own stdin input"
                >Custom Input</button>
                <button
                  className={`output-tab ${activeTab === 'run' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('run')}
                >
                  Sample Cases
                  {runData && (
                    <span style={{ marginLeft: 6, fontSize: 11, color: runData.passedCases === runData.totalCases ? '#10b981' : '#ef4444' }}>
                      {runData.passedCases}/{runData.totalCases}
                    </span>
                  )}
                </button>
                <button
                  className={`output-tab ${activeTab === 'submit' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('submit')}
                >
                  Submission
                  {submitData && (
                    <span style={{ marginLeft: 6, fontSize: 11, color: submitData.passedCases === submitData.totalCases ? '#10b981' : '#ef4444' }}>
                      {submitData.passedCases}/{submitData.totalCases}
                    </span>
                  )}
                </button>
              </div>

              <div className="output-body">

                {/* ── Console (idle) ── */}
                {activeTab === 'problem' && (
                  <div className="console-empty">
                    <div style={{ fontSize: 28, marginBottom: 8 }}>💻</div>
                    <div>Click <strong>▶ Run Code</strong> to test with sample cases.</div>
                    <div style={{ marginTop: 4, fontSize: 12 }}>Use <strong>Custom Input</strong> to test with your own data.</div>
                  </div>
                )}

                {/* ── Custom Input Tab ── */}
                {activeTab === 'custom' && (
                  <div style={{ padding: '12px 14px', height: '100%', display: 'flex', flexDirection: 'column', gap: 10, overflow: 'auto' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Custom stdin Input
                      </div>
                      <textarea
                        value={customInput[problem.id] || ''}
                        onChange={e => setCustomInput(prev => ({ ...prev, [problem.id]: e.target.value }))}
                        placeholder="Type your custom input here..."
                        style={{
                          width: '100%', minHeight: 80, padding: '8px 10px',
                          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 6, color: 'white', fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
                          resize: 'vertical', outline: 'none', boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <button
                      onClick={handleRunCustom}
                      disabled={runningCustom}
                      style={{
                        padding: '7px 18px', background: runningCustom ? '#334155' : '#0f172a',
                        color: runningCustom ? '#64748b' : '#38bdf8', border: '1px solid #1e3a5f',
                        borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: runningCustom ? 'not-allowed' : 'pointer',
                        alignSelf: 'flex-start'
                      }}
                    >{runningCustom ? '⏳ Running...' : '▶ Run with Custom Input'}</button>

                    {customData && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <StatusBadge status={customData.status === 'success' ? 'accepted' : customData.status} />
                          <TimeBadge ms={customData.timeTaken} />
                        </div>
                        {(customData.status === 'runtime_error' || customData.status === 'compile_error') && customData.error ? (
                          <>
                            <div style={{ fontSize: 11, color: '#fca5a5', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>Error Output</div>
                            <ErrorBlock text={customData.error} />
                          </>
                        ) : (
                          <IOBlock label="stdout" value={customData.output} color="#34d399" />
                        )}
                      </div>
                    )}
                    {!customData && !runningCustom && (
                      <div style={{ color: '#334155', fontSize: 13, textAlign: 'center', paddingTop: 8 }}>No output yet.</div>
                    )}
                  </div>
                )}

                {/* ── Sample Cases (run results) ── */}
                {activeTab === 'run' && (
                  <div style={{ padding: '10px 12px', overflowY: 'auto', height: '100%' }}>
                    {running && <div style={{ color: '#64748b', textAlign: 'center', paddingTop: 20 }}>⏳ Running sample cases...</div>}
                    {!running && !runData && <div className="console-empty">Click <strong>▶ Run Code</strong> to test sample cases.</div>}
                    {!running && runData && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <StatusBadge status={runData.status} />
                          <span style={{ fontSize: 13, color: '#94a3b8' }}>
                            {runData.passedCases}/{runData.totalCases} sample case{runData.totalCases !== 1 ? 's' : ''} passed
                          </span>
                        </div>
                        {runData.results?.map((r, i) => (
                          <SampleCaseResult key={i} r={r} idx={i} />
                        ))}
                      </>
                    )}
                  </div>
                )}

                {/* ── Submit Results (hidden cases) ── */}
                {activeTab === 'submit' && (
                  <div style={{ padding: '10px 12px', overflowY: 'auto', height: '100%' }}>
                    {submitting && <div style={{ color: '#64748b', textAlign: 'center', paddingTop: 20 }}>⏳ Running hidden test cases...</div>}
                    {!submitting && !submitData && <div className="console-empty">Click <strong>Submit</strong> to run hidden test cases.</div>}
                    {!submitting && submitData && (
                      <>
                        {/* Score summary bar */}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12,
                          padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8
                        }}>
                          <StatusBadge status={submitData.status} />
                          <span style={{ fontSize: 13, color: '#94a3b8', flex: 1 }}>
                            {submitData.passedCases}/{submitData.totalCases} hidden cases passed
                          </span>
                          <span style={{
                            fontSize: 15, fontWeight: 700, fontFamily: 'monospace',
                            color: submitData.score > 0 ? '#10b981' : '#64748b'
                          }}>
                            {submitData.score}/{submitData.maxScore} pts
                          </span>
                        </div>

                        {/* Per-case hidden results */}
                        {submitData.caseSummary ? (
                          submitData.caseSummary.map((r, i) => (
                            <HiddenCaseResult key={i} r={r} idx={i} scorePerCase={scorePerCase} />
                          ))
                        ) : (
                          // Fallback: synthesize from counts
                          Array.from({ length: submitData.totalCases }).map((_, i) => (
                            <HiddenCaseResult
                              key={i}
                              r={{ caseNum: i + 1, passed: i < submitData.passedCases, status: i < submitData.passedCases ? 'accepted' : 'wrong_answer', timeTaken: null }}
                              idx={i}
                              scorePerCase={scorePerCase}
                            />
                          ))
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="action-bar">
              <button className="btn btn-secondary" onClick={handleRun} disabled={running || submitting}>
                {running ? '⏳ Running...' : '▶ Run Code'}
              </button>
              <button className="btn btn-primary" onClick={handleSubmitCode} disabled={submitting || running}>
                {submitting ? '⏳ Submitting...' : '✔ Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Finish Modal ── */}
      {showFinish && (
        <div className="modal-overlay" onClick={() => setShowFinish(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>End Exam & Submit All?</h3>
            <p className="confirm-note">Current score: {currentScore}/{totalPoints} points</p>
            <p className="confirm-warn">You cannot make changes after submitting.</p>
            <div className="confirm-actions">
              <button className="btn btn-secondary" onClick={() => setShowFinish(false)}>Continue Coding</button>
              <button className="btn btn-danger" onClick={doFinish}>End Exam</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
