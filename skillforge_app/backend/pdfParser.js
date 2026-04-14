/**
 * pdfParser.js
 * Parses Q&A structured text extracted from a PDF (via client-side PDF.js).
 * Supports multiple common formats used in interview Q&A documents.
 */

/**
 * Attempt to extract question-answer pairs from raw PDF text.
 * Handles point-wise structured PDFs with patterns like:
 *   Q1. / Q1: / Question 1. / 1.   followed by
 *   A1. / A1: / Answer: / Ans: / Answer 1.
 *
 * Returns array of { questionNum, questionText, modelAnswer, questionType }
 */
function parsePDFText(text) {
  if (!text || typeof text !== 'string') return [];

  // Normalise line endings and collapse excessive blank lines
  const normalised = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Try each parsing strategy in order of specificity
  let results = tryExplicitQA(normalised);
  if (results.length >= 2) return results;

  results = tryNumberedQA(normalised);
  if (results.length >= 2) return results;

  results = tryBoldSections(normalised);
  if (results.length >= 2) return results;

  // Fallback: split by double newlines, treat alternating blocks as Q / A
  return tryAlternatingBlocks(normalised);
}

// ── Strategy 1: Explicit Q:/A: or Question N:/Answer: markers ──────────────
function tryExplicitQA(text) {
  // Matches: Q1. Q1: Q.1 Question 1. Question 1: Question:
  const qPattern = /(?:^|\n)[ \t]*(?:Q(?:uestion)?\.?\s*\d*[\s.:)]+)(.+?)(?=\n[ \t]*(?:A(?:ns(?:wer)?)?\.?\s*\d*[\s.:)]+|\n[ \t]*Q(?:uestion)?\.?\s*\d*[\s.:)]+))/gis;
  const aPattern = /(?:^|\n)[ \t]*(?:A(?:ns(?:wer)?)?\.?\s*\d*[\s.:)]+)(.+?)(?=\n[ \t]*Q(?:uestion)?\.?\s*\d*[\s.:)]+|$)/gis;

  const questions = [];
  const answers = [];

  let m;
  const qRe = /(?:^|\n)[ \t]*Q(?:uestion)?\.?\s*(\d*)[\s.:)]+([^\n](?:.|\n)*?)(?=\n[ \t]*(?:A(?:ns(?:wer)?)?\.?\s*\d*[\s.:)]|Q(?:uestion)?\.?\s*\d*[\s.:)])|$)/gi;
  const aRe = /(?:^|\n)[ \t]*A(?:ns(?:wer)?)?\.?\s*(\d*)[\s.:)]+([^\n](?:.|\n)*?)(?=\n[ \t]*Q(?:uestion)?\.?\s*\d*[\s.:)]|$)/gi;

  while ((m = qRe.exec(text)) !== null) {
    questions.push({ num: parseInt(m[1]) || questions.length + 1, text: m[2].trim() });
  }
  while ((m = aRe.exec(text)) !== null) {
    answers.push({ num: parseInt(m[1]) || answers.length + 1, text: m[2].trim() });
  }

  if (questions.length === 0 || answers.length === 0) return [];

  return zipQA(questions, answers);
}

// ── Strategy 2: Numbered items like "1." "2." with Answer on next section ──
function tryNumberedQA(text) {
  // Split on numbered items: "1." "1)" "1:" at start of line
  const blocks = text.split(/\n(?=\s*\d{1,3}[\.\):][ \t])/);
  if (blocks.length < 3) return [];

  const pairs = [];
  let qNum = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (!block) continue;

    // Check if block starts with a number
    const numMatch = block.match(/^(\d{1,3})[\.\):]\s+/);
    if (!numMatch) continue;

    const num = parseInt(numMatch[1]);
    const rest = block.slice(numMatch[0].length).trim();

    // Check if the rest contains an "Answer:" marker
    const ansMarker = rest.search(/\n\s*(?:Answer|Ans|A)[\s.:]/i);
    if (ansMarker !== -1) {
      const qText = rest.slice(0, ansMarker).trim();
      const aText = rest.slice(ansMarker).replace(/^\s*(?:Answer|Ans|A)[\s.:]+/i, '').trim();
      if (qText && aText) {
        pairs.push({ questionNum: num, questionText: qText, modelAnswer: aText, questionType: classifyQuestion(qText, aText) });
      }
    } else if (i + 1 < blocks.length) {
      // Next block might start with "Answer:" directly
      const nextBlock = blocks[i + 1].trim();
      if (/^(?:Answer|Ans|A)[\s.:]/i.test(nextBlock)) {
        const aText = nextBlock.replace(/^(?:Answer|Ans|A)[\s.:]+/i, '').trim();
        if (rest && aText) {
          pairs.push({ questionNum: num, questionText: rest, modelAnswer: aText, questionType: classifyQuestion(rest, aText) });
        }
        i++; // skip next block
      }
    }
  }

  return pairs;
}

// ── Strategy 3: Bold-like section headers (ALL CAPS lines as Q, body as A) ──
function tryBoldSections(text) {
  const lines = text.split('\n');
  const pairs = [];
  let currentQ = null;
  let answerLines = [];
  let qNum = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentQ && answerLines.length > 0) {
        const aText = answerLines.join(' ').trim();
        pairs.push({ questionNum: ++qNum, questionText: currentQ, modelAnswer: aText, questionType: classifyQuestion(currentQ, aText) });
        currentQ = null;
        answerLines = [];
      }
      continue;
    }
    // Detect "question line" — ends with ? or looks like an all-caps heading
    if (trimmed.endsWith('?') || /^[A-Z][^a-z]{10,}\??\s*$/.test(trimmed)) {
      if (currentQ && answerLines.length > 0) {
        const aText = answerLines.join(' ').trim();
        pairs.push({ questionNum: ++qNum, questionText: currentQ, modelAnswer: aText, questionType: classifyQuestion(currentQ, aText) });
        answerLines = [];
      }
      currentQ = trimmed;
    } else if (currentQ) {
      answerLines.push(trimmed);
    }
  }
  if (currentQ && answerLines.length > 0) {
    const aText = answerLines.join(' ').trim();
    pairs.push({ questionNum: ++qNum, questionText: currentQ, modelAnswer: aText, questionType: classifyQuestion(currentQ, aText) });
  }

  return pairs.length >= 2 ? pairs : [];
}

// ── Strategy 4: Alternating double-newline blocks ──────────────────────────
function tryAlternatingBlocks(text) {
  const blocks = text.split(/\n\n+/).map(b => b.trim()).filter(Boolean);
  if (blocks.length < 4) return [];

  const pairs = [];
  for (let i = 0; i + 1 < blocks.length; i += 2) {
    const q = blocks[i];
    const a = blocks[i + 1];
    // Skip very short blocks (likely headers/footers)
    if (q.length < 10 || a.length < 5) continue;
    pairs.push({
      questionNum: pairs.length + 1,
      questionText: q,
      modelAnswer: a,
      questionType: classifyQuestion(q, a)
    });
  }
  return pairs;
}

// ── Helper: zip questions + answers by index ──────────────────────────────
function zipQA(questions, answers) {
  const pairs = [];
  const len = Math.min(questions.length, answers.length);
  for (let i = 0; i < len; i++) {
    const q = questions[i];
    const a = answers[i];
    pairs.push({
      questionNum: q.num || i + 1,
      questionText: q.text,
      modelAnswer: a.text,
      questionType: classifyQuestion(q.text, a.text)
    });
  }
  return pairs;
}

// ── Classify question as short/long based on answer length ────────────────
function classifyQuestion(qText, aText) {
  const wordCount = aText.split(/\s+/).length;
  if (wordCount > 60) return 'long';
  if (wordCount > 20) return 'medium';
  return 'short';
}

module.exports = { parsePDFText };
