import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function ReviewPage() {
  const { testId, sessionId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/candidate/tests/${testId}/sessions/${sessionId}/review`)
      .then(r => setData(r.data))
      .catch(e => {
        if (e.response?.status === 403) setError('access_denied');
        else setError(e.response?.data?.error || 'Failed to load review');
      })
      .finally(() => setLoading(false));
  }, [testId, sessionId]);

  if (loading) return <div className="loading">Loading review...</div>;

  if (error === 'access_denied') {
    return (
      <div className="access-denied">
        <div className="icon">&#128274;</div>
        <h2>Access Denied</h2>
        <p className="text-dim">You do not have analysis access for this test, or your access has expired.</p>
        <button className="btn btn-outline" style={{ marginTop: 20 }} onClick={() => navigate('/candidate')}>Back to Dashboard</button>
      </div>
    );
  }
  if (error) {
    return (
      <div className="error-page">
        <div className="alert alert-error">{error}</div>
        <button className="btn btn-outline" onClick={() => navigate('/candidate')}>Back</button>
      </div>
    );
  }
  if (!data) return null;

  const rawQuestions = data.review || data.questions || [];
  const testName = data.testName || '';
  const passed = !!data.passed;
  const score = data.score ?? 0;
  const percentage = data.percentage ?? 0;
  const grade = data.grade || (passed ? 'PASS' : 'FAIL');

  const questions = rawQuestions.map((q, idx) => {
    const userIdx = (q.userAnswer === null || q.userAnswer === undefined)
      ? null
      : (typeof q.userAnswer === 'number' ? q.userAnswer : parseInt(q.userAnswer, 10));
    const correctIdx = typeof q.correctAnswer === 'number'
      ? q.correctAnswer
      : (q.correctAnswer != null ? parseInt(q.correctAnswer, 10) : null);
    const isSkipped = userIdx === null || isNaN(userIdx) || userIdx === -1;
    const isCorrect = !isSkipped && correctIdx != null && userIdx === correctIdx;
    const options = Array.isArray(q.options) ? q.options : [];
    const status = isSkipped ? 'skipped' : isCorrect ? 'correct' : 'wrong';
    return {
      ...q,
      questionNumber: q.displayId || idx + 1,
      questionText: q.question || q.question_text || q.text || '',
      options,
      userAnswerIndex: isSkipped ? null : userIdx,
      correctAnswerIndex: correctIdx,
      userAnswerText: !isSkipped && options[userIdx] != null ? options[userIdx] : null,
      correctAnswerText: correctIdx != null && options[correctIdx] != null ? options[correctIdx] : null,
      correctAnswerLetter: correctIdx != null ? OPTION_LETTERS[correctIdx] : null,
      isCorrect,
      isSkipped,
      status,
    };
  });

  const total = data.summary?.totalQuestions ?? questions.length;
  const correct = data.summary?.correct ?? questions.filter(q => q.status === 'correct').length;
  const wrong = data.summary?.wrong ?? questions.filter(q => q.status === 'wrong').length;
  const skipped = data.summary?.skipped ?? questions.filter(q => q.status === 'skipped').length;
  const answered = data.summary?.answered ?? (total - skipped);

  const filtered = questions.filter(q => activeFilter === 'all' || q.status === activeFilter);

  const StatCard = ({ value, label, color, bg, border, labelColor }) => (
    <div style={{ background: bg, border: '1px solid ' + border, borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: 24, fontWeight: 600, color, lineHeight: 1 }}>{value ?? 0}</div>
      <div style={{ fontSize: 11, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 6 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0b0b12', color: '#fff' }}>
      {/* HEADER */}
      <div style={{
        background: '#13131f',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '1.25rem 2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 500, margin: 0 }}>Test Review</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '2px 0 0' }}>{testName}</p>
        </div>
        <button
          onClick={() => navigate('/candidate')}
          style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 13 }}
        >
          Back to Dashboard
        </button>
      </div>

      {/* RESULT BANNER */}
      <div style={{
        margin: '1.5rem 2rem',
        padding: '1.25rem 1.5rem',
        borderRadius: 12,
        background: passed ? 'rgba(29,158,117,0.1)' : 'rgba(226,75,74,0.1)',
        border: '1px solid ' + (passed ? 'rgba(29,158,117,0.25)' : 'rgba(226,75,74,0.25)'),
        display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: passed ? 'rgba(29,158,117,0.2)' : 'rgba(226,75,74,0.2)',
          border: '2px solid ' + (passed ? '#1D9E75' : '#E24B4A'),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 600,
          color: passed ? '#1D9E75' : '#E24B4A', flexShrink: 0,
        }}>
          {grade || 'F'}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 500, marginBottom: 4 }}>
            {passed ? 'You Passed!' : 'Not Passed'}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{testName || '-'}</div>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#fff', fontSize: 28, fontWeight: 600, lineHeight: 1 }}>
              {score != null ? score : '-'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>
              Score
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 24 }}>/</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#fff', fontSize: 28, fontWeight: 600, lineHeight: 1 }}>
              {total || '-'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>
              Total
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 600, lineHeight: 1, color: (Number(percentage) >= 60) ? '#1D9E75' : '#E24B4A' }}>
              {percentage != null ? `${percentage}%` : '-'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>
              Percentage
            </div>
          </div>
        </div>
      </div>

      {/* STATS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, margin: '0 2rem 1.5rem' }}>
        <StatCard value={total || 0} label="Total" color="#fff" bg="rgba(255,255,255,0.05)" border="rgba(255,255,255,0.08)" labelColor="rgba(255,255,255,0.4)" />
        <StatCard value={answered || 0} label="Answered" color="#378ADD" bg="rgba(24,95,165,0.08)" border="rgba(24,95,165,0.2)" labelColor="rgba(55,138,221,0.6)" />
        <StatCard value={correct || 0} label="Correct" color="#1D9E75" bg="rgba(29,158,117,0.08)" border="rgba(29,158,117,0.2)" labelColor="rgba(29,158,117,0.6)" />
        <StatCard value={wrong || 0} label="Wrong" color="#E24B4A" bg="rgba(226,75,74,0.08)" border="rgba(226,75,74,0.2)" labelColor="rgba(226,75,74,0.6)" />
        <StatCard value={skipped || 0} label="Skipped" color="#BA7517" bg="rgba(186,117,23,0.08)" border="rgba(186,117,23,0.2)" labelColor="rgba(186,117,23,0.6)" />
      </div>

      {/* FILTER TABS */}
      <div style={{ padding: '1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: `All Questions (${total})` },
          { key: 'correct', label: `✓ Correct (${correct})` },
          { key: 'wrong', label: `✗ Wrong (${wrong})` },
          { key: 'skipped', label: `— Skipped (${skipped})` },
        ].map(f => {
          const active = activeFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              style={{
                padding: '6px 16px', borderRadius: 99,
                border: '1px solid ' + (active ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.1)'),
                background: active ? 'rgba(139,92,246,0.2)' : 'transparent',
                color: active ? '#a78bfa' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer', fontSize: 13,
                fontWeight: active ? 500 : 400,
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* QUESTIONS LIST */}
      <div style={{ padding: '1.5rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
            No questions match this filter
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {filtered.map((q, idx) => {
            const borderColor = q.status === 'correct' ? 'rgba(29,158,117,0.25)'
              : q.status === 'wrong' ? 'rgba(226,75,74,0.25)'
              : 'rgba(186,117,23,0.25)';
            const cardBg = q.status === 'correct' ? 'rgba(29,158,117,0.05)'
              : q.status === 'wrong' ? 'rgba(226,75,74,0.05)'
              : 'rgba(186,117,23,0.05)';
            return (
              <div key={q.id || idx} style={{ borderRadius: 12, border: '1px solid ' + borderColor, background: cardBg, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 500 }}>Q{q.questionNumber}</span>
                  {q.status === 'correct' && (
                    <span style={{ background: 'rgba(29,158,117,0.2)', color: '#1D9E75', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 500 }}>✓ Correct</span>
                  )}
                  {q.status === 'wrong' && (
                    <span style={{ background: 'rgba(226,75,74,0.2)', color: '#E24B4A', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 500 }}>✗ Wrong</span>
                  )}
                  {q.status === 'skipped' && (
                    <span style={{ background: 'rgba(186,117,23,0.2)', color: '#BA7517', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 500 }}>— Skipped</span>
                  )}
                </div>

                <div style={{ padding: '14px 16px' }}>
                  <p style={{ color: '#fff', fontSize: 13, lineHeight: 1.6, marginBottom: 14, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{q.questionText}</p>

                  {q.code_snippet && (
                    <pre style={{ background: 'rgba(0,0,0,0.4)', padding: 10, borderRadius: 6, fontSize: 12, color: 'rgba(255,255,255,0.8)', overflowX: 'auto', margin: '0 0 12px' }}>{q.code_snippet}</pre>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {q.options.map((option, optIdx) => {
                      const isSelected = !q.isSkipped && optIdx === q.userAnswerIndex;
                      const isCorrectOpt = optIdx === q.correctAnswerIndex;
                      let optionBg = 'rgba(255,255,255,0.04)';
                      let optionBorder = 'rgba(255,255,255,0.08)';
                      let optionColor = 'rgba(255,255,255,0.7)';
                      let icon = null;
                      if (isCorrectOpt) { optionBg = 'rgba(29,158,117,0.15)'; optionBorder = 'rgba(29,158,117,0.35)'; optionColor = '#1D9E75'; icon = '✓'; }
                      if (isSelected && !isCorrectOpt) { optionBg = 'rgba(226,75,74,0.15)'; optionBorder = 'rgba(226,75,74,0.35)'; optionColor = '#E24B4A'; icon = '✗'; }
                      return (
                        <div key={optIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 12px', borderRadius: 8, background: optionBg, border: '1px solid ' + optionBorder }}>
                          <div style={{
                            width: 22, height: 22, borderRadius: '50%',
                            background: isCorrectOpt ? 'rgba(29,158,117,0.3)'
                              : isSelected && !isCorrectOpt ? 'rgba(226,75,74,0.3)'
                              : 'rgba(255,255,255,0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 600, color: optionColor, flexShrink: 0,
                          }}>
                            {icon || OPTION_LETTERS[optIdx] || (optIdx + 1)}
                          </div>
                          <span style={{ fontSize: 13, color: optionColor, lineHeight: 1.4, flex: 1, wordBreak: 'break-word' }}>{option}</span>
                          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                            {isSelected && (
                              <span style={{
                                fontSize: 10, padding: '1px 6px', borderRadius: 4,
                                background: isCorrectOpt ? 'rgba(29,158,117,0.2)' : 'rgba(226,75,74,0.2)',
                                color: isCorrectOpt ? '#1D9E75' : '#E24B4A',
                              }}>Your answer</span>
                            )}
                            {isCorrectOpt && !isSelected && (
                              <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(29,158,117,0.2)', color: '#1D9E75' }}>Correct</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {q.isSkipped && (
                    <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(186,117,23,0.1)', border: '1px solid rgba(186,117,23,0.2)', fontSize: 12, color: '#BA7517' }}>
                      You did not answer this question. Correct answer: <strong style={{ color: '#fff' }}>{q.correctAnswerLetter}{q.correctAnswerText ? ' — ' + q.correctAnswerText : ''}</strong>
                    </div>
                  )}

                  {q.explanation && (
                    <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                      <strong style={{ color: 'rgba(255,255,255,0.8)' }}>💡 Explanation: </strong>{q.explanation}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
