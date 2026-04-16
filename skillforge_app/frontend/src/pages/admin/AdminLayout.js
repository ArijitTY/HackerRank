import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api';
import AdminDashboard from './AdminDashboard';
import AdminCandidates from './AdminCandidates';
import AdminResults from './AdminResults';
import LiveMonitor from '../super/LiveMonitor';
import DesignTestPage from '../super/DesignTestPage';
import AdminNetworkPage from './AdminNetworkPage';
import AdminInterviewPage from './AdminInterviewPage';
import AuditLogPage from '../super/AuditLogPage';
import AdminBatchesPage from './AdminBatchesPage';

const navItems = [
  {
    path: '/admin', label: 'Dashboard',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
  },
  {
    path: '/admin/batches', label: 'Batches',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
  },
  {
    path: '/admin/candidates', label: 'Candidates',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  },
  {
    path: '/admin/design-test', label: 'Design Test',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
  },
  {
    path: '/admin/results', label: 'Results',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
  },
  {
    path: '/admin/live', label: 'Live Monitor', live: true,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  },
  {
    path: '/admin/interview', label: 'Interviews',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  },
  {
    path: '/admin/network', label: 'Network',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
  },
  {
    path: '/admin/audit-log', label: 'Audit Log',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  },
];

export default function AdminLayout({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTestCount, setActiveTestCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchCount = () => {
      api.get('/admin/monitor/active-count')
        .then(r => { if (!cancelled) setActiveTestCount(r.data?.count || 0); })
        .catch(() => {});
    };
    fetchCount();
    const id = setInterval(fetchCount, 30000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'A';

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', position:'relative' }}>
      <nav className="sidebar" style={{ width:'260px', minWidth:'260px', height:'100vh', position:'fixed', left:0, top:0, overflowY:'auto', overflowX:'hidden', zIndex:100, display:'flex', flexDirection:'column' }}>
        <div className="sidebar-brand" onClick={() => navigate('/admin')} style={{ cursor: 'pointer' }}>
          <div className="sidebar-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div>
            <div className="sidebar-title">SkillForge</div>
            <div className="sidebar-subtitle">Admin Console</div>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{initial}</div>
          <div>
            <div className="user-name">{user?.name || 'Admin'}</div>
            <div className="user-role">
              <span className="role-badge admin">Admin</span>
            </div>
          </div>
        </div>

        <div className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {navItems.map(item => (
            <button
              key={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.live && activeTestCount > 0 && (
                <span className="nav-live-indicator">
                  <span className="nav-live-dot-ring" />
                  <span className="nav-live-dot-core" />
                  <span className="nav-live-count">{activeTestCount}</span>
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </nav>

      <main className="main-content main-content-area" style={{ marginLeft:'260px', flex:1, height:'100vh', overflowY:'auto', overflowX:'auto', padding:'2rem', boxSizing:'border-box' }}>
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="batches" element={<AdminBatchesPage />} />
          <Route path="candidates" element={<AdminCandidates />} />
          <Route path="design-test" element={<DesignTestPage apiPrefix="/admin" />} />
          <Route path="results" element={<AdminResults />} />
          <Route path="live" element={<LiveMonitor />} />
          <Route path="interview" element={<AdminInterviewPage />} />
          <Route path="network" element={<AdminNetworkPage />} />
          <Route path="audit-log" element={<AuditLogPage apiPrefix="/admin" />} />
        </Routes>
      </main>
    </div>
  );
}
