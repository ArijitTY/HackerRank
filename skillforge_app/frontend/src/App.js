import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import SuperLayout from './pages/super/SuperLayout';
import AdminLayout from './pages/admin/AdminLayout';
import CandidateLayout from './pages/candidate/CandidateLayout';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('sf_user');
    return u ? JSON.parse(u) : null;
  });

  const handleLogin = (userData, token) => {
    localStorage.setItem('sf_token', token);
    localStorage.setItem('sf_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('sf_token');
    localStorage.removeItem('sf_user');
    setUser(null);
  };

  if (!user) {
    return (
      <ToastProvider>
        <ErrorBoundary>
          <div className="app-bg">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <LoginPage onLogin={handleLogin} />
            </div>
          </div>
        </ErrorBoundary>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <ErrorBoundary>
        <div className="app-bg">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Routes>
              {user.role === 'super_admin' && (
                <Route path="/super/*" element={<SuperLayout user={user} onLogout={handleLogout} />} />
              )}
              {user.role === 'admin' && (
                <Route path="/admin/*" element={<AdminLayout user={user} onLogout={handleLogout} />} />
              )}
              {user.role === 'candidate' && (
                <Route path="/candidate/*" element={<CandidateLayout user={user} onLogout={handleLogout} />} />
              )}
              <Route path="*" element={
                <Navigate to={user.role === 'super_admin' ? '/super' : user.role === 'admin' ? '/admin' : '/candidate'} />
              } />
            </Routes>
          </div>
        </div>
      </ErrorBoundary>
    </ToastProvider>
  );
}

export default App;
