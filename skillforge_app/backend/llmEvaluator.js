/**
 * llmEvaluator.js
 * Evaluates interview answers using Gemini / OpenAI / Groq.
 * Uses Node's built-in https module — no external SDK needed.
 */

const https = require('https');

// Provider → available models
const MODELS = {
  gemini: [
    { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Free)' },
    { id: 'gemini-1.5-pro',   label: 'Gemini 1.5 Pro' },
    { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  ],
  openai: [
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { id: 'gpt-4o',      label: 'GPT-4o' },
    { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  ],
  groq: [
    { id: 'llama3-8b-8192',         label: 'Llama 3 8B (Free)' },
    { id: 'llama3-70b-8192',        label: 'Llama 3 70B (Free)' },
    { id: 'mixtral-8x7b-32768',     label: 'Mixtral 8x7B (Free)' },
    { id: 'llama-3.1-8b-instant',   label: 'Llama 3.1 8B Instant (Free)' },
  ],
};

/**
 * Build the evaluation prompt
 */
function buildPrompt(question, modelAnswer, candidateAnswer) {
  return `You are an expert technical interviewer evaluating a candidate's answer.

QUESTION:
${question}

MODEL ANSWER (Expected):
${modelAnswer}

CANDIDATE'S ANSWER:
${candidateAnswer || '(No answer provided)'}

Evaluate the candidate's answer strictly on a scale of 0 to 10 based on:
- Accuracy: Are the facts correct?
- Completeness: Did they cover all key points from the model answer?
- Clarity: Is the explanation clear and coherent?
- Depth: Is there sufficient detail?

Respond ONLY with valid JSON in this exact format:
{
  "score": <integer 0-10>,
  "reasoning": "<2-3 sentences explaining the overall score>",
  "strengths": "<what the candidate got right>",
  "missing": "<key points that were missing or incorrect>"
}`;
}

/**
 * Make an HTTPS POST request and return parsed JSON response body
 */
function httpsPost(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname,
      path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers },
    };
    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          if (res.statusCode >= 400) {
            reject(new Error(`API error ${res.statusCode}: ${JSON.stringify(parsed?.error || parsed)}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error(`Failed to parse API response: ${raw.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Request timeout')); });
    req.write(data);
    req.end();
  });
}

/**
 * Parse LLM response text → { score, reasoning, strengths, missing }
 */
function parseEvalResponse(text) {
  // Extract JSON block (handle markdown code fences)
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  const jsonStr = jsonMatch ? jsonMatch[1] : text;
  try {
    const obj = JSON.parse(jsonStr.trim());
    return {
      score: Math.max(0, Math.min(10, parseInt(obj.score) || 0)),
      reasoning: obj.reasoning || '',
      strengths: obj.strengths || '',
      missing: obj.missing || '',
    };
  } catch (e) {
    // Fallback: extract score from text
    const scoreMatch = text.match(/score["\s:]+(\d+)/i);
    return {
      score: scoreMatch ? Math.max(0, Math.min(10, parseInt(scoreMatch[1]))) : 5,
      reasoning: text.slice(0, 300),
      strengths: '',
      missing: '',
    };
  }
}

// ── Gemini ──────────────────────────────────────────────────────────────────
async function callGemini(prompt, apiKey, model = 'gemini-1.5-flash') {
  const path = `/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 512 }
  };
  const resp = await httpsPost('generativelanguage.googleapis.com', path, {}, body);
  const text = resp?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return parseEvalResponse(text);
}

// ── OpenAI ───────────────────────────────────────────────────────────────────
async function callOpenAI(prompt, apiKey, model = 'gpt-4o-mini') {
  const body = {
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    max_tokens: 512,
  };
  const resp = await httpsPost('api.openai.com', '/v1/chat/completions', { Authorization: `Bearer ${apiKey}` }, body);
  const text = resp?.choices?.[0]?.message?.content || '';
  return parseEvalResponse(text);
}

// ── Groq ─────────────────────────────────────────────────────────────────────
async function callGroq(prompt, apiKey, model = 'llama3-8b-8192') {
  const body = {
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    max_tokens: 512,
  };
  const resp = await httpsPost('api.groq.com', '/openai/v1/chat/completions', { Authorization: `Bearer ${apiKey}` }, body);
  const text = resp?.choices?.[0]?.message?.content || '';
  return parseEvalResponse(text);
}

/**
 * Main entry point: evaluate a single answer
 * @param {string} question
 * @param {string} modelAnswer
 * @param {string} candidateAnswer
 * @param {object} settings  { provider, apiKey, model }
 * @returns {{ score, reasoning, strengths, missing }}
 */
async function evaluateAnswer(question, modelAnswer, candidateAnswer, settings) {
  const { provider = 'gemini', apiKey, model } = settings;
  if (!apiKey) throw new Error('No API key configured. Please set one in Settings.');

  const prompt = buildPrompt(question, modelAnswer, candidateAnswer);

  switch (provider) {
    case 'gemini': return await callGemini(prompt, apiKey, model || 'gemini-1.5-flash');
    case 'openai': return await callOpenAI(prompt, apiKey, model || 'gpt-4o-mini');
    case 'groq':   return await callGroq(prompt, apiKey, model || 'llama3-8b-8192');
    default: throw new Error(`Unknown provider: ${provider}`);
  }
}

/**
 * Test the API connection with a minimal prompt
 */
async function testConnection(settings) {
  const { provider = 'gemini', apiKey, model } = settings;
  if (!apiKey) throw new Error('No API key provided');
  const prompt = 'Reply with: {"score":10,"reasoning":"ok","strengths":"","missing":""}';
  switch (provider) {
    case 'gemini': return await callGemini(prompt, apiKey, model || 'gemini-1.5-flash');
    case 'openai': return await callOpenAI(prompt, apiKey, model || 'gpt-4o-mini');
    case 'groq':   return await callGroq(prompt, apiKey, model || 'llama3-8b-8192');
    default: throw new Error(`Unknown provider: ${provider}`);
  }
}

module.exports = { evaluateAnswer, testConnection, MODELS };
