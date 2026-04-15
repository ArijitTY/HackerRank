import React, { useState } from 'react';

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function validateEmail(email) {
  if (!email || !email.trim()) return 'Email address is required';
  if (!EMAIL_REGEX.test(email.trim())) return 'Please enter a valid email address (e.g. john@company.com)';
  return null;
}

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password)) score++;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score, label: labels[score] || 'Weak' };
}

const labelStyle = { fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' };
const iconLeft = { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: 14, pointerEvents: 'none' };
const inputBase = { width: '100%', padding: '10px 12px 10px 36px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' };

export function EmailField({ value, onChange, error, onError, placeholder = 'john@company.com', name = 'candidate-email' }) {
  const valid = value && !error && EMAIL_REGEX.test(value);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={labelStyle}>EMAIL ADDRESS <span style={{ color: '#E24B4A' }}>*</span></label>
      <div style={{ position: 'relative' }}>
        <span style={iconLeft}>✉</span>
        <input
          type="email"
          value={value ?? ''}
          name={name}
          autoComplete="off"
          onChange={e => { onChange(e.target.value); if (error) onError(null); }}
          onBlur={e => { const err = validateEmail(e.target.value); if (err) onError(err); }}
          placeholder={placeholder}
          style={{ ...inputBase, border: '1px solid ' + (error ? '#E24B4A' : 'rgba(255,255,255,0.12)') }}
        />
        {valid && (
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#1D9E75', fontSize: 16 }}>✓</span>
        )}
      </div>
      {error && <span style={{ color: '#E24B4A', fontSize: 12 }}>⚠ {error}</span>}
    </div>
  );
}

export function PasswordField({ value, onChange, error, onError, name = 'new-candidate-password' }) {
  const [show, setShow] = useState(false);
  const strength = getPasswordStrength(value || '');
  const strengthColor = strength.score <= 1 ? '#E24B4A' : strength.score <= 2 ? '#BA7517' : strength.score <= 3 ? '#378ADD' : '#1D9E75';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={labelStyle}>
        PASSWORD <span style={{ color: '#E24B4A' }}>*</span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, textTransform: 'none', letterSpacing: 'normal', marginLeft: 6, fontSize: 11 }}>
          (minimum 6 characters)
        </span>
      </label>
      <div style={{ position: 'relative' }}>
        <span style={iconLeft}>🔒</span>
        <input
          type={show ? 'text' : 'password'}
          value={value ?? ''}
          name={name}
          autoComplete="new-password"
          onChange={e => { onChange(e.target.value); if (error) onError(null); }}
          onBlur={e => {
            if (!e.target.value) onError('Password is required');
            else if (e.target.value.length < 6) onError('Password must be at least 6 characters');
            else onError(null);
          }}
          placeholder="Min. 6 characters"
          style={{ ...inputBase, padding: '10px 44px 10px 36px', border: '1px solid ' + (error ? '#E24B4A' : 'rgba(255,255,255,0.12)') }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 16, padding: 0 }}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? '🙈' : '👁'}
        </button>
      </div>
      {value && (
        <div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
            {[1, 2, 3, 4].map(level => (
              <div key={level} style={{
                flex: 1, height: 3, borderRadius: 99,
                background: level <= strength.score ? strengthColor : 'rgba(255,255,255,0.1)',
              }} />
            ))}
          </div>
          <span style={{ fontSize: 11, color: strengthColor }}>{strength.label}</span>
        </div>
      )}
      {error && <span style={{ color: '#E24B4A', fontSize: 12 }}>⚠ {error}</span>}
      {!error && !value && (
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>Use at least 6 characters with letters and numbers</span>
      )}
    </div>
  );
}
