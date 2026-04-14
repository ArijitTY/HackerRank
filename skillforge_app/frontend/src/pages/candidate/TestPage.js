import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api';
import CodingTestPage from './CodingTestPage';
// Lazy-load Monaco for hybrid coding section
import MonacoEditor from '@monaco-editor/react';

function HybridMonacoEditor({ code, onChange, language = 'python' }) {
  return (
    <div style={{ flex: 1, minHeight: 300 }}>
      <MonacoEditor
        height="100%"
        language={language}
        value={code}
        onChange={onChange}
        theme="vs-dark"
        options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, automaticLayout: true }}
      />
    </div>
  );
}

function parseTime(t) {
  if (!t) return Date.now();
  if (typeof t === 'number') return t;
  const s = String(t);
  if (!s.includes('Z') && !s.includes('T') && !s.includes('+')) return new Date(s + 'Z').getTime();
  return new Date(s).getTime();
}

export default function TestPage({ user }) {
  const { testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state || {};

  // Coding test state
  const [testType, setTestType] = useState(navState.testType || 'mcq');
  const [codingData, setCodingData] = useState(navState.testType === 'coding' ? navState : null);

  const [hybridProblems, setHybridProblems] = useState(navState.testType === 'hybrid' ? (navState.problems || []) : []);
  const [hybridTotalPoints, setHybridTotalPoints] = useState(navState.totalPoints || 0); // eslint-disable-line no-unused-vars
  const [hybridSection, setHybridSection] = useState('mcq'); // 'mcq' or 'coding'
  const [hybridCodeMap, setHybridCodeMap] = useState(navState.codeMap || {});
  const [hybridCodeRunResults, setHybridCodeRunResults] = useState(navState.codingResults || {});
  const [hybridBestScores, setHybridBestScores] = useState(navState.bestScores || {});
  const [hybridActiveProblem, setHybridActiveProblem] = useState(0);
  const [hybridRunning, setHybridRunning] = useState(false);

  const [sessionId, setSessionId] = useState(navState.sessionId || null);
  const [questions, setQuestions] = useState(navState.questions || []);
  const [answers, setAnswers] = useState(() => {
    const raw = navState.answers || {};
    const norm = {};
    Object.entries(raw).forEach(([k, v]) => { const n = parseInt(v); if (!isNaN(n)) norm[String(k)] = n; });
    return norm;
  });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [startTime, setStartTime] = useState(navState.startTime ? parseTime(navState.startTime) : null);
  const [duration, setDuration] = useState((navState.durationMinutes || 0) * 60000);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!navState.sessionId);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);
  const submittedRef = useRef(false);
  const [resumed, setResumed] = useState(navState.resumed || false); // eslint-disable-line no-unused-vars
  const [showResumeBanner, setShowResumeBanner] = useState(navState.resumed || false);
  const timerReady = useRef(false);
  // Timer warning + question flagging
  const [showTimerWarning, setShowTimerWarning] = useState(false);
  const timerWarnShownRef = useRef(false);
  const [flagged, setFlagged] = useState(new Set());

  // ===== ANTI-CHEAT STATE =====
  const [violations, setViolations] = useState(0);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [violationMsg, setViolationMsg] = useState('');
  const violationsRef = useRef(0);

  useEffect(() => {
    // If we already have hybrid data from navigation state, skip API call
    if (navState.sessionId && navState.testType === 'hybrid') {
      setTestType('hybrid');
      setHybridProblems(navState.problems || []);
      setHybridTotalPoints(navState.totalPoints || 0);
      if (navState.codeMap) setHybridCodeMap(navState.codeMap);
      if (navState.bestScores) setHybridBestScores(navState.bestScores);
      if (navState.codingResults) setHybridCodeRunResults(navState.codingResults);
      setSessionId(navState.sessionId);
      setQuestions(navState.questions || []);
      setStartTime(parseTime(navState.startTime));
      setDuration((navState.durationMinutes || 60) * 60000);
      const raw = navState.answers || {};
      const norm = {};
      Object.entries(raw).forEach(([k, v]) => { const n = parseInt(v); if (!isNaN(n)) norm[String(k)] = n; });
      setAnswers(norm);
      setLoading(false);
      if (navState.resumed) setTimeout(() => setShowResumeBanner(false), 5000);
      setTimeout(() => { timerReady.current = true; }, 3000);
      return;
    }

    // If we already have data from navigation state, skip API call
    if (navState.sessionId && navState.questions && navState.questions.length > 0) {
      console.log('[TEST] Using navigation state:', navState.questions.length, 'questions,', Object.keys(navState.answers || {}).length, 'answers');
      setLoading(false);
      if (navState.resumed) setTimeout(() => setShowResumeBanner(false), 5000);
      setTimeout(() => { timerReady.current = true; }, 3000);
      return;
    }

    // No nav state — call /start API
    const initSession = async () => {
      try {
        console.log('[TEST] No nav state, calling /start API');
        const { data } = await api.post(`/candidate/tests/${testId}/start`);

        // Check if this is a coding test
        if (data.testType === 'coding') {
          setTestType('coding');
          setCodingData(data);
          setLoading(false);
          return;
        }

        if (data.testType === 'hybrid') {
          setTestType('hybrid');
          setHybridProblems(data.problems || []);
          setHybridTotalPoints(data.totalPoints || 0);
          if (data.codeMap) setHybridCodeMap(data.codeMap);
          if (data.bestScores) setHybridBestScores(data.bestScores);
          if (data.codingResults) setHybridCodeRunResults(data.codingResults);
          // MCQ part
          setSessionId(data.sessionId);
          setQuestions(data.questions || []);
          setStartTime(parseTime(data.startTime || data.start_time));
          setDuration((data.durationMinutes || 60) * 60000);
          if (data.answers) {
            const saved = {};
            Object.entries(data.answers).forEach(([k, v]) => { saved[String(k)] = parseInt(v); });
            setAnswers(saved);
          }
          if (data.resumed) { setResumed(true); setShowResumeBanner(true); setTimeout(() => setShowResumeBanner(false), 5000); }
          setLoading(false);
          return;
        }

        setSessionId(data.sessionId || data.session_id);
        setQuestions(data.questions || []);
        setStartTime(parseTime(data.startTime || data.start_time));
        setDuration((data.durationMinutes || data.duration || 60) * 60000);
        const saved = {};
        if (data.answers && typeof data.answers === 'object') {
          Object.entries(data.answers).forEach(([k, v]) => { saved[String(k)] = parseInt(v); });
        }
        setAnswers(saved);
        if (data.resumed) {
          setResumed(true);
          setShowResumeBanner(true);
          setTimeout(() => setShowResumeBanner(false), 5000);
        }
      } catch (err) {
        setError(err.response?.data?.error || err.response?.data?.message || 'Failed to start test');
      } finally {
        setLoading(false);
      }
    };
    initSession();
    setTimeout(() => { timerReady.current = true; }, 3000);
  }, [testId]); // eslint-disable-line

  // ===== ANTI-CHEAT: Tab switch & window blur detection =====
  useEffect(() => {
    if (!sessionId || result) return;

    const recordViolation = async (type) => {
      violationsRef.current += 1;
      const count = violationsRef.current;
      setViolations(count);

      if (count >= 3) {
        setViolationMsg(`You have switched tabs/windows ${count} times. The test is being auto-submitted.`);
        setShowViolationWarning(true);
        try {
          await api.post(`/candidate/tests/${testId}/session/${sessionId}/violation`, {
            type, timestamp: new Date().toISOString()
          });
        } catch { /* silent */ }
        // Auto-submit after brief delay so candidate sees the message
        setTimeout(() => {
          if (!submittedRef.current) {
            submittedRef.current = true;
            handleSubmit(true);
          }
        }, 3000);
      } else {
        setViolationMsg(`Warning ${count}/3: Tab switching is not allowed. After 3 violations your test will be auto-submitted.`);
        setShowViolationWarning(true);
        setTimeout(() => setShowViolationWarning(false), 6000);
        try {
          await api.post(`/candidate/tests/${testId}/session/${sessionId}/violation`, {
            type, timestamp: new Date().toISOString()
          });
        } catch { /* silent */ }
      }
    };

    const handleVisibility = () => {
      if (document.hidden && !submittedRef.current && timerReady.current) {
        recordViolation('tab_switch');
      }
    };

    const handleBlur = () => {
      if (!submittedRef.current && timerReady.current) {
        recordViolation('window_blur');
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
    };
  }, [sessionId, testId, result]); // eslint-disable-line

  useEffect(() => {
    if (!startTime || !duration) return;
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);
      // Show 5-min warning once
      if (remaining <= 300000 && remaining > 0 && !timerWarnShownRef.current) {
        timerWarnShownRef.current = true;
        setShowTimerWarning(true);
        setTimeout(() => setShowTimerWarning(false), 10000);
      }
      if (remaining <= 0 && !submittedRef.current && timerReady.current) {
        submittedRef.current = true;
        handleSubmit(true);
      }
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [startTime, duration]); // eslint-disable-line

  const handleAnswer = useCallback(async (questionId, optionIndex) => {
    const qKey = String(questionId);
    const val = parseInt(optionIndex);
    setAnswers(prev => ({ ...prev, [qKey]: val }));
    if (sessionId) {
      try {
        await api.post(`/candidate/tests/${testId}/session/${sessionId}/answer`, {
          questionId: qKey, selectedOption: val,
        });
      } catch { /* silent */ }
    }
  }, [testId, sessionId]);

  const handleSubmit = async (auto = false) => {
    if (submitting || result) return;
    setSubmitting(true);
    setShowConfirm(false);
    clearInterval(timerRef.current);
    try {
      const { data } = await api.post(`/candidate/tests/${testId}/session/${sessionId}/submit`, { answers, auto });
      setResult(data.result || data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const hybridRunCode = async (problemId, code, input = '') => {
    setHybridRunning(true);
    try {
      const { data } = await api.post(`/candidate/tests/${testId}/run`, { problemId, code, input });
      setHybridCodeRunResults(prev => ({ ...prev, [problemId]: data }));
      if (data.passed !== undefined || (data.results && data.results.every(r => r.passed))) {
        // Calculate points
        const problem = hybridProblems.find(p => p.id === problemId);
        if (problem && data.results) {
          const passed = data.results.filter(r => r.passed).length;
          const total = data.results.length;
          const pts = total > 0 ? Math.round((passed / total) * problem.points) : 0;
          setHybridBestScores(prev => ({ ...prev, [problemId]: Math.max(prev[problemId] || 0, pts) }));
        }
      }
    } catch (err) { console.error('Run error:', err); }
    finally { setHybridRunning(false); }
  };

  const hybridSubmitCode = async (problemId) => {
    const code = hybridCodeMap[problemId] || '';
    if (!code.trim()) return;
    setHybridRunning(true);
    try {
      const { data } = await api.post(`/candidate/tests/${testId}/submit-code`, { problemId, code });
      if (data.score !== undefined) {
        setHybridBestScores(prev => ({ ...prev, [problemId]: Math.max(prev[problemId] || 0, data.score) }));
      }
      setHybridCodeRunResults(prev => ({ ...prev, [`${problemId}_submitted`]: data }));
    } catch (err) { console.error('Submit code error:', err); }
    finally { setHybridRunning(false); }
  };

  const formatTime = (ms) => {
    if (ms == null) return '--:--';
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const timerCls = () => {
    if (timeLeft == null || !duration) return 'test-timer';
    const pct = timeLeft / duration;
    if (pct < 0.15) return 'test-timer timer-danger';
    if (pct < 0.30) return 'test-timer timer-warn';
    return 'test-timer';
  };

  if (loading) return <div className="loading">Loading test...</div>;
  if (error && !questions.length) return (
    <div style={{ padding: 60, textAlign: 'center' }}>
      <div style={{ color: '#f87171', marginBottom: 20 }}>{error}</div>
      <button className="btn btn-outline" onClick={() => navigate('/candidate')}>Back to Dashboard</button>
    </div>
  );

  const toggleFlag = (qId) => {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId); else next.add(qId);
      return next;
    });
  };

  // Timer warning banner (≤5 min)
  const TimerWarning = showTimerWarning ? (
    <div style={{
      position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9998, maxWidth: 480, width: '90%',
      background: 'linear-gradient(135deg,#7f1d1d,#991b1b)',
      border: '1px solid #ef4444', borderRadius: 12, padding: '14px 20px',
      boxShadow: '0 0 40px rgba(239,68,68,0.35)',
      display: 'flex', alignItems: 'center', gap: 12, color: '#fff',
      animation: 'slideDown 0.4s ease'
    }}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>⏰</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>5 minutes remaining!</div>
        <div style={{ fontSize: 12, opacity: 0.85 }}>Please review your answers and submit before time runs out.</div>
      </div>
      <button onClick={() => setShowTimerWarning(false)} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: 18, flexShrink: 0 }}>✕</button>
    </div>
  ) : null;

  // Violation warning overlay
  const ViolationWarning = showViolationWarning ? (
    <div style={{
      position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, maxWidth: 520, width: '90%',
      background: violations >= 3 ? 'linear-gradient(135deg,#7f1d1d,#991b1b)' : 'linear-gradient(135deg,#78350f,#92400e)',
      border: `1px solid ${violations >= 3 ? '#ef4444' : '#f59e0b'}`,
      borderRadius: 12, padding: '16px 20px',
      boxShadow: `0 0 40px ${violations >= 3 ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.4)'}`,
      display: 'flex', alignItems: 'flex-start', gap: 12, color: '#fff'
    }}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>{violations >= 3 ? '🚨' : '⚠️'}</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
          {violations >= 3 ? 'Auto-submitting test!' : `Tab Switch Detected (${violations}/3)`}
        </div>
        <div style={{ fontSize: 13, opacity: 0.9 }}>{violationMsg}</div>
      </div>
    </div>
  ) : null;

  // ===== CODING TEST DISPATCH =====
  if (testType === 'coding' && codingData) {
    return (
      <CodingTestPage
        user={user}
        testId={testId}
        sessionId={codingData.sessionId}
        problems={codingData.problems || []}
        totalPoints={codingData.totalPoints || 0}
        startTime={codingData.startTime || codingData.start_time}
        durationMinutes={codingData.durationMinutes || 90}
        resumeData={codingData.resumed ? {
          codeMap: codingData.codeMap || {},
          codingResults: codingData.codingResults || {},
          bestScores: codingData.bestScores || {}
        } : null}
      />
    );
  }

  // ===== HYBRID TEST RENDER =====
  if (testType === 'hybrid') {
    const activeProblem = hybridProblems[hybridActiveProblem];
    const answeredMcq = Object.keys(answers).length;
    const solvedCoding = Object.values(hybridBestScores).filter(s => s > 0).length;
    const earnedPoints = Object.values(hybridBestScores).reduce((a, b) => a + b, 0);

    // If result is available, show result screen
    if (result) {
      const r = result;
      return (
        <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <div style={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>⚡</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Test Submitted!</h2>
            <div style={{ fontSize: 52, fontWeight: 900, fontFamily: "'JetBrains Mono',monospace", color: r.passed ? '#34d399' : '#f87171', margin: '20px 0 4px' }}>
              {r.percentage ?? '-'}%
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '24px 0', textAlign: 'left' }}>
              {r.mcqTotal > 0 && <div style={{ background: 'rgba(255,255,255,0.04)', padding: 16, borderRadius: 10 }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>MCQ Score</div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'monospace' }}>{r.mcqScore}/{r.mcqTotal}</div>
              </div>}
              {r.codingTotal > 0 && <div style={{ background: 'rgba(255,255,255,0.04)', padding: 16, borderRadius: 10 }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Coding Score</div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'monospace', color: '#a78bfa' }}>{r.codingEarned}/{r.codingTotal} pts</div>
              </div>}
            </div>
            <span className={`badge ${r.passed ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 14, padding: '6px 18px' }}>{r.passed ? 'PASS' : 'FAIL'}</span>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
              {r.mcqTotal > 0 && (
                <button className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 15, background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }} onClick={() => navigate(`/candidate/review/${testId}/${sessionId}`)}>
                  📝 Review MCQ Answers
                </button>
              )}
              <button className="btn btn-outline" style={{ padding: '12px 28px', fontSize: 15 }} onClick={() => navigate('/candidate')}>Back to Dashboard</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ minHeight: '100vh', background: '#030712', color: 'white', display: 'flex', flexDirection: 'column' }}>
        {ViolationWarning}
        {TimerWarning}
        {/* Header */}
        <div style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Custom Assessment</div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => setHybridSection('mcq')} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: hybridSection === 'mcq' ? '#7c3aed' : 'rgba(255,255,255,0.06)', color: hybridSection === 'mcq' ? 'white' : 'rgba(255,255,255,0.5)' }}>
                📝 MCQ ({answeredMcq}/{questions.length})
              </button>
              {hybridProblems.length > 0 && <button onClick={() => setHybridSection('coding')} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: hybridSection === 'coding' ? '#7c3aed' : 'rgba(255,255,255,0.06)', color: hybridSection === 'coding' ? 'white' : 'rgba(255,255,255,0.5)' }}>
                💻 Coding ({solvedCoding}/{hybridProblems.length})
              </button>}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {hybridProblems.length > 0 && <div style={{ fontSize: 13, color: '#a78bfa' }}>{earnedPoints} pts earned</div>}
            <div className={timerCls()} style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700 }}>{formatTime(timeLeft)}</div>
            <button onClick={() => setShowConfirm(true)} style={{ padding: '8px 20px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Submit All</button>
          </div>
        </div>

        {/* MCQ Section */}
        {hybridSection === 'mcq' && questions.length > 0 && (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Question grid nav */}
            <div style={{ width: 280, borderRight: '1px solid rgba(255,255,255,0.08)', padding: 16, overflowY: 'auto', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Questions ({answeredMcq}/{questions.length})</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
                {questions.map((q, i) => {
                  const answered = answers[String(q.id)] !== undefined;
                  const isCurrent = i === currentIdx;
                  return (
                    <button key={q.id} onClick={() => setCurrentIdx(i)} style={{ padding: '6px', fontSize: 11, fontWeight: 600, borderRadius: 4, border: 'none', cursor: 'pointer', background: isCurrent ? '#7c3aed' : answered ? '#10b981' : 'rgba(255,255,255,0.06)', color: 'white', fontFamily: 'monospace' }}>{i + 1}</button>
                  );
                })}
              </div>
            </div>
            {/* Question display */}
            <div style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
              {questions[currentIdx] && (() => {
                const q = questions[currentIdx];
                const selectedOpt = answers[String(q.id)];
                return (
                  <div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Question {currentIdx + 1} of {questions.length}</div>
                    {q.code_snippet && <pre style={{ background: 'rgba(255,255,255,0.04)', padding: 16, borderRadius: 8, fontSize: 13, fontFamily: 'monospace', overflowX: 'auto', marginBottom: 16, color: 'rgba(255,255,255,0.8)' }}>{q.code_snippet}</pre>}
                    <p style={{ fontSize: 16, lineHeight: 1.6, marginBottom: 24 }}>{q.question}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {q.options.map((opt, oi) => (
                        <button key={oi} onClick={() => handleAnswer(q.id, oi)} style={{ padding: '14px 20px', textAlign: 'left', borderRadius: 10, border: `2px solid ${selectedOpt === oi ? '#7c3aed' : 'rgba(255,255,255,0.1)'}`, background: selectedOpt === oi ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)', color: 'white', cursor: 'pointer', fontSize: 14, transition: 'all 0.15s' }}>
                          <span style={{ fontWeight: 600, marginRight: 10, color: 'rgba(255,255,255,0.4)' }}>{String.fromCharCode(65 + oi)}.</span>{opt}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                      <button onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0} className="btn btn-outline">← Prev</button>
                      <button onClick={() => setCurrentIdx(Math.min(questions.length - 1, currentIdx + 1))} disabled={currentIdx === questions.length - 1} className="btn btn-primary">Next →</button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Coding Section */}
        {hybridSection === 'coding' && hybridProblems.length > 0 && (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Problem list sidebar */}
            <div style={{ width: 280, borderRight: '1px solid rgba(255,255,255,0.08)', overflowY: 'auto', background: 'rgba(0,0,0,0.2)' }}>
              {hybridProblems.map((p, i) => {
                const score = hybridBestScores[p.id] || 0;
                const isCurrent = i === hybridActiveProblem;
                return (
                  <div key={p.id} onClick={() => setHybridActiveProblem(i)} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', background: isCurrent ? 'rgba(124,58,237,0.15)' : 'transparent', borderLeft: isCurrent ? '3px solid #7c3aed' : '3px solid transparent' }}>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Problem {i + 1}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{p.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: p.difficulty === 'Easy' ? '#10b981' : p.difficulty === 'Hard' ? '#ef4444' : '#f59e0b' }}>{p.difficulty}</span>
                      <span style={{ fontSize: 11, color: score > 0 ? '#10b981' : 'rgba(255,255,255,0.3)' }}>{score}/{p.points} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Problem detail + editor */}
            {activeProblem && (
              <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Problem description */}
                <div style={{ width: '40%', padding: 20, overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.08)', fontSize: 14, lineHeight: 1.6 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{activeProblem.title}</h3>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: activeProblem.difficulty === 'Easy' ? 'rgba(16,185,129,0.15)' : activeProblem.difficulty === 'Hard' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: activeProblem.difficulty === 'Easy' ? '#10b981' : activeProblem.difficulty === 'Hard' ? '#ef4444' : '#f59e0b' }}>{activeProblem.difficulty}</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}>{activeProblem.points} pts</span>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 12 }}>{activeProblem.description}</p>
                  {activeProblem.sampleTestCases && activeProblem.sampleTestCases.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>EXAMPLES</div>
                      {activeProblem.sampleTestCases.slice(0, 2).map((tc, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 12, marginBottom: 8, fontSize: 12, fontFamily: 'monospace' }}>
                          {tc.input && <div><span style={{ color: 'rgba(255,255,255,0.4)' }}>Input: </span>{tc.input}</div>}
                          <div><span style={{ color: 'rgba(255,255,255,0.4)' }}>Output: </span>{tc.expectedOutput}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Editor */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <HybridMonacoEditor
                    code={hybridCodeMap[activeProblem.id] || activeProblem.starterCode || ''}
                    onChange={(val) => setHybridCodeMap(prev => ({ ...prev, [activeProblem.id]: val }))}
                    language="python"
                  />
                  <div style={{ padding: '10px 16px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 10 }}>
                    <button onClick={() => hybridRunCode(activeProblem.id, hybridCodeMap[activeProblem.id] || activeProblem.starterCode || '', activeProblem.sampleTestCases?.[0]?.input || '')} disabled={hybridRunning} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'white', cursor: 'pointer', fontSize: 13 }}>▶ Run</button>
                    <button onClick={() => hybridSubmitCode(activeProblem.id)} disabled={hybridRunning} style={{ padding: '8px 16px', background: '#7c3aed', border: 'none', borderRadius: 6, color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Submit Code</button>
                  </div>
                  {hybridCodeRunResults[activeProblem.id] && (() => {
                    const runRes = hybridCodeRunResults[activeProblem.id];
                    return (
                      <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(255,255,255,0.08)', maxHeight: 160, overflowY: 'auto', fontSize: 12, fontFamily: 'monospace' }}>
                        {runRes.results ? runRes.results.map((r, i) => (
                          <div key={i} style={{ padding: '4px 0', color: r.passed ? '#10b981' : '#f87171' }}>
                            Case {i + 1}: {r.passed ? '✓ Passed' : '✗ Failed'}{r.output ? ` — ${r.output.slice(0, 60)}` : ''}
                          </div>
                        )) : <div style={{ color: '#f87171' }}>{runRes.error || 'Run failed'}</div>}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Confirm Submit Modal */}
        {showConfirm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
            <div style={{ background: '#1a1a2e', borderRadius: 16, padding: 32, width: 420, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>⚠️</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Submit Test?</h3>
              <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>MCQ: {answeredMcq}/{questions.length} answered</div>
              {hybridProblems.length > 0 && <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>Coding: {solvedCoding}/{hybridProblems.length} solved ({earnedPoints} pts)</div>}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button onClick={() => setShowConfirm(false)} className="btn btn-outline">Cancel</button>
                <button onClick={() => handleSubmit(false)} className="btn btn-primary">Confirm Submit</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Result screen
  if (result) {
    const r = result;
    const subjectScores = r.subjectScores || {};
    return (
      <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>⚡</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Test Submitted!</h2>
          <div style={{ fontSize: 52, fontWeight: 900, fontFamily: "'JetBrains Mono',monospace", color: r.passed ? '#34d399' : '#f87171', margin: '20px 0 4px' }}>
            {r.percentage ?? '-'}%
          </div>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
            {r.score ?? '-'} / {r.total ?? '-'} correct
          </div>
          <span className={`badge ${r.passed ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 14, padding: '6px 18px' }}>
            {r.grade || (r.passed ? 'PASS' : 'FAIL')}
          </span>
          {Object.keys(subjectScores).length > 0 && (
            <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, marginTop: 28, textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.8 }}>Subject Breakdown</div>
              {Object.entries(subjectScores).sort((a,b) => a[0].localeCompare(b[0])).map(([subj, data]) => {
                const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                return (
                  <div key={subj} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>{subj}</span>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", color: 'rgba(255,255,255,0.4)' }}>{data.correct}/{data.total}</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: pct >= 60 ? '#059669' : '#dc2626', borderRadius: 3, transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              style={{ padding: '12px 28px', fontSize: 15, background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
              onClick={() => navigate(`/candidate/review/${testId}/${sessionId}`)}
            >
              📝 Review Answers
            </button>
            <button className="btn btn-outline" style={{ padding: '12px 28px', fontSize: 15 }} onClick={() => navigate('/candidate')}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentIdx];
  if (!q) return <div className="loading">No questions loaded</div>;

  const answeredCount = Object.keys(answers).length;
  const totalQ = questions.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#030712', overflow: 'hidden' }}>
      {ViolationWarning}
      {TimerWarning}
      {/* Resume Banner */}
      {showResumeBanner && (
        <div style={{
          background: 'rgba(5,150,105,0.15)', borderBottom: '1px solid rgba(5,150,105,0.3)',
          padding: '10px 20px', textAlign: 'center', color: '#34d399', fontSize: 14,
          fontWeight: 600, zIndex: 200, animation: 'fadeIn 0.3s ease'
        }}>
          🔄 Session Restored — {Object.keys(answers).length} answers recovered. Timer continues from where you left off.
          <button onClick={() => setShowResumeBanner(false)} style={{
            background: 'none', border: 'none', color: '#34d399', marginLeft: 16,
            cursor: 'pointer', fontSize: 16
          }}>✕</button>
        </div>
      )}
      {/* Fixed Header */}
      <header style={{
        height: 58, background: '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', flexShrink: 0, gap: 20, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>⚡ SkillForge</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.05)', padding: '3px 10px', borderRadius: 6 }}>
            {user?.name}
          </span>
        </div>
        <div style={{ flex: 1, maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontFamily: "'JetBrains Mono',monospace" }}>
            Question {currentIdx + 1} of {totalQ}
          </span>
          <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${((currentIdx + 1) / totalQ) * 100}%`, background: 'linear-gradient(90deg, #7c3aed, #2563eb)', borderRadius: 2, transition: 'width 0.3s' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div className={timerCls()} style={{
            fontFamily: "'JetBrains Mono',monospace", fontSize: 18, fontWeight: 700,
            background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.08)', minWidth: 90, textAlign: 'center'
          }}>
            {formatTime(timeLeft)}
          </div>
          <button onClick={() => setShowConfirm(true)} style={{
            padding: '8px 18px', background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
            border: 'none', borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap'
          }}>Submit</button>
        </div>
      </header>

      {/* Body: Palette + Question */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Palette Sidebar */}
        <aside style={{
          width: 260, background: '#0d1117', borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0
        }}>
          <div style={{ padding: '14px 14px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Questions</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: "'JetBrains Mono',monospace" }}>{answeredCount}/{totalQ}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '6px 14px 10px', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#2563eb', display: 'inline-block' }} /> Current</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#7c3aed', display: 'inline-block' }} /> Answered</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#d97706', display: 'inline-block' }} /> Flagged</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(255,255,255,0.12)', display: 'inline-block' }} /> Pending</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5 }}>
              {questions.map((qq, i) => {
                const isCurrent = i === currentIdx;
                const isAnswered = answers[qq.id] !== undefined;
                const isFlagged = flagged.has(qq.id);
                let bg = 'rgba(255,255,255,0.04)';
                let color = 'rgba(255,255,255,0.3)';
                let border = '1px solid rgba(255,255,255,0.06)';
                let shadow = 'none';
                if (isCurrent) { bg = '#2563eb'; color = 'white'; border = '1px solid #2563eb'; shadow = '0 0 10px rgba(37,99,235,0.4)'; }
                else if (isFlagged) { bg = 'rgba(217,119,6,0.2)'; color = '#fbbf24'; border = '1px solid rgba(217,119,6,0.4)'; }
                else if (isAnswered) { bg = 'rgba(124,58,237,0.25)'; color = '#a78bfa'; border = '1px solid rgba(124,58,237,0.4)'; }
                return (
                  <button key={i} onClick={() => setCurrentIdx(i)} title={isFlagged ? 'Flagged for review' : ''} style={{
                    aspectRatio: '1', borderRadius: 7, border, background: bg, color, boxShadow: shadow,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace",
                    transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
                  }}>
                    {qq.displayId || i + 1}
                    {isFlagged && <span style={{ position: 'absolute', top: 1, right: 2, fontSize: 7 }}>🚩</span>}
                  </button>
                );
              })}
            </div>
          </div>
          <button onClick={() => setShowConfirm(true)} style={{
            margin: 10, padding: 12, background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
            border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit'
          }}>Submit Test ({answeredCount}/{totalQ})</button>
        </aside>

        {/* Question Area */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          <div style={{
            background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16, padding: '32px 36px', maxWidth: 760, width: '100%'
          }}>
            {/* Meta */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span className={`badge diff-${(q.difficulty || 'medium').toLowerCase()}`} style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700
              }}>{q.difficulty || 'Medium'}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => toggleFlag(q.id)} style={{
                  padding: '4px 12px', borderRadius: 8, border: flagged.has(q.id) ? '1px solid #d97706' : '1px solid rgba(255,255,255,0.1)',
                  background: flagged.has(q.id) ? 'rgba(217,119,6,0.15)' : 'rgba(255,255,255,0.03)',
                  color: flagged.has(q.id) ? '#fbbf24' : 'rgba(255,255,255,0.4)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s'
                }}>
                  {flagged.has(q.id) ? '🚩 Flagged' : '⚑ Flag'}
                </button>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontFamily: "'JetBrains Mono',monospace" }}>
                  Q{q.displayId || currentIdx + 1} <span style={{ color: 'rgba(255,255,255,0.2)' }}>/ {totalQ}</span>
                </span>
              </div>
            </div>

            {/* Code snippet */}
            {q.code_snippet && q.code_snippet.trim() !== '' && (
              <pre style={{
                background: '#030712', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10, padding: '18px 20px', fontFamily: "'JetBrains Mono',monospace",
                fontSize: 13, color: '#a8ff78', overflowX: 'auto', marginBottom: 20,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6
              }}>{q.code_snippet}</pre>
            )}

            {/* Question text */}
            <div style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.7, color: 'white', marginBottom: 24 }}>
              {q.question || q.question_text || q.text}
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {(q.options || []).map((opt, oi) => {
                const isSelected = answers[q.id] === oi;
                return (
                  <button key={oi} onClick={() => handleAnswer(q.id, oi)} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: isSelected ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.03)',
                    border: isSelected ? '1px solid #7c3aed' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isSelected ? '0 0 0 1px rgba(124,58,237,0.3)' : 'none',
                    borderRadius: 10, padding: '14px 18px', cursor: 'pointer',
                    textAlign: 'left', transition: 'all 0.18s', color: 'white',
                    fontFamily: 'inherit', fontSize: 14, width: '100%'
                  }}>
                    <span style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: isSelected ? '#7c3aed' : 'rgba(255,255,255,0.06)',
                      color: isSelected ? 'white' : 'rgba(255,255,255,0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace",
                      flexShrink: 0, transition: 'all 0.18s'
                    }}>{['A','B','C','D'][oi]}</span>
                    <span style={{ flex: 1, lineHeight: 1.5 }}>{opt}</span>
                    {isSelected && <span style={{ color: '#7c3aed', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 12, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)'
            }}>
              <button onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0}
                style={{
                  padding: '10px 22px', borderRadius: 9, fontSize: 14, fontWeight: 600,
                  cursor: currentIdx === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: currentIdx === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
                  opacity: currentIdx === 0 ? 0.4 : 1, transition: 'all 0.2s'
                }}>← Previous</button>

              <div style={{ display: 'flex', gap: 6 }}>
                {[...Array(Math.min(7, totalQ))].map((_, i) => {
                  const idx = Math.max(0, Math.min(currentIdx - 3, totalQ - 7)) + i;
                  if (idx >= totalQ) return null;
                  const isActive = idx === currentIdx;
                  const isDone = answers[questions[idx]?.id] !== undefined;
                  return (
                    <button key={idx} onClick={() => setCurrentIdx(idx)} style={{
                      width: 32, height: 32, borderRadius: 7, fontSize: 12, fontWeight: 600,
                      fontFamily: "'JetBrains Mono',monospace", cursor: 'pointer',
                      border: isActive ? '1px solid #7c3aed' : isDone ? '1px solid rgba(5,150,105,0.3)' : '1px solid rgba(255,255,255,0.08)',
                      background: isActive ? '#7c3aed' : isDone ? 'rgba(5,150,105,0.15)' : 'rgba(255,255,255,0.03)',
                      color: isActive ? 'white' : isDone ? '#34d399' : 'rgba(255,255,255,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s'
                    }}>{idx + 1}</button>
                  );
                })}
              </div>

              {currentIdx < totalQ - 1 ? (
                <button onClick={() => setCurrentIdx(i => i + 1)} style={{
                  padding: '10px 22px', borderRadius: 9, fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                  background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
                  color: '#a78bfa', transition: 'all 0.2s'
                }}>Next →</button>
              ) : (
                <button onClick={() => setShowConfirm(true)} style={{
                  padding: '10px 22px', borderRadius: 9, fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                  background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', border: 'none',
                  color: 'white', transition: 'all 0.2s'
                }}>Submit ✓</button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setShowConfirm(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: 32, width: 420, maxWidth: '95vw',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)', animation: 'slideUp 0.3s ease'
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>Submit Test?</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", color: '#34d399' }}>{answeredCount}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Answered</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", color: '#f87171' }}>{totalQ - answeredCount}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Unanswered</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", color: '#7c3aed' }}>{totalQ}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Total</div>
              </div>
            </div>
            {flagged.size > 0 && (
              <div style={{ textAlign: 'center', color: '#fbbf24', fontSize: 13, marginBottom: 8 }}>
                🚩 {flagged.size} question{flagged.size > 1 ? 's' : ''} flagged for review
              </div>
            )}
            {totalQ - answeredCount > 0 && (
              <div style={{ textAlign: 'center', color: '#d97706', fontSize: 13, marginBottom: 20 }}>
                You have {totalQ - answeredCount} unanswered question{totalQ - answeredCount > 1 ? 's' : ''}.
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setShowConfirm(false)} style={{
                padding: '11px 24px', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
                color: 'rgba(255,255,255,0.6)', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit'
              }}>Continue Test</button>
              <button onClick={() => handleSubmit(false)} disabled={submitting} style={{
                padding: '11px 28px', background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit'
              }}>{submitting ? 'Submitting...' : 'Confirm Submit'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
