import React from 'react';

/**
 * Duplicate Candidate Warning Modal.
 *
 * Props:
 *  - open (bool)
 *  - title (string)               : defaults depending on errorCode
 *  - message (string)             : defaults from backend payload
 *  - existingCandidate { id, name, email, batchCode }
 *  - onGoBack (fn)                : close this modal only (keep Create modal open)
 *  - onDismiss (fn)               : close all modals
 *  - errorCode (string)           : 'DUPLICATE_CANDIDATE' | 'EMAIL_EXISTS'
 */
export default function DuplicateWarningModal({
  open = true,
  title,
  message,
  existingCandidate,
  onGoBack,
  onDismiss,
  errorCode = 'EMAIL_EXISTS',
}) {
  if (!open) return null;

  const resolvedTitle = title || (errorCode === 'DUPLICATE_CANDIDATE'
    ? 'Duplicate candidate'
    : 'Email already exists');
  const resolvedMessage = message || (errorCode === 'DUPLICATE_CANDIDATE'
    ? 'A candidate with this name, email and batch already exists.'
    : 'An account with this email already exists.');

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 2100,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480,
          maxHeight: '90vh',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          background: '#0d1117',
          border: '1px solid rgba(186,117,23,0.35)',
          borderRadius: 14,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          color: 'rgba(255,255,255,0.9)',
          fontFamily: 'inherit',
        }}
      >
        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '26px 24px 22px' }}>
        <div style={{
          width: 54, height: 54, borderRadius: '50%',
          background: 'rgba(186,117,23,0.14)',
          border: '1px solid rgba(186,117,23,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke="#F0B429" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>

        <h3 style={{ margin: 0, textAlign: 'center', fontSize: 18, fontWeight: 700, color: '#fff' }}>
          {resolvedTitle}
        </h3>
        <p style={{
          margin: '10px 0 16px', textAlign: 'center',
          fontSize: 13.5, lineHeight: 1.6,
          color: 'rgba(255,255,255,0.65)',
        }}>
          {resolvedMessage}
        </p>

        {existingCandidate && (
          <div style={{
            margin: '0 0 20px',
            padding: '12px 14px',
            background: 'rgba(186,117,23,0.08)',
            border: '1px solid rgba(186,117,23,0.3)',
            borderRadius: 8,
            fontSize: 13,
          }}>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, fontWeight: 700 }}>
              Existing candidate
            </div>
            <div style={{ color: 'rgba(255,255,255,0.92)', fontWeight: 600 }}>{existingCandidate.name || '—'}</div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace', fontSize: 12, marginTop: 2 }}>{existingCandidate.email || '—'}</div>
            {existingCandidate.batchCode && (
              <div style={{ marginTop: 6 }}>
                <span style={{
                  display: 'inline-block', padding: '2px 8px', borderRadius: 5,
                  background: 'rgba(124,58,237,0.18)', color: '#a78bfa',
                  fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
                }}>{existingCandidate.batchCode}</span>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            type="button"
            onClick={onGoBack}
            style={{
              padding: '10px 20px', borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.8)',
              fontFamily: 'inherit',
            }}
          >
            Go Back & Edit
          </button>
          <button
            type="button"
            onClick={onDismiss}
            style={{
              padding: '10px 20px', borderRadius: 8,
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: '#BA7517',
              border: 'none',
              color: '#fff',
              fontFamily: 'inherit',
            }}
          >
            OK, Understood
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
