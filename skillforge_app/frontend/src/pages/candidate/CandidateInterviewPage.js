import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

const S = {
  wrap: { minHeight: '100vh', background: '#030712', display: 'flex', flexDirection: 'column' },
  topbar: {
    background: '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.06)',
    padding: '0 28px', height: 56, display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50,
  },
  badge: { padding: '2px 10px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 20, fontSize: 11, color: '#a78bfa', fontWeight: 600, marginLeft: 4 },
  body: { flex: 1, padding: '32px 24px', maxWidth: 860, margin: '0 auto', width: '100%' },
  bar: { height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' },
  barFill: (pct) => ({ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#7c3aed,#2563eb)', borderRadius: 4, transition: 'width .3s ease' }),
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 28, marginBottom: 20 },
  qNum: { fontSize: 12, fontWeight: 700, color: '#818cf8', letterSpacing: 1, marginBottom: 8 },
  qText: { fontSize: 17, fontWeight: 600, color: 'rgba(255,255,255,0.92)', lineHeight: 1.6, marginBottom: 14 },
  qType: (t) => ({
    display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, marginBottom: 20,
    background: t === 'long' ? 'rgba(245,158,11,0.1)' : t === 'medium' ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)',
    color: t === 'long' ? '#fbbf24' : t === 'medium' ? '#60a5fa' : '#34d399',
    border: `1px solid ${t === 'long' ? 'rgba(245,158,11,0.25)' : t === 'medium' ? 'rgba(59,130,246,0.25)' : 'rgba(16,185,129,0.25)'}`,
  }),
  textarea: {
    width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'rgba(255,255,255,0.88)',
    fontSize: 14, lineHeight: 1.7, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box',
  },
  navBtn: (variant) => ({
    padding: '10px 22px', borderRadius: 9, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity .15s',
    background: variant === 'primary' ? 'linear-gradient(135deg,#7c3aed,#2563eb)' : variant === 'danger' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
    border: variant === 'primary' ? 'none' : variant === 'danger' ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(255,255,255,0.1)',
    color: variant === 'danger' ? '#f87171' : 'white',
  }),
  center: { padding: 80, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 15 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 32, maxWidth: 420, width: '90%', textAlign: 'center' },
  doneWrap: { textAlign: 'center', paddingTop: 80 },
};

/* ── Skeleton loader ─────────────────────────────────────────────────── */
function Skeleton({ width = '100%', height = 16, radius = 6, style = {} }) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: 'linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      ...style,
    }} />
  );
}

/* ── Confirm Submit Modal ────────────────────────────────────────────── */
function ConfirmModal({ questions, answers, onConfirm, onCancel, submitting }) {
  const answered = questions.filter(q => (answers[q.id] || '').trim().length > 0).length;
  const skipped = questions.length - answered;
  return (
    <div style={S.overlay} onClick={onCancel}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 10 }}>Submit Interview?</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24, lineHeight: 1.6 }}>
          You've answered <strong style={{ color: '#818cf8' }}>{answered}</strong> of <strong>{questions.length}</strong> questions.
          {skipped > 0 && <><br/><span style={{ color: '#fbbf24' }}>⚠️ {skipped} question{skipped > 1 ? 's' : ''} unanswered.</span></>}
          <br/><br/>Once submitted, you cannot make changes.
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={onCancel} disabled={submitting} style={S.navBtn('default')}>Go Back</button>
          <button onClick={onConfirm} disabled={submitting} style={{ ...S.navBtn('primary'), minWidth: 120 }}>
            {submitting ? '⏳ Submitting...' : '✅ Submit Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────── */
export default function CandidateInterviewPage({ user }) {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers]     = useState({});
  const [resumed, setResumed]     = useState(false);
  const [testName, setTestName]   = useState('Interview');
  const [saving, setSaving]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [done, setDone]           = useState(false);
  const saveTimers = useRef({});

  // Persist current question index in localStorage so resume restores position
  const lsKey = `interview_idx_${testId}`;
  const [currentIdx, setCurrentIdx] = useState(() => {
    const saved = localStorage.getItem(lsKey);
    return saved ? parseInt(saved, 10) : 0;
  });

  const gotoIdx = (idx) => {
    setCurrentIdx(idx);
    localStorage.setItem(lsKey, String(idx));
  };

  /* ── Load / Start session ────────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const listResp = await api.get('/candidate/interviews');
        const interview = listResp.data.interviews?.find(i => i.test_id === parseInt(testId));
        if (interview) setTestName(interview.name || 'Interview');

        const resp = await api.post(`/candidate/interviews/${testId}/start`);
        const { sessionId: sid, questions: qs, answers: ans, resumed: res } = resp.data;
        setSessionId(sid);
        setQuestions(qs);
        setResumed(res);

        const aMap = {};
        if (ans?.length) for (const a of ans) aMap[a.question_id] = a.answer_text || '';
        setAnswers(aMap);

        // Clamp saved index to valid range
        setCurrentIdx(prev => Math.min(prev, qs.length - 1));
      } catch (e) {
        setError(e.response?.data?.error || 'Failed to start interview');
      }
      setLoading(false);
    })();
  }, [testId]); // eslint-disable-line

  /* ── Auto-save with debounce ─────────────────────────────────────── */
  const saveAnswer = useCallback(async (questionId, text, sid) => {
    if (!sid) return;
    setSaving(true);
    try {
      await api.put(`/candidate/interviews/${testId}/session/${sid}/answer/${questionId}`, { answerText: text });
    } catch (_) { /* silent */ }
    setSaving(false);
  }, [testId]);

  const handleAnswerChange = (questionId, text) => {
    setAnswers(prev => ({ ...prev, [questionId]: text }));
    if (saveTimers.current[questionId]) clearTimeout(saveTimers.current[questionId]);
    saveTimers.current[questionId] = setTimeout(() => saveAnswer(questionId, text, sessionId), 800);
  };

  /* ── Navigate with flush save ────────────────────────────────────── */
  const goToQuestion = async (idx) => {
    const currentQ = questions[currentIdx];
    if (currentQ && saveTimers.current[currentQ.id]) {
      clearTimeout(saveTimers.current[currentQ.id]);
      delete saveTimers.current[currentQ.id];
      await saveAnswer(currentQ.id, answers[currentQ.id] || '', sessionId);
    }
    gotoIdx(idx);
  };

  /* ── Submit ──────────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    setSubmitting(true);
    const currentQ = questions[currentIdx];
    if (currentQ) await saveAnswer(currentQ.id, answers[currentQ.id] || '', sessionId);
    try {
      await api.post(`/candidate/interviews/${testId}/session/${sessionId}/submit`);
      localStorage.removeItem(lsKey); // clear saved position after submit
      setDone(true);
    } catch (e) {
      alert(e.response?.data?.error || 'Submit failed. Please try again.');
    }
    setSubmitting(false);
    setShowConfirm(false);
  };

  /* ── Render: skeleton loader ─────────────────────────────────────── */
  if (loading) return (
    <div style={S.wrap}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={S.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Skeleton width={120} height={20} />
        </div>
      </div>
      <div style={S.body}>
        <Skeleton height={8} radius={4} style={{ marginBottom: 24 }} />
        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
          {[...Array(5)].map((_, i) => <Skeleton key={i} width={32} height={32} radius="50%" />)}
        </div>
        <div style={S.card}>
          <Skeleton width={80} height={12} style={{ marginBottom: 12 }} />
          <Skeleton height={22} style={{ marginBottom: 8 }} />
          <Skeleton width="70%" height={22} style={{ marginBottom: 20 }} />
          <Skeleton width={90} height={24} radius={20} style={{ marginBottom: 20 }} />
          <Skeleton height={160} radius={10} />
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div style={S.wrap}>
      <div style={{ ...S.center, color: '#f87171' }}>❌ {error}</div>
    </div>
  );

  /* ── Done screen ─────────────────────────────────────────────────── */
  if (done) return (
    <div style={S.wrap}>
      <div style={S.body}>
        <div style={S.doneWrap}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 8 }}>Interview Submitted!</div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
            Your answers have been recorded successfully.<br/>
            The interviewer will review and evaluate your responses.<br/>
            You'll be notified once results are available.
          </div>
          <button onClick={() => navigate('/candidate')} style={{ ...S.navBtn('primary'), marginTop: 32, padding: '12px 32px' }}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  const currentQ   = questions[currentIdx];
  const totalQ     = questions.length;
  const progressPct = totalQ > 0 ? Math.round(((currentIdx + 1) / totalQ) * 100) : 0;
  const answeredCount = questions.filter(q => (answers[q.id] || '').trim().length > 0).length;
  const minHeight  = currentQ?.question_type === 'long' ? 220 : currentQ?.question_type === 'medium' ? 160 : 100;

  return (
    <div style={S.wrap}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      {/* Top bar */}
      <div style={S.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span style={{ fontSize: 15, fontWeight: 800 }}>
            <span style={{ color: '#818cf8' }}>Skill</span><span style={{ color: 'white' }}>Forge</span>
          </span>
          <span style={S.badge}>Interview</span>
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginLeft: 8 }}>{testName}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {saving && (
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Saving...
            </span>
          )}
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{answeredCount}/{totalQ} answered</span>
          {resumed && (
            <span style={{ fontSize: 11, padding: '3px 10px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, color: '#fbbf24', fontWeight: 600 }}>
              ↩ Resumed
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={S.body}>
        {/* Progress bar */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
            <span>Question {currentIdx + 1} of {totalQ}</span>
            <span style={{ color: progressPct === 100 ? '#34d399' : undefined }}>{progressPct}% complete</span>
          </div>
          <div style={S.bar}><div style={S.barFill(progressPct)} /></div>
        </div>

        {/* Question dot navigator */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
          {questions.map((q, i) => {
            const isAnswered = (answers[q.id] || '').trim().length > 0;
            const isCurrent  = i === currentIdx;
            return (
              <button key={q.id} type="button" onClick={() => goToQuestion(i)} title={`Q${i + 1}${isAnswered ? ' ✓' : ''}`}
                style={{
                  width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 12, fontWeight: 700, transition: 'all .15s',
                  background: isCurrent ? 'linear-gradient(135deg,#7c3aed,#2563eb)' : isAnswered ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)',
                  color: isCurrent ? 'white' : isAnswered ? '#34d399' : 'rgba(255,255,255,0.4)',
                  border: isCurrent ? 'none' : isAnswered ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(255,255,255,0.1)',
                  outline: isCurrent ? '2px solid rgba(124,58,237,0.4)' : 'none', outlineOffset: 2,
                }}>
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* Question card */}
        {currentQ && (
          <div style={S.card}>
            <div style={S.qNum}>QUESTION {currentIdx + 1}</div>
            <div style={S.qText}>{currentQ.question_text}</div>
            <div style={S.qType(currentQ.question_type)}>
              {currentQ.question_type === 'long' ? '📝 Long Answer' : currentQ.question_type === 'medium' ? '✏️ Medium Answer' : '⚡ Short Answer'}
            </div>

            <textarea
              key={currentQ.id}
              style={{ ...S.textarea, minHeight }}
              placeholder={
                currentQ.question_type === 'long'   ? 'Write your detailed answer here...' :
                currentQ.question_type === 'medium' ? 'Write your answer here (a short paragraph)...' :
                                                      'Write your answer here (1-3 sentences)...'
              }
              value={answers[currentQ.id] || ''}
              onChange={e => handleAnswerChange(currentQ.id, e.target.value)}
              spellCheck
              autoFocus
            />
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 8, textAlign: 'right' }}>
              {(answers[currentQ.id] || '').trim().split(/\s+/).filter(Boolean).length} words
            </div>
          </div>
        )}

        {/* Nav row */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <button type="button" disabled={currentIdx === 0}
            style={{ ...S.navBtn('default'), opacity: currentIdx === 0 ? 0.4 : 1 }}
            onClick={() => goToQuestion(currentIdx - 1)}>
            ← Previous
          </button>
          <button type="button" style={S.navBtn('danger')} onClick={() => setShowConfirm(true)}>
            📤 Submit Interview
          </button>
          <button type="button" disabled={currentIdx === totalQ - 1}
            style={{ ...S.navBtn(currentIdx === totalQ - 1 ? 'default' : 'primary'), opacity: currentIdx === totalQ - 1 ? 0.4 : 1 }}
            onClick={() => goToQuestion(currentIdx + 1)}>
            Next →
          </button>
        </div>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
          Click a number above to jump to any question · Answers are saved automatically
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal questions={questions} answers={answers}
          onConfirm={handleSubmit} onCancel={() => setShowConfirm(false)} submitting={submitting} />
      )}
    </div>
  );
}
