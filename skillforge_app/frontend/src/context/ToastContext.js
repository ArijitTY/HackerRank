import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type, visible: true }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350);
    }, duration);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350);
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur || 6000),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  };

  const ICONS = {
    success: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    error: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    ),
    warning: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    info: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  };

  const COLORS = {
    success: { bg: '#052e16', border: '#16a34a', icon: '#4ade80', bar: '#16a34a' },
    error:   { bg: '#450a0a', border: '#dc2626', icon: '#f87171', bar: '#dc2626' },
    warning: { bg: '#431407', border: '#d97706', icon: '#fbbf24', bar: '#d97706' },
    info:    { bg: '#0c1445', border: '#3b82f6', icon: '#60a5fa', bar: '#3b82f6' },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 99999,
        display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 400, width: '90vw',
        pointerEvents: 'none'
      }}>
        {toasts.map(t => {
          const c = COLORS[t.type] || COLORS.info;
          return (
            <div key={t.id} style={{
              background: c.bg, border: `1px solid ${c.border}`,
              borderRadius: 12, padding: '14px 16px 14px 16px',
              boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${c.border}22`,
              display: 'flex', alignItems: 'flex-start', gap: 12,
              color: 'white', fontSize: 14, lineHeight: 1.5,
              transform: t.visible ? 'translateX(0) scale(1)' : 'translateX(120%) scale(0.9)',
              opacity: t.visible ? 1 : 0,
              transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              pointerEvents: 'all', position: 'relative', overflow: 'hidden',
            }}>
              <span style={{ color: c.icon, flexShrink: 0, marginTop: 1 }}>{ICONS[t.type]}</span>
              <span style={{ flex: 1, fontWeight: 500 }}>{t.message}</span>
              <button onClick={() => removeToast(t.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 4px',
                color: 'rgba(255,255,255,0.4)', fontSize: 16, lineHeight: 1, flexShrink: 0,
                marginTop: -1, transition: 'color 0.15s'
              }}
                onMouseEnter={e => e.target.style.color = 'white'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
              >✕</button>
              {/* Progress bar */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, height: 2, background: c.bar,
                width: '100%', transformOrigin: 'left',
                animation: t.visible ? `toastProgress ${4000}ms linear forwards` : 'none'
              }} />
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes toastProgress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
