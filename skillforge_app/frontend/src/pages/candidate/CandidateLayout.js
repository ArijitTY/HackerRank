import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import CandidateDashboard from './CandidateDashboard';
import TestPage from './TestPage';
import ReviewPage from './ReviewPage';
import CandidateProfilePage from './CandidateProfilePage';
import CandidateInterviewPage from './CandidateInterviewPage';

function getTokenExp() {
  try {
    const token = localStorage.getItem('sf_token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null; // ms
  } catch { return null; }
}

export default function CandidateLayout({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isTestScreen = location.pathname.includes('/candidate/test/');
  const isInterviewScreen = location.pathname.includes('/candidate/interview/');

  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  const expiryWarnShownRef = useRef(false);

  useEffect(() => {
    const check = () => {
      const exp = getTokenExp();
      if (!exp) return;
      const msLeft = exp - Date.now();
      if (msLeft <= 300000 && msLeft > 0 && !expiryWarnShownRef.current) {
        expiryWarnShownRef.current = true;
        setShowExpiryWarning(true);
      }
      if (msLeft <= 0) { onLogout(); }
    };
    check();
    const iv = setInterval(check, 30000);
    return () => clearInterval(iv);
  }, []); // eslint-disable-line

  // Test screen is FULL SCREEN — no navbar, no padding, no wrapper
  if (isTestScreen) {
    return (
      <Routes>
        <Route path="test/:testId" element={<TestPage user={user} />} />
      </Routes>
    );
  }

  // Interview screen is also FULL SCREEN — manages its own top bar
  if (isInterviewScreen) {
    return (
      <Routes>
        <Route path="interview/:testId" element={<CandidateInterviewPage user={user} />} />
      </Routes>
    );
  }

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'C';

  return (
    <div style={{ background: '#030712', minHeight: '100vh' }}>
      {/* Session expiry warning modal */}
      {showExpiryWarning && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#0d1117', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 16, padding: '28px 32px', maxWidth: 420, width: '90%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc', margin: '0 0 10px' }}>Session Expiring Soon</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              Your session will expire in less than 5 minutes. Please save your work and log back in to continue.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setShowExpiryWarning(false)} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Dismiss</button>
              <button onClick={onLogout} style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#d97706,#b45309)', border: 'none', borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Logout & Re-login</button>
            </div>
          </div>
        </div>
      )}
      {/* Top navbar — sticky, not fixed */}
      <nav style={{
        background: '#0d1117',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 32px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span style={{ fontSize: 16, fontWeight: 800 }}>
            <span style={{ color: '#818cf8' }}>Skill</span>
            <span style={{ color: 'white' }}>Forge</span>
          </span>
          <span style={{
            padding: '2px 10px', background: 'rgba(139,92,246,0.15)',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: 20, fontSize: 11, color: '#a78bfa', fontWeight: 600,
            marginLeft: 4,
          }}>Candidate</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/candidate/profile')} style={{
            display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none',
            cursor: 'pointer', padding: 0,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 800, color: 'white',
            }}>{initial}</div>
            <span style={{ fontWeight: 500, fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{user?.name}</span>
          </button>
          <button onClick={onLogout} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8,
            color: '#f87171', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </nav>

      {/* Content area — normal scroll, no fixed positioning */}
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Routes>
          <Route index element={<CandidateDashboard user={user} />} />
          <Route path="profile" element={<CandidateProfilePage user={user} />} />
          <Route path="review/:testId/:sessionId" element={<ReviewPage />} />
          <Route path="interview/:testId" element={<CandidateInterviewPage user={user} />} />
        </Routes>
      </div>
    </div>
  );
}
