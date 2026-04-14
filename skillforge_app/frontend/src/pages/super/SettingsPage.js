import { useState, useEffect } from 'react';
import { formatIST, formatISTDate, nowLocalIso } from '../../utils/dateUtils';
import api from '../../api';

const PROVIDERS = [
  { id: 'gemini', label: 'Google Gemini', badge: '🆓 Free Tier Available', color: '#4285f4' },
  { id: 'openai', label: 'OpenAI', badge: 'Paid', color: '#10a37f' },
  { id: 'groq',   label: 'Groq', badge: '🆓 Free Tier Available', color: '#f55036' },
];

const SETUP_LINKS = {
  gemini: { label: 'Get free API key at Google AI Studio', url: 'https://aistudio.google.com/app/apikey' },
  openai: { label: 'Get API key at OpenAI Platform', url: 'https://platform.openai.com/api-keys' },
  groq:   { label: 'Get free API key at Groq Console', url: 'https://console.groq.com/keys' },
};

const S = {
  page: { padding: '0 0 40px' },
  header: { marginBottom: 28 },
  title: { fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.95)', marginBottom: 4 },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24, marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, display: 'block' },
  input: { width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' },
  select: { width: '100%', padding: '10px 14px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', cursor: 'pointer' },
  btn: (bg) => ({ padding: '10px 22px', background: bg || '#7c3aed', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 }),
  error: { padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', fontSize: 13, marginBottom: 14 },
  success: { padding: '10px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, color: '#34d399', fontSize: 13, marginBottom: 14 },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState({ provider: 'gemini', model: 'gemini-1.5-flash', apiKey: '' });
  const [models, setModels] = useState({});
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/super/settings').then(r => {
      setSettings({ provider: r.data.provider, model: r.data.model, apiKey: r.data.apiKey });
      setModels(r.data.models || {});
    }).finally(() => setLoading(false));
  }, []);

  const currentModels = models[settings.provider] || [];

  const save = async () => {
    setSaving(true); setMsg({ type: '', text: '' });
    try {
      await api.put('/super/settings', settings);
      setMsg({ type: 'success', text: '✅ Settings saved successfully!' });
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.error || 'Failed to save' });
    }
    setSaving(false);
  };

  const testConn = async () => {
    setTesting(true); setMsg({ type: '', text: '' });
    try {
      const r = await api.post('/super/settings/test');
      setMsg({ type: 'success', text: `✅ ${r.data.message}` });
    } catch (e) {
      setMsg({ type: 'error', text: `❌ ${e.response?.data?.error || 'Connection failed'}` });
    }
    setTesting(false);
  };

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading...</div>;

  const provider = PROVIDERS.find(p => p.id === settings.provider);
  const setupLink = SETUP_LINKS[settings.provider];

  return (
    <div className="page-enter" style={S.page}>
      <div style={S.header}>
        <h1 style={S.title}>⚙️ Settings</h1>
        <p style={S.sub}>Configure AI evaluation model for interview assessments</p>
      </div>

      {msg.text && <div style={msg.type === 'error' ? S.error : S.success}>{msg.text}</div>}

      {/* Provider Selection */}
      <div style={S.card}>
        <div style={S.sectionTitle}>🤖 AI Provider</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
          {PROVIDERS.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                const firstModel = (models[p.id] || [])[0]?.id || '';
                setSettings(s => ({ ...s, provider: p.id, model: firstModel }));
              }}
              style={{
                padding: '14px 16px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                border: `2px solid ${settings.provider === p.id ? p.color : 'rgba(255,255,255,0.08)'}`,
                background: settings.provider === p.id ? p.color + '15' : 'rgba(255,255,255,0.02)',
                transition: 'all .15s',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: settings.provider === p.id ? p.color : 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
                {p.label}
              </div>
              <div style={{ fontSize: 11, color: settings.provider === p.id ? p.color + 'cc' : 'rgba(255,255,255,0.3)' }}>
                {p.badge}
              </div>
            </button>
          ))}
        </div>

        {/* Model Selection */}
        <div style={{ marginBottom: 16 }}>
          <label style={S.label}>Model</label>
          <select
            style={S.select}
            value={settings.model}
            onChange={e => setSettings(s => ({ ...s, model: e.target.value }))}
          >
            {currentModels.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* API Key */}
        <div style={{ marginBottom: 16 }}>
          <label style={S.label}>
            API Key
            {setupLink && (
              <a href={setupLink.url} target="_blank" rel="noreferrer"
                style={{ marginLeft: 10, color: provider?.color || '#818cf8', fontSize: 11, fontWeight: 400, textDecoration: 'none' }}>
                ↗ {setupLink.label}
              </a>
            )}
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type={showKey ? 'text' : 'password'}
              style={S.input}
              placeholder={`Paste your ${provider?.label} API key here...`}
              value={settings.apiKey}
              onChange={e => setSettings(s => ({ ...s, apiKey: e.target.value }))}
            />
            <button type="button" onClick={() => setShowKey(v => !v)}
              style={{ ...S.btn('rgba(255,255,255,0.06)'), color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', minWidth: 60 }}>
              {showKey ? '🙈 Hide' : '👁 Show'}
            </button>
          </div>
        </div>

        {/* Gemini free tier note */}
        {settings.provider === 'gemini' && (
          <div style={{ background: 'rgba(66,133,244,0.08)', border: '1px solid rgba(66,133,244,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#93c5fd', marginBottom: 16 }}>
            💡 <strong>Gemini 1.5 Flash is completely free</strong> — 15 requests/min, 1M tokens/day.
            Just sign in at <strong>aistudio.google.com</strong>, click "Get API key", and paste it here. No credit card needed.
          </div>
        )}
        {settings.provider === 'groq' && (
          <div style={{ background: 'rgba(245,80,54,0.08)', border: '1px solid rgba(245,80,54,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#fca5a5', marginBottom: 16 }}>
            💡 <strong>Groq is free</strong> with generous rate limits. Sign up at <strong>console.groq.com</strong> → API Keys → Create.
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={save} disabled={saving} style={S.btn()}>
            {saving ? '⏳ Saving...' : '💾 Save Settings'}
          </button>
          <button onClick={testConn} disabled={testing} style={S.btn('rgba(16,185,129,0.15)')}>
            {testing ? '⏳ Testing...' : '🔌 Test Connection'}
          </button>
        </div>
      </div>

      {/* Database Backup */}
      <div style={S.card}>
        <div style={S.sectionTitle}>🗄️ Database Backup</div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 16, lineHeight: 1.6 }}>
          Download a complete backup of the SQLite database. Store it safely to restore data if needed.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => {
            const token = localStorage.getItem('sf_token');
            fetch('/api/super/backup', { headers: { Authorization: `Bearer ${token}` } })
              .then(r => r.blob()).then(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `skillforge_backup_${nowLocalIso().split('T')[0]}.db`;
                document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
              }).catch(() => alert('Backup failed'));
          }} style={S.btn('rgba(255,255,255,0.06)')}>
            💾 Download DB Backup
          </button>
        </div>
      </div>

      {/* Info card */}
      <div style={S.card}>
        <div style={S.sectionTitle}>ℹ️ How AI Evaluation Works</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
          <p>When Harsha sir submits an interview for evaluation:</p>
          <ol style={{ paddingLeft: 18, margin: '8px 0' }}>
            <li>Each candidate answer is sent to the selected AI model along with the question and model answer.</li>
            <li>The AI returns a <strong style={{ color: 'rgba(255,255,255,0.7)' }}>score out of 10</strong>, reasoning, strengths, and what was missing.</li>
            <li>Harsha sir can then <strong style={{ color: 'rgba(255,255,255,0.7)' }}>review each answer</strong> and override any AI score.</li>
            <li>Once satisfied, he clicks <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Approve</strong> to finalise the candidate's result.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
