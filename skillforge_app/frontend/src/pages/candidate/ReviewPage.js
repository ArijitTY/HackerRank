import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

export default function ReviewPage() {
  const { testId, sessionId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/candidate/tests/${testId}/sessions/${sessionId}/review`)
      .then(r => setData(r.data))
      .catch(e => {
        if (e.response?.status === 403) {
          setError('access_denied');
        } else {
          setError(e.response?.data?.error || 'Failed to load review');
        }
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

  if (error) return (
    <div className="error-page">
      <div className="alert alert-error">{error}</div>
      <button className="btn btn-outline" onClick={() => navigate('/candidate')}>Back</button>
    </div>
  );
  if (!data) return null;

  const questions = data.review || data.questions || [];
  const optionLabels = ['A', 'B', 'C', 'D'];

  const getQuestionStatus = (q) => {
    const sel = q.userAnswer ?? q.selected_option;
    if (sel == null || sel === -1) return 'skipped';
    return (q.isCorrect || q.is_correct) ? 'correct' : 'wrong';
  };

  const filtered = questions.filter(q => {
    if (filter === 'all') return true;
    return getQuestionStatus(q) === filter;
  });

  const counts = {
    all: questions.length,
    correct: questions.filter(q => getQuestionStatus(q) === 'correct').length,
    wrong: questions.filter(q => getQuestionStatus(q) === 'wrong').length,
    skipped: questions.filter(q => getQuestionStatus(q) === 'skipped').length,
  };

  return (
    <div className="page-container review-page">
      <button className="btn btn-ghost back-btn" onClick={() => navigate('/candidate')}>
        &#8592; Back to Dashboard
      </button>

      {/* Score Summary Card */}
      <div className="review-summary-card card">
        <div className="review-summary-content">
          <div className="score-circle" style={{ '--score-color': data.passed ? 'var(--success)' : 'var(--danger)' }}>
            <div className="score-value">{data.score ?? '-'}/{data.total ?? '-'}</div>
            <div className="score-percentage">{data.percentage ?? '-'}%</div>
          </div>
          <div className="review-grade">
            <span className={`badge badge-lg ${data.passed ? 'badge-success' : 'badge-danger'}`}>
              {data.grade || (data.passed ? 'PASS' : 'FAIL')}
            </span>
          </div>
          <div className="review-stats-row">
            <div className="review-mini-stat correct">
              <span className="mini-stat-value">{counts.correct}</span>
              <span className="mini-stat-label">Correct</span>
            </div>
            <div className="review-mini-stat wrong">
              <span className="mini-stat-value">{counts.wrong}</span>
              <span className="mini-stat-label">Wrong</span>
            </div>
            <div className="review-mini-stat skipped">
              <span className="mini-stat-value">{counts.skipped}</span>
              <span className="mini-stat-label">Skipped</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {['all', 'correct', 'wrong', 'skipped'].map(f => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''} ${f !== 'all' ? `filter-${f}` : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Question Review Cards */}
      <div className="review-questions">
        {filtered.map((q, i) => {
          const status = getQuestionStatus(q);
          return (
            <div key={q.id || i} className={`question-card review-q-card status-${status}`}>
              <div className="question-header">
                <span className="question-num">Q{q.displayId || i + 1}</span>
                <div className="question-badges">
                  <span className={`badge badge-${(q.difficulty || '').toLowerCase()}`}>{q.difficulty}</span>
                  <span className={`badge ${status === 'correct' ? 'badge-success' : status === 'wrong' ? 'badge-danger' : 'badge-muted'}`}>
                    {status === 'correct' ? 'Correct' : status === 'wrong' ? 'Wrong' : 'Skipped'}
                  </span>
                </div>
              </div>

              <div className="question-text">{q.question || q.question_text || q.text}</div>
              {q.code_snippet && <div className="code-block">{q.code_snippet}</div>}

              <div className="option-list">
                {(q.options || []).map((opt, oi) => {
                  let cls = 'option-item';
                  const isCorrect = oi === (q.correctAnswer ?? q.correct_answer);
                  const isSelected = oi === (q.userAnswer ?? q.selected_option);
                  if (isCorrect && isSelected) cls += ' correct user-selected';
                  else if (isCorrect) cls += ' correct';
                  else if (isSelected) cls += ' wrong user-selected';
                  return (
                    <div key={oi} className={cls}>
                      <span className="opt-label">{optionLabels[oi]}</span>
                      <span className="opt-text">{opt}</span>
                      {isCorrect && <span className="opt-tag correct-tag">Correct Answer</span>}
                      {isSelected && !isCorrect && <span className="opt-tag wrong-tag">Your Answer</span>}
                      {isSelected && isCorrect && <span className="opt-tag correct-tag">Your Answer (Correct)</span>}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div className="explanation-box">
                  <div className="explanation-header">
                    <span className="explanation-icon">&#128161;</span>
                    <strong>Explanation</strong>
                  </div>
                  <p>{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">&#128269;</span>
            <p>No questions match this filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
