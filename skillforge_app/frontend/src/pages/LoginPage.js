import { useState } from 'react';
import { login } from '../api';

function getLoginError(code, defaultMsg) {
  switch (code) {
    case 'EMAIL_NOT_FOUND':  return 'No account found with this email address';
    case 'INVALID_PASSWORD': return 'Incorrect password. Please try again';
    case 'ACCOUNT_INACTIVE': return 'Your account has been deactivated. Contact your administrator';
    case 'RATE_LIMITED':     return 'Too many login attempts. Please wait 15 minutes';
    case 'MISSING_CREDENTIALS': return 'Email and password required';
    default: return defaultMsg || 'Login failed. Please try again.';
  }
}

export default function LoginPage({ onLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setErrorCode('');
    setLoading(true);
    try {
      const { data } = await login(email, password);
      onLogin(data.user, data.token);
    } catch (err) {
      const payload = err.response?.data || {};
      const code = payload.error || '';
      const msg  = payload.message || getLoginError(code, 'Login failed. Please try again.');
      setErrorCode(code);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isInactive = errorCode === 'ACCOUNT_INACTIVE';
  const emailInvalid = errorCode === 'EMAIL_NOT_FOUND';
  const pwdInvalid   = errorCode === 'INVALID_PASSWORD';

  const clearErr = () => { if (errorCode || error) { setError(''); setErrorCode(''); } };

  return (
    <div className="login-page">
      {/* ── LEFT PANEL ── */}
      <div className="login-left">
        {/* Animated background orbs */}
        <div className="lp-orb lp-orb-1" />
        <div className="lp-orb lp-orb-2" />
        <div className="lp-orb lp-orb-3" />
        <div className="lp-grid" />

        {/* Brand */}
        <div className="login-brand">
          <div className="login-brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div>
            <div className="login-brand-name">SkillForge</div>
            <div className="login-brand-sub">Assessment Platform</div>
          </div>
        </div>

        {/* Hero */}
        <div className="login-hero">
          <div className="lp-badge">✦ v2.0 — Now Live</div>
          <h2>Assess Smarter.<br /><span className="lp-hero-accent">Hire Better.</span></h2>
          <p>A modern platform for creating, managing and evaluating technical assessments — with precision and confidence.</p>
        </div>

        {/* Feature list */}
        <div className="login-features">
          {[
            {
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              ),
              text: 'Secure proctored testing environment',
            },
            {
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              ),
              text: 'Real-time monitoring and analytics',
            },
            {
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              ),
              text: 'AI-powered interview evaluation',
            },
          ].map(({ icon, text }, i) => (
            <div className="login-feature-item" key={i} style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
              <span className="lp-feature-icon">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="login-right">
        {/* Subtle right-side bg glow */}
        <div className="lp-right-glow" />

        <div className="login-card">
          {/* Top decoration line */}
          <div className="lp-card-top-bar" />

          <div className="lp-card-header">
            <div className="lp-avatar-ring">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div>
              <h2>Welcome back</h2>
              <p className="login-subtitle">Sign in to your workspace</p>
            </div>
          </div>

          {error && (
            <div
              className="login-error"
              style={isInactive ? {
                background: 'rgba(186,117,23,0.1)',
                border: '1px solid #BA7517',
                color: '#F0B429',
              } : undefined}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="login-field">
              <label>Email address</label>
              <div className="login-input-wrap">
                <span className="input-icon-left">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="M22 7l-10 6L2 7"/>
                  </svg>
                </span>
                <input
                  className="login-input"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); clearErr(); }}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  style={emailInvalid ? { border: '1px solid #E24B4A' } : undefined}
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <label>Password</label>
              <div className="login-input-wrap">
                <span className="input-icon-left">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  className="login-input"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearErr(); }}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  style={pwdInvalid ? { border: '1px solid #E24B4A' } : undefined}
                />
                <button
                  type="button"
                  className="lp-eye-btn"
                  onClick={() => setShowPass(v => !v)}
                  tabIndex={-1}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="lp-footer-note">
            Protected by SkillForge security &nbsp;·&nbsp; &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
