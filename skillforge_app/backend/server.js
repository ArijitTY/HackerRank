const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const os = require('os');
const { spawn } = require('child_process');

const db = require('./db');
const { generateToken, authMiddleware, requireRole, hashPassword, comparePassword } = require('./auth');
const { buildQuestionSet, seededShuffle, hashCode } = require('./questions');
const { logAudit } = require('./audit');
const { runProblem, isJavaAvailable } = require('./codeExecution');

const app = express();
const PORT = 3000;

// SQLite datetime('now') returns UTC without 'Z' suffix.
// JavaScript new Date() parses without 'Z' as LOCAL time, causing timezone mismatch.
// This helper ensures correct UTC parsing.
function parseDbTime(t) {
  if (!t) return 0;
  // If it already has Z or timezone, parse directly
  if (t.includes('Z') || t.includes('+') || t.includes('T')) return new Date(t).getTime();
  // SQLite format "YYYY-MM-DD HH:MM:SS" — append Z for UTC
  return new Date(t + 'Z').getTime();
}

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, same-origin)
    if (!origin) return callback(null, true);
    // Allow any localhost port for development
    if (origin.match(/^http:\/\/localhost(:\d+)?$/) || origin.match(/^http:\/\/127\.0\.0\.1(:\d+)?$/)) {
      return callback(null, true);
    }
    // Allow LAN IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
    if (origin.match(/^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/)) {
      return callback(null, true);
    }
    callback(null, true); // Open for now - restrict in production
  },
  credentials: true
}));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

// ============================================================
// IN-MEMORY RATE LIMITER (no external packages needed)
// ============================================================
const rateLimitStore = new Map();
function rateLimit({ windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests' } = {}) {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = rateLimitStore.get(key) || { count: 0, resetAt: now + windowMs };
    if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + windowMs; }
    entry.count++;
    rateLimitStore.set(key, entry);
    if (entry.count > max) {
      return res.status(429).json({ error: message, retryAfter: Math.ceil((entry.resetAt - now) / 1000) });
    }
    next();
  };
}
// Clean up old rate limit entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) rateLimitStore.delete(key);
  }
}, 10 * 60 * 1000);

// ============================================================
// HELPER: get LAN IP
// ============================================================
function getLanIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

// ============================================================
// AUTH ENDPOINTS
// ============================================================

// POST /api/auth/login
app.post('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many login attempts. Please wait 15 minutes.' }), (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }
    if (!comparePassword(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    db.prepare('UPDATE users SET last_login = datetime(\'now\') WHERE id = ?').run(user.id);

    logAudit(db, {
      actorId: user.id,
      actorRole: user.role,
      action: 'login',
      targetType: 'user',
      targetId: user.id,
      details: { email: user.email }
    });

    const response = {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    };

    if (user.role === 'candidate') {
      const permissions = db.prepare(`
        SELECT tp.*, t.name as test_name, t.duration_minutes, t.passing_percentage, t.total_questions
        FROM test_permissions tp
        JOIN tests t ON tp.test_id = t.id
        WHERE tp.candidate_id = ?
      `).all(user.id);
      response.permissions = permissions;
    }

    res.json(response);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authMiddleware, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, role, is_active, created_at, last_login FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const response = { user };
    if (user.role === 'candidate') {
      response.permissions = db.prepare(`
        SELECT tp.*, t.name as test_name, t.duration_minutes, t.passing_percentage, t.total_questions
        FROM test_permissions tp
        JOIN tests t ON tp.test_id = t.id
        WHERE tp.candidate_id = ?
      `).all(user.id);
    }
    res.json(response);
  } catch (err) {
    console.error('Auth/me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// SUPER ADMIN ENDPOINTS
// ============================================================

// --- Admin management ---

app.get('/api/super/admins', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const admins = db.prepare(`
      SELECT u.id, u.name, u.email, u.is_active, u.created_at, u.last_login,
             aa.assigned_tests, aa.max_candidates
      FROM users u
      LEFT JOIN admin_assignments aa ON u.id = aa.admin_id
      WHERE u.role = 'admin'
      ORDER BY u.created_at DESC
    `).all();
    res.json(admins);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/super/admins', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const { name, email, password, assignedTests, maxCandidates } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password required' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email);
    if (existing) return res.status(409).json({ error: 'Email already exists' });

    const id = uuidv4();
    const hashed = hashPassword(password);

    db.prepare(`
      INSERT INTO users (id, name, email, password, role, created_by)
      VALUES (?, ?, ?, ?, 'admin', ?)
    `).run(id, name, email, hashed, req.user.id);

    db.prepare(`
      INSERT INTO admin_assignments (id, admin_id, assigned_tests, max_candidates)
      VALUES (?, ?, ?, ?)
    `).run(uuidv4(), id, JSON.stringify(assignedTests || []), maxCandidates || 100);

    logAudit(db, {
      actorId: req.user.id, actorRole: 'super_admin',
      action: 'create_admin', targetType: 'user', targetId: id,
      details: { name, email }
    });

    res.status(201).json({ id, name, email, role: 'admin' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/super/admins/:id/revoke', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    db.prepare('UPDATE users SET is_active = 0 WHERE id = ? AND role = ?').run(req.params.id, 'admin');
    logAudit(db, {
      actorId: req.user.id, actorRole: 'super_admin',
      action: 'revoke_admin', targetType: 'user', targetId: req.params.id, details: {}
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/super/admins/:id/restore', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    db.prepare('UPDATE users SET is_active = 1 WHERE id = ? AND role = ?').run(req.params.id, 'admin');
    logAudit(db, {
      actorId: req.user.id, actorRole: 'super_admin',
      action: 'restore_admin', targetType: 'user', targetId: req.params.id, details: {}
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Candidate management (super admin) ---

app.get('/api/super/candidates', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const candidates = db.prepare(`
      SELECT u.id, u.name, u.email, u.is_active, u.created_at, u.last_login, u.created_by,
             (SELECT COUNT(*) FROM test_permissions WHERE candidate_id = u.id) as permissions_count,
             (SELECT COUNT(*) FROM test_sessions WHERE candidate_id = u.id AND status = 'submitted') as completed_tests,
             (SELECT ROUND(AVG(percentage),1) FROM test_sessions WHERE candidate_id = u.id AND status = 'submitted') as avg_score,
             (SELECT MAX(percentage) FROM test_sessions WHERE candidate_id = u.id AND status = 'submitted') as best_score,
             (SELECT name FROM users WHERE id = u.created_by) as created_by_name
      FROM users u
      WHERE u.role = 'candidate'
      ORDER BY u.created_at DESC
    `).all();
    res.json(candidates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/super/candidates', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password required' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email);
    if (existing) return res.status(409).json({ error: 'Email already exists' });

    const id = uuidv4();
    const hashed = hashPassword(password);

    db.prepare(`
      INSERT INTO users (id, name, email, password, role, created_by)
      VALUES (?, ?, ?, ?, 'candidate', ?)
    `).run(id, name, email, hashed, req.user.id);

    logAudit(db, {
      actorId: req.user.id, actorRole: 'super_admin',
      action: 'create_candidate', targetType: 'user', targetId: id,
      details: { name, email }
    });

    res.status(201).json({ id, name, email, role: 'candidate' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/super/candidates/:id', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const candidate = db.prepare(`
      SELECT id, name, email, is_active, created_at, last_login, created_by
      FROM users WHERE id = ? AND role = 'candidate'
    `).get(req.params.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    candidate.permissions = db.prepare(`
      SELECT tp.*, t.name as test_name, t.duration_minutes
      FROM test_permissions tp
      JOIN tests t ON tp.test_id = t.id
      WHERE tp.candidate_id = ?
    `).all(req.params.id);

    candidate.sessions = db.prepare(`
      SELECT ts.*, t.name as test_name
      FROM test_sessions ts
      JOIN tests t ON ts.test_id = t.id
      WHERE ts.candidate_id = ?
      ORDER BY ts.created_at DESC
    `).all(req.params.id);

    res.json(candidate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/super/candidates/:id/revoke', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    db.prepare(`
      UPDATE test_permissions SET status = 'revoked'
      WHERE candidate_id = ? AND status = 'granted'
    `).run(req.params.id);

    logAudit(db, {
      actorId: req.user.id, actorRole: 'super_admin',
      action: 'revoke_all_permissions', targetType: 'user', targetId: req.params.id, details: {}
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE super admin candidate permanently
app.delete('/api/super/candidates/:id', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const candidate = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'candidate'").get(req.params.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    db.prepare("DELETE FROM test_permissions WHERE candidate_id = ?").run(req.params.id);
    db.prepare("DELETE FROM test_sessions WHERE candidate_id = ?").run(req.params.id);
    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);

    logAudit(db, {
      actorId: req.user.id, actorRole: 'super_admin',
      action: 'delete_user', targetType: 'user', targetId: req.params.id, details: {}
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE super admin — permanently remove an admin account
app.delete('/api/super/admins/:id', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const admin = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'admin'").get(req.params.id);
    if (!admin) return res.status(404).json({ error: 'Admin not found' });

    // Remove all candidates created by this admin first
    const adminCandidates = db.prepare("SELECT id FROM users WHERE role = 'candidate' AND created_by = ?").all(req.params.id);
    for (const c of adminCandidates) {
      db.prepare("DELETE FROM test_permissions WHERE candidate_id = ?").run(c.id);
      db.prepare("DELETE FROM test_sessions WHERE candidate_id = ?").run(c.id);
    }
    db.prepare("DELETE FROM users WHERE role = 'candidate' AND created_by = ?").run(req.params.id);
    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);

    logAudit(db, {
      actorId: req.user.id, actorRole: 'super_admin',
      action: 'delete_admin', targetType: 'user', targetId: req.params.id, details: {}
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Permission management (super admin) ---

app.post('/api/super/permissions', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const { candidateId, testId, maxAttempts } = req.body;
    if (!candidateId || !testId) {
      return res.status(400).json({ error: 'candidateId and testId required' });
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO test_permissions (id, candidate_id, test_id, max_attempts, granted_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, candidateId, testId, maxAttempts || 1, req.user.id);

    logAudit(db, {
      actorId: req.user.id, actorRole: 'super_admin',
      action: 'grant_permission', targetType: 'test_permission', targetId: id,
      details: { candidateId, testId, maxAttempts: maxAttempts || 1 }
    });

    res.status(201).json({ id, candidateId, testId, status: 'granted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/super/permissions/:id/revoke', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    db.prepare("UPDATE test_permissions SET status = 'revoked' WHERE id = ?").run(req.params.id);
    logAudit(db, {
      actorId: req.user.id, actorRole: 'super_admin',
      action: 'revoke_permission', targetType: 'test_permission', targetId: req.params.id, details: {}
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/super/permissions/:id/restore', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    db.prepare("UPDATE test_permissions SET status = 'granted' WHERE id = ?").run(req.params.id);
    logAudit(db, {
      actorId: req.user.id, actorRole: 'super_admin',
      action: 'restore_permission', targetType: 'test_permission', targetId: req.params.id, details: {}
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/super/permissions/:id/reset', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    db.prepare(`
      UPDATE test_permissions SET max_attempts = max_attempts + 1, status = 'granted' WHERE id = ?
    `).run(req.params.id);
    logAudit(db, {
      actorId: req.user.id, actorRole: 'super_admin',
      action: 'reset_permission', targetType: 'test_permission', targetId: req.params.id, details: {}
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/super/permissions/:id/analysis', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const { expiresAt } = req.body;
    const expires = expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    db.prepare(`
      UPDATE test_permissions SET analysis_only = 1, analysis_expires_at = ? WHERE id = ?
    `).run(expires, req.params.id);
    logAudit(db, {
      actorId: req.user.id, actorRole: 'super_admin',
      action: 'grant_analysis', targetType: 'test_permission', targetId: req.params.id,
      details: { expiresAt: expires }
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Dashboard & Results (super admin) ---

app.get('/api/super/dashboard', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const candidates = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'candidate'").get().c;
    const admins = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'admin'").get().c;
    const tests = db.prepare('SELECT COUNT(*) as c FROM tests').get().c;
    const totalSessions = db.prepare('SELECT COUNT(*) as c FROM test_sessions').get().c;
    const liveSessions = db.prepare("SELECT COUNT(*) as c FROM test_sessions WHERE status = 'in_progress'").get().c;
    const submittedSessions = db.prepare("SELECT COUNT(*) as c FROM test_sessions WHERE status = 'submitted'").get().c;
    const totalQuestions = db.prepare('SELECT COUNT(*) as c FROM questions').get().c;
    const totalPermissions = db.prepare('SELECT COUNT(*) as c FROM test_permissions').get().c;

    const avgScore = db.prepare("SELECT AVG(percentage) as avg FROM test_sessions WHERE status = 'submitted'").get().avg;
    const passCount = db.prepare("SELECT COUNT(*) as c FROM test_sessions WHERE status = 'submitted' AND passed = 1").get().c;
    const avgPassRate = submittedSessions > 0 ? Math.round((passCount / submittedSessions) * 100) : 0;

    // Test stats
    const allTests = db.prepare('SELECT * FROM tests WHERE is_active = 1').all();
    const testStats = allTests.map(t => {
      const stats = db.prepare(`
        SELECT COUNT(*) as total_attempts,
               AVG(CASE WHEN status='submitted' THEN percentage END) as avg_score,
               SUM(CASE WHEN status='submitted' AND passed=1 THEN 1 ELSE 0 END) as passed_count,
               SUM(CASE WHEN status='submitted' THEN 1 ELSE 0 END) as submitted_count,
               SUM(CASE WHEN status='in_progress' THEN 1 ELSE 0 END) as active_now
        FROM test_sessions WHERE test_id = ?
      `).get(t.id);
      return {
        id: t.id, name: t.name,
        totalAttempts: stats.submitted_count || 0,
        avgScore: stats.avg_score ? Math.round(stats.avg_score) : 0,
        passRate: stats.submitted_count > 0 ? Math.round(((stats.passed_count || 0) / stats.submitted_count) * 100) : 0,
        activeNow: stats.active_now || 0
      };
    });

    // Recent activity from audit log
    const recentActivity = db.prepare(`
      SELECT al.*, u.name as actor_name
      FROM audit_log al
      LEFT JOIN users u ON al.actor_id = u.id
      ORDER BY al.timestamp DESC
      LIMIT 20
    `).all().map(a => ({
      ...a,
      details: a.details ? JSON.parse(a.details) : {}
    }));

    res.json({
      candidates, admins, tests, liveSessions, avgPassRate,
      totalSessions, submittedSessions, totalQuestions, totalPermissions,
      averageScore: avgScore ? Math.round(avgScore * 100) / 100 : 0,
      passCount,
      testStats,
      recentActivity
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// TESTS ENDPOINTS
// ============================================================

app.get('/api/tests', authMiddleware, (req, res) => {
  try {
    // Standard tests + custom tests created by the caller
    const tests = db.prepare(`SELECT * FROM tests WHERE is_active = 1 AND (is_custom = 0 OR (is_custom = 1 AND created_by = ?)) ORDER BY rowid`).all(req.user.id);
    const testsWithStats = tests.map(test => {
      const stats = db.prepare(`
        SELECT COUNT(*) as total_attempts,
               AVG(CASE WHEN status='submitted' THEN percentage END) as avg_score,
               SUM(CASE WHEN status='submitted' AND passed=1 THEN 1 ELSE 0 END) as passed_count,
               SUM(CASE WHEN status='submitted' THEN 1 ELSE 0 END) as submitted_count,
               SUM(CASE WHEN status='in_progress' THEN 1 ELSE 0 END) as active_now
        FROM test_sessions WHERE test_id = ?
      `).get(test.id);
      return {
        ...test,
        totalAttempts: stats.submitted_count || 0,
        avgScore: stats.avg_score ? Math.round(stats.avg_score) : 0,
        passRate: stats.submitted_count > 0 ? Math.round(((stats.passed_count || 0) / stats.submitted_count) * 100) : 0,
        activeNow: stats.active_now || 0
      };
    });
    res.json({ tests: testsWithStats });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/super/tests', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    // Standard tests + custom tests created by this super admin
    const tests = db.prepare(`SELECT * FROM tests WHERE is_active = 1 AND (is_custom = 0 OR (is_custom = 1 AND created_by = ?)) ORDER BY rowid`).all(req.user.id);
    const testsWithStats = tests.map(test => {
      const stats = db.prepare(`
        SELECT COUNT(*) as total_attempts,
               AVG(CASE WHEN status='submitted' THEN percentage END) as avg_score,
               SUM(CASE WHEN status='submitted' AND passed=1 THEN 1 ELSE 0 END) as passed_count,
               SUM(CASE WHEN status='submitted' THEN 1 ELSE 0 END) as submitted_count,
               SUM(CASE WHEN status='in_progress' THEN 1 ELSE 0 END) as active_now
        FROM test_sessions WHERE test_id = ?
      `).get(test.id);
      return {
        ...test,
        totalAttempts: stats.submitted_count || 0,
        avgScore: stats.avg_score ? Math.round(stats.avg_score) : 0,
        passRate: stats.submitted_count > 0 ? Math.round(((stats.passed_count || 0) / stats.submitted_count) * 100) : 0,
        activeNow: stats.active_now || 0
      };
    });
    res.json({ tests: testsWithStats });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/admin/tests', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    // Standard tests + custom tests created by this admin
    const tests = db.prepare(`SELECT * FROM tests WHERE is_active = 1 AND (is_custom = 0 OR (is_custom = 1 AND created_by = ?)) ORDER BY rowid`).all(req.user.id);
    const testsWithStats = tests.map(test => {
      const stats = db.prepare(`
        SELECT COUNT(*) as total_attempts,
               AVG(CASE WHEN status='submitted' THEN percentage END) as avg_score,
               SUM(CASE WHEN status='submitted' AND passed=1 THEN 1 ELSE 0 END) as passed_count,
               SUM(CASE WHEN status='submitted' THEN 1 ELSE 0 END) as submitted_count,
               SUM(CASE WHEN status='in_progress' THEN 1 ELSE 0 END) as active_now
        FROM test_sessions WHERE test_id = ?
      `).get(test.id);
      return {
        ...test,
        totalAttempts: stats.submitted_count || 0,
        avgScore: stats.avg_score ? Math.round(stats.avg_score) : 0,
        passRate: stats.submitted_count > 0 ? Math.round(((stats.passed_count || 0) / stats.submitted_count) * 100) : 0,
        activeNow: stats.active_now || 0
      };
    });
    res.json({ tests: testsWithStats });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ============================================================
// DESIGN TEST (Super Admin + Admin)
// ============================================================

// Get question bank stats (subjects, counts by difficulty/type)
app.get('/api/super/question-stats', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const subjects = db.prepare(`
      SELECT subject, difficulty, type, COUNT(*) as cnt
      FROM questions GROUP BY subject, difficulty, type
    `).all();

    const subjectMap = {};
    for (const row of subjects) {
      if (!subjectMap[row.subject]) {
        subjectMap[row.subject] = { name: row.subject, total: 0, byDifficulty: {}, byType: {} };
      }
      const s = subjectMap[row.subject];
      s.total += row.cnt;
      s.byDifficulty[row.difficulty] = (s.byDifficulty[row.difficulty] || 0) + row.cnt;
      s.byType[row.type || 'mcq'] = (s.byType[row.type || 'mcq'] || 0) + row.cnt;
    }

    const codingProblemsCount = db.prepare("SELECT COUNT(*) as cnt FROM coding_problems WHERE evaluation_type = 'python'").get().cnt;
    res.json({ subjects: Object.values(subjectMap), pythonCodingProblems: codingProblemsCount });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/admin/question-stats', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const subjects = db.prepare(`
      SELECT subject, difficulty, type, COUNT(*) as cnt
      FROM questions GROUP BY subject, difficulty, type
    `).all();

    const subjectMap = {};
    for (const row of subjects) {
      if (!subjectMap[row.subject]) {
        subjectMap[row.subject] = { name: row.subject, total: 0, byDifficulty: {}, byType: {} };
      }
      const s = subjectMap[row.subject];
      s.total += row.cnt;
      s.byDifficulty[row.difficulty] = (s.byDifficulty[row.difficulty] || 0) + row.cnt;
      s.byType[row.type || 'mcq'] = (s.byType[row.type || 'mcq'] || 0) + row.cnt;
    }

    const codingProblemsCount = db.prepare("SELECT COUNT(*) as cnt FROM coding_problems WHERE evaluation_type = 'python'").get().cnt;
    res.json({ subjects: Object.values(subjectMap), pythonCodingProblems: codingProblemsCount });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// List custom-designed tests
app.get('/api/super/design-tests', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const tests = db.prepare(`
      SELECT t.*, u.name as creator_name,
        (SELECT COUNT(*) FROM test_sessions WHERE test_id = t.id) as total_attempts,
        (SELECT COUNT(*) FROM test_sessions WHERE test_id = t.id AND status = 'submitted') as submitted_count,
        (SELECT ROUND(AVG(percentage), 1) FROM test_sessions WHERE test_id = t.id AND status = 'submitted') as avg_score
      FROM tests t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.is_custom = 1
      ORDER BY t.created_at DESC
    `).all();
    res.json({ tests });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/admin/design-tests', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const tests = db.prepare(`
      SELECT t.*, u.name as creator_name,
        (SELECT COUNT(*) FROM test_sessions WHERE test_id = t.id) as total_attempts,
        (SELECT COUNT(*) FROM test_sessions WHERE test_id = t.id AND status = 'submitted') as submitted_count,
        (SELECT ROUND(AVG(percentage), 1) FROM test_sessions WHERE test_id = t.id AND status = 'submitted') as avg_score
      FROM tests t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.is_custom = 1 AND t.created_by = ?
      ORDER BY t.created_at DESC
    `).all(req.user.id);
    res.json({ tests });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// Create a custom test
app.post('/api/super/design-test', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const { name, description, subjects, totalQuestions, difficultyDistribution, typeQuotas, durationMinutes, passingPercentage, codingProblemCount, availableFrom, availableUntil } = req.body;
    const codingCount = parseInt(codingProblemCount) || 0;
    const mcqCount = parseInt(totalQuestions) || 0;

    if (!name) return res.status(400).json({ error: 'Test name is required' });
    if (mcqCount === 0 && codingCount === 0) return res.status(400).json({ error: 'Must include MCQ questions or coding problems (or both)' });

    if (mcqCount > 0) {
      if (!subjects || !subjects.length) return res.status(400).json({ error: 'Select at least one subject for MCQ questions' });
      const placeholders = subjects.map(() => '?').join(',');
      const availableCount = db.prepare(`SELECT COUNT(*) as cnt FROM questions WHERE subject IN (${placeholders})`).get(...subjects);
      if (availableCount.cnt < mcqCount) {
        return res.status(400).json({ error: `Only ${availableCount.cnt} questions available for selected subjects. Requested ${mcqCount}.` });
      }
    }

    if (codingCount > 0) {
      const availableCoding = db.prepare("SELECT COUNT(*) as cnt FROM coding_problems WHERE evaluation_type = 'python'").get();
      if (availableCoding.cnt < codingCount) {
        return res.status(400).json({ error: `Only ${availableCoding.cnt} Python coding problems available. Requested ${codingCount}.` });
      }
    }

    const testType = codingCount > 0 && mcqCount > 0 ? 'hybrid' : codingCount > 0 ? 'coding' : 'mcq';
    const testId = 'test_custom_' + uuidv4().substring(0, 8);

    db.prepare(`
      INSERT INTO tests (id, name, description, port, duration_minutes, passing_percentage, total_questions, test_type, is_custom, created_by, subjects_json, difficulty_json, type_quotas_json, coding_problem_count, available_from, available_until)
      VALUES (?, ?, ?, 3000, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      testId, name, description || '',
      durationMinutes || 90, passingPercentage || 60, mcqCount, testType,
      req.user.id,
      JSON.stringify(subjects || []),
      JSON.stringify(difficultyDistribution || { Easy: 30, Medium: 50, Hard: 20 }),
      JSON.stringify(typeQuotas || {}),
      codingCount,
      availableFrom || null, availableUntil || null
    );

    logAudit(db, {
      actorId: req.user.id, actorRole: req.user.role,
      action: 'create_custom_test', targetType: 'test', targetId: testId,
      details: { name, subjects, mcqCount, codingCount, testType, durationMinutes }
    });

    const created = db.prepare('SELECT * FROM tests WHERE id = ?').get(testId);
    res.status(201).json(created);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/admin/design-test', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const { name, description, subjects, totalQuestions, difficultyDistribution, typeQuotas, durationMinutes, passingPercentage, codingProblemCount, availableFrom, availableUntil } = req.body;
    const codingCount = parseInt(codingProblemCount) || 0;
    const mcqCount = parseInt(totalQuestions) || 0;

    if (!name) return res.status(400).json({ error: 'Test name is required' });
    if (mcqCount === 0 && codingCount === 0) return res.status(400).json({ error: 'Must include MCQ questions or coding problems (or both)' });

    if (mcqCount > 0) {
      if (!subjects || !subjects.length) return res.status(400).json({ error: 'Select at least one subject for MCQ questions' });
      const placeholders = subjects.map(() => '?').join(',');
      const availableCount = db.prepare(`SELECT COUNT(*) as cnt FROM questions WHERE subject IN (${placeholders})`).get(...subjects);
      if (availableCount.cnt < mcqCount) {
        return res.status(400).json({ error: `Only ${availableCount.cnt} questions available for selected subjects. Requested ${mcqCount}.` });
      }
    }

    if (codingCount > 0) {
      const availableCoding = db.prepare("SELECT COUNT(*) as cnt FROM coding_problems WHERE evaluation_type = 'python'").get();
      if (availableCoding.cnt < codingCount) {
        return res.status(400).json({ error: `Only ${availableCoding.cnt} Python coding problems available. Requested ${codingCount}.` });
      }
    }

    const testType = codingCount > 0 && mcqCount > 0 ? 'hybrid' : codingCount > 0 ? 'coding' : 'mcq';
    const testId = 'test_custom_' + uuidv4().substring(0, 8);

    db.prepare(`
      INSERT INTO tests (id, name, description, port, duration_minutes, passing_percentage, total_questions, test_type, is_custom, created_by, subjects_json, difficulty_json, type_quotas_json, coding_problem_count, available_from, available_until)
      VALUES (?, ?, ?, 3000, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      testId, name, description || '',
      durationMinutes || 90, passingPercentage || 60, mcqCount, testType,
      req.user.id,
      JSON.stringify(subjects || []),
      JSON.stringify(difficultyDistribution || { Easy: 30, Medium: 50, Hard: 20 }),
      JSON.stringify(typeQuotas || {}),
      codingCount,
      availableFrom || null, availableUntil || null
    );

    logAudit(db, {
      actorId: req.user.id, actorRole: req.user.role,
      action: 'create_custom_test', targetType: 'test', targetId: testId,
      details: { name, subjects, mcqCount, codingCount, testType, durationMinutes }
    });

    const created = db.prepare('SELECT * FROM tests WHERE id = ?').get(testId);
    res.status(201).json(created);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// Delete (deactivate) a custom test
app.delete('/api/super/design-test/:testId', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const test = db.prepare('SELECT * FROM tests WHERE id = ? AND is_custom = 1').get(req.params.testId);
    if (!test) return res.status(404).json({ error: 'Custom test not found' });

    db.prepare('UPDATE tests SET is_active = 0 WHERE id = ?').run(req.params.testId);

    logAudit(db, {
      actorId: req.user.id, actorRole: req.user.role,
      action: 'deactivate_custom_test', targetType: 'test', targetId: req.params.testId,
      details: { name: test.name }
    });

    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/admin/design-test/:testId', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const test = db.prepare('SELECT * FROM tests WHERE id = ? AND is_custom = 1 AND created_by = ?').get(req.params.testId, req.user.id);
    if (!test) return res.status(404).json({ error: 'Custom test not found' });

    db.prepare('UPDATE tests SET is_active = 0 WHERE id = ?').run(req.params.testId);

    logAudit(db, {
      actorId: req.user.id, actorRole: req.user.role,
      action: 'deactivate_custom_test', targetType: 'test', targetId: req.params.testId,
      details: { name: test.name }
    });

    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// Hard-delete a custom test (super_admin)
app.delete('/api/super/design-test/:testId/hard', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const testId = req.params.testId;
    const test = db.prepare('SELECT * FROM tests WHERE id = ?').get(testId);
    if (!test) return res.status(404).json({ error: 'Test not found' });

    // Count submitted sessions for warning in UI
    const submittedCount = db.prepare(
      "SELECT COUNT(*) as c FROM test_sessions WHERE test_id = ? AND status = 'submitted'"
    ).get(testId)?.c || 0;

    // Delete in correct FK order — no separate session_answers or test_questions table
    db.transaction(() => {
      db.prepare('DELETE FROM test_sessions WHERE test_id = ?').run(testId);
      db.prepare('DELETE FROM test_permissions WHERE test_id = ?').run(testId);
      db.prepare('DELETE FROM coding_test_cases WHERE problem_id IN (SELECT id FROM coding_problems WHERE test_id = ?)').run(testId);
      db.prepare('DELETE FROM coding_problems WHERE test_id = ?').run(testId);
      db.prepare('DELETE FROM tests WHERE id = ?').run(testId);
    })();

    logAudit(db, {
      actorId: req.user.id, actorRole: req.user.role,
      action: 'delete_custom_test', targetType: 'test', targetId: testId,
      details: { name: test.name, submittedSessionsDeleted: submittedCount }
    });

    res.json({ success: true, deletedSessions: submittedCount });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error: ' + err.message }); }
});

// ============================================================

app.get('/api/super/results', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const results = db.prepare(`
      SELECT ts.id, ts.candidate_id, ts.test_id, ts.status, ts.start_time, ts.end_time,
             ts.score, ts.total_questions, ts.percentage, ts.passed, ts.grade, ts.time_taken,
             u.name as candidate_name, u.email as candidate_email,
             t.name as test_name
      FROM test_sessions ts
      JOIN users u ON ts.candidate_id = u.id
      JOIN tests t ON ts.test_id = t.id
      WHERE ts.status = 'submitted'
      ORDER BY ts.end_time DESC
    `).all();
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Results CSV export — must come BEFORE /:sessionId to avoid route conflict
app.get('/api/super/results/export', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT ts.id as session_id, u.name as candidate_name, u.email as candidate_email,
             t.name as test_name, ts.score, ts.total_questions, ts.percentage,
             ts.passed, ts.grade, ts.time_taken, ts.start_time, ts.end_time,
             ts.tab_violations
      FROM test_sessions ts
      JOIN users u ON ts.candidate_id = u.id
      JOIN tests t ON ts.test_id = t.id
      WHERE ts.status = 'submitted'
      ORDER BY ts.end_time DESC
    `).all();
    const csv = buildResultsCsv(rows);
    const filename = `skillforge_results_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Paginated results — BEFORE /:sessionId
app.get('/api/super/results/paginated', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(200, parseInt(req.query.limit) || 25);
    const offset = (page - 1) * limit;
    const { testId, search } = req.query;
    let where = "ts.status = 'submitted'";
    const params = [];
    if (testId) { where += ' AND ts.test_id = ?'; params.push(testId); }
    if (search) { where += ' AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ?)'; params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`); }
    const total = db.prepare(`SELECT COUNT(*) as c FROM test_sessions ts JOIN users u ON ts.candidate_id = u.id JOIN tests t ON ts.test_id = t.id WHERE ${where}`).get(...params).c;
    const results = db.prepare(`
      SELECT ts.id, ts.candidate_id, ts.test_id, ts.start_time, ts.end_time,
             ts.score, ts.total_questions, ts.percentage, ts.passed, ts.grade, ts.time_taken, ts.tab_violations,
             u.name as candidate_name, u.email as candidate_email, t.name as test_name
      FROM test_sessions ts JOIN users u ON ts.candidate_id = u.id JOIN tests t ON ts.test_id = t.id
      WHERE ${where} ORDER BY ts.end_time DESC LIMIT ? OFFSET ?
    `).all(...params, limit, offset);
    res.json({ results, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// Question analytics — BEFORE /:sessionId
app.get('/api/super/results/question-analytics', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const { testId } = req.query;
    const sessions = testId
      ? db.prepare("SELECT answers_json, questions_json FROM test_sessions WHERE test_id = ? AND status = 'submitted'").all(testId)
      : db.prepare("SELECT answers_json, questions_json FROM test_sessions WHERE status = 'submitted'").all();
    const questionStats = {};
    for (const session of sessions) {
      let answers = {}, questions = [];
      try { answers = JSON.parse(session.answers_json || '{}'); } catch(e) {}
      try { questions = JSON.parse(session.questions_json || '[]'); } catch(e) {}
      for (const q of questions) {
        if (!questionStats[q.id]) {
          questionStats[q.id] = { id: q.id, question: (q.question || '').substring(0, 80), subject: q.subject,
            difficulty: q.difficulty, attempts: 0, correct: 0, wrong: 0, skipped: 0 };
        }
        const stat = questionStats[q.id];
        stat.attempts++;
        const given = answers[q.id];
        if (given === undefined || given === null) { stat.skipped++; }
        else if (given === q.answer) { stat.correct++; }
        else { stat.wrong++; }
      }
    }
    const stats = Object.values(questionStats).map(s => ({
      ...s, accuracy: s.attempts > 0 ? Math.round((s.correct / s.attempts) * 100) : 0
    })).sort((a, b) => a.accuracy - b.accuracy);
    res.json({ stats: stats.slice(0, 100), total: stats.length });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/super/results/:sessionId', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const session = db.prepare(`
      SELECT ts.*, u.name as candidate_name, u.email as candidate_email, t.name as test_name
      FROM test_sessions ts
      JOIN users u ON ts.candidate_id = u.id
      JOIN tests t ON ts.test_id = t.id
      WHERE ts.id = ?
    `).get(req.params.sessionId);

    if (!session) return res.status(404).json({ error: 'Session not found' });

    if (session.questions_json) session.questions = JSON.parse(session.questions_json);
    if (session.answers_json) session.answers = JSON.parse(session.answers_json);
    if (session.result_json) session.result = JSON.parse(session.result_json);

    delete session.questions_json;
    delete session.answers_json;
    delete session.result_json;

    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// ADMIN ENDPOINTS (filtered to own candidates)
// ============================================================

app.get('/api/admin/candidates', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const candidates = db.prepare(`
      SELECT u.id, u.name, u.email, u.is_active, u.created_at, u.last_login,
             (SELECT COUNT(*) FROM test_permissions WHERE candidate_id = u.id) as permissions_count,
             (SELECT COUNT(*) FROM test_sessions WHERE candidate_id = u.id AND status = 'submitted') as completed_tests,
             (SELECT ROUND(AVG(percentage),1) FROM test_sessions WHERE candidate_id = u.id AND status = 'submitted') as avg_score,
             (SELECT MAX(percentage) FROM test_sessions WHERE candidate_id = u.id AND status = 'submitted') as best_score
      FROM users u
      WHERE u.role = 'candidate' AND u.created_by = ?
      ORDER BY u.created_at DESC
    `).all(req.user.id);
    res.json(candidates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/candidates', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password required' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email);
    if (existing) return res.status(409).json({ error: 'Email already exists' });

    const id = uuidv4();
    const hashed = hashPassword(password);

    db.prepare(`
      INSERT INTO users (id, name, email, password, role, created_by)
      VALUES (?, ?, ?, ?, 'candidate', ?)
    `).run(id, name, email, hashed, req.user.id);

    logAudit(db, {
      actorId: req.user.id, actorRole: 'admin',
      action: 'create_candidate', targetType: 'user', targetId: id,
      details: { name, email }
    });

    res.status(201).json({ id, name, email, role: 'candidate' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/candidates/:id', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const candidate = db.prepare(`
      SELECT id, name, email, is_active, created_at, last_login, created_by
      FROM users WHERE id = ? AND role = 'candidate' AND created_by = ?
    `).get(req.params.id, req.user.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    candidate.permissions = db.prepare(`
      SELECT tp.*, t.name as test_name, t.duration_minutes
      FROM test_permissions tp
      JOIN tests t ON tp.test_id = t.id
      WHERE tp.candidate_id = ?
    `).all(req.params.id);

    candidate.sessions = db.prepare(`
      SELECT ts.*, t.name as test_name
      FROM test_sessions ts
      JOIN tests t ON ts.test_id = t.id
      WHERE ts.candidate_id = ?
      ORDER BY ts.created_at DESC
    `).all(req.params.id);

    res.json(candidate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/candidates/:id/revoke', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const candidate = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'candidate' AND created_by = ?").get(req.params.id, req.user.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    db.prepare("UPDATE test_permissions SET status = 'revoked' WHERE candidate_id = ? AND status = 'granted'").run(req.params.id);

    logAudit(db, {
      actorId: req.user.id, actorRole: 'admin',
      action: 'revoke_all_permissions', targetType: 'user', targetId: req.params.id, details: {}
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE admin candidate permanently (only their own candidates)
app.delete('/api/admin/candidates/:id', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const candidate = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'candidate' AND created_by = ?").get(req.params.id, req.user.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    db.prepare("DELETE FROM test_permissions WHERE candidate_id = ?").run(req.params.id);
    db.prepare("DELETE FROM test_sessions WHERE candidate_id = ?").run(req.params.id);
    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);

    logAudit(db, {
      actorId: req.user.id, actorRole: 'admin',
      action: 'delete_candidate', targetType: 'user', targetId: req.params.id, details: {}
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/permissions', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const { candidateId, testId, maxAttempts } = req.body;
    if (!candidateId || !testId) {
      return res.status(400).json({ error: 'candidateId and testId required' });
    }

    // Verify candidate belongs to this admin
    const candidate = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'candidate' AND created_by = ?").get(candidateId, req.user.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found or not yours' });

    const id = uuidv4();
    db.prepare(`
      INSERT INTO test_permissions (id, candidate_id, test_id, max_attempts, granted_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, candidateId, testId, maxAttempts || 1, req.user.id);

    logAudit(db, {
      actorId: req.user.id, actorRole: 'admin',
      action: 'grant_permission', targetType: 'test_permission', targetId: id,
      details: { candidateId, testId, maxAttempts: maxAttempts || 1 }
    });

    res.status(201).json({ id, candidateId, testId, status: 'granted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/permissions/:id/revoke', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const perm = db.prepare(`
      SELECT tp.id FROM test_permissions tp
      JOIN users u ON tp.candidate_id = u.id
      WHERE tp.id = ? AND u.created_by = ?
    `).get(req.params.id, req.user.id);
    if (!perm) return res.status(404).json({ error: 'Permission not found' });

    db.prepare("UPDATE test_permissions SET status = 'revoked' WHERE id = ?").run(req.params.id);
    logAudit(db, {
      actorId: req.user.id, actorRole: 'admin',
      action: 'revoke_permission', targetType: 'test_permission', targetId: req.params.id, details: {}
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/permissions/:id/restore', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const perm = db.prepare(`
      SELECT tp.id FROM test_permissions tp
      JOIN users u ON tp.candidate_id = u.id
      WHERE tp.id = ? AND u.created_by = ?
    `).get(req.params.id, req.user.id);
    if (!perm) return res.status(404).json({ error: 'Permission not found' });

    db.prepare("UPDATE test_permissions SET status = 'granted' WHERE id = ?").run(req.params.id);
    logAudit(db, {
      actorId: req.user.id, actorRole: 'admin',
      action: 'restore_permission', targetType: 'test_permission', targetId: req.params.id, details: {}
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/permissions/:id/reset', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const perm = db.prepare(`
      SELECT tp.id FROM test_permissions tp
      JOIN users u ON tp.candidate_id = u.id
      WHERE tp.id = ? AND u.created_by = ?
    `).get(req.params.id, req.user.id);
    if (!perm) return res.status(404).json({ error: 'Permission not found' });

    db.prepare("UPDATE test_permissions SET max_attempts = max_attempts + 1, status = 'granted' WHERE id = ?").run(req.params.id);
    logAudit(db, {
      actorId: req.user.id, actorRole: 'admin',
      action: 'reset_permission', targetType: 'test_permission', targetId: req.params.id, details: {}
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/permissions/:id/analysis', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const perm = db.prepare(`
      SELECT tp.id FROM test_permissions tp
      JOIN users u ON tp.candidate_id = u.id
      WHERE tp.id = ? AND u.created_by = ?
    `).get(req.params.id, req.user.id);
    if (!perm) return res.status(404).json({ error: 'Permission not found' });

    const { expiresAt } = req.body;
    const expires = expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    db.prepare("UPDATE test_permissions SET analysis_only = 1, analysis_expires_at = ? WHERE id = ?").run(expires, req.params.id);
    logAudit(db, {
      actorId: req.user.id, actorRole: 'admin',
      action: 'grant_analysis', targetType: 'test_permission', targetId: req.params.id,
      details: { expiresAt: expires }
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin results CSV export — must come BEFORE /:sessionId
app.get('/api/admin/results/export', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT ts.id as session_id, u.name as candidate_name, u.email as candidate_email,
             t.name as test_name, ts.score, ts.total_questions, ts.percentage,
             ts.passed, ts.grade, ts.time_taken, ts.start_time, ts.end_time,
             ts.tab_violations
      FROM test_sessions ts
      JOIN users u ON ts.candidate_id = u.id
      JOIN tests t ON ts.test_id = t.id
      WHERE ts.status = 'submitted' AND u.created_by = ?
      ORDER BY ts.end_time DESC
    `).all(req.user.id);
    const csv = buildResultsCsv(rows);
    const filename = `skillforge_results_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Paginated results (admin) — BEFORE /:sessionId
app.get('/api/admin/results/paginated', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(200, parseInt(req.query.limit) || 25);
    const offset = (page - 1) * limit;
    const { testId, search } = req.query;
    let where = "ts.status = 'submitted' AND u.created_by = ?";
    const params = [req.user.id];
    if (testId) { where += ' AND ts.test_id = ?'; params.push(testId); }
    if (search) { where += ' AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ?)'; params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`); }
    const total = db.prepare(`SELECT COUNT(*) as c FROM test_sessions ts JOIN users u ON ts.candidate_id = u.id JOIN tests t ON ts.test_id = t.id WHERE ${where}`).get(...params).c;
    const results = db.prepare(`
      SELECT ts.id, ts.candidate_id, ts.test_id, ts.start_time, ts.end_time,
             ts.score, ts.total_questions, ts.percentage, ts.passed, ts.grade, ts.time_taken, ts.tab_violations,
             u.name as candidate_name, u.email as candidate_email, t.name as test_name
      FROM test_sessions ts JOIN users u ON ts.candidate_id = u.id JOIN tests t ON ts.test_id = t.id
      WHERE ${where} ORDER BY ts.end_time DESC LIMIT ? OFFSET ?
    `).all(...params, limit, offset);
    res.json({ results, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// Question analytics (admin) — BEFORE /:sessionId
app.get('/api/admin/results/question-analytics', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const { testId } = req.query;
    const sessions = testId
      ? db.prepare(`SELECT ts.answers_json, ts.questions_json FROM test_sessions ts JOIN users u ON ts.candidate_id = u.id WHERE ts.test_id = ? AND ts.status = 'submitted' AND u.created_by = ?`).all(testId, req.user.id)
      : db.prepare(`SELECT ts.answers_json, ts.questions_json FROM test_sessions ts JOIN users u ON ts.candidate_id = u.id WHERE ts.status = 'submitted' AND u.created_by = ?`).all(req.user.id);
    const questionStats = {};
    for (const session of sessions) {
      let answers = {}, questions = [];
      try { answers = JSON.parse(session.answers_json || '{}'); } catch(e) {}
      try { questions = JSON.parse(session.questions_json || '[]'); } catch(e) {}
      for (const q of questions) {
        if (!questionStats[q.id]) {
          questionStats[q.id] = { id: q.id, question: (q.question || '').substring(0, 80), subject: q.subject,
            difficulty: q.difficulty, attempts: 0, correct: 0, wrong: 0, skipped: 0 };
        }
        const stat = questionStats[q.id];
        stat.attempts++;
        const given = answers[q.id];
        if (given === undefined || given === null) { stat.skipped++; }
        else if (given === q.answer) { stat.correct++; }
        else { stat.wrong++; }
      }
    }
    const stats = Object.values(questionStats).map(s => ({
      ...s, accuracy: s.attempts > 0 ? Math.round((s.correct / s.attempts) * 100) : 0
    })).sort((a, b) => a.accuracy - b.accuracy);
    res.json({ stats: stats.slice(0, 100), total: stats.length });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/admin/results/:sessionId', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const session = db.prepare(`
      SELECT ts.*, u.name as candidate_name, u.email as candidate_email, t.name as test_name
      FROM test_sessions ts
      JOIN users u ON ts.candidate_id = u.id
      JOIN tests t ON ts.test_id = t.id
      WHERE ts.id = ? AND u.created_by = ?
    `).get(req.params.sessionId, req.user.id);

    if (!session) return res.status(404).json({ error: 'Session not found' });

    if (session.questions_json) session.questions = JSON.parse(session.questions_json);
    if (session.answers_json) session.answers = JSON.parse(session.answers_json);
    if (session.result_json) session.result = JSON.parse(session.result_json);

    delete session.questions_json;
    delete session.answers_json;
    delete session.result_json;

    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/dashboard', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const candidates = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'candidate' AND created_by = ?").get(req.user.id).c;
    const testsAssigned = db.prepare(`
      SELECT COUNT(*) as c FROM test_permissions tp
      JOIN users u ON tp.candidate_id = u.id
      WHERE u.created_by = ?
    `).get(req.user.id).c;
    const totalSessions = db.prepare(`
      SELECT COUNT(*) as c FROM test_sessions ts
      JOIN users u ON ts.candidate_id = u.id
      WHERE u.created_by = ?
    `).get(req.user.id).c;
    const liveSessions = db.prepare(`
      SELECT COUNT(*) as c FROM test_sessions ts
      JOIN users u ON ts.candidate_id = u.id
      WHERE u.created_by = ? AND ts.status = 'in_progress'
    `).get(req.user.id).c;
    const submittedSessions = db.prepare(`
      SELECT COUNT(*) as c FROM test_sessions ts
      JOIN users u ON ts.candidate_id = u.id
      WHERE u.created_by = ? AND ts.status = 'submitted'
    `).get(req.user.id).c;
    const passCount = db.prepare(`
      SELECT COUNT(*) as c FROM test_sessions ts
      JOIN users u ON ts.candidate_id = u.id
      WHERE u.created_by = ? AND ts.status = 'submitted' AND ts.passed = 1
    `).get(req.user.id).c;
    const passRate = submittedSessions > 0 ? Math.round((passCount / submittedSessions) * 100) : 0;

    // Recent activity
    const recentActivity = db.prepare(`
      SELECT al.*, u.name as actor_name
      FROM audit_log al
      LEFT JOIN users u ON al.actor_id = u.id
      WHERE al.actor_id = ? OR al.target_id IN (
        SELECT id FROM users WHERE created_by = ?
      )
      ORDER BY al.timestamp DESC
      LIMIT 20
    `).all(req.user.id, req.user.id).map(a => ({
      ...a,
      details: a.details ? JSON.parse(a.details) : {}
    }));

    res.json({ candidates, testsAssigned, liveSessions, passRate, totalSessions, recentActivity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/results', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const results = db.prepare(`
      SELECT ts.id, ts.candidate_id, ts.test_id, ts.status, ts.start_time, ts.end_time,
             ts.score, ts.total_questions, ts.percentage, ts.passed, ts.grade, ts.time_taken,
             u.name as candidate_name, u.email as candidate_email,
             t.name as test_name
      FROM test_sessions ts
      JOIN users u ON ts.candidate_id = u.id
      JOIN tests t ON ts.test_id = t.id
      WHERE ts.status = 'submitted' AND u.created_by = ?
      ORDER BY ts.end_time DESC
    `).all(req.user.id);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/live', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const sessions = db.prepare(`
      SELECT ts.id, ts.candidate_id, ts.test_id, ts.start_time, ts.answers_json,
             u.name as candidate_name, u.email as candidate_email,
             t.name as test_name, t.duration_minutes
      FROM test_sessions ts
      JOIN users u ON ts.candidate_id = u.id
      JOIN tests t ON ts.test_id = t.id
      WHERE ts.status = 'in_progress' AND u.created_by = ?
    `).all(req.user.id);

    const now = new Date();
    const live = sessions.map(s => {
      const startTime = new Date(parseDbTime(s.start_time));
      const elapsedMs = now - startTime;
      const elapsedMin = Math.floor(elapsedMs / 60000);
      const remainingMin = Math.max(0, s.duration_minutes - elapsedMin);
      const answers = s.answers_json ? JSON.parse(s.answers_json) : {};
      return {
        sessionId: s.id,
        candidateId: s.candidate_id,
        candidateName: s.candidate_name,
        candidateEmail: s.candidate_email,
        testId: s.test_id,
        testName: s.test_name,
        startTime: s.start_time,
        timeElapsed: elapsedMin,
        timeRemaining: remainingMin,
        durationMinutes: s.duration_minutes,
        answeredCount: Object.keys(answers).length
      };
    });
    res.json(live);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// CANDIDATE ENDPOINTS
// ============================================================

app.get('/api/candidate/dashboard', authMiddleware, requireRole('candidate'), (req, res) => {
  try {
    const candidateId = req.user.id;
    const fullUser = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(candidateId);

    const permissions = db.prepare(`
      SELECT tp.*, t.name as test_name, t.description as test_description,
             t.duration_minutes, t.passing_percentage, t.total_questions,
             t.test_type, u.name as granted_by_name
      FROM test_permissions tp
      JOIN tests t ON tp.test_id = t.id
      LEFT JOIN users u ON tp.granted_by = u.id
      WHERE tp.candidate_id = ?
      ORDER BY tp.granted_at DESC
    `).all(candidateId);

    const tests = permissions.map(perm => {
      const sessions = db.prepare(`
        SELECT id, status, start_time, end_time, score, total_questions, percentage, passed, grade, time_taken
        FROM test_sessions
        WHERE candidate_id = ? AND test_id = ?
        ORDER BY start_time DESC
      `).all(candidateId, perm.test_id);

      let status = 'locked';
      const inProgress = sessions.find(s => s.status === 'in_progress');
      if (perm.status === 'revoked') status = 'locked';
      else if (perm.analysis_only === 1) {
        status = (perm.analysis_expires_at && new Date(perm.analysis_expires_at) < new Date()) ? 'expired' : 'analysis_only';
      }
      else if (inProgress) status = 'in_progress';
      else if (parseInt(perm.attempt_count) >= parseInt(perm.max_attempts)) status = 'completed';
      else if (perm.status === 'granted') status = 'available';

      const bestSession = sessions.filter(s => s.status === 'submitted').sort((a, b) => (b.percentage || 0) - (a.percentage || 0))[0];

      return {
        // camelCase for frontend
        testId: perm.test_id,
        testName: perm.test_name,
        testDescription: perm.test_description || '',
        testType: perm.test_type || 'mcq',
        durationMinutes: perm.duration_minutes,
        totalQuestions: perm.total_questions,
        passPercentage: perm.passing_percentage || 60,
        grantedBy: perm.granted_by_name || 'Admin',
        grantedAt: perm.granted_at,
        permissionId: perm.id,
        status,
        analysisOnly: perm.analysis_only === 1,
        analysisExpiresAt: perm.analysis_expires_at,
        maxAttempts: perm.max_attempts,
        attemptCount: perm.attempt_count,
        bestScore: bestSession ? Math.round(bestSession.percentage) : null,
        lastSessionId: sessions[0]?.id || null,
        currentSessionId: inProgress?.id || null,
        sessions,
        // Also include snake_case for backward compat
        test_id: perm.test_id,
        test_name: perm.test_name,
        test_description: perm.test_description || '',
        duration: perm.duration_minutes,
        question_count: perm.total_questions,
        assigned_by_name: perm.granted_by_name || 'Admin',
        assigned_at: perm.granted_at,
        best_score: bestSession ? Math.round(bestSession.percentage) : null,
        last_session_id: sessions[0]?.id || null,
        current_session_id: inProgress?.id || null,
      };
    });

    res.json({
      candidate: { id: fullUser?.id || candidateId, name: fullUser?.name || req.user.name, email: fullUser?.email || req.user.email },
      tests
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Candidate performance analytics
app.get('/api/candidate/analytics', authMiddleware, requireRole('candidate'), (req, res) => {
  try {
    const candidateId = req.user.id;
    const sessions = db.prepare(`
      SELECT ts.*, t.name as test_name, t.total_questions, t.passing_percentage, t.duration_minutes
      FROM test_sessions ts JOIN tests t ON ts.test_id = t.id
      WHERE ts.candidate_id = ? AND ts.status = 'submitted' ORDER BY ts.end_time ASC
    `).all(candidateId);

    if (sessions.length === 0) return res.json({ hasData: false, sessions: [] });

    const sessionData = sessions.map((s, idx) => {
      let subjectScores = {}, review = [];
      try { const r = JSON.parse(s.result_json || '{}'); subjectScores = r.subjectScores || {}; review = r.review || []; } catch(e) {}
      return {
        sessionId: s.id, testId: s.test_id, testName: s.test_name, attemptNumber: idx + 1,
        submittedAt: s.end_time || s.submitted_at, score: s.score || 0,
        total: s.total_questions || 100, percentage: Math.round(s.percentage || 0),
        passed: s.passed === 1, timeTaken: s.time_taken || 0, subjectScores,
        correctCount: review.filter(q => q.isCorrect).length,
        wrongCount: review.filter(q => !q.isCorrect && q.userAnswer != null).length,
        skippedCount: review.filter(q => q.userAnswer == null).length,
      };
    });

    const totalAttempts = sessionData.length;
    const totalPassed = sessionData.filter(s => s.passed).length;
    const avgScore = Math.round(sessionData.reduce((a, s) => a + s.percentage, 0) / totalAttempts);
    const bestScore = Math.max(...sessionData.map(s => s.percentage));
    const latestScore = sessionData[sessionData.length - 1].percentage;
    const improvement = sessionData.length > 1 ? latestScore - sessionData[0].percentage : 0;

    // Build subject aggregation from actual question subjects per session
    const subjectAgg = {};
    sessionData.forEach(s => {
      // Get actual subjects from this session's questions
      const sess = db.prepare('SELECT questions_json FROM test_sessions WHERE id=?').get(s.sessionId);
      const validSubjects = new Set();
      try {
        const qs = JSON.parse(sess?.questions_json || '[]');
        qs.forEach(q => { if (q.subject) validSubjects.add(q.subject); });
      } catch(e) {}

      Object.entries(s.subjectScores || {}).forEach(([subj, data]) => {
        if (validSubjects.size > 0 && !validSubjects.has(subj)) return;
        if (!data.total || data.total === 0) return;
        if (!subjectAgg[subj]) subjectAgg[subj] = { correct: 0, total: 0, testNames: [] };
        subjectAgg[subj].correct += data.correct || 0;
        subjectAgg[subj].total += data.total || 0;
        if (!subjectAgg[subj].testNames.includes(s.testName)) subjectAgg[subj].testNames.push(s.testName);
      });
    });

    const subjectBreakdown = Object.entries(subjectAgg)
      .filter(([, d]) => d.total > 0)
      .map(([name, d]) => ({
        name, correct: d.correct, total: d.total,
        percentage: Math.round((d.correct / d.total) * 100),
        testNames: d.testNames,
      })).sort((a, b) => b.percentage - a.percentage);

    const trend = sessionData.map((s, i) => ({
      label: `Attempt ${i + 1}`, testName: s.testName, percentage: s.percentage, passed: s.passed,
      date: s.submittedAt ? new Date(s.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '',
    }));

    res.json({
      hasData: true,
      overview: { totalAttempts, totalPassed, avgScore, bestScore, latestScore, improvement },
      trend, subjectBreakdown,
      strengths: subjectBreakdown.filter(s => s.percentage >= 70 && s.total >= 3).slice(0, 3),
      weaknesses: subjectBreakdown.filter(s => s.percentage < 60 && s.total >= 3).sort((a,b) => a.percentage - b.percentage).slice(0, 3),
      sessions: sessionData,
    });
  } catch (err) { console.error('Analytics error:', err); res.status(500).json({ error: err.message }); }
});

app.post('/api/candidate/tests/:testId/start', authMiddleware, requireRole('candidate'), (req, res) => {
  try {
    const { testId } = req.params;
    const candidateId = req.user.id;

    // Find valid permission
    const permission = db.prepare(`
      SELECT tp.*, t.duration_minutes, t.total_questions, t.name as test_name, t.test_type,
             t.available_from, t.available_until
      FROM test_permissions tp
      JOIN tests t ON tp.test_id = t.id
      WHERE tp.candidate_id = ? AND tp.test_id = ? AND tp.status = 'granted'
      ORDER BY tp.granted_at DESC
      LIMIT 1
    `).get(candidateId, testId);

    if (!permission) {
      return res.status(403).json({ error: 'No valid permission for this test' });
    }

    if (permission.attempt_count >= permission.max_attempts) {
      return res.status(403).json({ error: 'Maximum attempts reached' });
    }

    // Check scheduling window
    const now = new Date();
    if (permission.available_from && new Date(permission.available_from) > now) {
      return res.status(403).json({ error: `This test is not available yet. Opens on ${new Date(permission.available_from).toLocaleString()}.` });
    }
    if (permission.available_until && new Date(permission.available_until) < now) {
      return res.status(403).json({ error: `This test has expired. It was available until ${new Date(permission.available_until).toLocaleString()}.` });
    }

    const testType = permission.test_type || 'mcq';

    // ===== CODING TEST =====
    if (testType === 'coding') {
      // Check for existing in-progress coding session — resume it
      const existingCoding = db.prepare(`
        SELECT id, start_time, duration_minutes, code_map_json, coding_results_json, best_scores_json
        FROM test_sessions WHERE candidate_id = ? AND test_id = ? AND status = 'in_progress'
      `).get(candidateId, testId);

      // Load problems (safe = no solution/hidden data)
      const allProblems = db.prepare('SELECT * FROM coding_problems WHERE test_id = ?').all(testId);
      const safeProblems = allProblems.map(p => ({
        id: p.id, section: p.section, title: p.title, difficulty: p.difficulty,
        points: p.points, timeLimit: p.time_limit, description: p.description,
        inputFormat: p.input_format, outputFormat: p.output_format,
        constraints: p.constraints_text, starterCode: p.starter_code,
        evaluationType: p.evaluation_type,
        sampleTestCases: db.prepare('SELECT input, expected_output as expectedOutput, explanation FROM coding_test_cases WHERE problem_id = ? AND is_hidden = 0').all(p.id)
      }));
      const totalPoints = allProblems.reduce((s, p) => s + p.points, 0);
      const sections = [...new Set(allProblems.map(p => p.section))];

      if (existingCoding) {
        const codeMap = JSON.parse(existingCoding.code_map_json || '{}');
        const codingResults = JSON.parse(existingCoding.coding_results_json || '{}');
        const bestScores = JSON.parse(existingCoding.best_scores_json || '{}');
        return res.json({
          testType: 'coding', sessionId: existingCoding.id,
          startTime: existingCoding.start_time, start_time: existingCoding.start_time,
          problems: safeProblems, totalPoints, sections,
          durationMinutes: existingCoding.duration_minutes || permission.duration_minutes,
          testName: permission.test_name, resumed: true,
          codeMap, codingResults, bestScores
        });
      }

      const sessionId = uuidv4();
      db.prepare(`
        INSERT INTO test_sessions (id, candidate_id, test_id, permission_id, status, duration_minutes,
          total_questions, code_map_json, coding_results_json, best_scores_json)
        VALUES (?, ?, ?, ?, 'in_progress', ?, ?, '{}', '{}', '{}')
      `).run(sessionId, candidateId, testId, permission.id, permission.duration_minutes, allProblems.length);

      logAudit(db, {
        actorId: candidateId, actorRole: 'candidate',
        action: 'start_test', targetType: 'test_session', targetId: sessionId,
        details: { testId, testType: 'coding', problemCount: allProblems.length, totalPoints }
      });

      return res.json({
        testType: 'coding', sessionId,
        startTime: new Date().toISOString(), start_time: new Date().toISOString(),
        problems: safeProblems, totalPoints, sections,
        durationMinutes: permission.duration_minutes, testName: permission.test_name
      });
    }

    // ===== HYBRID TEST (MCQ + Python Coding) =====
    if (testType === 'hybrid') {
      const testRecord = db.prepare('SELECT * FROM tests WHERE id = ?').get(testId);
      const codingCount = testRecord ? (testRecord.coding_problem_count || 0) : 0;

      // Check for existing hybrid session
      const existingHybrid = db.prepare(`
        SELECT id, start_time, duration_minutes, questions_json, answers_json,
               code_map_json, coding_results_json, best_scores_json, hybrid_problem_ids_json
        FROM test_sessions WHERE candidate_id = ? AND test_id = ? AND status = 'in_progress'
      `).get(candidateId, testId);

      // Helper to load safe problem data
      const loadSafeProblem = (pid) => {
        const p = db.prepare('SELECT * FROM coding_problems WHERE id = ?').get(pid);
        if (!p) return null;
        return {
          id: p.id, section: p.section, title: p.title, difficulty: p.difficulty,
          points: p.points, timeLimit: p.time_limit, description: p.description,
          inputFormat: p.input_format, outputFormat: p.output_format,
          constraints: p.constraints_text, starterCode: p.starter_code,
          evaluationType: p.evaluation_type,
          sampleTestCases: db.prepare('SELECT input, expected_output as expectedOutput, explanation FROM coding_test_cases WHERE problem_id = ? AND is_hidden = 0').all(pid)
        };
      };

      let selectedProblemIds;
      if (existingHybrid) {
        selectedProblemIds = JSON.parse(existingHybrid.hybrid_problem_ids_json || '[]');
      } else {
        const allPythonProblems = db.prepare("SELECT id FROM coding_problems WHERE evaluation_type = 'python' ORDER BY id").all();
        const shuffled = seededShuffle(allPythonProblems.map(p => p.id), hashCode(candidateId + testId + '_coding'));
        selectedProblemIds = shuffled.slice(0, codingCount);
      }

      const safeProblems = selectedProblemIds.map(loadSafeProblem).filter(Boolean);
      const totalPoints = safeProblems.reduce((s, p) => s + p.points, 0);

      if (existingHybrid) {
        const questions = JSON.parse(existingHybrid.questions_json || '[]');
        const safeQuestions = questions.map(q => ({
          displayId: q.displayId, id: q.id, subject: q.subject, topic: q.topic,
          difficulty: q.difficulty, type: q.type, question: q.question,
          options: q.options, code_snippet: q.code_snippet
        }));
        const answers = JSON.parse(existingHybrid.answers_json || '{}');
        return res.json({
          testType: 'hybrid', sessionId: existingHybrid.id, resumed: true,
          startTime: existingHybrid.start_time, start_time: existingHybrid.start_time,
          durationMinutes: existingHybrid.duration_minutes || permission.duration_minutes,
          testName: permission.test_name,
          questions: safeQuestions, answers, answeredCount: Object.keys(answers).length,
          problems: safeProblems, totalPoints,
          codeMap: JSON.parse(existingHybrid.code_map_json || '{}'),
          bestScores: JSON.parse(existingHybrid.best_scores_json || '{}'),
          codingResults: JSON.parse(existingHybrid.coding_results_json || '{}')
        });
      }

      const sessionId = uuidv4();
      const mcqResult = (testRecord.total_questions > 0) ? buildQuestionSet(db, testId, sessionId) : { questions: [], safeQuestions: [] };
      const mcqQuestions = mcqResult ? (mcqResult.questions || []) : [];
      const safeMcqQuestions = mcqResult ? (mcqResult.safeQuestions || []) : [];

      db.prepare(`
        INSERT INTO test_sessions (id, candidate_id, test_id, permission_id, status, duration_minutes,
          questions_json, answers_json, total_questions, code_map_json, coding_results_json, best_scores_json, hybrid_problem_ids_json)
        VALUES (?, ?, ?, ?, 'in_progress', ?, ?, '{}', ?, '{}', '{}', '{}', ?)
      `).run(sessionId, candidateId, testId, permission.id, permission.duration_minutes,
        JSON.stringify(mcqQuestions), mcqQuestions.length, JSON.stringify(selectedProblemIds));

      logAudit(db, {
        actorId: candidateId, actorRole: 'candidate',
        action: 'start_test', targetType: 'test_session', targetId: sessionId,
        details: { testId, testType: 'hybrid', mcqCount: mcqQuestions.length, codingCount: safeProblems.length, totalPoints }
      });

      return res.json({
        testType: 'hybrid', sessionId,
        startTime: new Date().toISOString(), start_time: new Date().toISOString(),
        durationMinutes: permission.duration_minutes, testName: permission.test_name,
        questions: safeMcqQuestions, totalQuestions: mcqQuestions.length,
        problems: safeProblems, totalPoints
      });
    }

    // ===== MCQ TEST (existing flow) =====

    // Check for existing in-progress session — resume it
    const existing = db.prepare(`
      SELECT id, start_time, questions_json, answers_json, duration_minutes
      FROM test_sessions
      WHERE candidate_id = ? AND test_id = ? AND status = 'in_progress'
    `).get(candidateId, testId);

    if (existing) {
      const questions = existing.questions_json ? JSON.parse(existing.questions_json) : [];
      const answers = existing.answers_json ? JSON.parse(existing.answers_json) : {};
      const safeQuestions = questions.map(q => ({
        displayId: q.displayId,
        id: q.id,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty,
        type: q.type,
        question: q.question,
        options: q.options,
        code_snippet: q.code_snippet
      }));
      return res.json({
        testType: 'mcq',
        sessionId: existing.id,
        startTime: existing.start_time,
        start_time: existing.start_time,
        questions: safeQuestions,
        safeQuestions,
        answers,
        answeredCount: Object.keys(answers).length,
        durationMinutes: existing.duration_minutes || permission.duration_minutes,
        testName: permission.test_name,
        resumed: true
      });
    }

    const sessionId = uuidv4();
    const result = buildQuestionSet(db, testId, sessionId);

    if (!result) {
      // Java/Selenium rounds - create session without questions
      db.prepare(`
        INSERT INTO test_sessions (id, candidate_id, test_id, permission_id, status, duration_minutes, answers_json)
        VALUES (?, ?, ?, ?, 'in_progress', ?, '{}')
      `).run(sessionId, candidateId, testId, permission.id, permission.duration_minutes);

      return res.json({
        testType: 'mcq',
        sessionId,
        startTime: new Date().toISOString(),
        safeQuestions: [],
        durationMinutes: permission.duration_minutes,
        message: 'This test uses external question system'
      });
    }

    db.prepare(`
      INSERT INTO test_sessions (id, candidate_id, test_id, permission_id, status, duration_minutes, questions_json, answers_json, total_questions)
      VALUES (?, ?, ?, ?, 'in_progress', ?, ?, '{}', ?)
    `).run(
      sessionId, candidateId, testId, permission.id,
      permission.duration_minutes,
      JSON.stringify(result.questions),
      result.questions.length
    );

    logAudit(db, {
      actorId: candidateId, actorRole: 'candidate',
      action: 'start_test', targetType: 'test_session', targetId: sessionId,
      details: { testId, questionCount: result.questions.length }
    });

    res.json({
      testType: 'mcq',
      sessionId,
      startTime: new Date().toISOString(),
      start_time: new Date().toISOString(),
      questions: result.safeQuestions,
      safeQuestions: result.safeQuestions,
      durationMinutes: permission.duration_minutes
    });
  } catch (err) {
    console.error('Start test error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Check for active session (resume support)
app.get('/api/candidate/tests/:testId/active-session', authMiddleware, requireRole('candidate'), (req, res) => {
  try {
    const { testId } = req.params;
    const candidateId = req.user.id;
    const session = db.prepare(`
      SELECT * FROM test_sessions
      WHERE candidate_id = ? AND test_id = ? AND status = 'in_progress'
      ORDER BY start_time DESC LIMIT 1
    `).get(candidateId, testId);

    if (!session) return res.json({ hasActiveSession: false });

    const test = db.prepare('SELECT * FROM tests WHERE id=?').get(testId);
    const testType = test?.test_type || 'mcq';
    const durationMs = (test?.duration_minutes || 90) * 60 * 1000;
    const startMs = parseDbTime(session.start_time);
    const remainingMs = durationMs - (Date.now() - startMs);

    if (remainingMs <= 0) {
      // Auto-submit timed out session
      if (testType === 'coding') {
        const bestScores = JSON.parse(session.best_scores_json || '{}');
        const allProblems = db.prepare('SELECT * FROM coding_problems WHERE test_id = ?').all(testId);
        const totalPoints = allProblems.reduce((s, p) => s + p.points, 0);
        const earnedPoints = Object.values(bestScores).reduce((a, b) => a + b, 0);
        const pct = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
        db.prepare(`UPDATE test_sessions SET status='timed_out', end_time=datetime('now'),
          score=?, total_questions=?, percentage=?, passed=?, time_taken=? WHERE id=?`)
          .run(earnedPoints, allProblems.length, pct, pct >= 60 ? 1 : 0, test?.duration_minutes || 90, session.id);
      } else {
        const questions = JSON.parse(session.questions_json || '[]');
        const answers = JSON.parse(session.answers_json || '{}');
        let score = 0;
        questions.forEach(q => {
          const ua = answers[String(q.id)];
          if (ua !== undefined && parseInt(ua) === parseInt(q.answer_index || q.answer)) score++;
        });
        const total = questions.length;
        const pct = total > 0 ? Math.round((score / total) * 100) : 0;
        db.prepare(`UPDATE test_sessions SET status='timed_out', end_time=datetime('now'),
          score=?, total_questions=?, percentage=?, passed=?, time_taken=? WHERE id=?`)
          .run(score, total, pct, pct >= 60 ? 1 : 0, test?.duration_minutes || 90, session.id);
      }
      db.prepare('UPDATE test_permissions SET attempt_count=attempt_count+1 WHERE candidate_id=? AND test_id=?')
        .run(candidateId, testId);
      return res.json({ hasActiveSession: false, timedOut: true });
    }

    // Coding test active session
    if (testType === 'coding') {
      const allProblems = db.prepare('SELECT * FROM coding_problems WHERE test_id = ?').all(testId);
      const safeProblems = allProblems.map(p => ({
        id: p.id, section: p.section, title: p.title, difficulty: p.difficulty,
        points: p.points, timeLimit: p.time_limit, description: p.description,
        inputFormat: p.input_format, outputFormat: p.output_format,
        constraints: p.constraints_text, starterCode: p.starter_code,
        evaluationType: p.evaluation_type,
        sampleTestCases: db.prepare('SELECT input, expected_output as expectedOutput, explanation FROM coding_test_cases WHERE problem_id = ? AND is_hidden = 0').all(p.id)
      }));
      const totalPoints = allProblems.reduce((s, p) => s + p.points, 0);
      const sections = [...new Set(allProblems.map(p => p.section))];
      const codeMap = JSON.parse(session.code_map_json || '{}');
      const codingResults = JSON.parse(session.coding_results_json || '{}');
      const bestScores = JSON.parse(session.best_scores_json || '{}');

      return res.json({
        hasActiveSession: true, testType: 'coding', sessionId: session.id,
        problems: safeProblems, totalPoints, sections,
        startTime: session.start_time, durationMinutes: test?.duration_minutes || 90,
        testName: test?.name || '', remainingSeconds: Math.floor(remainingMs / 1000),
        codeMap, codingResults, bestScores
      });
    }

    // Hybrid test active session
    if (testType === 'hybrid') {
      const selectedProblemIds = JSON.parse(session.hybrid_problem_ids_json || '[]');
      const safeProblems = selectedProblemIds.map(pid => {
        const p = db.prepare('SELECT * FROM coding_problems WHERE id = ?').get(pid);
        if (!p) return null;
        return {
          id: p.id, section: p.section, title: p.title, difficulty: p.difficulty,
          points: p.points, timeLimit: p.time_limit, description: p.description,
          inputFormat: p.input_format, outputFormat: p.output_format,
          constraints: p.constraints_text, starterCode: p.starter_code,
          evaluationType: p.evaluation_type,
          sampleTestCases: db.prepare('SELECT input, expected_output as expectedOutput, explanation FROM coding_test_cases WHERE problem_id = ? AND is_hidden = 0').all(pid)
        };
      }).filter(Boolean);
      const totalPoints = safeProblems.reduce((s, p) => s + p.points, 0);
      const questions = JSON.parse(session.questions_json || '[]');
      const safeQs = questions.map(q => ({
        id: q.id, displayId: q.displayId, subject: q.subject, topic: q.topic,
        difficulty: q.difficulty, type: q.type, question: q.question, options: q.options, code_snippet: q.code_snippet || ''
      }));
      return res.json({
        hasActiveSession: true, testType: 'hybrid', sessionId: session.id,
        questions: safeQs, answers: JSON.parse(session.answers_json || '{}'),
        problems: safeProblems, totalPoints,
        startTime: session.start_time, durationMinutes: test?.duration_minutes || 90,
        testName: test?.name || '', remainingSeconds: Math.floor(remainingMs / 1000),
        codeMap: JSON.parse(session.code_map_json || '{}'),
        codingResults: JSON.parse(session.coding_results_json || '{}'),
        bestScores: JSON.parse(session.best_scores_json || '{}')
      });
    }

    // MCQ test active session
    const questions = JSON.parse(session.questions_json || '[]');
    const answers = JSON.parse(session.answers_json || '{}');
    const safeQs = questions.map(q => ({
      id: q.id, displayId: q.displayId, difficulty: q.difficulty, type: q.type,
      question: q.question, options: q.options, code_snippet: q.code_snippet || ''
    }));
    res.json({
      hasActiveSession: true, testType: 'mcq', sessionId: session.id, questions: safeQs, answers,
      startTime: session.start_time, durationMinutes: test?.duration_minutes || 90,
      testName: test?.name || '', answeredCount: Object.keys(answers).length,
      remainingSeconds: Math.floor(remainingMs / 1000)
    });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

app.get('/api/candidate/tests/:testId/session/:sessionId', authMiddleware, requireRole('candidate'), (req, res) => {
  try {
    const session = db.prepare(`
      SELECT id, start_time, answers_json, questions_json, status, duration_minutes
      FROM test_sessions
      WHERE id = ? AND candidate_id = ? AND test_id = ?
    `).get(req.params.sessionId, req.user.id, req.params.testId);

    if (!session) return res.status(404).json({ error: 'Session not found' });

    const answers = session.answers_json ? JSON.parse(session.answers_json) : {};
    const questions = session.questions_json ? JSON.parse(session.questions_json) : [];

    // Return safe questions (no answers/explanations)
    const safeQuestions = questions.map(q => ({
      displayId: q.displayId,
      id: q.id,
      subject: q.subject,
      topic: q.topic,
      difficulty: q.difficulty,
      type: q.type,
      question: q.question,
      options: q.options,
      code_snippet: q.code_snippet
    }));

    res.json({
      sessionId: session.id,
      startTime: session.start_time,
      start_time: session.start_time,
      status: session.status,
      durationMinutes: session.duration_minutes,
      answers,
      answeredCount: Object.keys(answers).length,
      questions: safeQuestions,
      safeQuestions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/candidate/tests/:testId/session/:sessionId/answer', authMiddleware, requireRole('candidate'), (req, res) => {
  try {
    const { sessionId } = req.params;
    const candidateId = req.user.id;

    const session = db.prepare(`
      SELECT id, answers_json, status FROM test_sessions
      WHERE id = ? AND candidate_id = ?
    `).get(sessionId, candidateId);

    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status !== 'in_progress') {
      return res.status(400).json({ error: 'Session is not in progress' });
    }

    const { questionId, selectedOption } = req.body;
    const optionIndex = parseInt(selectedOption, 10);

    const answers = session.answers_json ? JSON.parse(session.answers_json) : {};
    answers[questionId] = optionIndex;

    db.prepare('UPDATE test_sessions SET answers_json = ? WHERE id = ?')
      .run(JSON.stringify(answers), sessionId);

    res.json({ saved: true, answeredCount: Object.keys(answers).length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Rate limiter for code execution (30 runs per 5 minutes per IP)
const codeRunRateLimit = rateLimit({ windowMs: 5 * 60 * 1000, max: 30, message: 'Too many code executions. Please wait a few minutes.' });

// ===== CODING: Run code against sample test cases =====
app.post('/api/candidate/tests/:testId/run', authMiddleware, requireRole('candidate'), codeRunRateLimit, (req, res) => {
  try {
    const { testId } = req.params;
    const { sessionId, problemId, code } = req.body;
    const candidateId = req.user.id;

    const session = db.prepare('SELECT * FROM test_sessions WHERE id = ? AND candidate_id = ? AND test_id = ? AND status = ?')
      .get(sessionId, candidateId, testId, 'in_progress');
    if (!session) return res.status(404).json({ error: 'Session not found or not active' });

    const problem = db.prepare('SELECT * FROM coding_problems WHERE id = ? AND test_id = ?').get(problemId, testId);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    // Save code
    const codeMap = JSON.parse(session.code_map_json || '{}');
    codeMap[problemId] = code;
    db.prepare('UPDATE test_sessions SET code_map_json = ? WHERE id = ?').run(JSON.stringify(codeMap), sessionId);

    // Get sample test cases
    const sampleCases = db.prepare('SELECT input, expected_output as expectedOutput, explanation FROM coding_test_cases WHERE problem_id = ? AND is_hidden = 0').all(problemId);

    // Build problem object for runProblem
    const probObj = {
      evaluationType: problem.evaluation_type,
      requiredKeywords: problem.required_keywords ? JSON.parse(problem.required_keywords) : [],
      requiredCount: problem.required_count || 0,
      sqlSetup: problem.sql_setup || '',
      timeLimit: problem.time_limit || 5000
    };

    const results = runProblem(probObj, code, sampleCases);
    const passedCount = results.filter(r => r.passed).length;

    // Enrich results with the original input/explanation for display
    const enriched = results.map((r, i) => ({
      ...r,
      input: sampleCases[i]?.input ?? '',
      explanation: sampleCases[i]?.explanation ?? ''
    }));

    res.json({
      results: enriched, passedCases: passedCount, totalCases: sampleCases.length,
      status: passedCount === sampleCases.length ? 'accepted' : (results[0]?.status || 'wrong_answer')
    });
  } catch (err) {
    console.error('Run code error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== CODING: Run code with custom stdin input =====
app.post('/api/candidate/tests/:testId/run-custom', authMiddleware, requireRole('candidate'), codeRunRateLimit, (req, res) => {
  try {
    const { testId } = req.params;
    const { sessionId, problemId, code, customInput } = req.body;
    const candidateId = req.user.id;

    const session = db.prepare('SELECT * FROM test_sessions WHERE id = ? AND candidate_id = ? AND test_id = ? AND status = ?')
      .get(sessionId, candidateId, testId, 'in_progress');
    if (!session) return res.status(404).json({ error: 'Session not found or not active' });

    const problem = db.prepare('SELECT * FROM coding_problems WHERE id = ? AND test_id = ?').get(problemId, testId);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    // Save code
    const codeMap = JSON.parse(session.code_map_json || '{}');
    codeMap[problemId] = code;
    db.prepare('UPDATE test_sessions SET code_map_json = ? WHERE id = ?').run(JSON.stringify(codeMap), sessionId);

    const { executePython, executeSql, sanitizePythonCode } = require('./codeExecution');
    const evalType = problem.evaluation_type || 'python';

    let result;
    if (evalType === 'sql') {
      result = executeSql(code, problem.sql_setup || '');
    } else {
      const check = sanitizePythonCode(code);
      if (!check.safe) {
        return res.json({ status: 'runtime_error', output: '', error: check.reason, timeTaken: 0 });
      }
      result = executePython(code, customInput || '', problem.time_limit || 10000);
    }

    res.json({
      status: result.status,
      output: result.output || '',
      error: result.error || null,
      timeTaken: result.timeTaken || 0
    });
  } catch (err) {
    console.error('Custom run error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== CODING: Submit code against hidden test cases =====
app.post('/api/candidate/tests/:testId/submit-code', authMiddleware, requireRole('candidate'), (req, res) => {
  try {
    const { testId } = req.params;
    const { sessionId, problemId, code } = req.body;
    const candidateId = req.user.id;

    const session = db.prepare('SELECT * FROM test_sessions WHERE id = ? AND candidate_id = ? AND test_id = ? AND status = ?')
      .get(sessionId, candidateId, testId, 'in_progress');
    if (!session) return res.status(404).json({ error: 'Session not found or not active' });

    const problem = db.prepare('SELECT * FROM coding_problems WHERE id = ? AND test_id = ?').get(problemId, testId);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    // Save code
    const codeMap = JSON.parse(session.code_map_json || '{}');
    codeMap[problemId] = code;

    // Get hidden test cases
    const hiddenCases = db.prepare('SELECT input, expected_output as expectedOutput FROM coding_test_cases WHERE problem_id = ? AND is_hidden = 1').all(problemId);

    const probObj = {
      evaluationType: problem.evaluation_type,
      requiredKeywords: problem.required_keywords ? JSON.parse(problem.required_keywords) : [],
      requiredCount: problem.required_count || 0,
      sqlSetup: problem.sql_setup || '',
      timeLimit: problem.time_limit || 5000
    };

    const results = runProblem(probObj, code, hiddenCases);
    const passedCount = results.filter(r => r.passed).length;
    const totalCases = hiddenCases.length;
    const score = passedCount === totalCases ? problem.points : Math.floor((passedCount / totalCases) * problem.points);
    const overallStatus = passedCount === totalCases ? 'accepted' : (results.find(r => !r.passed)?.status || 'wrong_answer');

    // Update best scores
    const bestScores = JSON.parse(session.best_scores_json || '{}');
    const prevBest = bestScores[problemId] || 0;
    if (score > prevBest) bestScores[problemId] = score;

    // Update coding results
    const codingResults = JSON.parse(session.coding_results_json || '{}');
    codingResults[problemId] = { passedCases: passedCount, totalCases, score, maxScore: problem.points, status: overallStatus };

    db.prepare('UPDATE test_sessions SET code_map_json = ?, coding_results_json = ?, best_scores_json = ? WHERE id = ?')
      .run(JSON.stringify(codeMap), JSON.stringify(codingResults), JSON.stringify(bestScores), sessionId);

    // Return per-case summary — mask input/expected for hidden cases
    const caseSummary = results.map(r => ({
      caseNum: r.caseNum,
      passed: r.passed,
      status: r.status,
      timeTaken: r.timeTaken || 0,
      // For wrong_answer or runtime_error, expose the actual output so candidate can debug
      output: r.passed ? null : (r.output || ''),
      error: r.error || null
    }));

    res.json({ passedCases: passedCount, totalCases, score, maxScore: problem.points, status: overallStatus, caseSummary });
  } catch (err) {
    console.error('Submit code error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/candidate/tests/:testId/session/:sessionId/submit', authMiddleware, requireRole('candidate'), (req, res) => {
  try {
    const { sessionId, testId } = req.params;
    const candidateId = req.user.id;

    const session = db.prepare(`
      SELECT * FROM test_sessions
      WHERE id = ? AND candidate_id = ? AND test_id = ?
    `).get(sessionId, candidateId, testId);

    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status === 'submitted') {
      return res.status(400).json({ error: 'Session already submitted' });
    }

    // Determine test type
    const test = db.prepare('SELECT * FROM tests WHERE id = ?').get(testId);
    const testType = test?.test_type || 'mcq';
    const passingPct = test ? test.passing_percentage : 60;

    // Time taken
    const startTimeMs = parseDbTime(session.start_time);
    const endTime = new Date();
    const timeTaken = Math.floor((endTime - startTimeMs) / 1000);

    let score, total, percentage, passed, grade, resultJson;

    if (testType === 'coding') {
      // ===== CODING TEST SUBMIT =====
      const bestScores = JSON.parse(session.best_scores_json || '{}');
      const codingResults = JSON.parse(session.coding_results_json || '{}');
      const allProblems = db.prepare('SELECT * FROM coding_problems WHERE test_id = ?').all(testId);
      const totalPoints = allProblems.reduce((s, p) => s + p.points, 0);
      const earnedPoints = Object.values(bestScores).reduce((a, b) => a + b, 0);

      // Section scores
      const sectionScores = {};
      const sections = [...new Set(allProblems.map(p => p.section))];
      sections.forEach(s => { sectionScores[s] = { total: 0, earned: 0 }; });

      const problemSummary = allProblems.map(p => {
        const best = bestScores[p.id] || 0;
        const result = codingResults[p.id] || { status: 'not_attempted', passedCases: 0, totalCases: 0, score: 0 };
        sectionScores[p.section].total += p.points;
        sectionScores[p.section].earned += best;
        return {
          id: p.id, title: p.title, section: p.section, difficulty: p.difficulty,
          maxPoints: p.points, earned: best, status: result.status,
          passedCases: result.passedCases || 0, totalCases: result.totalCases || 0
        };
      });

      score = earnedPoints;
      total = allProblems.length;
      percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100 * 100) / 100 : 0;
      passed = percentage >= passingPct ? 1 : 0;

      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B';
      else if (percentage >= 60) grade = 'C';
      else if (percentage >= 50) grade = 'D';
      else grade = 'F';

      resultJson = JSON.stringify({
        testType: 'coding', earnedPoints, totalPoints, sectionScores, problemSummary,
        score: earnedPoints, total: allProblems.length, percentage, passed, grade, timeTaken
      });

      db.prepare(`
        UPDATE test_sessions
        SET status = 'submitted', end_time = datetime('now'), score = ?, total_questions = ?,
            percentage = ?, passed = ?, grade = ?, time_taken = ?, result_json = ?
        WHERE id = ?
      `).run(score, total, percentage, passed, grade, timeTaken, resultJson, sessionId);

      // Update permission
      if (session.permission_id) {
        const perm = db.prepare('SELECT * FROM test_permissions WHERE id = ?').get(session.permission_id);
        if (perm) {
          const newAttemptCount = perm.attempt_count + 1;
          const newStatus = newAttemptCount >= perm.max_attempts ? 'completed' : 'granted';
          db.prepare('UPDATE test_permissions SET attempt_count = ?, status = ? WHERE id = ?')
            .run(newAttemptCount, newStatus, session.permission_id);
        }
      }

      logAudit(db, {
        actorId: candidateId, actorRole: 'candidate',
        action: 'submit_test', targetType: 'test_session', targetId: sessionId,
        details: { testId, testType: 'coding', earnedPoints, totalPoints, percentage, passed, grade }
      });

      return res.json({
        testType: 'coding', earnedPoints, totalPoints, percentage,
        passed: !!passed, grade, sectionScores, problemSummary, timeTaken
      });
    }

    if (testType === 'hybrid') {
      // Score MCQ part
      const questions = JSON.parse(session.questions_json || '[]');
      const submittedAnswers = req.body.answers || {};
      const sessionAnswers = JSON.parse(session.answers_json || '{}');
      let mcqScore = 0;
      questions.forEach(q => {
        const ua = submittedAnswers[String(q.id)] ?? sessionAnswers[String(q.id)];
        if (ua !== undefined && parseInt(ua) === parseInt(q.answer_index !== undefined ? q.answer_index : q.answer)) mcqScore++;
      });

      // Score coding part
      const bestScores = JSON.parse(session.best_scores_json || '{}');
      const codingEarned = Object.values(bestScores).reduce((a, b) => a + b, 0);
      const problemIds = JSON.parse(session.hybrid_problem_ids_json || '[]');
      const codingTotal = problemIds.reduce((sum, pid) => {
        const p = db.prepare('SELECT points FROM coding_problems WHERE id = ?').get(pid);
        return sum + (p ? p.points : 0);
      }, 0);

      // Combined score: MCQ out of questions count, coding out of total points
      const mcqTotal = questions.length;
      // Calculate percentage: weight both parts equally if both exist, otherwise just one
      let percentage;
      if (mcqTotal > 0 && codingTotal > 0) {
        const mcqPct = mcqTotal > 0 ? (mcqScore / mcqTotal) * 100 : 0;
        const codingPct = codingTotal > 0 ? (codingEarned / codingTotal) * 100 : 0;
        percentage = Math.round((mcqPct + codingPct) / 2);
      } else if (mcqTotal > 0) {
        percentage = Math.round((mcqScore / mcqTotal) * 100);
      } else {
        percentage = codingTotal > 0 ? Math.round((codingEarned / codingTotal) * 100) : 0;
      }

      const test = db.prepare('SELECT * FROM tests WHERE id = ?').get(testId);
      const passingPct = test?.passing_percentage || 60;
      const passed = percentage >= passingPct;
      const timeTaken = session.start_time ? Math.floor((Date.now() - new Date(session.start_time + 'Z').getTime()) / 60000) : 0;

      db.prepare(`
        UPDATE test_sessions SET status='submitted', end_time=datetime('now'),
          answers_json=?, score=?, total_questions=?, percentage=?, passed=?, time_taken=?,
          coding_results_json=?
        WHERE id=?
      `).run(
        JSON.stringify(submittedAnswers), mcqScore + codingEarned,
        mcqTotal + problemIds.length, percentage, passed ? 1 : 0, timeTaken,
        session.coding_results_json, session.id
      );

      db.prepare('UPDATE test_permissions SET status=?, attempt_count=attempt_count+1 WHERE candidate_id=? AND test_id=?')
        .run('completed', candidateId, testId);

      logAudit(db, { actorId: candidateId, actorRole: 'candidate', action: 'submit_test', targetType: 'test_session', targetId: session.id, details: { testType: 'hybrid', mcqScore, mcqTotal, codingEarned, codingTotal, percentage } });

      return res.json({
        result: {
          testType: 'hybrid', passed, percentage,
          mcqScore, mcqTotal, codingEarned, codingTotal,
          score: mcqScore + codingEarned, total: mcqTotal + problemIds.length,
          grade: percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'F',
          timeTaken
        }
      });
    }

    // ===== MCQ TEST SUBMIT (existing flow) =====
    const questions = session.questions_json ? JSON.parse(session.questions_json) : [];
    const answers = session.answers_json ? JSON.parse(session.answers_json) : {};

    // Score
    score = 0;
    total = questions.length;
    const subjectScores = {};

    for (const q of questions) {
      const subj = q.subject || 'General';
      if (!subjectScores[subj]) {
        subjectScores[subj] = { correct: 0, total: 0, percentage: 0 };
      }
      subjectScores[subj].total++;

      const userAnswer = answers[q.id];
      if (userAnswer !== undefined && userAnswer === q.answer) {
        score++;
        subjectScores[subj].correct++;
      }
    }

    for (const subj of Object.keys(subjectScores)) {
      const s = subjectScores[subj];
      s.percentage = s.total > 0 ? Math.round((s.correct / s.total) * 100 * 100) / 100 : 0;
    }

    percentage = total > 0 ? Math.round((score / total) * 100 * 100) / 100 : 0;
    passed = percentage >= passingPct ? 1 : 0;

    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';
    else grade = 'F';

    resultJson = JSON.stringify({ subjectScores, score, total, percentage, passed, grade, timeTaken });

    db.prepare(`
      UPDATE test_sessions
      SET status = 'submitted', end_time = datetime('now'), score = ?, total_questions = ?,
          percentage = ?, passed = ?, grade = ?, time_taken = ?, result_json = ?
      WHERE id = ?
    `).run(score, total, percentage, passed, grade, timeTaken, resultJson, sessionId);

    // Update permission
    if (session.permission_id) {
      const perm = db.prepare('SELECT * FROM test_permissions WHERE id = ?').get(session.permission_id);
      if (perm) {
        const newAttemptCount = perm.attempt_count + 1;
        const newStatus = newAttemptCount >= perm.max_attempts ? 'completed' : 'granted';
        db.prepare('UPDATE test_permissions SET attempt_count = ?, status = ? WHERE id = ?')
          .run(newAttemptCount, newStatus, session.permission_id);
      }
    }

    logAudit(db, {
      actorId: candidateId, actorRole: 'candidate',
      action: 'submit_test', targetType: 'test_session', targetId: sessionId,
      details: { testId, score, total, percentage, passed, grade }
    });

    res.json({
      score, total, percentage, passed: !!passed, grade, subjectScores,
      timeTaken
    });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/candidate/tests/:testId/sessions/:sessionId/review', authMiddleware, requireRole('candidate'), (req, res) => {
  try {
    const { testId, sessionId } = req.params;
    const candidateId = req.user.id;

    const session = db.prepare(`
      SELECT ts.*
      FROM test_sessions ts
      WHERE ts.id = ? AND ts.candidate_id = ? AND ts.test_id = ? AND ts.status IN ('submitted','timed_out')
    `).get(sessionId, candidateId, testId);

    if (!session) return res.status(404).json({ error: 'Session not found or not yet submitted' });

    // Determine test type
    const test = db.prepare('SELECT test_type FROM tests WHERE id = ?').get(testId);
    const testType = test?.test_type || 'mcq';

    if (testType === 'coding') {
      // Coding test review
      const resultData = session.result_json ? JSON.parse(session.result_json) : {};
      const codeMap = session.code_map_json ? JSON.parse(session.code_map_json) : {};
      return res.json({ testType: 'coding', result: resultData, codeMap });
    }

    // MCQ review
    const questions = session.questions_json ? JSON.parse(session.questions_json) : [];
    const answers = session.answers_json ? JSON.parse(session.answers_json) : {};

    const review = questions.map(q => {
      const userAnswer = answers[q.id];
      return {
        displayId: q.displayId,
        id: q.id,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty,
        type: q.type,
        question: q.question,
        options: q.options,
        code_snippet: q.code_snippet,
        userAnswer: userAnswer !== undefined ? userAnswer : null,
        correctAnswer: q.answer,
        isCorrect: userAnswer !== undefined && userAnswer === q.answer,
        explanation: q.explanation
      };
    });

    const score = session.score ?? review.filter(q => q.isCorrect).length;
    const total = session.total_questions ?? review.length;
    const percentage = session.percentage ?? (total > 0 ? Math.round((score / total) * 100) : 0);

    res.json({
      testType: 'mcq',
      review,
      score,
      total,
      percentage,
      passed: session.passed === 1,
      grade: percentage >= 90 ? 'A' : percentage >= 75 ? 'B' : percentage >= 60 ? 'C' : 'F'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// MONITORING
// ============================================================

app.get('/api/monitor/live', authMiddleware, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const liveSessions = db.prepare(`
      SELECT ts.id, ts.candidate_id, ts.test_id, ts.start_time, ts.answers_json,
             ts.coding_results_json, ts.best_scores_json,
             u.name as candidate_name, u.email as candidate_email,
             t.name as test_name, t.duration_minutes, t.test_type, t.total_questions
      FROM test_sessions ts
      JOIN users u ON ts.candidate_id = u.id
      JOIN tests t ON ts.test_id = t.id
      WHERE ts.status = 'in_progress'
    `).all();

    const now = new Date();
    const live = liveSessions.map(s => {
      const startTime = new Date(parseDbTime(s.start_time));
      const elapsedMs = now - startTime;
      const elapsedMin = Math.floor(elapsedMs / 60000);
      const remainingMin = Math.max(0, s.duration_minutes - elapsedMin);

      const base = {
        sessionId: s.id, candidateId: s.candidate_id,
        candidateName: s.candidate_name, candidateEmail: s.candidate_email,
        testId: s.test_id, testName: s.test_name, testType: s.test_type || 'mcq',
        startTime: s.start_time, timeElapsed: elapsedMin,
        timeRemaining: remainingMin, durationMinutes: s.duration_minutes
      };

      if (s.test_type === 'coding') {
        const codingResults = s.coding_results_json ? JSON.parse(s.coding_results_json) : {};
        const bestScores = s.best_scores_json ? JSON.parse(s.best_scores_json) : {};
        const attempted = Object.keys(codingResults).length;
        const solved = Object.values(codingResults).filter(r => r.status === 'accepted').length;
        const earnedPoints = Object.values(bestScores).reduce((a, b) => a + b, 0);
        return { ...base, attempted, solved, totalProblems: s.total_questions, earnedPoints };
      } else {
        const answers = s.answers_json ? JSON.parse(s.answers_json) : {};
        return { ...base, answeredCount: Object.keys(answers).length, totalQuestions: s.total_questions };
      }
    });
    res.json(live);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// TUNNEL
// ============================================================

let ngrokProcess = null;

app.get('/api/tunnel/status', (req, res) => {
  try {
    const lanIp = getLanIp();
    const ngrokUrl = db.prepare("SELECT value FROM config WHERE key = 'ngrok_url'").get();
    res.json({
      lanIp,
      lanUrl: `http://${lanIp}:${PORT}`,
      ngrokUrl: ngrokUrl ? ngrokUrl.value : null,
      ngrokRunning: ngrokProcess !== null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/tunnel/lan', (req, res) => {
  res.json({ ip: getLanIp(), url: `http://${getLanIp()}:${PORT}` });
});

app.post('/api/tunnel/ngrok/start', authMiddleware, requireRole('super_admin', 'admin'), (req, res) => {
  try {
    if (ngrokProcess) {
      return res.status(400).json({ error: 'ngrok already running' });
    }

    ngrokProcess = spawn('ngrok', ['http', String(PORT)], { detached: true, stdio: 'ignore' });
    ngrokProcess.unref();

    // Give ngrok a moment to start, then try to get the URL
    setTimeout(() => {
      try {
        const http = require('http');
        http.get('http://127.0.0.1:4040/api/tunnels', (resp) => {
          let data = '';
          resp.on('data', chunk => data += chunk);
          resp.on('end', () => {
            try {
              const tunnels = JSON.parse(data);
              const url = tunnels.tunnels[0]?.public_url || '';
              db.prepare("INSERT OR REPLACE INTO config (key, value, updated_at) VALUES ('ngrok_url', ?, datetime('now'))").run(url);
            } catch (e) {
              console.error('Error parsing ngrok tunnels:', e);
            }
          });
        }).on('error', (e) => {
          console.error('Error connecting to ngrok API:', e);
        });
      } catch (e) {
        console.error('ngrok URL fetch error:', e);
      }
    }, 3000);

    res.json({ success: true, message: 'ngrok starting...' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to start ngrok' });
  }
});

app.post('/api/tunnel/ngrok/stop', authMiddleware, requireRole('super_admin', 'admin'), (req, res) => {
  try {
    if (ngrokProcess) {
      ngrokProcess.kill();
      ngrokProcess = null;
    }
    db.prepare("DELETE FROM config WHERE key = 'ngrok_url'").run();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to stop ngrok' });
  }
});

// ============================================================
// ANTI-CHEAT: TAB VIOLATION TRACKING
// ============================================================

app.post('/api/candidate/tests/:testId/session/:sessionId/violation', authMiddleware, requireRole('candidate'), (req, res) => {
  try {
    const { sessionId } = req.params;
    const candidateId = req.user.id;
    const { type, timestamp } = req.body;

    const session = db.prepare(
      'SELECT id, tab_violations, violation_log_json, status FROM test_sessions WHERE id = ? AND candidate_id = ?'
    ).get(sessionId, candidateId);
    if (!session || session.status !== 'in_progress') {
      return res.status(404).json({ error: 'Session not found or not in progress' });
    }

    const violations = (session.tab_violations || 0) + 1;
    const log = JSON.parse(session.violation_log_json || '[]');
    log.push({ type: type || 'tab_switch', timestamp: timestamp || new Date().toISOString() });

    db.prepare('UPDATE test_sessions SET tab_violations = ?, violation_log_json = ? WHERE id = ?')
      .run(violations, JSON.stringify(log), sessionId);

    const warningLevel = violations >= 3 ? 'auto_submit' : violations >= 1 ? 'warning' : null;
    res.json({ violations, warningLevel });
  } catch (err) {
    console.error('Violation tracking error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// BULK CANDIDATE IMPORT
// ============================================================

app.post('/api/super/candidates/bulk-import', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const { candidates } = req.body;
    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ error: 'Candidates array is required' });
    }
    const results = { created: [], skipped: [], errors: [] };
    const insertMany = db.transaction(() => {
      for (const c of candidates) {
        if (!c.name || !c.email || !c.password) {
          results.errors.push({ email: c.email || 'unknown', reason: 'Missing name, email or password' });
          continue;
        }
        const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(c.email);
        if (existing) { results.skipped.push({ email: c.email, reason: 'Email already exists' }); continue; }
        const id = uuidv4();
        const hashed = hashPassword(c.password);
        db.prepare(`INSERT INTO users (id, name, email, password, role, created_by) VALUES (?, ?, ?, ?, 'candidate', ?)`)
          .run(id, c.name.trim(), c.email.trim(), hashed, req.user.id);
        results.created.push({ id, name: c.name, email: c.email });
      }
    });
    insertMany();
    logAudit(db, {
      actorId: req.user.id, actorRole: 'super_admin',
      action: 'bulk_import_candidates', targetType: 'user', targetId: null,
      details: { created: results.created.length, skipped: results.skipped.length, errors: results.errors.length }
    });
    res.json(results);
  } catch (err) {
    console.error('Bulk import error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/candidates/bulk-import', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const { candidates } = req.body;
    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ error: 'Candidates array is required' });
    }
    const results = { created: [], skipped: [], errors: [] };
    const insertMany = db.transaction(() => {
      for (const c of candidates) {
        if (!c.name || !c.email || !c.password) {
          results.errors.push({ email: c.email || 'unknown', reason: 'Missing name, email or password' });
          continue;
        }
        const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(c.email);
        if (existing) { results.skipped.push({ email: c.email, reason: 'Email already exists' }); continue; }
        const id = uuidv4();
        const hashed = hashPassword(c.password);
        db.prepare(`INSERT INTO users (id, name, email, password, role, created_by) VALUES (?, ?, ?, ?, 'candidate', ?)`)
          .run(id, c.name.trim(), c.email.trim(), hashed, req.user.id);
        results.created.push({ id, name: c.name, email: c.email });
      }
    });
    insertMany();
    logAudit(db, {
      actorId: req.user.id, actorRole: 'admin',
      action: 'bulk_import_candidates', targetType: 'user', targetId: null,
      details: { created: results.created.length, skipped: results.skipped.length, errors: results.errors.length }
    });
    res.json(results);
  } catch (err) {
    console.error('Bulk import error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// RESULTS EXPORT (CSV download)
// ============================================================

function buildResultsCsv(rows) {
  const header = [
    'Session ID', 'Candidate Name', 'Candidate Email', 'Test Name',
    'Score', 'Total Questions', 'Percentage (%)', 'Passed', 'Grade',
    'Time Taken (s)', 'Start Time', 'End Time', 'Tab Violations'
  ];
  const dataRows = rows.map(r => [
    r.session_id, r.candidate_name, r.candidate_email, r.test_name,
    r.score ?? '', r.total_questions ?? '', r.percentage ?? '',
    r.passed ? 'Yes' : 'No', r.grade ?? '',
    r.time_taken ?? '', r.start_time ?? '', r.end_time ?? '',
    r.tab_violations || 0
  ]);
  return [header, ...dataRows]
    .map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

// ============================================================
// LEADERBOARD
// ============================================================

function getLeaderboard(db, testId, adminId) {
  const query = adminId
    ? `SELECT u.id as candidate_id, u.name as candidate_name, u.email as candidate_email,
              ts.percentage, ts.score, ts.total_questions, ts.grade, ts.passed,
              ts.end_time as completed_at, ts.tab_violations, t.name as test_name, ts.id as session_id
       FROM test_sessions ts
       JOIN users u ON ts.candidate_id = u.id
       JOIN tests t ON ts.test_id = t.id
       WHERE ts.test_id = ? AND ts.status = 'submitted' AND u.created_by = ?
       ORDER BY ts.percentage DESC, ts.end_time ASC`
    : `SELECT u.id as candidate_id, u.name as candidate_name, u.email as candidate_email,
              ts.percentage, ts.score, ts.total_questions, ts.grade, ts.passed,
              ts.end_time as completed_at, ts.tab_violations, t.name as test_name, ts.id as session_id
       FROM test_sessions ts
       JOIN users u ON ts.candidate_id = u.id
       JOIN tests t ON ts.test_id = t.id
       WHERE ts.test_id = ? AND ts.status = 'submitted'
       ORDER BY ts.percentage DESC, ts.end_time ASC`;

  const rows = adminId ? db.prepare(query).all(testId, adminId) : db.prepare(query).all(testId);

  // Best score per candidate
  const seen = new Set();
  const deduped = [];
  for (const r of rows) {
    if (!seen.has(r.candidate_id)) {
      seen.add(r.candidate_id);
      deduped.push({ ...r, rank: deduped.length + 1 });
    }
  }
  return deduped;
}

app.get('/api/super/leaderboard', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const { testId } = req.query;
    const tests = db.prepare("SELECT id, name FROM tests WHERE is_active = 1 ORDER BY created_at DESC").all();
    if (!testId) {
      // Return overall leaderboard (all tests combined, best score per candidate per test)
      const allRows = db.prepare(`
        SELECT u.id as candidate_id, u.name as candidate_name, u.email as candidate_email,
               ts.percentage, ts.score, ts.total_questions, ts.grade, ts.passed,
               ts.end_time as completed_at, ts.tab_violations, t.name as test_name, ts.id as session_id, ts.test_id
        FROM test_sessions ts
        JOIN users u ON ts.candidate_id = u.id
        JOIN tests t ON ts.test_id = t.id
        WHERE ts.status = 'submitted'
        ORDER BY ts.percentage DESC, ts.end_time ASC
      `).all();
      const seen = new Set();
      const deduped = [];
      for (const r of allRows) {
        const key = r.candidate_id + '_' + r.test_id;
        if (!seen.has(key)) { seen.add(key); deduped.push({ ...r, rank: deduped.length + 1 }); }
      }
      return res.json({ tests, leaderboard: deduped });
    }
    const leaderboard = getLeaderboard(db, testId, null);
    res.json({ tests, leaderboard });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/leaderboard', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const { testId } = req.query;
    const tests = db.prepare("SELECT id, name FROM tests WHERE is_active = 1 ORDER BY created_at DESC").all();
    if (!testId) {
      // Return all candidates leaderboard (scoped to admin's candidates)
      const allRows = db.prepare(`
        SELECT u.id as candidate_id, u.name as candidate_name, u.email as candidate_email,
               ts.percentage, ts.score, ts.total_questions, ts.grade, ts.passed,
               ts.end_time as completed_at, ts.tab_violations, t.name as test_name, ts.id as session_id, ts.test_id
        FROM test_sessions ts
        JOIN users u ON ts.candidate_id = u.id
        JOIN tests t ON ts.test_id = t.id
        WHERE ts.status = 'submitted' AND u.created_by = ?
        ORDER BY ts.percentage DESC, ts.end_time ASC
      `).all(req.user.id);
      const seen = new Set();
      const deduped = [];
      for (const r of allRows) {
        const key = r.candidate_id + '_' + r.test_id;
        if (!seen.has(key)) { seen.add(key); deduped.push({ ...r, rank: deduped.length + 1 }); }
      }
      return res.json({ tests, leaderboard: deduped });
    }
    const leaderboard = getLeaderboard(db, testId, req.user.id);
    res.json({ tests, leaderboard });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// USER ACTIVATE/DEACTIVATE (super admin)
// ============================================================

app.put('/api/super/users/:id/status', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const { is_active } = req.body;
    if (is_active === undefined) return res.status(400).json({ error: 'is_active required' });
    db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(is_active ? 1 : 0, req.params.id);
    logAudit(db, { actorId: req.user.id, actorRole: 'super_admin',
      action: is_active ? 'activate_user' : 'deactivate_user', targetType: 'user', targetId: req.params.id, details: {} });
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ============================================================
// DB PERFORMANCE INDEXES (created once at startup)
// ============================================================
try {
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sessions_candidate ON test_sessions(candidate_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_test ON test_sessions(test_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_status ON test_sessions(status);
    CREATE INDEX IF NOT EXISTS idx_sessions_candidate_test ON test_sessions(candidate_id, test_id);
    CREATE INDEX IF NOT EXISTS idx_permissions_candidate ON test_permissions(candidate_id);
    CREATE INDEX IF NOT EXISTS idx_permissions_test ON test_permissions(test_id);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_created_by ON users(created_by);
    CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor_id);
    CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);
    CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
  `);
} catch(e) { /* indexes may already exist */ }

// ============================================================
// TEST EDIT ENDPOINTS
// ============================================================

app.put('/api/super/design-test/:testId', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const { name, description, durationMinutes, passingPercentage } = req.body;
    if (!name) return res.status(400).json({ error: 'Test name is required' });
    const test = db.prepare('SELECT * FROM tests WHERE id = ?').get(req.params.testId);
    if (!test) return res.status(404).json({ error: 'Test not found' });
    db.prepare(`
      UPDATE tests SET name = ?, description = ?, duration_minutes = ?, passing_percentage = ?
      WHERE id = ?
    `).run(name, description || test.description, durationMinutes || test.duration_minutes,
           passingPercentage || test.passing_percentage, req.params.testId);
    logAudit(db, { actorId: req.user.id, actorRole: 'super_admin', action: 'edit_test',
      targetType: 'test', targetId: req.params.testId, details: { name, durationMinutes, passingPercentage } });
    res.json(db.prepare('SELECT * FROM tests WHERE id = ?').get(req.params.testId));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/admin/design-test/:testId', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const { name, description, durationMinutes, passingPercentage } = req.body;
    if (!name) return res.status(400).json({ error: 'Test name is required' });
    const test = db.prepare('SELECT * FROM tests WHERE id = ? AND created_by = ?').get(req.params.testId, req.user.id);
    if (!test) return res.status(404).json({ error: 'Test not found or not yours' });
    db.prepare(`
      UPDATE tests SET name = ?, description = ?, duration_minutes = ?, passing_percentage = ?
      WHERE id = ?
    `).run(name, description || test.description, durationMinutes || test.duration_minutes,
           passingPercentage || test.passing_percentage, req.params.testId);
    logAudit(db, { actorId: req.user.id, actorRole: 'admin', action: 'edit_test',
      targetType: 'test', targetId: req.params.testId, details: { name, durationMinutes, passingPercentage } });
    res.json(db.prepare('SELECT * FROM tests WHERE id = ?').get(req.params.testId));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ============================================================
// PASSWORD RESET BY ADMIN
// ============================================================

app.put('/api/super/users/:id/password', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const newPassword = req.body.newPassword || req.body.password;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const user = db.prepare('SELECT id, name FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashPassword(newPassword), req.params.id);
    logAudit(db, { actorId: req.user.id, actorRole: 'super_admin', action: 'reset_password',
      targetType: 'user', targetId: req.params.id, details: { targetName: user.name } });
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/admin/candidates/:id/password', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const newPassword = req.body.newPassword || req.body.password;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const candidate = db.prepare("SELECT id, name FROM users WHERE id = ? AND role = 'candidate' AND created_by = ?").get(req.params.id, req.user.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashPassword(newPassword), req.params.id);
    logAudit(db, { actorId: req.user.id, actorRole: 'admin', action: 'reset_password',
      targetType: 'user', targetId: req.params.id, details: { targetName: candidate.name } });
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ============================================================
// CANDIDATE PROFILE UPDATE
// ============================================================

app.get('/api/candidate/profile', authMiddleware, requireRole('candidate'), (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, created_at, last_login FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const stats = db.prepare(`
      SELECT COUNT(*) as completed_tests,
             SUM(CASE WHEN passed=1 THEN 1 ELSE 0 END) as passed_count,
             ROUND(AVG(percentage),1) as avg_score,
             MAX(percentage) as best_score
      FROM test_sessions WHERE candidate_id = ? AND status = 'submitted'
    `).get(req.user.id);
    res.json({ ...user, ...(stats || {}), completed_tests: stats?.completed_tests || 0 });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/candidate/profile', authMiddleware, requireRole('candidate'), (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
    db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name.trim(), req.user.id);
    res.json({ success: true, name: name.trim() });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/candidate/profile/password', authMiddleware, requireRole('candidate'), (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Current and new password required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
    const user = db.prepare('SELECT password FROM users WHERE id = ?').get(req.user.id);
    if (!comparePassword(currentPassword, user.password)) return res.status(401).json({ error: 'Current password is incorrect' });
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashPassword(newPassword), req.user.id);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ============================================================
// BULK PERMISSION ASSIGN
// ============================================================

app.post('/api/super/permissions/bulk', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const { candidateIds, testId, maxAttempts } = req.body;
    if (!candidateIds || !Array.isArray(candidateIds) || !testId) {
      return res.status(400).json({ error: 'candidateIds array and testId required' });
    }
    const results = { granted: [], skipped: [], errors: [] };
    const insert = db.transaction(() => {
      for (const candidateId of candidateIds) {
        const candidate = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'candidate'").get(candidateId);
        if (!candidate) { results.errors.push({ candidateId, reason: 'Not found' }); continue; }
        const existing = db.prepare('SELECT id FROM test_permissions WHERE candidate_id = ? AND test_id = ? AND status = ?').get(candidateId, testId, 'granted');
        if (existing) { results.skipped.push({ candidateId, reason: 'Already assigned' }); continue; }
        const id = uuidv4();
        db.prepare('INSERT INTO test_permissions (id, candidate_id, test_id, max_attempts, granted_by) VALUES (?, ?, ?, ?, ?)')
          .run(id, candidateId, testId, maxAttempts || 1, req.user.id);
        results.granted.push({ id, candidateId });
      }
    });
    insert();
    logAudit(db, { actorId: req.user.id, actorRole: 'super_admin', action: 'bulk_grant_permissions',
      targetType: 'test', targetId: testId, details: { granted: results.granted.length, skipped: results.skipped.length } });
    res.json(results);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/admin/permissions/bulk', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const { candidateIds, testId, maxAttempts } = req.body;
    if (!candidateIds || !Array.isArray(candidateIds) || !testId) {
      return res.status(400).json({ error: 'candidateIds array and testId required' });
    }
    const results = { granted: [], skipped: [], errors: [] };
    const insert = db.transaction(() => {
      for (const candidateId of candidateIds) {
        const candidate = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'candidate' AND created_by = ?").get(candidateId, req.user.id);
        if (!candidate) { results.errors.push({ candidateId, reason: 'Not found' }); continue; }
        const existing = db.prepare('SELECT id FROM test_permissions WHERE candidate_id = ? AND test_id = ? AND status = ?').get(candidateId, testId, 'granted');
        if (existing) { results.skipped.push({ candidateId, reason: 'Already assigned' }); continue; }
        const id = uuidv4();
        db.prepare('INSERT INTO test_permissions (id, candidate_id, test_id, max_attempts, granted_by) VALUES (?, ?, ?, ?, ?)')
          .run(id, candidateId, testId, maxAttempts || 1, req.user.id);
        results.granted.push({ id, candidateId });
      }
    });
    insert();
    logAudit(db, { actorId: req.user.id, actorRole: 'admin', action: 'bulk_grant_permissions',
      targetType: 'test', targetId: testId, details: { granted: results.granted.length, skipped: results.skipped.length } });
    res.json(results);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ============================================================
// AUDIT LOG VIEWER (with pagination)
// ============================================================

app.get('/api/super/audit-log', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const offset = (page - 1) * limit;
    const { action, actorId, search } = req.query;

    let where = '1=1';
    const params = [];
    if (action) { where += ' AND al.action = ?'; params.push(action); }
    if (actorId) { where += ' AND al.actor_id = ?'; params.push(actorId); }
    if (search) {
      where += ' AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(al.action) LIKE ?)';
      const q = `%${search.toLowerCase()}%`;
      params.push(q, q, q);
    }

    const total = db.prepare(`SELECT COUNT(*) as c FROM audit_log al LEFT JOIN users u ON al.actor_id = u.id WHERE ${where}`).get(...params).c;
    const logs = db.prepare(`
      SELECT al.*, u.name as actor_name, u.email as actor_email, u.role as actor_role
      FROM audit_log al LEFT JOIN users u ON al.actor_id = u.id
      WHERE ${where}
      ORDER BY al.timestamp DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset).map(a => ({ ...a, details: a.details ? (() => { try { return JSON.parse(a.details); } catch(e) { return {}; } })() : {} }));

    const actions = db.prepare('SELECT DISTINCT action FROM audit_log ORDER BY action').all().map(r => r.action);
    res.json({ logs, total, page, limit, pages: Math.ceil(total / limit), actions });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ============================================================
// CATCH-ALL: serve frontend (MUST be last — after all API routes)
// ============================================================

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
});

// ============================================================
// INTERVIEW MODULE
// ============================================================
const { parsePDFText }   = require('./pdfParser');
const { evaluateAnswer, testConnection, MODELS } = require('./llmEvaluator');

// ── helpers ──────────────────────────────────────────────────────────────────
function getSetting(key) {
  const row = db.prepare('SELECT value FROM app_settings WHERE key = ?').get(key);
  return row ? row.value : null;
}
function setSetting(key, value) {
  db.prepare('INSERT OR REPLACE INTO app_settings(key,value,updated_at) VALUES(?,?,datetime("now"))').run(key, value);
}
function getLLMSettings() {
  return {
    provider: getSetting('llm_provider') || 'gemini',
    model:    getSetting('llm_model')    || 'gemini-1.5-flash',
    apiKey:   getSetting('llm_api_key')  || '',
  };
}

// ── Settings ─────────────────────────────────────────────────────────────────
app.get('/api/super/settings', authMiddleware, requireRole('super_admin'), (req, res) => {
  const provider = getSetting('llm_provider') || 'gemini';
  const model    = getSetting('llm_model')    || 'gemini-1.5-flash';
  const apiKey   = getSetting('llm_api_key')  || '';
  res.json({ provider, model, apiKey: apiKey ? '***' + apiKey.slice(-4) : '', hasKey: !!apiKey, models: MODELS });
});

app.put('/api/super/settings', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const { provider, model, apiKey } = req.body;
    if (provider) setSetting('llm_provider', provider);
    if (model)    setSetting('llm_model', model);
    // Only update the API key if it's a real key (not the masked placeholder starting with ***)
    if (apiKey && !apiKey.startsWith('***')) {
      setSetting('llm_api_key', apiKey.trim());
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/super/settings/test', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const settings = getLLMSettings();
    await testConnection(settings);
    res.json({ ok: true, message: 'Connection successful!' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ── Interview Tests (CRUD) ───────────────────────────────────────────────────
app.get('/api/super/interview-tests', authMiddleware, requireRole('super_admin'), (req, res) => {
  const tests = db.prepare(`
    SELECT it.*, COUNT(iq.id) as question_count,
      (SELECT COUNT(*) FROM interview_sessions WHERE test_id = it.id) as session_count
    FROM interview_tests it
    LEFT JOIN interview_questions iq ON iq.test_id = it.id
    WHERE it.is_active = 1
    GROUP BY it.id ORDER BY it.created_at DESC
  `).all();
  res.json({ tests });
});

app.post('/api/super/interview-tests/parse', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });
    const questions = parsePDFText(text);
    res.json({ questions, count: questions.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/super/interview-tests', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const { name, description, extractedText, questions } = req.body;
    if (!name) return res.status(400).json({ error: 'Test name required' });
    if (!questions || questions.length === 0) return res.status(400).json({ error: 'At least one question required' });

    const result = db.prepare(
      'INSERT INTO interview_tests(name,description,extracted_text,created_by) VALUES(?,?,?,?)'
    ).run(name, description || '', extractedText || '', req.user.id);

    const testId = result.lastInsertRowid;
    const insertQ = db.prepare(
      'INSERT INTO interview_questions(test_id,question_num,question_text,model_answer,question_type,max_score) VALUES(?,?,?,?,?,?)'
    );
    for (const [i, q] of questions.entries()) {
      insertQ.run(testId, q.questionNum || i + 1, q.questionText, q.modelAnswer, q.questionType || 'short', q.maxScore || 10);
    }
    logAudit(db, { actorId: req.user.id, actorRole: req.user.role, action: 'create_interview_test', targetType: 'interview_test', targetId: String(testId), details: { name } });
    res.json({ testId, ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/super/interview-tests/:id', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const test = db.prepare('SELECT * FROM interview_tests WHERE id = ?').get(req.params.id);
    if (!test) return res.status(404).json({ error: 'Not found' });
    const questions = db.prepare('SELECT * FROM interview_questions WHERE test_id = ? ORDER BY question_num').all(req.params.id);
    res.json({ test, questions });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/super/interview-tests/:id', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const { name, description, questions } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Test name is required' });
    db.prepare('UPDATE interview_tests SET name=?,description=? WHERE id=?').run(name.trim(), description || '', req.params.id);
    if (questions) {
      db.prepare('DELETE FROM interview_questions WHERE test_id = ?').run(req.params.id);
      const insertQ = db.prepare('INSERT INTO interview_questions(test_id,question_num,question_text,model_answer,question_type,max_score) VALUES(?,?,?,?,?,?)');
      for (const [i, q] of questions.entries()) {
        insertQ.run(req.params.id, q.questionNum || i + 1, q.questionText, q.modelAnswer, q.questionType || 'short', q.maxScore || 10);
      }
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/super/interview-tests/:id', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    db.prepare('UPDATE interview_tests SET is_active=0 WHERE id=?').run(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Assign interview test to candidates ──────────────────────────────────────
app.post('/api/super/interview-tests/:id/assign', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const { candidateIds } = req.body;
    if (!candidateIds?.length) return res.status(400).json({ error: 'No candidates selected' });
    const testId = parseInt(req.params.id);
    const insert = db.prepare('INSERT OR IGNORE INTO interview_permissions(id,candidate_id,test_id,status,granted_by) VALUES(?,?,?,?,?)');
    let assigned = 0;
    for (const cid of candidateIds) {
      insert.run(uuidv4(), cid, testId, 'granted', req.user.id);
      assigned++;
    }
    logAudit(db, { actorId: req.user.id, actorRole: req.user.role, action: 'assign_interview', targetType: 'interview_test', targetId: String(testId), details: { candidateIds, assigned } });
    res.json({ assigned, ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Interview Results (admin view) ───────────────────────────────────────────
app.get('/api/super/interview-results', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const sessions = db.prepare(`
      SELECT s.*, u.name as candidate_name, u.email as candidate_email,
             t.name as test_name,
             COUNT(a.id) as answer_count,
             SUM(COALESCE(a.final_score, a.ai_score, 0)) as earned_score,
             SUM(q.max_score) as max_score
      FROM interview_sessions s
      JOIN users u ON u.id = s.candidate_id
      JOIN interview_tests t ON t.id = s.test_id
      LEFT JOIN interview_answers a ON a.session_id = s.id
      LEFT JOIN interview_questions q ON q.id = a.question_id
      GROUP BY s.id ORDER BY s.started_at DESC
    `).all();
    res.json({ sessions });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Interview results CSV export
app.get('/api/super/interview-results/export', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const sessions = db.prepare(`
      SELECT s.*, u.name as candidate_name, u.email as candidate_email,
             t.name as test_name,
             COUNT(a.id) as answer_count,
             SUM(COALESCE(a.final_score, a.ai_score, 0)) as earned_score,
             SUM(q.max_score) as max_score
      FROM interview_sessions s
      JOIN users u ON u.id = s.candidate_id
      JOIN interview_tests t ON t.id = s.test_id
      LEFT JOIN interview_answers a ON a.session_id = s.id
      LEFT JOIN interview_questions q ON q.id = a.question_id
      GROUP BY s.id ORDER BY s.started_at DESC
    `).all();

    const escCsv = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = ['Candidate', 'Email', 'Test', 'Status', 'Score', 'Max Score', 'Percentage', 'Started At', 'Completed At'];
    const rows = sessions.map(s => {
      const pct = s.max_score > 0 ? Math.round((s.earned_score / s.max_score) * 100) : 0;
      return [s.candidate_name, s.candidate_email, s.test_name, s.status,
        s.earned_score ?? 0, s.max_score ?? 0, pct + '%',
        s.started_at ? new Date(s.started_at).toISOString() : '',
        s.completed_at ? new Date(s.completed_at).toISOString() : ''].map(escCsv).join(',');
    });
    const csv = [header.map(escCsv).join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="interview_results_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/super/interview-results/:sessionId', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const session = db.prepare(`
      SELECT s.*, u.name as candidate_name, u.email as candidate_email, t.name as test_name
      FROM interview_sessions s
      JOIN users u ON u.id = s.candidate_id
      JOIN interview_tests t ON t.id = s.test_id
      WHERE s.id = ?
    `).get(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Not found' });

    const answers = db.prepare(`
      SELECT a.*, q.question_text, q.model_answer, q.question_num, q.question_type, q.max_score
      FROM interview_answers a
      JOIN interview_questions q ON q.id = a.question_id
      WHERE a.session_id = ?
      ORDER BY q.question_num
    `).all(req.params.sessionId);

    res.json({ session, answers });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/super/interview-results/:sessionId/evaluate', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const settings = getLLMSettings();
    if (!settings.apiKey) return res.status(400).json({ error: 'No LLM API key configured. Set one in Settings first.' });

    const answers = db.prepare(`
      SELECT a.*, q.question_text, q.model_answer
      FROM interview_answers a
      JOIN interview_questions q ON q.id = a.question_id
      WHERE a.session_id = ?
    `).all(req.params.sessionId);

    if (answers.length === 0) return res.status(400).json({ error: 'No answers found for this session' });

    const update = db.prepare(`
      UPDATE interview_answers SET ai_score=?,ai_reasoning=?,ai_strengths=?,ai_missing=?,final_score=?,evaluated_at=datetime('now')
      WHERE id=?
    `);

    let evaluated = 0;
    for (const ans of answers) {
      try {
        const result = await evaluateAnswer(ans.question_text, ans.model_answer, ans.answer_text || '', settings);
        update.run(result.score, result.reasoning, result.strengths, result.missing, result.score, ans.id);
        evaluated++;
      } catch (e) {
        console.error(`Evaluation failed for answer ${ans.id}:`, e.message);
      }
    }

    db.prepare("UPDATE interview_sessions SET status='evaluated' WHERE id=?").run(req.params.sessionId);
    logAudit(db, { actorId: req.user.id, actorRole: req.user.role, action: 'evaluate_interview', targetType: 'interview_session', targetId: req.params.sessionId, details: { evaluated, total: answers.length } });
    res.json({ evaluated, total: answers.length, ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/super/interview-results/:sessionId/answers/:answerId', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const { adminScore, adminNotes } = req.body;
    const score = parseFloat(adminScore);
    if (isNaN(score) || score < 0) return res.status(400).json({ error: 'Invalid score value' });

    // Get the question's max_score to cap the value
    const answer = db.prepare('SELECT ia.*, iq.max_score FROM interview_answers ia JOIN interview_questions iq ON iq.id = ia.question_id WHERE ia.id = ? AND ia.session_id = ?').get(req.params.answerId, req.params.sessionId);
    if (!answer) return res.status(404).json({ error: 'Answer not found' });

    const finalScore = Math.min(score, answer.max_score);
    db.prepare('UPDATE interview_answers SET admin_score=?,admin_notes=?,final_score=? WHERE id=? AND session_id=?')
      .run(finalScore, adminNotes || '', finalScore, req.params.answerId, req.params.sessionId);
    logAudit(db, { actorId: req.user.id, actorRole: req.user.role, action: 'override_interview_score', targetType: 'interview_answer', targetId: req.params.answerId, details: { sessionId: req.params.sessionId, finalScore } });
    res.json({ ok: true, finalScore });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/super/interview-results/:sessionId/approve', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const { adminNotes } = req.body;
    const session = db.prepare('SELECT id FROM interview_sessions WHERE id=?').get(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    db.prepare("UPDATE interview_sessions SET is_approved=1,status='reviewed',admin_notes=? WHERE id=?")
      .run(adminNotes || '', req.params.sessionId);
    logAudit(db, { actorId: req.user.id, actorRole: req.user.role, action: 'approve_interview', targetType: 'interview_session', targetId: req.params.sessionId });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============================================================
// ADMIN INTERVIEW ENDPOINTS (scoped to admin's candidates)
// ============================================================

app.get('/api/admin/interview-tests', authMiddleware, requireRole('admin'), (req, res) => {
  const tests = db.prepare(`
    SELECT it.*, COUNT(iq.id) as question_count,
      (SELECT COUNT(*) FROM interview_sessions iss
        JOIN users cu ON cu.id = iss.candidate_id
        WHERE iss.test_id = it.id AND cu.created_by = ?) as session_count
    FROM interview_tests it
    LEFT JOIN interview_questions iq ON iq.test_id = it.id
    WHERE it.is_active = 1
    GROUP BY it.id ORDER BY it.created_at DESC
  `).all(req.user.id);
  res.json({ tests });
});

app.post('/api/admin/interview-tests/parse', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });
    const questions = parsePDFText(text);
    res.json({ questions, count: questions.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/interview-tests', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const { name, description, extractedText, questions } = req.body;
    if (!name) return res.status(400).json({ error: 'Test name required' });
    if (!questions || questions.length === 0) return res.status(400).json({ error: 'At least one question required' });
    const result = db.prepare(
      'INSERT INTO interview_tests(name,description,extracted_text,created_by) VALUES(?,?,?,?)'
    ).run(name, description || '', extractedText || '', req.user.id);
    const testId = result.lastInsertRowid;
    const insertQ = db.prepare(
      'INSERT INTO interview_questions(test_id,question_num,question_text,model_answer,question_type,max_score) VALUES(?,?,?,?,?,?)'
    );
    for (const [i, q] of questions.entries()) {
      insertQ.run(testId, q.questionNum || i + 1, q.questionText, q.modelAnswer, q.questionType || 'short', q.maxScore || 10);
    }
    logAudit(db, { actorId: req.user.id, actorRole: 'admin', action: 'create_interview_test', targetType: 'interview_test', targetId: String(testId), details: { name } });
    res.json({ testId, ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/interview-tests/:id', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const test = db.prepare('SELECT * FROM interview_tests WHERE id = ?').get(req.params.id);
    if (!test) return res.status(404).json({ error: 'Not found' });
    const questions = db.prepare('SELECT * FROM interview_questions WHERE test_id = ? ORDER BY question_num').all(req.params.id);
    res.json({ test, questions });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/interview-tests/:id', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const { name, description, questions } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Test name is required' });
    db.prepare('UPDATE interview_tests SET name=?,description=? WHERE id=?').run(name.trim(), description || '', req.params.id);
    if (questions) {
      db.prepare('DELETE FROM interview_questions WHERE test_id = ?').run(req.params.id);
      const insertQ = db.prepare('INSERT INTO interview_questions(test_id,question_num,question_text,model_answer,question_type,max_score) VALUES(?,?,?,?,?,?)');
      for (const [i, q] of questions.entries()) {
        insertQ.run(req.params.id, q.questionNum || i + 1, q.questionText, q.modelAnswer, q.questionType || 'short', q.maxScore || 10);
      }
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/interview-tests/:id', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    db.prepare('UPDATE interview_tests SET is_active=0 WHERE id=?').run(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/interview-tests/:id/assign', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const { candidateIds } = req.body;
    if (!candidateIds?.length) return res.status(400).json({ error: 'No candidates selected' });
    const testId = parseInt(req.params.id);
    const insert = db.prepare('INSERT OR IGNORE INTO interview_permissions(id,candidate_id,test_id,status,granted_by) VALUES(?,?,?,?,?)');
    let assigned = 0;
    for (const cid of candidateIds) {
      insert.run(uuidv4(), cid, testId, 'granted', req.user.id);
      assigned++;
    }
    logAudit(db, { actorId: req.user.id, actorRole: 'admin', action: 'assign_interview', targetType: 'interview_test', targetId: String(testId), details: { candidateIds, assigned } });
    res.json({ assigned, ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/interview-results', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const sessions = db.prepare(`
      SELECT s.*, u.name as candidate_name, u.email as candidate_email,
             t.name as test_name,
             COUNT(a.id) as answer_count,
             SUM(COALESCE(a.final_score, a.ai_score, 0)) as earned_score,
             SUM(q.max_score) as max_score
      FROM interview_sessions s
      JOIN users u ON u.id = s.candidate_id
      JOIN interview_tests t ON t.id = s.test_id
      LEFT JOIN interview_answers a ON a.session_id = s.id
      LEFT JOIN interview_questions q ON q.id = a.question_id
      WHERE u.created_by = ?
      GROUP BY s.id ORDER BY s.started_at DESC
    `).all(req.user.id);
    res.json({ sessions });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/interview-results/:sessionId', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const session = db.prepare(`
      SELECT s.*, u.name as candidate_name, u.email as candidate_email, t.name as test_name
      FROM interview_sessions s
      JOIN users u ON u.id = s.candidate_id
      JOIN interview_tests t ON t.id = s.test_id
      WHERE s.id = ? AND u.created_by = ?
    `).get(req.params.sessionId, req.user.id);
    if (!session) return res.status(404).json({ error: 'Not found' });
    const answers = db.prepare(`
      SELECT a.*, q.question_text, q.model_answer, q.question_num, q.question_type, q.max_score
      FROM interview_answers a
      JOIN interview_questions q ON q.id = a.question_id
      WHERE a.session_id = ? ORDER BY q.question_num
    `).all(req.params.sessionId);
    res.json({ session, answers });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/interview-results/:sessionId/evaluate', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const settings = getLLMSettings();
    if (!settings.apiKey) return res.status(400).json({ error: 'No LLM API key configured. Set one in Settings first.' });
    const answers = db.prepare(`
      SELECT a.*, q.question_text, q.model_answer
      FROM interview_answers a
      JOIN interview_questions q ON q.id = a.question_id
      WHERE a.session_id = ?
    `).all(req.params.sessionId);
    if (answers.length === 0) return res.status(400).json({ error: 'No answers found for this session' });
    const update = db.prepare(`UPDATE interview_answers SET ai_score=?,ai_reasoning=?,ai_strengths=?,ai_missing=?,final_score=?,evaluated_at=datetime('now') WHERE id=?`);
    let evaluated = 0;
    for (const ans of answers) {
      try {
        const result = await evaluateAnswer(ans.question_text, ans.model_answer, ans.answer_text || '', settings);
        update.run(result.score, result.reasoning, result.strengths, result.missing, result.score, ans.id);
        evaluated++;
      } catch (e) { console.error(`Eval failed for ${ans.id}:`, e.message); }
    }
    db.prepare("UPDATE interview_sessions SET status='evaluated' WHERE id=?").run(req.params.sessionId);
    logAudit(db, { actorId: req.user.id, actorRole: 'admin', action: 'evaluate_interview', targetType: 'interview_session', targetId: req.params.sessionId, details: { evaluated, total: answers.length } });
    res.json({ evaluated, total: answers.length, ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/interview-results/:sessionId/answers/:answerId', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const { adminScore, adminNotes } = req.body;
    const score = parseFloat(adminScore);
    if (isNaN(score) || score < 0) return res.status(400).json({ error: 'Invalid score value' });
    const answer = db.prepare('SELECT ia.*, iq.max_score FROM interview_answers ia JOIN interview_questions iq ON iq.id = ia.question_id WHERE ia.id = ? AND ia.session_id = ?').get(req.params.answerId, req.params.sessionId);
    if (!answer) return res.status(404).json({ error: 'Answer not found' });
    const finalScore = Math.min(score, answer.max_score);
    db.prepare('UPDATE interview_answers SET admin_score=?,admin_notes=?,final_score=? WHERE id=? AND session_id=?')
      .run(finalScore, adminNotes || '', finalScore, req.params.answerId, req.params.sessionId);
    logAudit(db, { actorId: req.user.id, actorRole: 'admin', action: 'override_interview_score', targetType: 'interview_answer', targetId: req.params.answerId, details: { sessionId: req.params.sessionId, finalScore } });
    res.json({ ok: true, finalScore });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/interview-results/:sessionId/approve', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const { adminNotes } = req.body;
    const session = db.prepare('SELECT id FROM interview_sessions WHERE id=?').get(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    db.prepare("UPDATE interview_sessions SET is_approved=1,status='reviewed',admin_notes=? WHERE id=?")
      .run(adminNotes || '', req.params.sessionId);
    logAudit(db, { actorId: req.user.id, actorRole: 'admin', action: 'approve_interview', targetType: 'interview_session', targetId: req.params.sessionId });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Candidate: list assigned interviews ──────────────────────────────────────
app.get('/api/candidate/interviews', authMiddleware, requireRole('candidate'), (req, res) => {
  try {
    const candidateId = req.user.id;
    const perms = db.prepare(`
      SELECT ip.*, it.name, it.description,
        COUNT(iq.id) as question_count,
        (SELECT id FROM interview_sessions WHERE candidate_id=? AND test_id=ip.test_id ORDER BY started_at DESC LIMIT 1) as session_id,
        (SELECT status FROM interview_sessions WHERE candidate_id=? AND test_id=ip.test_id ORDER BY started_at DESC LIMIT 1) as session_status
      FROM interview_permissions ip
      JOIN interview_tests it ON it.id = ip.test_id AND it.is_active=1
      LEFT JOIN interview_questions iq ON iq.test_id=it.id
      WHERE ip.candidate_id=? AND ip.status='granted'
      GROUP BY ip.id
    `).all(candidateId, candidateId, candidateId);
    res.json({ interviews: perms });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/candidate/interviews/:testId/start', authMiddleware, requireRole('candidate'), (req, res) => {
  try {
    const candidateId = req.user.id;
    const testId = parseInt(req.params.testId);

    const perm = db.prepare('SELECT * FROM interview_permissions WHERE candidate_id=? AND test_id=? AND status="granted"').get(candidateId, testId);
    if (!perm) return res.status(403).json({ error: 'No permission for this interview' });

    // Resume existing in-progress session
    const existing = db.prepare('SELECT * FROM interview_sessions WHERE candidate_id=? AND test_id=? AND status="in_progress"').get(candidateId, testId);
    if (existing) {
      const answers = db.prepare('SELECT * FROM interview_answers WHERE session_id=?').all(existing.id);
      const questions = db.prepare('SELECT * FROM interview_questions WHERE test_id=? ORDER BY question_num').all(testId);
      return res.json({ sessionId: existing.id, questions, answers, resumed: true });
    }

    const questions = db.prepare('SELECT * FROM interview_questions WHERE test_id=? ORDER BY question_num').all(testId);
    if (questions.length === 0) return res.status(400).json({ error: 'No questions in this interview' });

    const totalMax = questions.reduce((s, q) => s + q.max_score, 0);
    const sessionId = uuidv4();
    db.prepare('INSERT INTO interview_sessions(id,candidate_id,test_id,total_max_score) VALUES(?,?,?,?)').run(sessionId, candidateId, testId, totalMax);

    // Pre-create answer rows
    const insertAns = db.prepare('INSERT INTO interview_answers(session_id,question_id) VALUES(?,?)');
    for (const q of questions) insertAns.run(sessionId, q.id);

    res.json({ sessionId, questions, answers: [], resumed: false });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/candidate/interviews/:testId/session/:sessionId/answer/:questionId', authMiddleware, requireRole('candidate'), (req, res) => {
  try {
    const { answerText } = req.body;
    const candidateId = req.user.id;

    const session = db.prepare('SELECT * FROM interview_sessions WHERE id=? AND candidate_id=? AND status="in_progress"').get(req.params.sessionId, candidateId);
    if (!session) return res.status(403).json({ error: 'Session not found or already submitted' });

    db.prepare('UPDATE interview_answers SET answer_text=? WHERE session_id=? AND question_id=?')
      .run(answerText || '', req.params.sessionId, req.params.questionId);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/candidate/interviews/:testId/session/:sessionId/submit', authMiddleware, requireRole('candidate'), (req, res) => {
  try {
    const candidateId = req.user.id;
    const session = db.prepare('SELECT * FROM interview_sessions WHERE id=? AND candidate_id=?').get(req.params.sessionId, candidateId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status !== 'in_progress') return res.status(400).json({ error: 'Already submitted' });

    db.prepare("UPDATE interview_sessions SET status='submitted',submitted_at=datetime('now') WHERE id=?").run(req.params.sessionId);
    res.json({ ok: true, message: 'Interview submitted successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/api/health', (req, res) => {
  try {
    const dbOk = db.prepare('SELECT 1').get();
    const uptime = Math.round(process.uptime());
    const mem = process.memoryUsage();
    res.json({
      status: 'ok',
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s`,
      database: dbOk ? 'ok' : 'error',
      memory: { heapUsed: Math.round(mem.heapUsed / 1024 / 1024) + 'MB', rss: Math.round(mem.rss / 1024 / 1024) + 'MB' },
      timestamp: new Date().toISOString(),
    });
  } catch (e) { res.status(500).json({ status: 'error', error: e.message }); }
});

// DB backup (super admin only — streams a copy of the SQLite file)
app.get('/api/super/backup', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const fs = require('fs');
    const dbPath = path.join(__dirname, 'skillforge.db');
    if (!fs.existsSync(dbPath)) return res.status(404).json({ error: 'Database file not found' });
    const filename = `skillforge_backup_${new Date().toISOString().split('T')[0]}.db`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    fs.createReadStream(dbPath).pipe(res);
    logAudit(db, { actorId: req.user.id, actorRole: 'super_admin', action: 'db_backup', targetType: 'database', targetId: 'skillforge.db', details: {} });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, '0.0.0.0', () => {
  const lanIp = getLanIp();
  const questionCount = db.prepare('SELECT COUNT(*) as c FROM questions').get().c;
  const testCount = db.prepare('SELECT COUNT(*) as c FROM tests').get().c;

  console.log('');
  console.log('='.repeat(60));
  console.log('  SkillForge Unified Assessment Platform');
  console.log('='.repeat(60));
  console.log(`  Local:    http://localhost:${PORT}`);
  console.log(`  Network:  http://${lanIp}:${PORT}`);
  console.log('');
  console.log(`  Super Admin: superadmin@skillforge.com / SuperAdmin@123`);
  console.log(`  Tests:       ${testCount}`);
  console.log(`  Questions:   ${questionCount}`);
  console.log('='.repeat(60));
  console.log('');
});
