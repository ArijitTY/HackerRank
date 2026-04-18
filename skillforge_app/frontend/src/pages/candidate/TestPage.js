import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api';
import { parseStamp, nowLocalIso } from '../../utils/dateUtils';
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

// ── Inline Coding Problem Component for Company Tests ──────────────────────
function CodingProblemInline({ question, savedCode, onCodeSave }) {
  const [code, setCode] = useState(savedCode || question.starter_code || '');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [testResults, setTestResults] = useState([]);

  const runCode = async () => {
    setRunning(true);
    setOutput('Running...');
    setTestResults([]);
    try {
      const res = await api.post('/candidate/run-code', {
        code, language: question.language || 'python', problemId: question.id
      });
      setOutput(res.data.output || '(no output)');
      if (res.data.testResults) setTestResults(res.data.testResults);
    } catch (err) {
      setOutput('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setRunning(false);
    }
  };

  const handleSave = () => { onCodeSave(code); };

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Problem description */}
      {question.description && (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 18, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: question.difficulty === 'Hard' ? 'rgba(239,68,68,0.15)' : question.difficulty === 'Medium' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
              color: question.difficulty === 'Hard' ? '#f87171' : question.difficulty === 'Medium' ? '#fbbf24' : '#34d399' }}>{question.difficulty}</span>
            <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}>
              {(question.language || 'python').toUpperCase()}
            </span>
            {question.marks && <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(6,182,212,0.15)', color: '#22d3ee' }}>{question.marks} marks</span>}
          </div>
          <pre style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{question.description}</pre>
          {question.explanation && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8 }}>
              <span style={{ fontSize: 12, color: '#fbbf24' }}>💡 Hint: {question.explanation}</span>
            </div>
          )}
        </div>
      )}

      {/* Code Editor */}
      <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginLeft: 8 }}>
              {question.language === 'sql' ? 'solution.sql' : 'solution.py'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleSave} style={{ padding: '5px 12px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 6, color: '#34d399', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>💾 Save</button>
            <button onClick={runCode} disabled={running} style={{ padding: '5px 14px', background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', border: 'none', borderRadius: 6, color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              {running ? '⏳ Running...' : '▶ Run'}
            </button>
          </div>
        </div>
        <MonacoEditor
          height="300px"
          language={question.language === 'sql' ? 'sql' : 'python'}
          value={code}
          onChange={(val) => setCode(val || '')}
          theme="vs-dark"
          options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false, tabSize: 4, wordWrap: 'on', lineNumbers: 'on', padding: { top: 12 } }}
        />
      </div>

      {/* Output */}
      {output && (
        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Output</div>
          <pre style={{ padding: 14, margin: 0, color: '#e2e8f0', fontFamily: "'JetBrains Mono',monospace", fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', background: '#030712', maxHeight: 200, overflowY: 'auto' }}>{output}</pre>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 14 }}>
          {testResults.map((tr, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: i < testResults.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <span style={{ fontSize: 14 }}>{tr.passed ? '✅' : '❌'}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Test {i + 1}:</span>
              <span style={{ fontSize: 12, color: tr.passed ? '#34d399' : '#f87171', fontFamily: "'JetBrains Mono',monospace" }}>
                Expected: {tr.expected} | Got: {tr.actual}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function parseTime(t) {
  if (!t) return Date.now();
  if (typeof t === 'number') return t;
  const d = parseStamp(t);
  return d ? d.getTime() : Date.now();
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
  const [hybridCodeRunResults, setHybridCodeRunResults] = useState(navState.codingResults || {}); // submit results
  const [hybridRunSamples, setHybridRunSamples] = useState({}); // sample run results
  const [hybridCustomInput, setHybridCustomInput] = useState({});
  const [hybridCustomResults, setHybridCustomResults] = useState({});
  const [hybridActiveTab, setHybridActiveTab] = useState({}); // per-problem active output tab
  const [hybridRunningCustom, setHybridRunningCustom] = useState(false);
  const [hybridBestScores, setHybridBestScores] = useState(navState.bestScores || {});
  const [hybridActiveProblem, setHybridActiveProblem] = useState(0);
  const [hybridRunning, setHybridRunning] = useState(false);
  const [hybridSubmittingId, setHybridSubmittingId] = useState(null);
  const [hybridToast, setHybridToast] = useState(null); // { msg, kind }

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

  // ===== FULLSCREEN STATE =====
  const [fsWarning, setFsWarning] = useState(false);   // show "please re-enter fullscreen" banner
  const fsActiveRef = useRef(false);                    // are we currently in fullscreen?

  // ===== ADMIN-ENDED STATE =====
  const [adminEnded, setAdminEnded] = useState(false);

  useEffect(() => {
    const tsid = navState.sessionId;
    const ping = async () => {
      try {
        const r = await api.get('/candidate/ping', { params: tsid ? { tsid } : {} });
        // If admin force-ended the drive session, detect it here
        if (tsid && r.data.testSessionStatus && r.data.testSessionStatus !== 'in_progress' && !submittedRef.current) {
          setAdminEnded(true);
          if (document.fullscreenElement || document.webkitFullscreenElement) document.exitFullscreen().catch(() => {});
        }
      } catch (e) { /* ignore */ }
    };
    ping();
    const pingId = setInterval(ping, 30 * 1000);
    return () => clearInterval(pingId);
  }, []); // eslint-disable-line

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
            type, timestamp: nowLocalIso()
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
            type, timestamp: nowLocalIso()
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

  // ===== FULLSCREEN MANAGEMENT =====
  // Enter fullscreen once the session is live
  useEffect(() => {
    if (!sessionId || result) return;
    const enterFs = async () => {
      const el = document.documentElement;
      try {
        if (el.requestFullscreen) await el.requestFullscreen();
        else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
        else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
        else if (el.msRequestFullscreen) el.msRequestFullscreen();
        fsActiveRef.current = true;
      } catch (err) {
        // macOS/Safari blocks programmatic fullscreen without a direct user gesture
        setFsWarning(true);
      }
    };
    enterFs();
    return () => {
      // Exit fullscreen on unmount (navigation away)
      if (document.fullscreenElement || document.webkitFullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, [sessionId]); // eslint-disable-line

  // Exit fullscreen when result is ready (submitted / timed-out)
  useEffect(() => {
    if (result && (document.fullscreenElement || document.webkitFullscreenElement)) {
      document.exitFullscreen().catch(() => {});
      fsActiveRef.current = false;
    }
  }, [result]);

  // Detect if candidate manually exits fullscreen during the test → warn + count violation
  useEffect(() => {
    if (!sessionId || result) return;
    const onFsChange = () => {
      const inFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
      if (!inFs && fsActiveRef.current && !submittedRef.current && timerReady.current) {
        // Candidate exited fullscreen manually
        fsActiveRef.current = false;
        setFsWarning(true);
      }
      if (inFs) {
        fsActiveRef.current = true;
        setFsWarning(false);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    document.addEventListener('mozfullscreenchange', onFsChange);
    document.addEventListener('MSFullscreenChange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
      document.removeEventListener('mozfullscreenchange', onFsChange);
      document.removeEventListener('MSFullscreenChange', onFsChange);
    };
  }, [sessionId, result]); // eslint-disable-line

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

  const showHybridToast = (msg, kind = 'info') => {
    setHybridToast({ msg, kind });
    setTimeout(() => setHybridToast(null), 4000);
  };

  const hybridRunCode = async (problemId, code, input = '') => {
    const problem = hybridProblems.find(p => p.id === problemId);
    const effectiveCode = (code && code.trim()) ? code : (problem?.starterCode || '');
    if (!effectiveCode.trim()) {
      showHybridToast('Please write some code before running.', 'error');
      return;
    }
    setHybridRunning(true);
    // Switch to Sample Cases tab
    setHybridActiveTab(prev => ({ ...prev, [problemId]: 'run' }));
    try {
      const { data } = await api.post(`/candidate/tests/${testId}/run`, { sessionId, problemId, code: effectiveCode, input });
      setHybridRunSamples(prev => ({ ...prev, [problemId]: data }));
      if (data.results && problem) {
        const passed = data.results.filter(r => r.passed).length;
        const total = data.results.length;
        if (total > 0 && passed === total) {
          showHybridToast(`All ${total} sample test cases passed!`, 'success');
        }
      }
    } catch (err) {
      console.error('Run error:', err);
      const errMsg = err.response?.data?.error || err.message || 'Run failed';
      setHybridRunSamples(prev => ({ ...prev, [problemId]: { error: errMsg, results: [], passedCases: 0, totalCases: 0 } }));
      showHybridToast('Run failed: ' + errMsg, 'error');
    } finally {
      setHybridRunning(false);
    }
  };

  const hybridRunCustom = async (problemId, code) => {
    setHybridRunningCustom(true);
    setHybridActiveTab(prev => ({ ...prev, [problemId]: 'custom' }));
    try {
      const { data } = await api.post(`/candidate/tests/${testId}/run-custom`, {
        sessionId, problemId, code, customInput: hybridCustomInput[problemId] || ''
      });
      setHybridCustomResults(prev => ({ ...prev, [problemId]: data }));
    } catch (err) {
      setHybridCustomResults(prev => ({ ...prev, [problemId]: { status: 'runtime_error', output: '', error: err.message } }));
    } finally {
      setHybridRunningCustom(false);
    }
  };

  const hybridSubmitCode = async (problemId) => {
    const problem = hybridProblems.find(p => p.id === problemId);
    const code = (hybridCodeMap[problemId] && hybridCodeMap[problemId].trim())
      ? hybridCodeMap[problemId]
      : (problem?.starterCode || '');
    if (!code.trim()) {
      showHybridToast('Please write some code before submitting.', 'error');
      return;
    }
    setHybridSubmittingId(problemId);
    setHybridActiveTab(prev => ({ ...prev, [problemId]: 'submit' }));
    try {
      const { data } = await api.post(`/candidate/tests/${testId}/submit-code`, { sessionId, problemId, code });
      if (data.score !== undefined) {
        setHybridBestScores(prev => ({ ...prev, [problemId]: Math.max(prev[problemId] || 0, data.score) }));
      }
      setHybridCodeRunResults(prev => ({ ...prev, [problemId]: { ...data, _submitted: true } }));
      const passedAll = data.totalCases > 0 && data.passedCases === data.totalCases;
      showHybridToast(
        passedAll
          ? `Submitted! All ${data.totalCases} hidden cases passed — ${data.score}/${data.maxScore} pts`
          : `Submitted: ${data.passedCases}/${data.totalCases} cases passed — ${data.score}/${data.maxScore} pts`,
        passedAll ? 'success' : 'warn'
      );
      const problemIdx = hybridProblems.findIndex(p => p.id === problemId);
      if (problemIdx !== -1 && problemIdx < hybridProblems.length - 1) {
        setTimeout(() => { setHybridActiveProblem(problemIdx + 1); }, 1800);
      }
    } catch (err) {
      console.error('Submit code error:', err);
      showHybridToast('Submit failed: ' + (err.response?.data?.error || err.message || 'Server error'), 'error');
    } finally {
      setHybridSubmittingId(null);
    }
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

  // Fullscreen exit warning banner
  const FsWarning = fsWarning ? (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 99999,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: 460, width: '90%', background: 'linear-gradient(135deg,#1e1b4b,#312e81)',
        border: '2px solid #7c3aed', borderRadius: 18, padding: '40px 32px', textAlign: 'center',
        boxShadow: '0 0 80px rgba(124,58,237,0.5)'
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🖥️</div>
        <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10, color: '#fff' }}>Fullscreen Required</h3>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginBottom: 28, lineHeight: 1.6 }}>
          You have exited fullscreen mode. This test must be taken in fullscreen. Please re-enter fullscreen to continue.
        </p>
        <button
          onClick={async () => {
            const el = document.documentElement;
            try {
              if (el.requestFullscreen) await el.requestFullscreen();
              else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
              else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
              else if (el.msRequestFullscreen) el.msRequestFullscreen();
              setFsWarning(false);
            } catch (err) { /* user declined — keep warning visible */ }
          }}
          style={{
            padding: '13px 36px', background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
            border: 'none', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 4px 24px rgba(124,58,237,0.5)'
          }}
        >
          ⛶ Enter Fullscreen
        </button>
      </div>
    </div>
  ) : null;

  // Admin-ended overlay (drive session completed/cancelled by admin while test was in progress)
  const AdminEndedOverlay = adminEnded ? (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 999999,
      background: 'rgba(0,0,0,0.95)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: 480, width: '90%', background: 'linear-gradient(135deg,#1c1917,#292524)',
        border: '2px solid #f59e0b', borderRadius: 18, padding: '40px 32px', textAlign: 'center',
        boxShadow: '0 0 80px rgba(245,158,11,0.4)'
      }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🔒</div>
        <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10, color: '#fff' }}>Session Closed</h3>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginBottom: 28, lineHeight: 1.6 }}>
          The administrator has ended this test session. Your progress has been saved and the test has been submitted automatically.
        </p>
        <button
          onClick={() => { if (document.fullscreenElement || document.webkitFullscreenElement) document.exitFullscreen().catch(() => {}); navigate('/candidate'); }}
          style={{
            padding: '13px 36px', background: 'linear-gradient(135deg,#d97706,#b45309)',
            border: 'none', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 4px 24px rgba(217,119,6,0.5)'
          }}
        >
          Back to Dashboard
        </button>
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
        {AdminEndedOverlay}
        {FsWarning}
        {ViolationWarning}
        {TimerWarning}
        {hybridToast && (
          <div style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9997,
            background: hybridToast.kind === 'error' ? 'linear-gradient(135deg,#7f1d1d,#991b1b)'
              : hybridToast.kind === 'success' ? 'linear-gradient(135deg,#065f46,#047857)'
              : hybridToast.kind === 'warn' ? 'linear-gradient(135deg,#78350f,#92400e)'
              : 'linear-gradient(135deg,#1e3a8a,#1e40af)',
            border: `1px solid ${hybridToast.kind === 'error' ? '#ef4444' : hybridToast.kind === 'success' ? '#10b981' : hybridToast.kind === 'warn' ? '#f59e0b' : '#3b82f6'}`,
            borderRadius: 10, padding: '12px 18px', color: 'white', fontSize: 13, fontWeight: 600,
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)', maxWidth: 420,
            display: 'flex', gap: 10, alignItems: 'center'
          }}>
            <span style={{ fontSize: 18 }}>
              {hybridToast.kind === 'error' ? '❌' : hybridToast.kind === 'success' ? '✅' : hybridToast.kind === 'warn' ? '⚠️' : 'ℹ️'}
            </span>
            <span>{hybridToast.msg}</span>
          </div>
        )}
        {/* Header */}
        <div style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{navState.testName || 'Assessment'}</div>
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

        {/* MCQ Section — same polished layout as pure MCQ test */}
        {hybridSection === 'mcq' && questions.length > 0 && (() => {
          const q = questions[currentIdx];
          const selectedOpt = answers[String(q?.id)];
          const totalQ = questions.length;
          return (
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* Sidebar palette */}
              <aside style={{ width: 260, background: '#0d1117', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ padding: '14px 14px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Questions</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: "'JetBrains Mono',monospace" }}>{answeredMcq}/{totalQ}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '6px 14px 10px', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#2563eb', display: 'inline-block' }} /> Current</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#7c3aed', display: 'inline-block' }} /> Answered</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(255,255,255,0.12)', display: 'inline-block' }} /> Pending</span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5 }}>
                    {questions.map((qq, i) => {
                      const isCurrent = i === currentIdx;
                      const isAnswered = answers[String(qq.id)] !== undefined;
                      let bg = 'rgba(255,255,255,0.04)';
                      let color = 'rgba(255,255,255,0.3)';
                      let border = '1px solid rgba(255,255,255,0.06)';
                      let shadow = 'none';
                      if (isCurrent) { bg = '#2563eb'; color = 'white'; border = '1px solid #2563eb'; shadow = '0 0 10px rgba(37,99,235,0.4)'; }
                      else if (isAnswered) { bg = 'rgba(124,58,237,0.25)'; color = '#a78bfa'; border = '1px solid rgba(124,58,237,0.4)'; }
                      return (
                        <button key={i} onClick={() => setCurrentIdx(i)} style={{ aspectRatio: '1', borderRadius: 7, border, background: bg, color, boxShadow: shadow, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace", transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</button>
                      );
                    })}
                  </div>
                  {/* Quick-access coding buttons */}
                  {hybridProblems.length > 0 && (
                    <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(6,182,212,0.6)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>💻 Coding ({hybridProblems.length})</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {hybridProblems.map((prob, idx) => {
                          const score = hybridBestScores[prob.id] || 0;
                          return (
                            <button key={prob.id} onClick={() => { setHybridSection('coding'); setHybridActiveProblem(idx); }}
                              style={{ padding: '7px 10px', borderRadius: 8, cursor: 'pointer', background: score > 0 ? 'rgba(6,182,212,0.15)' : 'rgba(6,182,212,0.06)', border: `1px solid ${score > 0 ? 'rgba(6,182,212,0.35)' : 'rgba(6,182,212,0.15)'}`, color: score > 0 ? '#22d3ee' : 'rgba(6,182,212,0.6)', fontSize: 11, fontWeight: 600, textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>💻</span>
                              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prob.title}</span>
                              {score > 0 && <span style={{ fontSize: 10, color: '#22d3ee' }}>{score}pts</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <button onClick={() => setShowConfirm(true)} style={{ margin: 10, padding: 12, background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Submit Test ({answeredMcq}/{totalQ})
                </button>
              </aside>

              {/* Question area */}
              <main style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                {q && (
                  <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '32px 36px', maxWidth: 760, width: '100%' }}>
                    {/* Meta row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                      <span className={`badge diff-${(q.difficulty || 'medium').toLowerCase()}`} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{q.difficulty || 'Medium'}</span>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontFamily: "'JetBrains Mono',monospace" }}>
                        Q{currentIdx + 1} <span style={{ color: 'rgba(255,255,255,0.2)' }}>/ {totalQ}</span>
                      </span>
                    </div>

                    {/* Code snippet */}
                    {q.code_snippet && q.code_snippet.trim() !== '' && (
                      <pre style={{ background: '#030712', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '18px 20px', fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: '#a8ff78', overflowX: 'auto', marginBottom: 20, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6 }}>{q.code_snippet}</pre>
                    )}

                    {/* Question text */}
                    <div style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.7, color: 'white', marginBottom: 24 }}>{q.question}</div>

                    {/* Options */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                      {(q.options || []).map((opt, oi) => {
                        const isSelected = selectedOpt === oi;
                        return (
                          <button key={oi} onClick={() => handleAnswer(q.id, oi)} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, background: isSelected ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.03)', border: isSelected ? '1px solid #7c3aed' : '1px solid rgba(255,255,255,0.08)', boxShadow: isSelected ? '0 0 0 1px rgba(124,58,237,0.3)' : 'none', borderRadius: 10, padding: '14px 18px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s', color: 'white', fontFamily: 'inherit', fontSize: 14, width: '100%', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                            <span style={{ width: 32, height: 32, borderRadius: 8, marginTop: 1, background: isSelected ? '#7c3aed' : 'rgba(255,255,255,0.06)', color: isSelected ? 'white' : 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", flexShrink: 0, transition: 'all 0.18s' }}>{['A','B','C','D'][oi]}</span>
                            <span style={{ flex: 1, lineHeight: 1.55 }}>{opt}</span>
                            {isSelected && <span style={{ color: '#7c3aed', fontSize: 16, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>✓</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Navigation */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <button onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0} style={{ padding: '10px 22px', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: currentIdx === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: currentIdx === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)', opacity: currentIdx === 0 ? 0.4 : 1, transition: 'all 0.2s' }}>← Previous</button>

                      <div style={{ display: 'flex', gap: 6 }}>
                        {[...Array(Math.min(7, totalQ))].map((_, i) => {
                          const idx = Math.max(0, Math.min(currentIdx - 3, totalQ - 7)) + i;
                          if (idx >= totalQ) return null;
                          const isActive = idx === currentIdx;
                          const isDone = answers[String(questions[idx]?.id)] !== undefined;
                          return (
                            <button key={idx} onClick={() => setCurrentIdx(idx)} style={{ width: 32, height: 32, borderRadius: 7, fontSize: 12, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", cursor: 'pointer', border: isActive ? '1px solid #7c3aed' : isDone ? '1px solid rgba(5,150,105,0.3)' : '1px solid rgba(255,255,255,0.08)', background: isActive ? '#7c3aed' : isDone ? 'rgba(5,150,105,0.15)' : 'rgba(255,255,255,0.03)', color: isActive ? 'white' : isDone ? '#34d399' : 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>{idx + 1}</button>
                          );
                        })}
                      </div>

                      {currentIdx < totalQ - 1 ? (
                        <button onClick={() => setCurrentIdx(i => i + 1)} style={{ padding: '10px 22px', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa', transition: 'all 0.2s' }}>Next →</button>
                      ) : hybridProblems.length > 0 ? (
                        <button onClick={() => { setHybridSection('coding'); setHybridActiveProblem(0); showHybridToast('MCQ section complete! Starting coding problems…', 'info'); }} style={{ padding: '10px 22px', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', border: 'none', color: 'white', transition: 'all 0.2s' }}>Start Coding →</button>
                      ) : (
                        <button onClick={() => setShowConfirm(true)} style={{ padding: '10px 22px', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', border: 'none', color: 'white' }}>Submit ✓</button>
                      )}
                    </div>
                  </div>
                )}
              </main>
            </div>
          );
        })()}

        {/* Coding Section — matches CodingTestPage layout */}
        {hybridSection === 'coding' && hybridProblems.length > 0 && (() => {
          const ap = hybridProblems[hybridActiveProblem];
          if (!ap) return null;
          const code = hybridCodeMap[ap.id] || ap.starterCode || '';
          const runData = hybridRunSamples[ap.id];
          const submitData = hybridCodeRunResults[ap.id]?._submitted ? hybridCodeRunResults[ap.id] : null;
          const customData = hybridCustomResults[ap.id];
          const activeTab = hybridActiveTab[ap.id] || 'problem';
          const setActiveTab = (tab) => setHybridActiveTab(prev => ({ ...prev, [ap.id]: tab }));
          const scorePerCase = submitData && submitData.totalCases > 0
            ? Math.round((submitData.maxScore || ap.points) / submitData.totalCases) : 0;
          const DIFF_COLORS = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };
          const STATUS_COLORS_L = { accepted:'#10b981', wrong_answer:'#ef4444', compile_error:'#f59e0b', runtime_error:'#f97316', time_limit_exceeded:'#a78bfa' };
          const STATUS_LABELS_L = { accepted:'ACCEPTED', wrong_answer:'WRONG ANSWER', compile_error:'COMPILE ERROR', runtime_error:'RUNTIME ERROR', time_limit_exceeded:'TIME LIMIT EXCEEDED' };
          const StatusBadge = ({ status }) => {
            const color = STATUS_COLORS_L[status] || '#64748b';
            const label = STATUS_LABELS_L[status] || (status||'').toUpperCase().replace(/_/g,' ');
            return <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:4, fontSize:12, fontWeight:700, letterSpacing:0.5, background:color+'1a', color, border:`1px solid ${color}44` }}>{label}</span>;
          };
          const TimeBadge = ({ ms }) => ms == null ? null : <span style={{ fontSize:11, color:'#64748b', fontFamily:'monospace', marginLeft:6 }}>⚡ {ms < 1000 ? `${ms}ms` : `${(ms/1000).toFixed(1)}s`}</span>;
          const ErrorBlock = ({ text }) => !text ? null : <pre style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:6, padding:'10px 14px', color:'#fca5a5', fontSize:12, fontFamily:"'JetBrains Mono',monospace", whiteSpace:'pre-wrap', wordBreak:'break-all', margin:'8px 0 0', maxHeight:200, overflowY:'auto' }}>{text}</pre>;
          const IOBlock = ({ label, value, color: c }) => (value===undefined||value===null) ? null : (
            <div style={{ marginBottom:8 }}>
              <div style={{ fontSize:11, fontWeight:600, color:c||'rgba(255,255,255,0.4)', marginBottom:3, textTransform:'uppercase', letterSpacing:0.5 }}>{label}</div>
              <pre style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:6, padding:'8px 12px', margin:0, color:'rgba(255,255,255,0.8)', fontSize:13, fontFamily:"'JetBrains Mono',monospace", whiteSpace:'pre-wrap', wordBreak:'break-all', maxHeight:120, overflowY:'auto' }}>{value===''?<span style={{color:'#475569',fontStyle:'italic'}}>(empty)</span>:value}</pre>
            </div>
          );

          return (
            <div className="coding-body">
              {/* Problem sidebar */}
              <aside className="problem-sidebar">
                {hybridProblems.map((p, i) => {
                  const score = hybridBestScores[p.id] || 0;
                  const submitted = hybridCodeRunResults[p.id]?._submitted;
                  const isCurrent = i === hybridActiveProblem;
                  return (
                    <div key={p.id} className="sidebar-section">
                      <button
                        className={`sidebar-problem ${isCurrent ? 'sp-active' : ''}`}
                        onClick={() => setHybridActiveProblem(i)}
                        style={submitted ? { background: isCurrent ? 'rgba(124,58,237,0.15)' : score > 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', borderColor: isCurrent ? 'rgba(124,58,237,0.4)' : score > 0 ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)' } : undefined}
                      >
                        <span className="sp-status">{submitted ? (score > 0 ? '✅' : '❌') : (hybridCodeMap[p.id] && hybridCodeMap[p.id] !== p.starterCode) ? '✏️' : '⬜'}</span>
                        <span className="sp-title" style={submitted ? { color: score > 0 ? '#34d399' : '#f87171' } : undefined}>{i + 1}. {p.title}</span>
                        <span className="sp-pts mono" style={submitted ? { color: score > 0 ? '#34d399' : '#f87171', fontWeight: 700 } : undefined}>{submitted ? `${score}/${p.points}` : `${p.points}pt`}</span>
                        <span className="sp-diff" style={{ color: DIFF_COLORS[p.difficulty] }}>{(p.difficulty||'')[0]}</span>
                      </button>
                    </div>
                  );
                })}
              </aside>

              {/* Split pane */}
              <div className="split-pane">
                {/* Left: problem statement */}
                <div className="pane-left">
                  <div className="problem-header">
                    <h2>{hybridActiveProblem + 1}. {ap.title}</h2>
                    <div className="problem-badges" style={{ flexWrap:'wrap', gap:6 }}>
                      <span className="badge" style={{ background: DIFF_COLORS[ap.difficulty]+'22', color: DIFF_COLORS[ap.difficulty], border:`1px solid ${DIFF_COLORS[ap.difficulty]}44` }}>{ap.difficulty}</span>
                      <span className="badge badge-pts">{ap.points} pts</span>
                      <span className="badge" style={{ background:'rgba(124,58,237,0.15)', color:'#a78bfa', border:'1px solid rgba(124,58,237,0.3)' }}>🐍 Python 3</span>
                    </div>
                  </div>
                  <div className="problem-body">
                    <div className="problem-desc">
                      {(ap.description||'').split('\n').map((line, i) => <p key={i}>{line || <br/>}</p>)}
                    </div>
                    {ap.inputFormat && <div className="problem-section"><h4>📥 Input Format</h4><p>{ap.inputFormat}</p></div>}
                    {ap.outputFormat && <div className="problem-section"><h4>📤 Output Format</h4><p>{ap.outputFormat}</p></div>}
                    {ap.constraints && <div className="problem-section"><h4>📐 Constraints</h4><pre className="constraints-pre">{ap.constraints}</pre></div>}
                    {ap.sampleTestCases && ap.sampleTestCases.length > 0 && (
                      <div className="problem-section">
                        <h4>🧪 Sample Test Cases</h4>
                        {ap.sampleTestCases.map((tc, i) => (
                          <div key={i} className="sample-case">
                            <div className="sample-label">Sample {i + 1}</div>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                              {tc.input && <div className="sample-block"><span className="sample-tag">Input</span><pre>{tc.input}</pre></div>}
                              <div className="sample-block"><span className="sample-tag">Expected Output</span><pre>{tc.expectedOutput}</pre></div>
                            </div>
                            {tc.explanation && <div className="sample-explanation">💡 {tc.explanation}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: editor + output */}
                <div className="pane-right">
                  <div className="editor-container">
                    <div className="editor-header">
                      <span className="editor-lang">🐍 Python 3</span>
                      {submitData && <span style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>Editor locked after submission</span>}
                    </div>
                    {submitData && (
                      <div style={{ padding:'12px 18px', background: submitData.score > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border:`1px solid ${submitData.score > 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <span style={{ fontSize:20 }}>{submitData.score > 0 ? '✅' : '❌'}</span>
                          <div>
                            <div style={{ fontSize:14, fontWeight:700, color: submitData.score > 0 ? '#34d399' : '#f87171' }}>{submitData.score > 0 ? 'Accepted!' : 'Wrong Answer'}</div>
                            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>This problem has been submitted — editor is locked</div>
                          </div>
                        </div>
                        <div style={{ fontSize:20, fontWeight:800, fontFamily:"'JetBrains Mono',monospace", color: submitData.score > 0 ? '#34d399' : '#f87171' }}>{submitData.score}/{submitData.maxScore} pts</div>
                      </div>
                    )}
                    <MonacoEditor
                      height="100%"
                      language="python"
                      theme="vs-dark"
                      value={code}
                      onChange={submitData ? undefined : (val) => setHybridCodeMap(prev => ({ ...prev, [ap.id]: val || '' }))}
                      options={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, minimap:{enabled:false}, scrollBeyondLastLine:false, wordWrap:'on', automaticLayout:true, tabSize:4, lineNumbers:'on', renderLineHighlight:'all', readOnly:!!submitData }}
                    />
                  </div>

                  {/* Output panel with tabs */}
                  <div className="output-panel">
                    <div className="output-tabs">
                      <button className={`output-tab ${activeTab === 'problem' ? 'tab-active' : ''}`} onClick={() => setActiveTab('problem')}>Console</button>
                      <button className={`output-tab ${activeTab === 'custom' ? 'tab-active' : ''}`} onClick={() => setActiveTab('custom')}>Custom Input</button>
                      <button className={`output-tab ${activeTab === 'run' ? 'tab-active' : ''}`} onClick={() => setActiveTab('run')}>
                        Sample Cases
                        {runData && <span style={{ marginLeft:6, fontSize:11, color: runData.passedCases === runData.totalCases ? '#10b981' : '#ef4444' }}>{runData.passedCases}/{runData.totalCases}</span>}
                      </button>
                      <button className={`output-tab ${activeTab === 'submit' ? 'tab-active' : ''}`} onClick={() => setActiveTab('submit')}>
                        Submission
                        {submitData && <span style={{ marginLeft:6, fontSize:11, color: submitData.passedCases === submitData.totalCases ? '#10b981' : '#ef4444' }}>{submitData.passedCases}/{submitData.totalCases}</span>}
                      </button>
                    </div>
                    <div className="output-body">
                      {/* Console tab */}
                      {activeTab === 'problem' && (
                        <div className="console-empty">
                          <div style={{ fontSize:28, marginBottom:8 }}>💻</div>
                          <div>Click <strong>▶ Run Code</strong> to test with sample cases.</div>
                          <div style={{ marginTop:4, fontSize:12 }}>Use <strong>Custom Input</strong> to test with your own data.</div>
                        </div>
                      )}
                      {/* Custom Input tab */}
                      {activeTab === 'custom' && (
                        <div style={{ padding:'12px 14px', height:'100%', display:'flex', flexDirection:'column', gap:10, overflow:'auto' }}>
                          <div>
                            <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.5)', marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>Custom stdin Input</div>
                            <textarea
                              value={hybridCustomInput[ap.id] || ''}
                              onChange={e => setHybridCustomInput(prev => ({ ...prev, [ap.id]: e.target.value }))}
                              placeholder="Type your custom input here..."
                              style={{ width:'100%', minHeight:80, padding:'8px 10px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:6, color:'white', fontSize:13, fontFamily:"'JetBrains Mono',monospace", resize:'vertical', outline:'none', boxSizing:'border-box' }}
                            />
                          </div>
                          <button onClick={() => hybridRunCustom(ap.id, code)} disabled={hybridRunningCustom}
                            style={{ padding:'7px 18px', background: hybridRunningCustom ? '#334155' : '#0f172a', color: hybridRunningCustom ? '#64748b' : '#38bdf8', border:'1px solid #1e3a5f', borderRadius:6, fontSize:13, fontWeight:600, cursor: hybridRunningCustom ? 'not-allowed' : 'pointer', alignSelf:'flex-start' }}>
                            {hybridRunningCustom ? '⏳ Running...' : '▶ Run with Custom Input'}
                          </button>
                          {customData && (
                            <div>
                              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                                <StatusBadge status={customData.status === 'success' ? 'accepted' : customData.status} />
                                <TimeBadge ms={customData.timeTaken} />
                              </div>
                              {(customData.status === 'runtime_error' || customData.status === 'compile_error') && customData.error
                                ? <><div style={{ fontSize:11, color:'#fca5a5', fontWeight:600, marginBottom:4, textTransform:'uppercase' }}>Error Output</div><ErrorBlock text={customData.error} /></>
                                : <IOBlock label="stdout" value={customData.output} color="#34d399" />
                              }
                            </div>
                          )}
                          {!customData && !hybridRunningCustom && <div style={{ color:'#334155', fontSize:13, textAlign:'center', paddingTop:8 }}>No output yet.</div>}
                        </div>
                      )}
                      {/* Sample Cases tab */}
                      {activeTab === 'run' && (
                        <div style={{ padding:'10px 12px', overflowY:'auto', height:'100%' }}>
                          {hybridRunning && <div style={{ color:'#64748b', textAlign:'center', paddingTop:20 }}>⏳ Running sample cases...</div>}
                          {!hybridRunning && !runData && <div className="console-empty">Click <strong>▶ Run Code</strong> to test sample cases.</div>}
                          {!hybridRunning && runData && (
                            <>
                              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                                <StatusBadge status={runData.status} />
                                <span style={{ fontSize:13, color:'#94a3b8' }}>{runData.passedCases}/{runData.totalCases} sample case{runData.totalCases !== 1 ? 's' : ''} passed</span>
                              </div>
                              {(runData.results || []).map((r, i) => {
                                const color = r.passed ? '#10b981' : STATUS_COLORS_L[r.status] || '#ef4444';
                                return (
                                  <div key={i} style={{ border:`1px solid ${color}33`, borderRadius:8, marginBottom:8, overflow:'hidden' }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:color+'0d' }}>
                                      <span style={{ fontSize:14 }}>{r.passed ? '✅' : '❌'}</span>
                                      <span style={{ fontWeight:600, fontSize:13, color:'rgba(255,255,255,0.85)', flex:1 }}>Sample Case {i + 1}</span>
                                      <StatusBadge status={r.passed ? 'accepted' : r.status} />
                                      <TimeBadge ms={r.timeTaken} />
                                    </div>
                                    <div style={{ padding:'10px 12px' }}>
                                      {(r.status === 'compile_error' || r.status === 'runtime_error')
                                        ? <ErrorBlock text={r.output || r.error || 'Unknown error'} />
                                        : <>
                                            <IOBlock label="Input" value={r.input} color="#60a5fa" />
                                            <IOBlock label="Your Output" value={r.output} color={r.passed ? '#34d399' : '#f87171'} />
                                            {!r.passed && <IOBlock label="Expected Output" value={r.expectedOutput} color="#34d399" />}
                                          </>
                                      }
                                    </div>
                                  </div>
                                );
                              })}
                            </>
                          )}
                        </div>
                      )}
                      {/* Submission tab */}
                      {activeTab === 'submit' && (
                        <div style={{ padding:'10px 12px', overflowY:'auto', height:'100%' }}>
                          {hybridSubmittingId === ap.id && <div style={{ color:'#64748b', textAlign:'center', paddingTop:20 }}>⏳ Running hidden test cases...</div>}
                          {!hybridSubmittingId && !submitData && <div className="console-empty">Click <strong>Submit</strong> to run hidden test cases.</div>}
                          {submitData && (
                            <>
                              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12, padding:'10px 14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:8 }}>
                                <StatusBadge status={submitData.status} />
                                <span style={{ fontSize:13, color:'#94a3b8', flex:1 }}>{submitData.passedCases}/{submitData.totalCases} hidden cases passed</span>
                                <span style={{ fontSize:15, fontWeight:700, fontFamily:'monospace', color: submitData.score > 0 ? '#10b981' : '#64748b' }}>{submitData.score}/{submitData.maxScore} pts</span>
                              </div>
                              {(submitData.caseSummary
                                ? submitData.caseSummary
                                : Array.from({ length: submitData.totalCases }).map((_, i) => ({ caseNum: i+1, passed: i < submitData.passedCases, status: i < submitData.passedCases ? 'accepted' : 'wrong_answer', timeTaken: null }))
                              ).map((r, i) => {
                                const color = r.passed ? '#10b981' : STATUS_COLORS_L[r.status] || '#ef4444';
                                return (
                                  <div key={i} style={{ border:`1px solid ${color}33`, borderRadius:8, marginBottom:8, overflow:'hidden' }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:color+'0d' }}>
                                      <span style={{ fontSize:14 }}>{r.passed ? '✅' : '❌'}</span>
                                      <span style={{ fontWeight:600, fontSize:13, color:'rgba(255,255,255,0.85)', flex:1 }}>🔒 Hidden Case {r.caseNum || i+1}</span>
                                      <StatusBadge status={r.passed ? 'accepted' : r.status} />
                                      <TimeBadge ms={r.timeTaken} />
                                      <span style={{ color: r.passed ? '#10b981' : '#64748b', fontSize:12, fontFamily:'monospace' }}>{r.passed ? `+${scorePerCase}pts` : '0pts'}</span>
                                    </div>
                                    {!r.passed && (r.output || r.error) && (
                                      <div style={{ padding:'10px 12px' }}><ErrorBlock text={r.error || r.output} /></div>
                                    )}
                                    {r.passed && <div style={{ padding:'8px 12px', fontSize:12, color:'#34d399' }}>Test case passed ✓</div>}
                                  </div>
                                );
                              })}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action bar */}
                  <div className="action-bar">
                    <button className="btn btn-secondary" onClick={() => hybridRunCode(ap.id, code, ap.sampleTestCases?.[0]?.input || '')} disabled={hybridRunning || hybridSubmittingId === ap.id || !!submitData}
                      style={submitData ? { opacity:0.5, cursor:'not-allowed' } : undefined}>
                      {hybridRunning ? '⏳ Running...' : '▶ Run Code'}
                    </button>
                    <button
                      className={`btn ${submitData ? '' : 'btn-primary'}`}
                      onClick={() => hybridSubmitCode(ap.id)}
                      disabled={!!submitData || hybridSubmittingId === ap.id || hybridRunning}
                      style={submitData ? { background:'rgba(16,185,129,0.2)', border:'1px solid rgba(16,185,129,0.4)', color:'#34d399', cursor:'not-allowed', opacity:0.8 } : undefined}>
                      {submitData ? '✅ Submitted' : hybridSubmittingId === ap.id ? '⏳ Submitting...' : '✔ Submit'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

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
      {AdminEndedOverlay}
      {FsWarning}
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

            {/* Coding Problem */}
            {q.type === 'coding_problem' ? (
              <CodingProblemInline
                question={q}
                savedCode={answers[q.id]}
                onCodeSave={(code) => handleAnswer(q.id, code)}
              />
            ) : (
            /* MCQ Options */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {(q.options || []).map((opt, oi) => {
                const isSelected = answers[q.id] === oi;
                return (
                  <button key={oi} onClick={() => handleAnswer(q.id, oi)} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                    background: isSelected ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.03)',
                    border: isSelected ? '1px solid #7c3aed' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isSelected ? '0 0 0 1px rgba(124,58,237,0.3)' : 'none',
                    borderRadius: 10, padding: '14px 18px', cursor: 'pointer',
                    textAlign: 'left', transition: 'all 0.18s', color: 'white',
                    fontFamily: 'inherit', fontSize: 14, width: '100%',
                    whiteSpace: 'normal', wordBreak: 'break-word'
                  }}>
                    <span style={{
                      width: 32, height: 32, borderRadius: 8, marginTop: 1,
                      background: isSelected ? '#7c3aed' : 'rgba(255,255,255,0.06)',
                      color: isSelected ? 'white' : 'rgba(255,255,255,0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace",
                      flexShrink: 0, transition: 'all 0.18s'
                    }}>{['A','B','C','D'][oi]}</span>
                    <span style={{ flex: 1, lineHeight: 1.55 }}>{opt}</span>
                    {isSelected && <span style={{ color: '#7c3aed', fontSize: 16, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>✓</span>}
                  </button>
                );
              })}
            </div>
            )}

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
