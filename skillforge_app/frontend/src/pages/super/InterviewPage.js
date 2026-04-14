import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../api';

// ─── Styles ────────────────────────────────────────────────────────────────
const S = {
  page: { padding: '0 0 60px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.95)' },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 },
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20, marginBottom: 16 },
  btn: (bg, fg) => ({ padding: '9px 20px', background: bg || '#7c3aed', color: fg || 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 }),
  input: { width: '100%', padding: '9px 13px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '9px 13px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white', fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box', minHeight: 80, lineHeight: 1.6 },
  label: { fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 },
  error: { padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', fontSize: 13, marginBottom: 14 },
  success: { padding: '10px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, color: '#34d399', fontSize: 13, marginBottom: 14 },
  badge: (color) => ({ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: color + '20', color, border: `1px solid ${color}44` }),
  tab: (active) => ({ padding: '8px 20px', background: 'none', border: 'none', borderBottom: `2px solid ${active ? '#7c3aed' : 'transparent'}`, color: active ? '#a78bfa' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 400, fontFamily: 'inherit', marginBottom: -1 }),
};

const STATUS_COLOR = { submitted: '#f59e0b', evaluated: '#3b82f6', reviewed: '#10b981', in_progress: '#6366f1' };
const STATUS_LABEL = { submitted: 'Pending Review', evaluated: 'AI Evaluated', reviewed: '✅ Approved', in_progress: 'In Progress' };
const QTYPE_COLOR = { short: '#10b981', medium: '#f59e0b', long: '#8b5cf6' };

// ─── Load PDF.js from CDN ──────────────────────────────────────────────────
function usePdfJs() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (window.pdfjsLib) { setReady(true); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setReady(true);
    };
    document.head.appendChild(script);
  }, []);
  return ready;
}

async function extractTextFromPDF(file) {
  const pdfjsLib = window.pdfjsLib;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }
  return fullText;
}

// ─── Question Editor Row ───────────────────────────────────────────────────
function QuestionRow({ q, idx, onChange, onRemove }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 14, marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa' }}>Q{idx + 1}</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={q.questionType || 'short'} onChange={e => onChange(idx, 'questionType', e.target.value)}
            style={{ padding: '4px 10px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'white', fontSize: 12, fontFamily: 'inherit' }}>
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
          <select value={q.maxScore || 10} onChange={e => onChange(idx, 'maxScore', parseInt(e.target.value))}
            style={{ padding: '4px 10px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'white', fontSize: 12, fontFamily: 'inherit', width: 70 }}>
            {[5, 10, 15, 20].map(v => <option key={v} value={v}>{v} pts</option>)}
          </select>
          <button onClick={() => onRemove(idx)}
            style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 6, color: '#f87171', fontSize: 18, cursor: 'pointer', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>×</button>
        </div>
      </div>
      <label style={S.label}>Question</label>
      <textarea style={{ ...S.textarea, minHeight: 56 }} value={q.questionText}
        onChange={e => onChange(idx, 'questionText', e.target.value)} placeholder="Enter question..." />
      <label style={{ ...S.label, marginTop: 8 }}>Model Answer</label>
      <textarea style={{ ...S.textarea, minHeight: 80 }} value={q.modelAnswer}
        onChange={e => onChange(idx, 'modelAnswer', e.target.value)} placeholder="Enter expected/model answer..." />
    </div>
  );
}

// ─── Create / Edit Test Modal ──────────────────────────────────────────────
function TestModal({ onClose, onSaved, editTest }) {
  const pdfReady = usePdfJs();
  const fileRef = useRef();
  const [step, setStep] = useState(editTest ? 'questions' : 'upload'); // upload | parsing | questions | confirm
  const [name, setName] = useState(editTest?.name || '');
  const [description, setDescription] = useState(editTest?.description || '');
  const [questions, setQuestions] = useState(editTest?.questions || []);
  const [extractedText, setExtractedText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pdfName, setPdfName] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!pdfReady) return setError('PDF.js still loading, try again in a second');
    setPdfName(file.name);
    setExtracting(true); setError('');
    try {
      const text = await extractTextFromPDF(file);
      setExtractedText(text);
      setExtracting(false);
      setParsing(true); setStep('parsing');
      const res = await api.post('/super/interview-tests/parse', { text });
      setQuestions(res.data.questions.map(q => ({ ...q, maxScore: q.maxScore || 10 })));
      setParsing(false);
      setStep('questions');
      if (res.data.questions.length === 0) setError('Could not auto-detect Q&A from this PDF. You can add questions manually below.');
    } catch (err) {
      setExtracting(false); setParsing(false);
      setError(err.response?.data?.error || err.message);
      setStep('upload');
    }
  };

  const addQuestion = () => {
    setQuestions(qs => [...qs, { questionNum: qs.length + 1, questionText: '', modelAnswer: '', questionType: 'short', maxScore: 10 }]);
  };

  const changeQ = (idx, field, val) => {
    setQuestions(qs => qs.map((q, i) => i === idx ? { ...q, [field]: val } : q));
  };

  const removeQ = (idx) => setQuestions(qs => qs.filter((_, i) => i !== idx));

  const save = async () => {
    if (!name.trim()) return setError('Test name is required');
    const valid = questions.filter(q => q.questionText?.trim() && q.modelAnswer?.trim());
    if (valid.length === 0) return setError('Add at least one complete question with a model answer');
    setSaving(true); setError('');
    try {
      if (editTest) {
        await api.put(`/super/interview-tests/${editTest.id}`, { name, description, questions: valid });
      } else {
        await api.post('/super/interview-tests', { name, description, extractedText, questions: valid });
      }
      onSaved();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to save');
      setSaving(false);
    }
  };

  const totalScore = questions.reduce((s, q) => s + (q.maxScore || 10), 0);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '24px 16px' }}>
      <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, width: '100%', maxWidth: 760, padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ color: 'white', fontSize: 18, margin: 0 }}>{editTest ? '✏️ Edit Interview Test' : '📄 Create Interview Test'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>

        {error && <div style={S.error}>{error}</div>}

        {/* Name & Description */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div>
            <label style={S.label}>Test Name *</label>
            <input style={S.input} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Python Developer Interview Round 1" />
          </div>
          <div>
            <label style={S.label}>Description</label>
            <input style={S.input} value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." />
          </div>
        </div>

        {/* PDF Upload (only for new tests) */}
        {!editTest && step === 'upload' && (
          <div style={{ border: '2px dashed rgba(124,58,237,0.4)', borderRadius: 10, padding: 28, textAlign: 'center', marginBottom: 20, cursor: 'pointer', background: 'rgba(124,58,237,0.04)' }}
            onClick={() => fileRef.current?.click()}>
            <input type="file" accept=".pdf" ref={fileRef} style={{ display: 'none' }} onChange={handleFile} />
            <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
              {pdfReady ? 'Click to upload PDF' : '⏳ Loading PDF reader...'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Questions & answers will be auto-extracted</div>
            <div style={{ marginTop: 10, color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>Or add questions manually below ↓</div>
          </div>
        )}
        {!editTest && (step === 'parsing' || extracting || parsing) && (
          <div style={{ textAlign: 'center', padding: 24, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
            <div>{extracting ? 'Reading PDF...' : parsing ? 'Parsing questions & answers with AI...' : 'Processing...'}</div>
            {pdfName && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{pdfName}</div>}
          </div>
        )}
        {!editTest && step === 'questions' && pdfName && (
          <div style={{ ...S.success, marginBottom: 16 }}>
            ✅ Extracted {questions.length} question{questions.length !== 1 ? 's' : ''} from <strong>{pdfName}</strong> — review and edit below.
          </div>
        )}

        {/* Questions list */}
        {(step === 'questions' || editTest) && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>
                {questions.length} question{questions.length !== 1 ? 's' : ''} &nbsp;·&nbsp; Total: {totalScore} pts
              </span>
              <button onClick={addQuestion} style={S.btn('rgba(124,58,237,0.2)', '#a78bfa')}>+ Add Question</button>
            </div>
            <div style={{ maxHeight: 400, overflowY: 'auto', paddingRight: 4 }}>
              {questions.map((q, i) => <QuestionRow key={i} q={q} idx={i} onChange={changeQ} onRemove={removeQ} />)}
              {questions.length === 0 && (
                <div style={{ textAlign: 'center', padding: 24, color: 'rgba(255,255,255,0.2)' }}>
                  No questions yet. Upload a PDF or click "+ Add Question".
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer actions */}
        {!editTest && step === 'upload' && (
          <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>Don't have a PDF? Add questions manually:</div>
            <button onClick={() => { setStep('questions'); addQuestion(); }} style={S.btn('rgba(255,255,255,0.06)', 'rgba(255,255,255,0.6)')}>
              + Add Questions Manually
            </button>
          </div>
        )}

        {(step === 'questions' || editTest) && (
          <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={S.btn('rgba(255,255,255,0.05)', 'rgba(255,255,255,0.5)')}>Cancel</button>
            <button onClick={save} disabled={saving} style={S.btn()}>
              {saving ? '⏳ Saving...' : '💾 Save Interview Test'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Assign Modal ──────────────────────────────────────────────────────────
function AssignModal({ test, onClose }) {
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/super/candidates').then(r => setCandidates(r.data.candidates || []));
  }, []);

  const toggle = (id) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const assign = async () => {
    if (selected.size === 0) return setMsg('Select at least one candidate');
    setAssigning(true);
    try {
      const r = await api.post(`/super/interview-tests/${test.id}/assign`, { candidateIds: [...selected] });
      setMsg(`✅ Assigned to ${r.data.assigned} candidate(s)`);
      setTimeout(onClose, 1500);
    } catch (e) {
      setMsg(e.response?.data?.error || 'Failed to assign');
    }
    setAssigning(false);
  };

  const filtered = candidates.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, width: '100%', maxWidth: 520, padding: 26 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ color: 'white', margin: 0 }}>Assign: {test.name}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>
        {msg && <div style={msg.startsWith('✅') ? S.success : S.error}>{msg}</div>}
        <input style={{ ...S.input, marginBottom: 12 }} placeholder="Search candidates..." value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ maxHeight: 280, overflowY: 'auto', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 14 }}>
          {filtered.map(c => (
            <div key={c.id} onClick={() => toggle(c.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)', background: selected.has(c.id) ? 'rgba(124,58,237,0.1)' : 'transparent' }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${selected.has(c.id) ? '#7c3aed' : 'rgba(255,255,255,0.2)'}`, background: selected.has(c.id) ? '#7c3aed' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {selected.has(c.id) && <span style={{ color: 'white', fontSize: 12 }}>✓</span>}
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{c.email}</div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No candidates found</div>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{selected.size} selected</span>
          <button onClick={assign} disabled={assigning} style={S.btn()}>
            {assigning ? '⏳ Assigning...' : `✔ Assign to ${selected.size} Candidate${selected.size !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Review Session Modal ─────────────────────────────────────────────────
function ReviewModal({ sessionId, onClose, onApproved }) {
  const [data, setData] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [overrides, setOverrides] = useState({});
  const [notes, setNotes] = useState({});
  const [saving, setSaving] = useState({});
  const [adminNotes, setAdminNotes] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  const load = useCallback(() => {
    api.get(`/super/interview-results/${sessionId}`).then(r => {
      setData(r.data);
      const ov = {}, nt = {};
      r.data.answers.forEach(a => {
        ov[a.id] = a.admin_score ?? a.ai_score ?? '';
        nt[a.id] = a.admin_notes || '';
      });
      setOverrides(ov); setNotes(nt);
      setAdminNotes(r.data.session.admin_notes || '');
    });
  }, [sessionId]);

  useEffect(() => { load(); }, [load]);

  const runEvaluation = async () => {
    setEvaluating(true); setMsg({ type: '', text: '' });
    try {
      const r = await api.post(`/super/interview-results/${sessionId}/evaluate`);
      setMsg({ type: 'success', text: `✅ AI evaluated ${r.data.evaluated}/${r.data.total} answers` });
      load();
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.error || 'Evaluation failed' });
    }
    setEvaluating(false);
  };

  const saveOverride = async (answerId) => {
    setSaving(s => ({ ...s, [answerId]: true }));
    try {
      await api.put(`/super/interview-results/${sessionId}/answers/${answerId}`, {
        adminScore: parseInt(overrides[answerId]) || 0,
        adminNotes: notes[answerId] || ''
      });
      setSaving(s => ({ ...s, [answerId]: false }));
      load();
    } catch (e) {
      setSaving(s => ({ ...s, [answerId]: false }));
    }
  };

  const approve = async () => {
    setApproving(true);
    try {
      await api.post(`/super/interview-results/${sessionId}/approve`, { adminNotes });
      onApproved();
    } catch (e) {
      setMsg({ type: 'error', text: 'Failed to approve' });
      setApproving(false);
    }
  };

  if (!data) return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'rgba(255,255,255,0.4)' }}>Loading...</div>
    </div>
  );

  const { session, answers } = data;
  const totalMax = answers.reduce((s, a) => s + a.max_score, 0);
  const totalEarned = answers.reduce((s, a) => s + (a.final_score ?? a.ai_score ?? 0), 0);
  const pct = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0;
  const hasAiScores = answers.some(a => a.ai_score !== null);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '20px 16px' }}>
      <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, width: '100%', maxWidth: 860, padding: 28, marginBottom: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ color: 'white', margin: '0 0 4px', fontSize: 18 }}>📋 {session.test_name}</h2>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              {session.candidate_name} ({session.candidate_email}) &nbsp;·&nbsp; {new Date(session.started_at).toLocaleDateString()}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 24, cursor: 'pointer' }}>×</button>
        </div>

        {msg.text && <div style={msg.type === 'error' ? S.error : S.success}>{msg.text}</div>}

        {/* Score summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Status', value: STATUS_LABEL[session.status] || session.status, color: STATUS_COLOR[session.status] || '#64748b' },
            { label: 'Questions', value: answers.length },
            { label: 'AI Score', value: hasAiScores ? `${totalEarned}/${totalMax}` : '—' },
            { label: 'Percentage', value: hasAiScores ? `${pct}%` : '—', color: pct >= 60 ? '#10b981' : pct > 0 ? '#f59e0b' : '#64748b' },
          ].map((stat, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: stat.color || 'rgba(255,255,255,0.85)', fontFamily: 'monospace' }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 3, textTransform: 'uppercase' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* AI Evaluate button */}
        {session.status === 'submitted' && (
          <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '14px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#93c5fd', marginBottom: 2 }}>🤖 Run AI Evaluation</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Score all answers automatically using your configured AI model</div>
            </div>
            <button onClick={runEvaluation} disabled={evaluating} style={S.btn('#3b82f6')}>
              {evaluating ? '⏳ Evaluating...' : '▶ Evaluate All'}
            </button>
          </div>
        )}

        {/* Answers */}
        {answers.map((a, i) => (
          <div key={a.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', marginRight: 8 }}>Q{a.question_num}</span>
                <span style={S.badge(QTYPE_COLOR[a.question_type] || '#64748b')}>{a.question_type}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginLeft: 8 }}>Max: {a.max_score} pts</span>
              </div>
              {a.ai_score !== null && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: a.ai_score >= 7 ? '#10b981' : a.ai_score >= 4 ? '#f59e0b' : '#ef4444', fontFamily: 'monospace' }}>
                    {a.final_score ?? a.ai_score}/{a.max_score}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{a.admin_score !== null ? 'Overridden' : 'AI Score'}</div>
                </div>
              )}
            </div>

            {/* Question */}
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>{a.question_text}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              {/* Candidate Answer */}
              <div>
                <div style={{ fontSize: 11, color: '#60a5fa', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>Candidate's Answer</div>
                <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 6, padding: '8px 12px', fontSize: 13, color: 'rgba(255,255,255,0.7)', minHeight: 60, lineHeight: 1.6 }}>
                  {a.answer_text || <em style={{ color: 'rgba(255,255,255,0.2)' }}>No answer provided</em>}
                </div>
              </div>
              {/* Model Answer */}
              <div>
                <div style={{ fontSize: 11, color: '#34d399', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>Model Answer</div>
                <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 6, padding: '8px 12px', fontSize: 13, color: 'rgba(255,255,255,0.7)', minHeight: 60, lineHeight: 1.6 }}>
                  {a.model_answer}
                </div>
              </div>
            </div>

            {/* AI Feedback */}
            {a.ai_reasoning && (
              <div style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: 8, padding: '10px 14px', marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>🤖 AI Reasoning</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: 6 }}>{a.ai_reasoning}</div>
                {a.ai_strengths && <div style={{ fontSize: 12, color: '#34d399', marginBottom: 2 }}>✅ {a.ai_strengths}</div>}
                {a.ai_missing && <div style={{ fontSize: 12, color: '#f87171' }}>❌ {a.ai_missing}</div>}
              </div>
            )}

            {/* Admin Override */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ ...S.label, marginBottom: 4 }}>Admin Notes / Override</label>
                <input style={{ ...S.input, fontSize: 12 }} placeholder="Add notes or corrections..." value={notes[a.id] || ''}
                  onChange={e => setNotes(n => ({ ...n, [a.id]: e.target.value }))} />
              </div>
              <div>
                <label style={{ ...S.label, marginBottom: 4 }}>Override Score (0-{a.max_score})</label>
                <input type="number" min={0} max={a.max_score} style={{ ...S.input, width: 80 }}
                  value={overrides[a.id] ?? ''} onChange={e => setOverrides(o => ({ ...o, [a.id]: e.target.value }))} />
              </div>
              <button onClick={() => saveOverride(a.id)} disabled={saving[a.id]}
                style={{ ...S.btn('rgba(255,255,255,0.06)', 'rgba(255,255,255,0.6)'), marginBottom: 1 }}>
                {saving[a.id] ? '⏳' : '💾'}
              </button>
            </div>
          </div>
        ))}

        {/* Approve */}
        {session.status !== 'reviewed' && hasAiScores && (
          <div style={{ marginTop: 20, padding: '16px 20px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10 }}>
            <label style={{ ...S.label, color: '#34d399', marginBottom: 6 }}>Final Notes (optional)</label>
            <textarea style={{ ...S.textarea, minHeight: 56, marginBottom: 12 }} value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Overall feedback for this candidate..." />
            <button onClick={approve} disabled={approving} style={S.btn('#10b981')}>
              {approving ? '⏳ Approving...' : '✅ Approve & Finalise Result'}
            </button>
          </div>
        )}
        {session.status === 'reviewed' && (
          <div style={S.success}>✅ This interview has been reviewed and approved.</div>
        )}
      </div>
    </div>
  );
}

// ─── Main InterviewPage ────────────────────────────────────────────────────
export default function InterviewPage() {
  const [tab, setTab] = useState('tests');
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editTest, setEditTest] = useState(null);
  const [assignTest, setAssignTest] = useState(null);
  const [reviewSession, setReviewSession] = useState(null);

  const loadTests = useCallback(() => {
    api.get('/super/interview-tests').then(r => setTests(r.data.tests || [])).finally(() => setLoading(false));
  }, []);

  const loadResults = useCallback(() => {
    api.get('/super/interview-results').then(r => setResults(r.data.sessions || []));
  }, []);

  useEffect(() => { loadTests(); loadResults(); }, [loadTests, loadResults]);

  const openEdit = async (test) => {
    const r = await api.get(`/super/interview-tests/${test.id}`);
    setEditTest(r.data);
  };

  const deleteTest = async (id, name) => {
    if (!window.confirm(`Deactivate interview test "${name}"?`)) return;
    await api.delete(`/super/interview-tests/${id}`);
    loadTests();
  };

  return (
    <div className="page-enter" style={S.page}>
      {showCreate && <TestModal onClose={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); loadTests(); }} />}
      {editTest && <TestModal editTest={editTest} onClose={() => setEditTest(null)} onSaved={() => { setEditTest(null); loadTests(); }} />}
      {assignTest && <AssignModal test={assignTest} onClose={() => setAssignTest(null)} />}
      {reviewSession && <ReviewModal sessionId={reviewSession} onClose={() => setReviewSession(null)} onApproved={() => { setReviewSession(null); loadResults(); }} />}

      <div style={S.header}>
        <div>
          <h1 style={S.title}>🎙️ Interview Tests</h1>
          <p style={S.sub}>Upload PDF Q&A banks, assign to candidates, review AI-evaluated results</p>
        </div>
        {tab === 'tests' && <button style={S.btn()} onClick={() => setShowCreate(true)}>+ Create Interview Test</button>}
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 24, display: 'flex' }}>
        <button style={S.tab(tab === 'tests')} onClick={() => setTab('tests')}>📋 Tests ({tests.length})</button>
        <button style={S.tab(tab === 'results')} onClick={() => { setTab('results'); loadResults(); }}>
          📊 Results ({results.length})
          {results.filter(r => r.status === 'submitted').length > 0 && (
            <span style={{ marginLeft: 6, background: '#f59e0b', color: '#000', borderRadius: 10, fontSize: 10, padding: '1px 6px', fontWeight: 700 }}>
              {results.filter(r => r.status === 'submitted').length} pending
            </span>
          )}
        </button>
      </div>

      {/* Tests Tab */}
      {tab === 'tests' && (
        loading ? <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)' }}>Loading...</div>
        : tests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎙️</div>
            <p>No interview tests yet. Click "+ Create Interview Test" to upload a PDF.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 16 }}>
            {tests.map(t => (
              <div key={t.id} style={S.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: 3 }}>{t.name}</div>
                    {t.description && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{t.description}</div>}
                  </div>
                  <button onClick={() => deleteTest(t.id, t.name)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 12, cursor: 'pointer', opacity: 0.6 }}>Deactivate</button>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                  <span style={S.badge('#a78bfa')}>{t.question_count} Questions</span>
                  <span style={S.badge('#3b82f6')}>{t.session_count} Sessions</span>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginBottom: 14 }}>
                  Created {new Date(t.created_at).toLocaleDateString()}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openEdit(t)} style={S.btn('rgba(255,255,255,0.05)', 'rgba(255,255,255,0.6)')}>✏️ Edit</button>
                  <button onClick={() => setAssignTest(t)} style={S.btn('#7c3aed')}>👥 Assign</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Results Tab */}
      {tab === 'results' && (
        results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
            <p>No interview submissions yet.</p>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
              <button style={S.btn('rgba(255,255,255,0.06)', 'rgba(255,255,255,0.7)')} onClick={() => {
                const token = localStorage.getItem('sf_token');
                fetch('/api/super/interview-results/export', { headers: { Authorization: `Bearer ${token}` } })
                  .then(r => r.blob()).then(blob => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = `interview_results_${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
                  });
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export CSV
              </button>
            </div>
            {results.map(s => {
              const earned = s.earned_score || 0;
              const max = s.max_score || 0;
              const pct = max > 0 ? Math.round((earned / max) * 100) : 0;
              return (
                <div key={s.id} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
                  onClick={() => setReviewSession(s.id)}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {s.candidate_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{s.candidate_name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{s.candidate_email} &nbsp;·&nbsp; {s.test_name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>{new Date(s.started_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {s.status !== 'in_progress' && <div style={{ fontSize: 15, fontWeight: 700, color: pct >= 60 ? '#10b981' : '#f59e0b', fontFamily: 'monospace', marginBottom: 2 }}>{earned}/{max} pts</div>}
                    <span style={S.badge(STATUS_COLOR[s.status] || '#64748b')}>{STATUS_LABEL[s.status] || s.status}</span>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.2)' }}>›</div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
