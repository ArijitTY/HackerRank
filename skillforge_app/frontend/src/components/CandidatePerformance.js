import React, { useEffect, useState } from 'react';
import api from '../api';
import { formatDate, formatDateTime } from '../utils/dateUtils';

const CARD_BG = 'rgba(255,255,255,0.03)';
const CARD_BORDER = '1px solid rgba(255,255,255,0.08)';
const MUTED = 'rgba(255,255,255,0.55)';
const MUTED_DIM = 'rgba(255,255,255,0.4)';

const GRADE_COLORS = {
  'A+': '#a78bfa',
  'A':  '#34d399',
  'B':  '#60a5fa',
  'C':  '#facc15',
  'D':  '#fb923c',
  'F':  '#f87171',
};

const TYPE_COLORS = {
  mcq:       { bg: 'rgba(96,165,250,0.15)', fg: '#60a5fa', label: 'MCQ' },
  coding:    { bg: 'rgba(167,139,250,0.15)', fg: '#a78bfa', label: 'Coding' },
  hybrid:    { bg: 'rgba(45,212,191,0.15)',  fg: '#2dd4bf', label: 'Hybrid' },
  interview: { bg: 'rgba(251,191,36,0.15)',  fg: '#fbbf24', label: 'Interview' },
};

const STATUS_COLORS = {
  Available: { bg: 'rgba(52,211,153,0.15)', fg: '#34d399' },
  Pending:   { bg: 'rgba(250,204,21,0.15)', fg: '#facc15' },
  Expired:   { bg: 'rgba(248,113,113,0.15)', fg: '#f87171' },
  Completed: { bg: 'rgba(96,165,250,0.15)', fg: '#60a5fa' },
};

function TypeBadge({ type }) {
  const k = String(type || 'mcq').toLowerCase();
  const t = TYPE_COLORS[k] || TYPE_COLORS.mcq;
  return (
    <span style={{ background: t.bg, color: t.fg, fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: 0.3 }}>
      {t.label}
    </span>
  );
}

function GradeBadge({ grade }) {
  if (!grade) return <span style={{ color: MUTED_DIM }}>-</span>;
  const color = GRADE_COLORS[grade] || MUTED;
  return (
    <span style={{ background: color + '26', color, fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 6, minWidth: 28, display: 'inline-block', textAlign: 'center' }}>
      {grade}
    </span>
  );
}

function ResultBadge({ passed }) {
  const bg = passed ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)';
  const fg = passed ? '#34d399' : '#f87171';
  return (
    <span style={{ background: bg, color: fg, fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6 }}>
      {passed ? 'PASS' : 'FAIL'}
    </span>
  );
}

function StatusBadge({ status }) {
  const t = STATUS_COLORS[status] || { bg: 'rgba(255,255,255,0.1)', fg: MUTED };
  return (
    <span style={{ background: t.bg, color: t.fg, fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6 }}>
      {status}
    </span>
  );
}

function StatCard({ color, icon, label, value, sub }) {
  return (
    <div style={{ flex: '1 1 180px', minWidth: 180, background: CARD_BG, border: CARD_BORDER, borderRadius: 12, padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: color + '1a', color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, color: MUTED, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#f3f4f6', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: MUTED_DIM, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function formatDuration(sec) {
  if (sec == null || isNaN(sec)) return '-';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

function GradeDistribution({ dist }) {
  const order = ['A+', 'A', 'B', 'C', 'D', 'F'];
  const total = order.reduce((a, g) => a + (dist[g] || 0), 0);
  return (
    <div style={{ background: CARD_BG, border: CARD_BORDER, borderRadius: 12, padding: 16, marginTop: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#f3f4f6' }}>Grade Distribution</div>
      {total === 0 ? (
        <div style={{ color: MUTED_DIM, fontSize: 13, padding: '12px 0' }}>No grades yet</div>
      ) : (
        <>
          <div style={{ display: 'flex', height: 36, borderRadius: 8, overflow: 'hidden', background: 'rgba(255,255,255,0.04)' }}>
            {order.map(g => {
              const c = dist[g] || 0;
              if (c === 0) return null;
              const pct = (c / total) * 100;
              return (
                <div key={g} style={{ width: pct + '%', background: GRADE_COLORS[g], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0b0f1a', fontWeight: 700, fontSize: 12 }}>
                  {pct > 8 ? c : ''}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 10 }}>
            {order.map(g => (
              <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: MUTED }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: GRADE_COLORS[g], display: 'inline-block' }} />
                <span style={{ color: '#e5e7eb', fontWeight: 600 }}>{g}</span>
                <span>{dist[g] || 0}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#f3f4f6', marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function SkeletonCard() {
  return <div style={{ flex: '1 1 180px', minWidth: 180, height: 72, background: 'rgba(255,255,255,0.04)', border: CARD_BORDER, borderRadius: 12, animation: 'sfpulse 1.2s ease-in-out infinite' }} />;
}

export default function CandidatePerformance({ candidateId, apiPrefix, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    api.get(`${apiPrefix}/candidates/${candidateId}/performance`)
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.error || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [candidateId, apiPrefix]);

  const close = () => { setVisible(false); setTimeout(onClose, 300); };

  const candidate = data?.candidate;
  const stats = data?.stats;
  const results = data?.testResults || [];
  const assigned = data?.assignedTests || [];
  const recent = data?.recentActivity || [];
  const grades = data?.gradeDistribution || { 'A+':0, 'A':0, 'B':0, 'C':0, 'D':0, 'F':0 };

  const statusOnline = (candidate?.status || '').toLowerCase() === 'online';

  return (
    <>
      <style>{`
        @keyframes sfpulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes sfspin { to { transform: rotate(360deg); } }
        .sf-perf-spinner { width: 32px; height: 32px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.1); border-top-color: #a78bfa; animation: sfspin 0.8s linear infinite; }
      `}</style>
      <div
        onClick={close}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, opacity: visible ? 1 : 0, transition: 'opacity .3s' }}
      />
      <div className="modal-scroll" style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: '75vw', maxWidth: 1400,
        background: '#0b0f1a', color: '#e5e7eb',
        borderLeft: '1px solid rgba(255,255,255,0.08)', zIndex: 501,
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .3s ease', overflowY: 'auto', padding: '28px 32px',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.6)',
      }}>
        {/* Close */}
        <button
          onClick={close}
          style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label="Close"
        >×</button>

        {loading && (
          <div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', animation: 'sfpulse 1.2s ease-in-out infinite' }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 18, width: 180, background: 'rgba(255,255,255,0.05)', borderRadius: 4, marginBottom: 8, animation: 'sfpulse 1.2s ease-in-out infinite' }} />
                <div style={{ height: 12, width: 220, background: 'rgba(255,255,255,0.05)', borderRadius: 4, animation: 'sfpulse 1.2s ease-in-out infinite' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
              <div className="sf-perf-spinner" />
            </div>
          </div>
        )}

        {!loading && error && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(248,113,113,0.15)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 14 }}>!</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Failed to load performance</div>
            <div style={{ color: MUTED, fontSize: 13, marginBottom: 18 }}>{error}</div>
            <button onClick={close} style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.06)', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, cursor: 'pointer' }}>Close</button>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22, paddingRight: 40 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff' }}>
                {(candidate?.name || '?')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 22, fontWeight: 600, color: '#f3f4f6' }}>{candidate?.name || 'Unknown'}</div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: statusOnline ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.12)', color: statusOnline ? '#34d399' : '#f87171' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusOnline ? '#34d399' : '#f87171', display: 'inline-block' }} />
                    {statusOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>{candidate?.email}</div>
                <div style={{ fontSize: 12, color: MUTED_DIM, marginTop: 2 }}>
                  Created by {candidate?.createdBy || '-'} · {formatDate(candidate?.createdAt)}
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <StatCard color="#60a5fa" icon="📋" label="Tests Assigned" value={stats.totalAssigned} />
              <StatCard color="#a78bfa" icon="▶" label="Attempted" value={stats.totalAttempted} sub={`${stats.totalCompleted} completed`} />
              <StatCard color="#34d399" icon="✓" label="Pass Rate" value={`${Number(stats.passRate).toFixed(1)}%`} sub={`${stats.totalPassed}/${stats.totalCompleted}`} />
              <StatCard color="#2dd4bf" icon="∅" label="Avg Score" value={`${Number(stats.averageScore).toFixed(1)}%`} />
              <StatCard color="#fbbf24" icon="🏆" label="Best Score" value={`${Number(stats.bestScore).toFixed(1)}%`} />
              <StatCard color={stats.violations > 0 ? '#f87171' : MUTED} icon="⚠" label="Violations" value={stats.violations} />
            </div>

            {/* Grade Distribution */}
            <GradeDistribution dist={grades} />

            {/* Test History */}
            <Section title="Test History">
              {results.length === 0 ? (
                <div style={{ background: CARD_BG, border: CARD_BORDER, borderRadius: 12, padding: 24, textAlign: 'center', color: MUTED }}>No tests attempted yet</div>
              ) : (
                <div className="table-scroll-wrapper" style={{ display: 'block', width: '100%', overflowX: 'auto', background: CARD_BG, border: CARD_BORDER, borderRadius: 12 }}>
                  <table style={{ minWidth: 900, whiteSpace: 'nowrap', width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ color: MUTED, textAlign: 'left' }}>
                        <th style={{ padding: '10px 12px', fontWeight: 600 }}>Test Name</th>
                        <th style={{ padding: '10px 12px', fontWeight: 600 }}>Type</th>
                        <th style={{ padding: '10px 12px', fontWeight: 600 }}>Score</th>
                        <th style={{ padding: '10px 12px', fontWeight: 600 }}>%</th>
                        <th style={{ padding: '10px 12px', fontWeight: 600 }}>Grade</th>
                        <th style={{ padding: '10px 12px', fontWeight: 600 }}>Result</th>
                        <th style={{ padding: '10px 12px', fontWeight: 600 }}>Time</th>
                        <th style={{ padding: '10px 12px', fontWeight: 600 }}>Date</th>
                        <th style={{ padding: '10px 12px', fontWeight: 600 }}>Attempt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, i) => (
                        <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '10px 12px', color: '#e5e7eb' }}>{r.testName}</td>
                          <td style={{ padding: '10px 12px' }}><TypeBadge type={r.testType} /></td>
                          <td style={{ padding: '10px 12px', color: MUTED }}>{r.score != null ? `${r.score}${r.totalQuestions ? '/' + r.totalQuestions : ''}` : '-'}</td>
                          <td style={{ padding: '10px 12px', color: '#e5e7eb', fontWeight: 600 }}>{r.percentage != null ? `${Number(r.percentage).toFixed(1)}%` : '-'}</td>
                          <td style={{ padding: '10px 12px' }}><GradeBadge grade={r.grade} /></td>
                          <td style={{ padding: '10px 12px' }}>{r.percentage != null ? <ResultBadge passed={!!r.passed} /> : <span style={{ color: MUTED_DIM }}>-</span>}</td>
                          <td style={{ padding: '10px 12px', color: MUTED }}>{formatDuration(r.timeTaken)}</td>
                          <td style={{ padding: '10px 12px', color: MUTED }}>{formatDateTime(r.submittedAt || r.startedAt)}</td>
                          <td style={{ padding: '10px 12px', color: MUTED }}>#{r.attemptNumber || 1}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            {/* Assigned Tests */}
            <Section title="Assigned Tests">
              {assigned.length === 0 ? (
                <div style={{ background: CARD_BG, border: CARD_BORDER, borderRadius: 12, padding: 24, textAlign: 'center', color: MUTED }}>No tests assigned</div>
              ) : (
                <div style={{ background: CARD_BG, border: CARD_BORDER, borderRadius: 12, padding: 6 }}>
                  {assigned.map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderTop: i ? '1px solid rgba(255,255,255,0.05)' : 'none', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1 1 200px', minWidth: 160, color: '#e5e7eb', fontSize: 13, fontWeight: 500 }}>{a.testName}</div>
                      <TypeBadge type={a.testType} />
                      <StatusBadge status={a.status} />
                      <div style={{ fontSize: 12, color: MUTED }}>
                        Attempts: <span style={{ color: '#e5e7eb', fontWeight: 600 }}>{a.attemptCount}/{a.maxAttempts || '∞'}</span>
                      </div>
                      <div style={{ fontSize: 12, color: MUTED_DIM }}>
                        {a.availableFrom ? formatDate(a.availableFrom) : '-'} → {a.availableUntil ? formatDate(a.availableUntil) : '-'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Recent Activity */}
            <Section title="Recent Activity">
              {recent.length === 0 ? (
                <div style={{ background: CARD_BG, border: CARD_BORDER, borderRadius: 12, padding: 24, textAlign: 'center', color: MUTED }}>No recent activity</div>
              ) : (
                <div style={{ background: CARD_BG, border: CARD_BORDER, borderRadius: 12, padding: 14 }}>
                  {recent.map((r, i) => (
                    <div key={r.id || i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderTop: i ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <span style={{ width: 8, height: 8, marginTop: 6, borderRadius: '50%', background: '#a78bfa', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: '#e5e7eb' }}>{r.action}</div>
                        <div style={{ fontSize: 11, color: MUTED_DIM, marginTop: 2 }}>{formatDateTime(r.createdAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <div style={{ height: 40 }} />
          </>
        )}
      </div>
    </>
  );
}
