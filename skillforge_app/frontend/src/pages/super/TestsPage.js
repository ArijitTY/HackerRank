import { useState, useEffect } from 'react';
import api from '../../api';

const TEST_CONFIG = {
  test_r1: {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>
      </svg>
    ),
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    tag: 'Java',
    badge: 'Core',
  },
  test_r2: {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    tag: 'Aptitude',
    badge: 'Reasoning',
  },
  test_r3: {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
    tag: 'Coding',
    badge: 'Advanced',
  },
  test_p1: {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    tag: 'Python',
    badge: 'Practical',
  },
  test_pqa: {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    tag: 'QA',
    badge: 'Testing',
  },
  test_pycode: {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
    tag: 'Python',
    badge: 'Coding',
  },
};

const DEFAULT_CONFIG = {
  icon: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  color: '#64748b',
  gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
  tag: 'General',
  badge: 'Test',
};

export default function TestsPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/super/tests')
      .then(r => setTests((r.data.tests || []).filter(t => !t.is_custom)))
      .catch(() => setTests([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading tests...</div>;

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tests</h1>
          <p className="page-sub">{tests.length} test{tests.length !== 1 ? 's' : ''} configured</p>
        </div>
      </div>

      <div className="tests-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {tests.map(t => {
          const cfg = TEST_CONFIG[t.id] || DEFAULT_CONFIG;
          return (
            <div key={t.id} className="test-card card-enter" style={{ borderLeft: `3px solid ${cfg.color}` }}>
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${cfg.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cfg.icon}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className="badge" style={{ background: `${cfg.color}20`, color: cfg.color, fontSize: 11 }}>{cfg.tag}</span>
                  <span className="badge badge-muted" style={{ fontSize: 11 }}>{cfg.badge}</span>
                </div>
              </div>

              <div style={{ padding: '0 20px 20px' }}>
                <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.95)' }}>{t.name}</h3>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.description}</p>

                <div style={{ display: 'flex', gap: 16, padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.9)' }}>{t.total_questions}</div>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>Questions</div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.9)' }}>{t.duration_minutes}m</div>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>Duration</div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.9)' }}>{t.passing_percentage || t.pass_percentage || 60}%</div>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>Pass</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
                  <div style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 2 }}>Attempts</div>
                    <div style={{ fontSize: 16, fontWeight: 600, fontFamily: 'monospace', color: 'rgba(255,255,255,0.85)' }}>{t.totalAttempts}</div>
                  </div>
                  <div style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 2 }}>Avg Score</div>
                    <div style={{ fontSize: 16, fontWeight: 600, fontFamily: 'monospace', color: t.avgScore >= 60 ? '#10b981' : '#ef4444' }}>{t.avgScore}%</div>
                  </div>
                  <div style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 2 }}>Pass Rate</div>
                    <div style={{ fontSize: 16, fontWeight: 600, fontFamily: 'monospace', color: 'rgba(255,255,255,0.85)' }}>{t.passRate}%</div>
                  </div>
                  <div style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 2 }}>Active</div>
                    <div style={{ fontSize: 16, fontWeight: 600, fontFamily: 'monospace', color: t.activeNow > 0 ? '#10b981' : 'rgba(255,255,255,0.85)' }}>{t.activeNow > 0 ? `${t.activeNow}` : '0'}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {tests.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 64, color: 'rgba(255,255,255,0.3)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16, opacity: 0.4 }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            <div style={{ fontSize: 15 }}>No tests configured</div>
          </div>
        )}
      </div>
    </div>
  );
}
