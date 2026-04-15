import React, { useEffect, useState } from 'react';
import api from '../api';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import OnlineStatusBadge from './OnlineStatusBadge';

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

function DashStat({ value, label, color, bg, border, labelColor }) {
  return (
    <div style={{ background: bg, borderRadius: 12, padding: '1rem', textAlign: 'center', border: '1px solid ' + border }}>
      <div style={{ fontSize: 28, fontWeight: 600, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 6 }}>{label}</div>
    </div>
  );
}

function MiniStat({ value, label, color, emphasize }) {
  return (
    <div style={{ background: emphasize ? 'rgba(226,75,74,0.08)' : 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 12, textAlign: 'center', border: '1px solid ' + (emphasize ? 'rgba(226,75,74,0.2)' : 'rgba(255,255,255,0.06)') }}>
      <div style={{ fontSize: 22, fontWeight: 600, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function GradeBar({ dist }) {
  const order = ['A+','A','B','C','D','F'];
  const colors = { 'A+':'#534AB7', 'A':'#1D9E75', 'B':'#185FA5', 'C':'#BA7517', 'D':'#854F0B', 'F':'#A32D2D' };
  const total = order.reduce((a, g) => a + (dist[g] || 0), 0);
  if (total === 0) {
    return (
      <div style={{ display: 'flex', height: 28, borderRadius: 8, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
        No attempts yet
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', height: 28, borderRadius: 8, overflow: 'hidden', gap: 2 }}>
      {order.map(g => {
        const count = dist[g] || 0;
        if (count === 0) return null;
        const pct = (count / total) * 100;
        return (
          <div key={g} title={`${g}: ${count}`} style={{ width: pct + '%', background: colors[g], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', minWidth: 28, transition: 'width 0.3s ease' }}>
            {g}
          </div>
        );
      })}
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

  const candidateStatus = (candidate?.status || 'offline').toLowerCase();
  const candidateLastSeenRelative = candidate?.lastSeenRelative || null;

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
        position: 'fixed', top: 0, right: 0, height: '100vh', width: 480,
        background: '#0b0f1a', color: '#e5e7eb',
        borderLeft: '1px solid rgba(255,255,255,0.08)', zIndex: 501,
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .3s ease', overflowY: 'auto', padding: 0,
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
            {/* PROFILE HEADER */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#534AB7,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                {(candidate?.name || '?')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 500, margin: '0 0 4px' }}>{candidate?.name || 'Unknown'}</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '0 0 6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{candidate?.email}</p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  {candidate?.batchCode && (
                    <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa' }}>
                      {candidate.batchCode}
                    </span>
                  )}
                  <OnlineStatusBadge status={candidateStatus} lastSeenRelative={candidateLastSeenRelative} size="sm" />
                </div>
              </div>
            </div>

            {/* STATS CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <DashStat value={stats.totalAssigned || 0} label="Total" color="#8B5CF6" bg="rgba(255,255,255,0.05)" border="rgba(255,255,255,0.08)" labelColor="rgba(255,255,255,0.4)" />
              <DashStat value={stats.available || 0} label="Available" color="#1D9E75" bg="rgba(29,158,117,0.08)" border="rgba(29,158,117,0.15)" labelColor="rgba(29,158,117,0.5)" />
              <DashStat value={stats.inProgress || 0} label="In Progress" color="#BA7517" bg="rgba(186,117,23,0.08)" border="rgba(186,117,23,0.15)" labelColor="rgba(186,117,23,0.5)" />
              <DashStat value={stats.totalCompleted || 0} label="Completed" color="#378ADD" bg="rgba(24,95,165,0.08)" border="rgba(24,95,165,0.15)" labelColor="rgba(55,138,221,0.5)" />
            </div>

            {/* PERFORMANCE STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <MiniStat value={`${Math.round(Number(stats.passRate) || 0)}%`} label="Pass Rate" color={(stats.passRate || 0) >= 60 ? '#1D9E75' : '#E24B4A'} />
              <MiniStat value={`${Math.round(Number(stats.averageScore) || 0)}%`} label="Avg Score" color="#a78bfa" />
              <MiniStat value={stats.violations || 0} label="Violations" color={stats.violations > 0 ? '#E24B4A' : '#1D9E75'} emphasize={stats.violations > 0} />
            </div>

            {/* GRADE DISTRIBUTION */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Grade Distribution</div>
              <GradeBar dist={grades} />
              <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                {['A+','A','B','C','D','F'].map(g => (
                  <span key={g} style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{g}: {grades[g] || 0}</span>
                ))}
              </div>
            </div>

            {/* TEST HISTORY */}
            <div style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Test History</div>
              {results.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No tests attempted yet</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {results.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#fff', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.testName}</div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>{formatDateTime(r.submittedAt || r.startedAt)}</div>
                      </div>
                      <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{r.score != null ? `${r.score}${r.totalQuestions ? '/' + r.totalQuestions : ''}` : '-'}</div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{r.percentage != null ? `${Math.round(Number(r.percentage))}%` : '-'}</div>
                      </div>
                      <GradeBadge grade={r.grade} />
                      {r.percentage != null && (
                        <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 500, flexShrink: 0,
                          background: r.passed ? 'rgba(29,158,117,0.15)' : 'rgba(226,75,74,0.15)',
                          color: r.passed ? '#1D9E75' : '#E24B4A',
                          border: '1px solid ' + (r.passed ? 'rgba(29,158,117,0.3)' : 'rgba(226,75,74,0.3)') }}>
                          {r.passed ? 'Pass' : 'Fail'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ height: 40 }} />
          </>
        )}
      </div>
    </>
  );
}
