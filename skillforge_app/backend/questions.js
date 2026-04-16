function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRng(seed) {
  let s = typeof seed === 'number' ? seed : hashCode(String(seed));
  return function () {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function seededShuffle(array, seed) {
  const arr = [...array];
  const rng = seededRng(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function selectBalanced(pool, total, seed) {
  const bySubject = {};
  for (const q of pool) {
    const subj = q.subject || 'General';
    if (!bySubject[subj]) bySubject[subj] = [];
    bySubject[subj].push(q);
  }

  const subjects = Object.keys(bySubject);
  const perSubject = Math.floor(total / subjects.length);
  let remainder = total - perSubject * subjects.length;

  let selected = [];
  for (const subj of subjects) {
    const shuffled = seededShuffle(bySubject[subj], seed + subj);
    const take = perSubject + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;
    selected = selected.concat(shuffled.slice(0, take));
  }

  return seededShuffle(selected.slice(0, total), seed);
}

function answerIndex(correctAnswer) {
  if (!correctAnswer) return 0;
  const letter = correctAnswer.trim().toUpperCase().charAt(0);
  const map = { A: 0, B: 1, C: 2, D: 3 };
  return map[letter] !== undefined ? map[letter] : 0;
}

// Shuffle the option list for a single question using a deterministic seed
// so the same session gets the same option order on refresh, and scoring
// lines up with whatever was shown to the candidate.
// Returns { options: [...], answer: newIndex }.
function shuffleOptions(options, correctIdx, seed) {
  const n = options.length;
  if (!Array.isArray(options) || n <= 1) {
    return { options: options || [], answer: correctIdx || 0 };
  }
  // Track positions so we can follow the correct answer after swaps.
  const indices = options.map((_, i) => i);
  const rng = seededRng(seed);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const shuffled = indices.map(i => options[i]);
  const newCorrect = indices.indexOf(correctIdx);
  return { options: shuffled, answer: newCorrect >= 0 ? newCorrect : 0 };
}

function buildQuestionSet(db, testId, sessionId) {
  const seed = hashCode(sessionId);
  let allQuestions;
  let quotas;

  // Company interview prep tests — pull from company_questions table
  const companyMap = {
    'test_sony': 'Sony',
    'test_ey': 'EY',
    'test_fluke': 'Fluke',
    'test_wakefit': 'Wakefit',
    'test_nykaa': 'Nykaa',
    'test_greyorange': 'GreyOrange',
    'test_arcessium': 'Arcessium'
  };

  if (companyMap[testId]) {
    const company = companyMap[testId];
    const testRecord = db.prepare('SELECT * FROM tests WHERE id = ?').get(testId);
    const totalNeeded = testRecord ? testRecord.total_questions : 50;

    // MCQ-only: coding problems are loaded separately by the hybrid engine in server.js
    const mcqPool = db.prepare('SELECT * FROM company_questions WHERE company = ?').all(company);
    if (mcqPool.length === 0) return null;

    const shuffled = seededShuffle(mcqPool, seed);
    const selected = shuffled.slice(0, Math.min(totalNeeded, shuffled.length));

    const questions = selected.map((q, i) => {
      const rawOpts = [q.option_a, q.option_b, q.option_c, q.option_d].filter(o => o && String(o).trim());
      const rawAns = q.answer_index != null ? q.answer_index : answerIndex(q.correct_answer);
      const { options, answer } = shuffleOptions(rawOpts, rawAns, seed + '_opt_' + q.id);
      return {
        displayId: i + 1,
        id: q.id,
        subject: q.subject || company + ' Interview',
        topic: q.topic || 'General',
        difficulty: q.difficulty || 'Medium',
        type: q.type || 'mcq',
        question: q.question,
        options,
        answer,
        explanation: q.explanation || '',
        code_snippet: q.code_snippet || ''
      };
    });

    const safeQuestions = questions.map(q => ({
      displayId: q.displayId, id: q.id, subject: q.subject, topic: q.topic,
      difficulty: q.difficulty, type: q.type, question: q.question,
      options: q.options, code_snippet: q.code_snippet
    }));

    return { questions, safeQuestions };
  }

  if (testId === 'test_p1') {
    // Python Round 1: only Python subject
    allQuestions = db.prepare("SELECT * FROM questions WHERE subject = 'Python'").all();
    quotas = { mcq: 50, output: 25, scenario: 15, code_completion: 10 };
  } else if (testId === 'test_pqa') {
    // Python QA Round 1: all subjects (exclude java)
    allQuestions = db.prepare("SELECT * FROM questions WHERE id NOT LIKE 'java_%'").all();
    quotas = { mcq: 40, output: 25, scenario: 25, code_completion: 10 };
  } else {
    // Custom-designed tests — read config from tests table
    const testRecord = db.prepare('SELECT * FROM tests WHERE id = ?').get(testId);
    if (testRecord && testRecord.is_custom === 1 && testRecord.subjects_json) {
      const subjects = JSON.parse(testRecord.subjects_json || '[]');
      const difficultyDist = JSON.parse(testRecord.difficulty_json || '{"Easy":30,"Medium":50,"Hard":20}');
      const typeQuotas = JSON.parse(testRecord.type_quotas_json || '{}');
      const totalQ = testRecord.total_questions || 100;

      if (subjects.length === 0) return null;

      // Build WHERE clause for selected subjects
      const placeholders = subjects.map(() => '?').join(',');
      allQuestions = db.prepare(`SELECT * FROM questions WHERE subject IN (${placeholders})`).all(...subjects);

      if (allQuestions.length === 0) return null;

      // Apply difficulty distribution
      const byDifficulty = { Easy: [], Medium: [], Hard: [] };
      for (const q of allQuestions) {
        const d = q.difficulty || 'Medium';
        if (byDifficulty[d]) byDifficulty[d].push(q);
        else byDifficulty['Medium'].push(q);
      }

      let selected = [];
      const diffTotal = (difficultyDist.Easy || 0) + (difficultyDist.Medium || 0) + (difficultyDist.Hard || 0);

      for (const [diff, pct] of Object.entries(difficultyDist)) {
        const count = Math.round((pct / (diffTotal || 100)) * totalQ);
        const pool = byDifficulty[diff] || [];
        if (pool.length === 0) continue;

        // If we have type quotas, apply them within each difficulty level
        if (typeQuotas && Object.keys(typeQuotas).length > 0) {
          const typeTotal = Object.values(typeQuotas).reduce((a, b) => a + b, 0);
          const byType = {};
          for (const q of pool) {
            const t = (q.type || 'mcq').toLowerCase();
            if (!byType[t]) byType[t] = [];
            byType[t].push(q);
          }
          for (const [type, typeCount] of Object.entries(typeQuotas)) {
            const typeProportion = Math.round((typeCount / (typeTotal || 1)) * count);
            const typePool = byType[type] || [];
            if (typePool.length === 0) continue;
            const picked = selectBalanced(typePool, Math.min(typeProportion, typePool.length), seed + diff + type);
            selected = selected.concat(picked);
          }
        } else {
          const picked = selectBalanced(pool, Math.min(count, pool.length), seed + diff);
          selected = selected.concat(picked);
        }
      }

      // Fill if we didn't get enough
      if (selected.length < totalQ) {
        const selectedIds = new Set(selected.map(q => q.id));
        const remaining = allQuestions.filter(q => !selectedIds.has(q.id));
        const extra = seededShuffle(remaining, seed + '_extra_custom').slice(0, totalQ - selected.length);
        selected = selected.concat(extra);
      }

      // Trim to exact total and shuffle
      selected = seededShuffle(selected.slice(0, totalQ), seed + '_final_custom');

      const questions = selected.map((q, idx) => {
        const rawOpts = [q.option_a, q.option_b, q.option_c, q.option_d];
        const rawAns = q.answer_index != null ? q.answer_index : answerIndex(q.correct_answer);
        const { options, answer } = shuffleOptions(rawOpts, rawAns, seed + '_opt_' + q.id);
        return {
          displayId: idx + 1, id: q.id, subject: q.subject, topic: q.topic,
          difficulty: q.difficulty, type: q.type, question: q.question,
          options, answer,
          explanation: q.explanation || '', code_snippet: q.code_snippet || ''
        };
      });
      const safeQuestions = questions.map(q => ({
        displayId: q.displayId, id: q.id, subject: q.subject, topic: q.topic,
        difficulty: q.difficulty, type: q.type, question: q.question,
        options: q.options, code_snippet: q.code_snippet
      }));
      return { questions, safeQuestions };
    }

    // Default fallback for unknown tests
    allQuestions = db.prepare("SELECT * FROM questions WHERE id NOT LIKE 'java_%'").all();
    quotas = { mcq: 50, output: 25, scenario: 15, code_completion: 10 };
  }

  // Group by type
  const byType = {};
  for (const q of allQuestions) {
    const t = (q.type || 'mcq').toLowerCase();
    if (!byType[t]) byType[t] = [];
    byType[t].push(q);
  }

  let selected = [];
  for (const [type, count] of Object.entries(quotas)) {
    const pool = byType[type] || [];
    if (pool.length === 0) continue;
    const picked = selectBalanced(pool, Math.min(count, pool.length), seed + type);
    selected = selected.concat(picked);
  }

  // If we didn't get enough from specific types, fill from all
  const totalNeeded = Object.values(quotas).reduce((a, b) => a + b, 0);
  if (selected.length < totalNeeded) {
    const selectedIds = new Set(selected.map(q => q.id));
    const remaining = allQuestions.filter(q => !selectedIds.has(q.id));
    const extra = seededShuffle(remaining, seed + '_extra').slice(0, totalNeeded - selected.length);
    selected = selected.concat(extra);
  }

  selected = seededShuffle(selected, seed + '_final');

  const questions = selected.map((q, idx) => {
    const rawOpts = [q.option_a, q.option_b, q.option_c, q.option_d];
    const rawAns = q.answer_index != null ? q.answer_index : answerIndex(q.correct_answer);
    const { options, answer } = shuffleOptions(rawOpts, rawAns, seed + '_opt_' + q.id);
    return {
      displayId: idx + 1,
      id: q.id,
      subject: q.subject,
      topic: q.topic,
      difficulty: q.difficulty,
      type: q.type,
      question: q.question,
      options,
      answer,
      explanation: q.explanation || '',
      code_snippet: q.code_snippet || ''
    };
  });

  const safeQuestions = questions.map(q => ({
    displayId: q.displayId,
    id: q.id,
    subject: q.subject,
    topic: q.topic,
    difficulty: q.difficulty,
    type: q.type,
    question: q.question,
    options: q.options,
    code_snippet: q.code_snippet
  }));

  return { questions, safeQuestions };
}

module.exports = { hashCode, seededRng, seededShuffle, selectBalanced, buildQuestionSet };
