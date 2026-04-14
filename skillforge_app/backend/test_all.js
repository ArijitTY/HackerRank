const http = require('http');
function api(method, path, body, token) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname:'localhost', port:3000, path, method,
      headers:{
        'Content-Type':'application/json',
        ...(token?{'Authorization':'Bearer '+token}:{}),
        ...(data?{'Content-Length':Buffer.byteLength(data)}:{})
      }
    }, res => {
      let b='';
      res.on('data',d=>b+=d);
      res.on('end',()=>{
        try{resolve({s:res.statusCode,d:JSON.parse(b)})}
        catch(e){resolve({s:res.statusCode,d:b})}
      });
    });
    req.on('error', e=>resolve({s:0,d:e.message}));
    if(data) req.write(data);
    req.end();
  });
}

async function testAll() {
  const results = [];
  const pass = (name) => { results.push({test:name,status:'PASS'}); console.log('PASS', name); };
  const fail = (name,reason) => { results.push({test:name,status:'FAIL',reason}); console.error('FAIL', name, ':', reason); };

  // ── CANDIDATE 1 ──
  console.log('\n== CANDIDATE 1: test@gmail.com ==');
  const l1 = await api('POST','/api/auth/login',{email:'test@gmail.com',password:'Test@123'});
  if(!l1.d.token) { fail('C1 Login', l1.d.error||l1.d.message||'no token'); return; }
  const t1 = l1.d.token;
  pass('C1 Login');

  const d1 = await api('GET','/api/candidate/dashboard',null,t1);
  if(d1.s!==200) { fail('C1 Dashboard', JSON.stringify(d1.d).substring(0,100)); }
  else {
    const tests = d1.d.tests||[];
    const avail = tests.filter(t=>t.status==='available');
    if(tests.length<12) fail('C1 Dashboard - Tests count', 'Expected 12 got '+tests.length);
    else pass('C1 Dashboard - '+tests.length+' tests, '+avail.length+' available');
  }

  const tests = d1.d.tests||[];
  const available = tests.filter(t=>t.status==='available');

  const testCases = [
    {id:'test_p1', name:'Python Round 1'},
    {id:'test_pqa', name:'Python QA Round 1'},
    {id:'test_sony', name:'Sony Interview Prep'},
    {id:'test_ey', name:'EY Interview Prep'},
  ];

  for(const tc of testCases) {
    const perm = available.find(t=>t.testId===tc.id);
    if(!perm) { fail(tc.name+' - Available', 'Not in available tests'); continue; }

    const start = await api('POST','/api/candidate/tests/'+tc.id+'/start',{permissionId:perm.permissionId},t1);
    if(start.s!==200||!start.d.sessionId) { fail(tc.name+' - Start', JSON.stringify(start.d).substring(0,100)); continue; }
    const sid = start.d.sessionId;
    const qs = start.d.questions||[];
    const mcqQs = qs.filter(q=>q.type!=='coding_problem'&&q.type!=='coding');
    const codingQs = qs.filter(q=>q.type==='coding_problem'||q.type==='coding');
    pass(tc.name+' - Start (MCQ:'+mcqQs.length+' Coding:'+codingQs.length+')');

    if(qs.length===0) { fail(tc.name+' - Questions', 'Empty questions array'); }
    else {
      const q1 = qs[0];
      if(!q1.id) fail(tc.name+' - Q has id', 'Missing id');
      else if(!q1.question) fail(tc.name+' - Q has text', 'Missing question text');
      else if(q1.type!=='coding_problem' && (!q1.options||q1.options.length<2)) fail(tc.name+' - Q has options', 'Missing options');
      else pass(tc.name+' - Questions valid ('+qs.length+' total)');
    }

    const toAnswer = mcqQs.slice(0,2);
    let answerOk = true;
    for(let i=0;i<toAnswer.length;i++) {
      const r = await api('POST','/api/candidate/tests/'+tc.id+'/session/'+sid+'/answer',
        {questionId:String(toAnswer[i].id),selectedOption:i%4},t1);
      if(r.s!==200) { fail(tc.name+' - Save answer '+(i+1), JSON.stringify(r.d)); answerOk=false; }
    }
    if(answerOk && toAnswer.length>0) pass(tc.name+' - Save answers');

    const active = await api('GET','/api/candidate/tests/'+tc.id+'/active-session',null,t1);
    if(active.s!==200||!active.d.hasActiveSession) fail(tc.name+' - Active session', JSON.stringify(active.d).substring(0,100));
    else pass(tc.name+' - Resume/Active session');

    const answers = {};
    toAnswer.forEach((q,i)=>{ answers[String(q.id)]=i%4; });
    const sub = await api('POST','/api/candidate/tests/'+tc.id+'/session/'+sid+'/submit',
      {sessionId:sid,answers},t1);
    if(sub.s!==200||!sub.d.result) {
      fail(tc.name+' - Submit', JSON.stringify(sub.d).substring(0,150));
    } else {
      const r = sub.d.result;
      if(r.total===undefined||r.percentage===undefined||r.grade===undefined) {
        fail(tc.name+' - Result fields', 'Missing score/percentage/grade: '+JSON.stringify(r).substring(0,100));
      } else {
        pass(tc.name+' - Submit ('+r.score+'/'+r.total+' = '+r.percentage+'% '+r.grade+')');
      }
    }
  }

  // Code execution
  console.log('\n-- Code Execution Tests --');
  const runPy = await api('POST','/api/candidate/run-code',
    {code:'print("Hello SkillForge")\nprint(2+2)',language:'python'},t1);
  if(runPy.s!==200||!runPy.d.output) fail('Run Python code', JSON.stringify(runPy.d).substring(0,100));
  else if(!runPy.d.output.includes('Hello')) fail('Run Python - correct output', 'Got: '+runPy.d.output);
  else pass('Run Python code');

  const runSql = await api('POST','/api/candidate/run-code',
    {code:'SELECT 1+1 as result',language:'sql'},t1);
  if(runSql.s!==200) fail('Run SQL code', JSON.stringify(runSql.d).substring(0,100));
  else pass('Run SQL code');

  const analytics = await api('GET','/api/candidate/analytics',null,t1);
  if(analytics.s!==200) fail('Candidate Analytics', JSON.stringify(analytics.d).substring(0,100));
  else if(!analytics.d.hasData) fail('Analytics - has data', 'No data after completing tests');
  else pass('Candidate Analytics');

  const profile = await api('GET','/api/candidate/profile',null,t1);
  if(profile.s!==200) fail('Candidate Profile', JSON.stringify(profile.d).substring(0,100));
  else pass('Candidate Profile');

  // ── CANDIDATE 2 ──
  console.log('\n== CANDIDATE 2: rahul@test.com ==');
  const l2 = await api('POST','/api/auth/login',{email:'rahul@test.com',password:'Rahul@123'});
  if(!l2.d.token) fail('C2 Login', l2.d.error||'no token');
  else {
    pass('C2 Login');
    const t2 = l2.d.token;
    const d2 = await api('GET','/api/candidate/dashboard',null,t2);
    if(d2.s!==200) fail('C2 Dashboard', JSON.stringify(d2.d).substring(0,100));
    else pass('C2 Dashboard - '+(d2.d.tests||[]).length+' tests');
  }

  // ── ADMIN ──
  console.log('\n== ADMIN: testadmin@skillforge.com ==');
  const la = await api('POST','/api/auth/login',{email:'testadmin@skillforge.com',password:'Admin@123'});
  if(!la.d.token) fail('Admin Login', la.d.error||'no token');
  else {
    pass('Admin Login');
    const ta = la.d.token;

    const adminDash = await api('GET','/api/admin/dashboard',null,ta);
    if(adminDash.s!==200) fail('Admin Dashboard', JSON.stringify(adminDash.d).substring(0,100));
    else pass('Admin Dashboard');

    const adminCands = await api('GET','/api/admin/candidates',null,ta);
    if(adminCands.s!==200) fail('Admin Candidates', JSON.stringify(adminCands.d).substring(0,100));
    else pass('Admin Candidates - '+(adminCands.d.candidates||[]).length+' candidates');

    const adminResults = await api('GET','/api/admin/results',null,ta);
    if(adminResults.s!==200) fail('Admin Results', JSON.stringify(adminResults.d).substring(0,100));
    else pass('Admin Results');

    const adminTests = await api('GET','/api/tests',null,ta);
    if(adminTests.s!==200) fail('Admin Tests', JSON.stringify(adminTests.d).substring(0,100));
    else pass('Admin Tests - '+(adminTests.d.tests||[]).length+' tests');

    const db = require('better-sqlite3')('./skillforge.db');
    const cand = db.prepare('SELECT id FROM users WHERE email=?').get('test@gmail.com');
    const grantRes = await api('POST','/api/admin/permissions',
      {candidateId:cand.id, testId:'test_fluke', maxAttempts:3},ta);
    if(grantRes.s!==200) fail('Admin Grant Permission', JSON.stringify(grantRes.d).substring(0,100));
    else pass('Admin Grant Permission');

    const getPerms = await api('GET','/api/admin/permissions',null,ta);
    if(getPerms.s!==200) fail('Admin Get Permissions', JSON.stringify(getPerms.d).substring(0,100));
    else pass('Admin Get Permissions');
  }

  // ── SUPER ADMIN ──
  console.log('\n== SUPER ADMIN ==');
  const ls = await api('POST','/api/auth/login',{email:'superadmin@skillforge.com',password:'SuperAdmin@123'});
  if(!ls.d.token) fail('Super Admin Login', ls.d.error||'no token');
  else {
    pass('Super Admin Login');
    const ts = ls.d.token;

    const endpoints = [
      ['GET','/api/super/dashboard','Super Dashboard'],
      ['GET','/api/super/admins','Super Admins list'],
      ['GET','/api/super/candidates','Super Candidates'],
      ['GET','/api/super/results','Super Results'],
      ['GET','/api/super/tests','Super Tests'],
      ['GET','/api/super/leaderboard','Leaderboard'],
      ['GET','/api/super/audit-log','Audit Log'],
      ['GET','/api/monitor/live','Live Monitor'],
      ['GET','/api/super/interview-tests','Interview Tests'],
      ['GET','/api/super/settings','Settings'],
      ['GET','/api/super/question-stats','Question Stats'],
    ];

    for(const [method,path,name] of endpoints) {
      const r = await api(method,path,null,ts);
      if(r.s!==200) fail(name, '('+r.s+') '+JSON.stringify(r.d).substring(0,80));
      else pass(name);
    }
  }

  // ── EDGE CASES ──
  console.log('\n== EDGE CASES ==');
  const wrongPwd = await api('POST','/api/auth/login',{email:'test@gmail.com',password:'wrongpassword'});
  if(wrongPwd.s===200) fail('Wrong password rejected', 'Should return 401 not 200');
  else pass('Wrong password correctly rejected ('+wrongPwd.s+')');

  const badToken = await api('GET','/api/candidate/dashboard',null,'invalid.token.here');
  if(badToken.s===200) fail('Invalid token rejected', 'Should return 401');
  else pass('Invalid token correctly rejected ('+badToken.s+')');

  const noEmail = await api('POST','/api/auth/login',{password:'Test@123'});
  if(noEmail.s===200) fail('Missing email rejected', 'Should return 400');
  else pass('Missing email correctly rejected ('+noEmail.s+')');

  // ── REPORT ──
  console.log('\n\n========================================');
  console.log('       SKILLFORGE TEST REPORT');
  console.log('========================================');
  const passed = results.filter(r=>r.status==='PASS');
  const failed = results.filter(r=>r.status==='FAIL');
  console.log('  PASSED:', passed.length);
  console.log('  FAILED:', failed.length);
  if(failed.length>0) {
    console.log('----------------------------------------');
    console.log('  FAILURES:');
    failed.forEach(f=>console.log('  FAIL:', f.test, '-', f.reason));
  }
  console.log('========================================');
}

testAll().catch(console.error);
