import { useState, useEffect } from 'react';
import { formatIST, formatISTDate, nowLocalIso, formatDateTime } from '../../utils/dateUtils';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import PerformanceAnalytics from '../../components/PerformanceAnalytics';
import { useToast } from '../../context/ToastContext';

const TEST_META = {
  test_r1:         { icon:'\u2615', color:'#f97316', grad:'linear-gradient(135deg,#f97316,#ea580c)', tag:'Java + Selenium' },
  test_r2:         { icon:'\uD83D\uDCDA', color:'#8b5cf6', grad:'linear-gradient(135deg,#8b5cf6,#6d28d9)', tag:'Practice Mode' },
  test_r3:         { icon:'\uD83D\uDCBB', color:'#06b6d4', grad:'linear-gradient(135deg,#06b6d4,#0284c7)', tag:'Coding' },
  test_p1:         { icon:'\uD83D\uDC0D', color:'#10b981', grad:'linear-gradient(135deg,#10b981,#059669)', tag:'Python' },
  test_pqa:        { icon:'\uD83D\uDD2C', color:'#ec4899', grad:'linear-gradient(135deg,#ec4899,#9333ea)', tag:'Python QA' },
  test_pycode:     { icon:'\u26A1', color:'#f59e0b', grad:'linear-gradient(135deg,#f59e0b,#d97706)', tag:'Python Coding' },
  test_sony:       { icon:'\uD83C\uDFAF', color:'#f97316', grad:'linear-gradient(135deg,#f97316,#ea580c)', tag:'MCQ + Coding' },
  test_ey:         { icon:'\uD83E\uDDE9', color:'#8b5cf6', grad:'linear-gradient(135deg,#8b5cf6,#6d28d9)', tag:'MCQ + Coding' },
  test_fluke:      { icon:'\uD83D\uDCCA', color:'#ef4444', grad:'linear-gradient(135deg,#ef4444,#dc2626)', tag:'MCQ + Coding' },
  test_wakefit:    { icon:'\u26A1', color:'#f59e0b', grad:'linear-gradient(135deg,#f59e0b,#d97706)', tag:'MCQ + Coding' },
  test_nykaa:      { icon:'\uD83D\uDC84', color:'#ec4899', grad:'linear-gradient(135deg,#ec4899,#db2777)', tag:'MCQ + Coding' },
  test_greyorange: { icon:'\uD83E\uDD16', color:'#6366f1', grad:'linear-gradient(135deg,#6366f1,#4f46e5)', tag:'MCQ + Coding' },
  test_arcessium:  { icon:'\uD83D\uDD37', color:'#06b6d4', grad:'linear-gradient(135deg,#06b6d4,#0284c7)', tag:'MCQ + Coding' },
};

// Dynamic meta generation for custom tests
const META_COLORS = ['#7c3aed','#2563eb','#059669','#d97706','#0891b2','#c026d3','#dc2626','#0284c7'];
const META_ICONS  = ['\uD83D\uDCDD','\uD83D\uDD2C','\u26A1','\uD83C\uDFAF','\uD83D\uDD27','\uD83E\uDDE9','\uD83D\uDCCA','\uD83D\uDE80'];
function getDynamicMeta(testId, testName) {
  if (TEST_META[testId]) return TEST_META[testId];
  const hash = (testId || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const color = META_COLORS[hash % META_COLORS.length];
  const icon  = META_ICONS[hash % META_ICONS.length];
  const tag   = (testName || 'Assessment').split(' ').slice(0, 2).join(' ');
  return { icon, color, grad: `linear-gradient(135deg,${color},${color}cc)`, tag };
}
const STATUS_META = {
  available:     { label:'Available',   color:'#10b981', bg:'rgba(16,185,129,0.15)',  border:'rgba(16,185,129,0.3)',  dot:'#10b981' },
  in_progress:   { label:'In Progress', color:'#f59e0b', bg:'rgba(245,158,11,0.15)',  border:'rgba(245,158,11,0.3)',  dot:'#f59e0b' },
  completed:     { label:'Completed',   color:'#3b82f6', bg:'rgba(59,130,246,0.15)',  border:'rgba(59,130,246,0.3)',  dot:'#3b82f6' },
  locked:        { label:'Locked',      color:'#64748b', bg:'rgba(100,116,139,0.1)',  border:'rgba(100,116,139,0.2)', dot:'#64748b' },
  analysis_only: { label:'Analysis',    color:'#8b5cf6', bg:'rgba(139,92,246,0.15)', border:'rgba(139,92,246,0.3)',  dot:'#8b5cf6' },
  expired:       { label:'Expired',     color:'#475569', bg:'rgba(71,85,105,0.1)',   border:'rgba(71,85,105,0.2)',   dot:'#475569' },
};

export default function CandidateDashboard({ user }) {
  const [tests, setTests] = useState([]);
  const [candidate, setCandidate] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const navigate = useNavigate();
  const toast = useToast();

  const fetchDashboard = () => {
    setLoading(true);
    api.get('/candidate/dashboard')
      .then(r => { setTests((r.data.tests || []).filter(t => (t.testType || t.test_type || 'mcq') !== 'interview')); setCandidate(r.data.candidate || null); setActiveSession(r.data.activeSession || null); })
      .catch(e => setError(e.response?.data?.error || 'Failed to load'))
      .finally(() => setLoading(false));
  };
  useEffect(fetchDashboard, []);

  // Fetch interview assignments separately
  useEffect(() => {
    api.get('/candidate/interviews')
      .then(r => setInterviews(r.data.interviews || []))
      .catch(() => {}); // silently ignore if endpoint fails
  }, []);

  // Ping server every 2 minutes to mark candidate as online
  useEffect(() => {
    const ping = () => api.get('/candidate/ping').catch(() => {});
    ping();
    const id = setInterval(ping, 2 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const handleAction = async (test) => {
    const tid = test.testId || test.test_id;
    setActionLoading(tid);
    try {
      if (test.status === 'in_progress') {
        const { data } = await api.get(`/candidate/tests/${tid}/active-session`);
        if (data.timedOut) { toast.warning('Your session has timed out.'); fetchDashboard(); return; }
        if (data.testType === 'coding') {
          if (!data.hasActiveSession) { toast.error('Session not found. Please refresh.'); fetchDashboard(); return; }
          navigate(`/candidate/test/${tid}`, { state: { ...data, testType: 'coding', resumed: true } });
        } else if (data.testType === 'hybrid') {
          if (!data.hasActiveSession) { toast.error('Session not found. Please refresh.'); fetchDashboard(); return; }
          navigate(`/candidate/test/${tid}`, { state: { ...data, testType: 'hybrid', resumed: true } });
        } else {
          if (!data.hasActiveSession || !data.questions?.length) { toast.error('Session not found. Please refresh.'); fetchDashboard(); return; }
          navigate(`/candidate/test/${tid}`, { state: { sessionId: data.sessionId, questions: data.questions, answers: data.answers || {}, startTime: data.startTime, durationMinutes: data.durationMinutes, testName: data.testName || test.testName, resumed: true } });
        }
      } else if (test.status === 'available') {
        const { data } = await api.post(`/candidate/tests/${tid}/start`);
        if (data.testType === 'coding') {
          navigate(`/candidate/test/${tid}`, { state: { ...data, testType: 'coding' } });
        } else if (data.testType === 'hybrid') {
          navigate(`/candidate/test/${tid}`, { state: { ...data, testType: 'hybrid' } });
        } else {
          if (!data.questions?.length) throw new Error('No questions available for this test. Contact your administrator.');
          navigate(`/candidate/test/${tid}`, { state: { sessionId: data.sessionId, questions: data.questions, answers: {}, startTime: data.startTime, durationMinutes: data.durationMinutes, testName: data.testName || test.testName, resumed: false } });
        }
      }
    } catch (err) { toast.error(err.response?.data?.message || err.message || 'Something went wrong'); }
    finally { setActionLoading(null); }
  };

  if (loading) return <div style={S.center}><div style={S.spin}/><p style={{color:'rgba(255,255,255,0.4)',marginTop:16,fontSize:14}}>Loading assessments...</p></div>;
  if (error) return <div style={S.center}><div style={{fontSize:48,marginBottom:12}}>⚠️</div><p style={{color:'#ef4444'}}>{error}</p><button onClick={fetchDashboard} style={{marginTop:16,padding:'10px 24px',background:'#7c3aed',border:'none',borderRadius:8,color:'white',cursor:'pointer',fontSize:14,fontWeight:600}}>Retry</button></div>;

  const userName = candidate?.name || user?.name || 'Candidate';
  const regularTests = tests.filter(t => !(t.isInterviewPrep || t.is_interview_prep));
  const interviewPrepTests = tests.filter(t => t.isInterviewPrep || t.is_interview_prep);
  const stats = [
    { icon:'\uD83D\uDCCB', label:'Total', value:tests.length, color:'#7c3aed' },
    { icon:'\u2705', label:'Available', value:tests.filter(t=>t.status==='available').length, color:'#10b981' },
    { icon:'\uD83D\uDD04', label:'In Progress', value:tests.filter(t=>t.status==='in_progress').length, color:'#f59e0b' },
    { icon:'\uD83C\uDFC6', label:'Completed', value:tests.filter(t=>t.status==='completed').length, color:'#3b82f6' },
  ];

  return (
    <div style={S.page}>
      {/* Welcome */}
      <div style={S.topBar}>
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <div style={{width:56,height:56,borderRadius:16,background:'linear-gradient(135deg,#7c3aed,#2563eb)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:900,color:'white',boxShadow:'0 0 24px rgba(124,58,237,0.3)'}}>{userName[0].toUpperCase()}</div>
          <div>
            <h1 style={{fontSize:24,fontWeight:800,color:'#f8fafc',letterSpacing:-0.4,margin:0}}>Welcome back, {userName}!</h1>
            <p style={{fontSize:13,color:'rgba(255,255,255,0.35)',margin:0}}>{candidate?.email}</p>
            {candidate?.batch_code && (
              <div style={{ marginTop: 4 }}>
                <span style={{ display:'inline-block', padding:'2px 10px', borderRadius:6, background:'rgba(124,58,237,0.18)', color:'#a78bfa', fontFamily:'monospace', fontSize:11, fontWeight:700 }}>
                  Batch: {candidate.batch_code}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {activeSession && (
        <ActiveSessionCard session={activeSession} />
      )}

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:28}}>
        {stats.map((s,i) => (
          <div key={i} style={{background:'#0d1117',border:'1px solid rgba(255,255,255,0.06)',borderRadius:12,padding:'16px 18px',display:'flex',alignItems:'center',gap:14}}>
            <div style={{width:42,height:42,borderRadius:11,background:`${s.color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{s.icon}</div>
            <div><div style={{fontSize:26,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",color:s.color,lineHeight:1}}>{s.value}</div><div style={{fontSize:10,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:0.6,fontWeight:600,marginTop:3}}>{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* Heading */}
      {regularTests.length > 0 && <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20,fontSize:12,fontWeight:700,color:'rgba(255,255,255,0.3)',letterSpacing:1}}>YOUR ASSESSMENTS<div style={{flex:1,height:1,background:'rgba(255,255,255,0.05)'}}/></div>}

      {tests.length === 0 ? (
        <div style={{textAlign:'center',padding:'80px 20px',background:'#0d1117',border:'1px dashed rgba(255,255,255,0.08)',borderRadius:20}}>
          <div style={{fontSize:64,marginBottom:16}}>🔒</div><h3 style={{fontSize:20,color:'rgba(255,255,255,0.5)',marginBottom:8}}>No tests assigned yet</h3><p style={{color:'rgba(255,255,255,0.25)',fontSize:14}}>Contact your administrator.</p></div>
      ) : regularTests.length === 0 ? null : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:20,alignItems:'stretch'}}>
          {regularTests.map((t, i) => {
            const tid = t.testId || t.test_id;
            const meta = getDynamicMeta(tid, t.testName || t.test_name);
            const st = STATUS_META[t.status] || STATUS_META.locked;
            const disabled = ['locked','expired'].includes(t.status);
            const best = (t.sessions||[]).filter(s=>s.status==='submitted').sort((a,b)=>(b.percentage||0)-(a.percentage||0))[0];
            const bestPct = best ? Math.round(best.percentage||0) : t.bestScore;
            const pass = t.passPercentage || 60;
            const assigner = t.grantedBy || t.assigned_by_name || 'Admin';
            const date = (t.grantedAt||t.assigned_at) ? formatISTDate() : '';
            const isLoading = actionLoading === tid;
            const submittedCount = (t.sessions||[]).filter(s=>s.status==='submitted').length;
            const maxAttempts = t.maxAttempts || t.max_attempts;
            const remainingAttempts = maxAttempts ? maxAttempts - submittedCount : null;

            return (
              <div key={tid||i} style={{position:'relative',background:'#0d1117',border:`1px solid ${disabled?'rgba(255,255,255,0.06)':`${meta.color}30`}`,borderRadius:16,overflow:'hidden',opacity:disabled?0.55:1,display:'flex',flexDirection:'column',transition:'transform 0.25s,box-shadow 0.25s'}}
                onMouseEnter={e=>{if(!disabled){e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 16px 40px rgba(0,0,0,0.5)'}}}
                onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}>

                <div style={{height:3,background:meta.grad}}/>
                <div style={{padding:'20px 22px 22px',display:'flex',flexDirection:'column',flex:1}}>

                  {/* Header */}
                  <div style={{display:'flex',alignItems:'flex-start',gap:14,marginBottom:12}}>
                    <div style={{width:52,height:52,borderRadius:14,background:`${meta.color}15`,border:`1px solid ${meta.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{meta.icon}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <h3 style={{fontSize:16,fontWeight:800,color:'#f8fafc',margin:'0 0 7px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{t.testName||t.test_name}</h3>
                      <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 11px',borderRadius:20,fontSize:12,fontWeight:700,color:st.color,background:st.bg,border:`1px solid ${st.border}`}}>
                        <span style={{width:6,height:6,borderRadius:'50%',background:st.dot,display:'inline-block'}}/>{st.label}
                      </div>
                    </div>
                  </div>

                  {(t.testDescription||t.test_description) && <p style={{fontSize:13,color:'rgba(255,255,255,0.4)',lineHeight:1.55,margin:'0 0 14px',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{t.testDescription||t.test_description}</p>}

                  {/* Chips */}
                  <div style={{display:'flex',flexWrap:'wrap',gap:7,marginBottom:14}}>
                    {[
                      `⏱ ${t.durationMinutes||t.duration||'?'} min`,
                      `❓ ${t.totalQuestions||t.question_count||'?'} questions`,
                      `🎯 ${pass}% pass`,
                    ].map((c,ci) => <span key={ci} style={{display:'inline-flex',alignItems:'center',gap:4,padding:'5px 11px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,fontSize:12,color:'rgba(255,255,255,0.5)',fontWeight:500}}>{c}</span>)}
                    <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'5px 11px',background:`${meta.color}10`,border:`1px solid ${meta.color}35`,borderRadius:8,fontSize:12,color:meta.color,fontWeight:600}}>{meta.tag}</span>
                    {remainingAttempts !== null && remainingAttempts > 0 && t.status !== 'completed' && (
                      <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'5px 11px',background:'rgba(139,92,246,0.08)',border:'1px solid rgba(139,92,246,0.25)',borderRadius:8,fontSize:12,color:'#a78bfa',fontWeight:600}}>🔁 {remainingAttempts} attempt{remainingAttempts!==1?'s':''} left</span>
                    )}
                  </div>

                  {/* Score bar */}
                  {t.status==='completed' && bestPct!=null && (
                    <div style={{marginBottom:12,padding:'11px 14px',background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:10}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                        <span style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>Best Score</span>
                        <span style={{fontSize:16,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",color:bestPct>=pass?'#34d399':'#f87171'}}>{bestPct}% <span style={{fontSize:12}}>{bestPct>=pass?'✅':'❌'}</span></span>
                      </div>
                      <div style={{height:7,background:'rgba(255,255,255,0.07)',borderRadius:4,overflow:'hidden'}}><div style={{height:'100%',borderRadius:4,width:`${bestPct}%`,background:bestPct>=80?'linear-gradient(90deg,#10b981,#34d399)':bestPct>=pass?'linear-gradient(90deg,#3b82f6,#60a5fa)':'linear-gradient(90deg,#ef4444,#f87171)',transition:'width 1.2s cubic-bezier(0.4,0,0.2,1)'}}/></div>
                      {/* Per-attempt review links */}
                      {(t.sessions||[]).filter(s=>s.status==='submitted').length > 1 && (
                        <div style={{marginTop:10,display:'flex',flexWrap:'wrap',gap:6}}>
                          {(t.sessions||[]).filter(s=>s.status==='submitted').map((s,idx)=>(
                            <button key={s.id} onClick={()=>navigate(`/candidate/review/${tid}/${s.id}`)}
                              style={{fontSize:11,padding:'4px 10px',background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.25)',borderRadius:6,color:'#a78bfa',cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>
                              Attempt {idx+1} — {Math.round(s.percentage||0)}%
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {t.status==='in_progress' && <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12,padding:'9px 13px',background:'rgba(245,158,11,0.07)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:10,fontSize:12,color:'#fbbf24',fontWeight:600}}>🔄 Test in progress — answers are saved</div>}

                  <div style={{flex:1}}/>

                  {/* Footer */}
                  <div style={{display:'flex',alignItems:'center',gap:9,paddingTop:12,borderTop:'1px solid rgba(255,255,255,0.05)',marginBottom:14}}>
                    <div style={{width:26,height:26,borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#2563eb)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'white',flexShrink:0}}>{assigner[0].toUpperCase()}</div>
                    <span style={{fontSize:12,color:'rgba(255,255,255,0.3)',flex:1}}>Assigned by <strong style={{color:'rgba(255,255,255,0.6)',fontWeight:600}}>{assigner}</strong></span>
                    {date && <span style={{fontSize:11,color:'rgba(255,255,255,0.2)',fontFamily:"'JetBrains Mono',monospace"}}>{date}</span>}
                  </div>

                  {/* Action Button */}
                  {isLoading ? (
                    <button style={{...btnBase,background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.4)',cursor:'wait'}}><span style={{width:14,height:14,border:'2px solid rgba(255,255,255,0.2)',borderTopColor:'white',borderRadius:'50%',animation:'spin 0.7s linear infinite',display:'inline-block'}}/>Loading...</button>
                  ) : t.status==='available' ? (
                    <button onClick={()=>handleAction(t)} style={{...btnBase,background:meta.grad,color:'white',boxShadow:`0 4px 16px ${meta.color}40`}}>🚀 Start Test</button>
                  ) : t.status==='in_progress' ? (
                    <button onClick={()=>handleAction(t)} style={{...btnBase,background:'linear-gradient(135deg,#d97706,#b45309)',color:'white',boxShadow:'0 4px 16px rgba(217,119,6,0.35)'}}>▶ Resume Test</button>
                  ) : t.status==='completed' ? (
                    <button
                      onClick={() => {
                        const sess = (t.sessions||[]).filter(s=>s.status==='submitted').sort((a,b)=>(b.percentage||0)-(a.percentage||0))[0];
                        if (sess?.id) navigate(`/candidate/review/${tid}/${sess.id}`);
                      }}
                      style={{...btnBase,background:'linear-gradient(135deg,#1d4ed8,#2563eb)',color:'white',boxShadow:'0 4px 16px rgba(37,99,235,0.3)'}}
                    >📝 Review Answers</button>
                  ) : t.status==='analysis_only' ? (
                    <button
                      onClick={() => {
                        const sess = (t.sessions||[]).filter(s=>s.status==='submitted').sort((a,b)=>(b.percentage||0)-(a.percentage||0))[0];
                        if (sess?.id) navigate(`/candidate/review/${tid}/${sess.id}`);
                      }}
                      style={{...btnBase,background:'rgba(139,92,246,0.12)',border:'1px solid rgba(139,92,246,0.3)',color:'#a78bfa'}}
                    >📝 Review Answers</button>
                  ) : (
                    <div style={{...btnBase,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.2)',cursor:'not-allowed'}}>{t.status==='expired'?'⏰ Expired':'🔒 Contact Administrator'}</div>
                  )}
                </div>
                <div style={{position:'absolute',bottom:-50,right:-30,width:130,height:130,borderRadius:'50%',background:meta.color,opacity:0.04,filter:'blur(35px)',pointerEvents:'none'}}/>
              </div>
            );
          })}
        </div>
      )}

      {/* Interview Prep Tests Section (hybrid tests flagged as interview prep) */}
      {interviewPrepTests.length > 0 && (
        <div style={{ marginTop: 36 }}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20,fontSize:12,fontWeight:700,color:'#c084fc',letterSpacing:1}}>
            🎯 MY INTERVIEWS
            <div style={{flex:1,height:1,background:'rgba(192,132,252,0.12)'}}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:20,alignItems:'stretch'}}>
            {interviewPrepTests.map((t, i) => {
              const tid = t.testId || t.test_id;
              const meta = getDynamicMeta(tid, t.testName || t.test_name);
              const st = STATUS_META[t.status] || STATUS_META.locked;
              const disabled = ['locked','expired'].includes(t.status);
              const best = (t.sessions||[]).filter(s=>s.status==='submitted').sort((a,b)=>(b.percentage||0)-(a.percentage||0))[0];
              const bestPct = best ? Math.round(best.percentage||0) : t.bestScore;
              const pass = t.passPercentage || 60;
              const assigner = t.grantedBy || t.assigned_by_name || 'Admin';
              const date = (t.grantedAt||t.assigned_at) ? formatISTDate() : '';
              const isLoading = actionLoading === tid;
              const submittedCount = (t.sessions||[]).filter(s=>s.status==='submitted').length;
              const maxAttempts = t.maxAttempts || t.max_attempts;
              const remainingAttempts = maxAttempts ? maxAttempts - submittedCount : null;
              return (
                <div key={tid||i} style={{position:'relative',background:'#0d1117',border:`1px solid ${disabled?'rgba(255,255,255,0.06)':'rgba(192,132,252,0.28)'}`,borderRadius:16,overflow:'hidden',opacity:disabled?0.55:1,display:'flex',flexDirection:'column'}}>
                  <div style={{height:3,background:'linear-gradient(90deg,#a855f7,#6366f1)'}}/>
                  <div style={{padding:'20px 22px 22px',display:'flex',flexDirection:'column',flex:1}}>
                    <div style={{display:'flex',alignItems:'flex-start',gap:14,marginBottom:12}}>
                      <div style={{width:52,height:52,borderRadius:14,background:'rgba(168,85,247,0.15)',border:'1px solid rgba(168,85,247,0.35)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>🎤</div>
                      <div style={{flex:1,minWidth:0}}>
                        <h3 style={{fontSize:16,fontWeight:800,color:'#f8fafc',margin:'0 0 7px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{t.testName||t.test_name}</h3>
                        <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 11px',borderRadius:20,fontSize:12,fontWeight:700,color:st.color,background:st.bg,border:`1px solid ${st.border}`}}>
                          <span style={{width:6,height:6,borderRadius:'50%',background:st.dot,display:'inline-block'}}/>{st.label}
                        </div>
                      </div>
                    </div>
                    {(t.testDescription||t.test_description) && <p style={{fontSize:13,color:'rgba(255,255,255,0.4)',lineHeight:1.55,margin:'0 0 14px',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{t.testDescription||t.test_description}</p>}
                    <div style={{display:'flex',flexWrap:'wrap',gap:7,marginBottom:14}}>
                      <span style={{padding:'5px 11px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,fontSize:12,color:'rgba(255,255,255,0.5)'}}>⏱ {t.durationMinutes||t.duration||'?'} min</span>
                      <span style={{padding:'5px 11px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,fontSize:12,color:'rgba(255,255,255,0.5)'}}>❓ {t.totalQuestions||t.question_count||'?'} questions</span>
                      <span style={{padding:'5px 11px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,fontSize:12,color:'rgba(255,255,255,0.5)'}}>🎯 {pass}% pass</span>
                      <span style={{padding:'5px 11px',background:'rgba(168,85,247,0.12)',border:'1px solid rgba(168,85,247,0.4)',borderRadius:8,fontSize:12,color:'#c084fc',fontWeight:600}}>INTERVIEW PREP</span>
                      {remainingAttempts !== null && remainingAttempts > 0 && t.status !== 'completed' && (
                        <span style={{padding:'5px 11px',background:'rgba(139,92,246,0.08)',border:'1px solid rgba(139,92,246,0.25)',borderRadius:8,fontSize:12,color:'#a78bfa',fontWeight:600}}>🔁 {remainingAttempts} left</span>
                      )}
                    </div>
                    {t.status==='completed' && bestPct!=null && (
                      <div style={{marginBottom:12,padding:'11px 14px',background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:10}}>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                          <span style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>Best Score</span>
                          <span style={{fontSize:16,fontWeight:800,color:bestPct>=pass?'#34d399':'#f87171'}}>{bestPct}%</span>
                        </div>
                        <div style={{height:7,background:'rgba(255,255,255,0.07)',borderRadius:4,overflow:'hidden'}}><div style={{height:'100%',width:`${bestPct}%`,background:bestPct>=pass?'linear-gradient(90deg,#a855f7,#6366f1)':'linear-gradient(90deg,#ef4444,#f87171)'}}/></div>
                      </div>
                    )}
                    <div style={{flex:1}}/>
                    <div style={{display:'flex',alignItems:'center',gap:9,paddingTop:12,borderTop:'1px solid rgba(255,255,255,0.05)',marginBottom:14}}>
                      <span style={{fontSize:12,color:'rgba(255,255,255,0.3)',flex:1}}>Assigned by <strong style={{color:'rgba(255,255,255,0.6)'}}>{assigner}</strong></span>
                      {date && <span style={{fontSize:11,color:'rgba(255,255,255,0.2)'}}>{date}</span>}
                    </div>
                    {isLoading ? (
                      <button style={{...btnBase,background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.4)',cursor:'wait'}}>Loading...</button>
                    ) : t.status==='available' ? (
                      <button onClick={()=>handleAction(t)} style={{...btnBase,background:'linear-gradient(135deg,#a855f7,#6366f1)',color:'white'}}>🎤 Start Interview</button>
                    ) : t.status==='in_progress' ? (
                      <button onClick={()=>handleAction(t)} style={{...btnBase,background:'linear-gradient(135deg,#d97706,#b45309)',color:'white'}}>▶ Resume</button>
                    ) : t.status==='completed' ? (
                      <button onClick={()=>{ const sess=(t.sessions||[]).filter(s=>s.status==='submitted').sort((a,b)=>(b.percentage||0)-(a.percentage||0))[0]; if(sess?.id) navigate(`/candidate/review/${tid}/${sess.id}`); }}
                        style={{...btnBase,background:'linear-gradient(135deg,#1d4ed8,#2563eb)',color:'white'}}>📝 Review</button>
                    ) : (
                      <div style={{...btnBase,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.2)',cursor:'not-allowed'}}>{t.status==='expired'?'⏰ Expired':'🔒 Locked'}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interview Tests Section */}
      {interviews.length > 0 && (
        <div style={{ marginTop: 36 }}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20,fontSize:12,fontWeight:700,color:'rgba(255,255,255,0.3)',letterSpacing:1}}>
            INTERVIEW TESTS
            <div style={{flex:1,height:1,background:'rgba(255,255,255,0.05)'}}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16}}>
            {interviews.map(iv => {
              const statusColor = iv.session_status === 'submitted' ? '#3b82f6' : iv.session_status === 'in_progress' ? '#f59e0b' : '#10b981';
              const statusLabel = iv.session_status === 'submitted' ? 'Submitted' : iv.session_status === 'in_progress' ? 'In Progress' : 'Available';
              const statusBg = iv.session_status === 'submitted' ? 'rgba(59,130,246,0.12)' : iv.session_status === 'in_progress' ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)';
              return (
                <div key={iv.test_id} style={{
                  background:'#0d1117', border:'1px solid rgba(124,58,237,0.2)',
                  borderRadius:14, overflow:'hidden', position:'relative',
                }}>
                  <div style={{height:3, background:'linear-gradient(90deg,#7c3aed,#2563eb)'}}/>
                  <div style={{padding:'18px 20px'}}>
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,marginBottom:10}}>
                      <div style={{fontSize:24}}>🎤</div>
                      <div style={{
                        padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700,
                        background:statusBg, color:statusColor,
                        border:`1px solid ${statusColor}40`,
                      }}>{statusLabel}</div>
                    </div>
                    <h3 style={{fontSize:15,fontWeight:700,color:'rgba(255,255,255,0.9)',margin:'0 0 6px'}}>{iv.name}</h3>
                    {iv.description && <p style={{fontSize:12,color:'rgba(255,255,255,0.4)',margin:'0 0 12px',lineHeight:1.5}}>{iv.description}</p>}
                    <div style={{fontSize:12,color:'rgba(255,255,255,0.35)',marginBottom:14}}>
                      📋 {iv.question_count || 0} question{iv.question_count !== 1 ? 's' : ''}
                    </div>
                    {iv.session_status === 'submitted' ? (
                      <div style={{...btnBase,background:'rgba(59,130,246,0.1)',border:'1px solid rgba(59,130,246,0.25)',color:'#60a5fa',cursor:'default'}}>
                        ✅ Submitted — Awaiting Review
                      </div>
                    ) : (
                      <button
                        onClick={() => navigate(`/candidate/interview/${iv.test_id}`)}
                        style={{...btnBase, background:'linear-gradient(135deg,#7c3aed,#2563eb)', color:'white'}}
                      >
                        {iv.session_status === 'in_progress' ? '▶ Resume Interview' : '🚀 Start Interview'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Performance Analytics Section */}
      <PerformanceAnalytics />
    </div>
  );
}

function ActiveSessionCard({ session }) {
  const pillMap = {
    active:   { bg: 'rgba(52,211,153,0.18)', color: '#34d399', label: 'Active' },
    upcoming: { bg: 'rgba(148,163,184,0.18)', color: '#cbd5e1', label: 'Upcoming' },
    expired:  { bg: 'rgba(248,113,113,0.18)', color: '#f87171', label: 'Expired' },
  };
  const pill = pillMap[session.status] || pillMap.active;
  const copyUrl = () => { if (session.tunnelUrl) navigator.clipboard.writeText(session.tunnelUrl).catch(() => {}); };
  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(37,99,235,0.08))', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 14, padding: 18, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ padding: '3px 12px', borderRadius: 20, background: pill.bg, color: pill.color, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{pill.label}</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: '#a78bfa', fontWeight: 700 }}>
          Session: {session.sessionCode}
        </span>
      </div>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>Drive: {session.sessionName}</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
        Available: {formatDateTime(session.dateFrom)} — {formatDateTime(session.dateTo)}
      </div>
      {session.tunnelUrl && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 8, marginTop: 4 }}>
          <span style={{ fontSize: 11, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Access URL:</span>
          <code style={{ flex: 1, fontSize: 12, color: '#7c3aed', fontFamily: 'monospace', wordBreak: 'break-all' }}>{session.tunnelUrl}</code>
          <button onClick={copyUrl} style={{ padding: '4px 10px', background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#a78bfa', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>Copy</button>
        </div>
      )}
    </div>
  );
}

const btnBase = {width:'100%',padding:'13px 20px',border:'none',borderRadius:12,fontSize:14,fontWeight:700,cursor:'pointer',transition:'all 0.2s',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:8};
const S = {
  page: {minHeight:'100vh',background:'#030712',padding:'28px 32px 48px'},
  center: {display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',background:'#030712',color:'white'},
  spin: {width:40,height:40,border:'3px solid rgba(255,255,255,0.1)',borderTopColor:'#7c3aed',borderRadius:'50%',animation:'spin 0.8s linear infinite'},
  topBar: {display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:28,flexWrap:'wrap',gap:16},
};
