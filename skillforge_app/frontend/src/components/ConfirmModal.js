import React from 'react';

/**
 * Reusable confirmation modal.
 *
 * Props:
 *  - open (bool)        : render if true
 *  - title (string)
 *  - message (string|node)
 *  - itemName (string)  : optional highlight box
 *  - confirmText (string): defaults "Confirm"
 *  - cancelText (string) : defaults "Cancel"
 *  - confirmColor (string): e.g. '#E24B4A'
 *  - onConfirm (fn)
 *  - onCancel (fn)
 *  - loading (bool)     : disable buttons while true
 */
export default function ConfirmModal({
  open = true,
  title = 'Are you sure?',
  message = '',
  itemName = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = '#E24B4A',
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!open) return null;

  const handleOverlay = () => { if (!loading && onCancel) onCancel(); };
  const handleCancel  = () => { if (!loading && onCancel) onCancel(); };
  const handleConfirm = () => { if (!loading && onConfirm) onConfirm(); };

  return (
    <div
      onClick={handleOverlay}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 460,
          maxHeight: '90vh',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          background: '#0d1117',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          fontFamily: 'inherit',
          color: 'rgba(255,255,255,0.9)',
        }}
      >
        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '26px 24px 22px' }}>
        {/* warning icon */}
        <div style={{
          width: 54, height: 54, borderRadius: '50%',
          background: 'rgba(226,75,74,0.12)',
          border: '1px solid rgba(226,75,74,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke="#E24B4A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>

        <h3 style={{
          margin: 0, textAlign: 'center',
          fontSize: 18, fontWeight: 700,
          color: '#fff',
        }}>
          {title}
        </h3>

        {message && (
          <p style={{
            margin: '10px 0 14px', textAlign: 'center',
            fontSize: 13.5, lineHeight: 1.6,
            color: 'rgba(255,255,255,0.6)',
          }}>
            {message}
          </p>
        )}

        {itemName && (
          <div style={{
            margin: '0 0 20px',
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
            textAlign: 'center',
            fontSize: 13,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.9)',
            wordBreak: 'break-word',
          }}>
            {itemName}
          </div>
        )}

        <div style={{
          display: 'flex', gap: 10, justifyContent: 'center',
          marginTop: itemName ? 0 : 18,
        }}>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            style={{
              padding: '10px 22px', borderRadius: 8,
              fontSize: 13, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.75)',
              fontFamily: 'inherit',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            style={{
              padding: '10px 22px', borderRadius: 8,
              fontSize: 13, fontWeight: 700,
              cursor: loading ? 'wait' : 'pointer',
              background: confirmColor,
              border: 'none',
              color: '#fff',
              fontFamily: 'inherit',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Working…' : confirmText}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
