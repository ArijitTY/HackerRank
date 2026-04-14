import { useState, useEffect } from 'react';
import { formatIST, formatISTDate, nowLocalIso } from '../../utils/dateUtils';
import { useParams } from 'react-router-dom';
import api from '../../api';

export default function CandidateDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});

  const fetchDetail = () => {
    api.get(`/super/candidates/${id}`)
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.error || 'Failed to load candidate'));
  };

  useEffect(() => { fetchDetail(); }, [id]); // eslint-disable-line

  const handlePermAction = async (permId, action, body = {}) => {
    try {
      if (action === 'grant') {
        await api.post('/super/permissions', { candidateId: id, ...body });
      } else {
        await api.put(`/super/permissions/${permId}/${action}`, body);
      }
      fetchDetail();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${action}`);
    }
  };

  if (error && !data) return <div className="login-error">{error}</div>;
  if (!data) return <div className="loading">Loading candidate details...</div>;

  const candidate = data.candidate || data;
  const permissions = data.permissions || data.tests || [];

  const statusBadge = (perm) => {
    const s = perm.status || 'locked';
    const map = {
      locked: 'badge-muted',
      available: 'badge-active',
      completed: 'badge-success',
      analysis_only: 'badge-count',
      in_progress: 'badge-active',
    };
    return <span className={`badge ${map[s] || 'badge-muted'}`}>{s.replace('_', ' ')}</span>;
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Candidate Detail</h1>
          <p className="page-sub">Manage permissions and view history</p>
        </div>
      </div>

      {error && <div className="login-error">{error}</div>}

      <div className="candidate-profile-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {(candidate.name || '?')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.95)' }}>{candidate.name}</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{candidate.email}</p>
          </div>
          <span className={`badge ${candidate.status === 'active' ? 'badge-active' : 'badge-revoked'}`}>
            {candidate.status || 'active'}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em', marginBottom: 4 }}>Created By</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{candidate.created_by_name || candidate.created_by || '-'}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em', marginBottom: 4 }}>Created</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{candidate.created_at ? formatISTDate() : '-'}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em', marginBottom: 4 }}>Tests Assigned</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{permissions.length}</div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Test Permissions</h3>
        </div>
        <table className="sf-table">
          <thead>
            <tr>
              <th>Test</th>
              <th>Status</th>
              <th>Attempts</th>
              <th>Best Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((p, i) => (
              <>
                <tr key={p.test_id || i}>
                  <td><span style={{ fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>{p.test_name || p.name || `Test ${p.test_id}`}</span></td>
                  <td>{statusBadge(p)}</td>
                  <td><span style={{ fontFamily: 'monospace', fontSize: 13 }}>{p.attempt_count ?? 0} / {p.max_attempts ?? '-'}</span></td>
                  <td><span style={{ fontFamily: 'monospace', fontSize: 13 }}>{p.best_score != null ? `${p.best_score}%` : '-'}</span></td>
                  <td>
                    <div className="btn-group">
                      {p.status === 'revoked' && (
                        <button className="btn btn-sm btn-success" onClick={() => handlePermAction(p.id, 'restore')}>Restore</button>
                      )}
                      {(p.status === 'granted' || p.status === 'completed') && (
                        <button className="btn btn-sm btn-danger" onClick={() => handlePermAction(p.id, 'revoke')}>Revoke</button>
                      )}
                      <button className="btn btn-sm btn-outline" onClick={() => handlePermAction(p.id, 'reset')}>Reset</button>
                      <button className="btn btn-sm btn-outline" onClick={() => handlePermAction(p.id, 'analysis', { analysisOnly: true })}>Analysis</button>
                      <button className="btn btn-sm btn-ghost" onClick={() => setExpanded(prev => ({ ...prev, [p.test_id]: !prev[p.test_id] }))}>
                        {expanded[p.test_id] ? 'Hide' : 'Sessions'}
                      </button>
                    </div>
                  </td>
                </tr>
                {expanded[p.test_id] && (p.sessions || []).map((s, si) => (
                  <tr key={`${p.test_id}-${si}`} style={{ background: 'rgba(255,255,255,0.01)' }}>
                    <td colSpan="5" style={{ paddingLeft: 48 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13 }}>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>#{si + 1}</span>
                        <span style={{ fontWeight: 500, color: s.score != null && s.score >= 60 ? '#10b981' : '#ef4444', fontFamily: 'monospace' }}>{s.score != null ? `${s.score}%` : '-'}</span>
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>{s.completed_at ? formatIST() : s.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            ))}
            {permissions.length === 0 && (
              <tr><td colSpan="5" className="table-empty">No test permissions found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
