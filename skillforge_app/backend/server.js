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
const PORT = parseInt(process.env.PORT) || 3000;

// ── Input validation helpers ──────────────────────────────────────────────────
// Backfill: recompute time_taken from start_time / end_time for every submitted session.
// Historical rows had mixed units (some minutes, some seconds) and mixed timezone
// formats — recomputing from the IST-local timestamp columns gives a single source of truth.
try {
  const rows = db.prepare(
    "SELECT id, start_time, end_time, time_taken FROM test_sessions WHERE end_time IS NOT NULL AND start_time IS NOT NULL"
  ).all();
  const upd = db.prepare('UPDATE test_sessions SET time_taken = ? WHERE id = ?');
  let fixed = 0;
  for (const s of rows) {
    const t = calcTimeDiff(s.start_time, s.end_time);
    if (t > 0 && s.time_taken !== t) { upd.run(t, s.id); fixed++; }
  }
  if (fixed > 0) console.log(`[time_taken backfill] recalculated ${fixed} sessions`);
} catch (e) { console.error('[time_taken backfill]', e); }

// Startup: auto-timeout stale in_progress sessions that exceeded their duration.
// These can accumulate when the server restarts mid-session or candidates abandon without submitting.
try {
  const staleRows = db.prepare(`
    SELECT ts.id, ts.start_time, ts.candidate_id, ts.test_id, ts.permission_id,
           COALESCE(ts.duration_minutes, t.duration_minutes, 90) as dur_min
    FROM test_sessions ts
    JOIN tests t ON t.id = ts.test_id
    WHERE ts.status = 'in_progress'
  `).all();
  let timedOut = 0;
  const nowMs = Date.now();
  for (const s of staleRows) {
    const startMs = parseDbTime(s.start_time);
    const elapsedMin = (nowMs - startMs) / 60000;
    if (elapsedMin > s.dur_min + 5) { // more than 5 minutes over time limit
      const elapsedSec = Math.min(Math.round((nowMs - startMs) / 1000), s.dur_min * 60);
      db.prepare(`UPDATE test_sessions SET status='timed_out', end_time=strftime('%Y-%m-%dT%H:%M:%f','now','localtime'), time_taken=? WHERE id=?`)
        .run(elapsedSec, s.id);
      // Update permission attempt count if applicable
      if (s.permission_id) {
        const perm = db.prepare('SELECT attempt_count, max_attempts FROM test_permissions WHERE id=?').get(s.permission_id);
        if (perm) {
          const newCount = perm.attempt_count + 1;
          const newStatus = newCount >= perm.max_attempts ? 'completed' : 'granted';
          db.prepare('UPDATE test_permissions SET attempt_count=?, status=? WHERE id=?').run(newCount, newStatus, s.permission_id);
        }
      }
      timedOut++;
    }
  }
  if (timedOut > 0) console.log(`[startup] Auto-timed-out ${timedOut} stale in_progress session(s)`);
} catch (e) { console.error('[startup auto-timeout]', e); }

function formatTimeTaken(seconds) {
  if (!seconds || isNaN(seconds)) return '-';
  let s = Number(seconds);
  if (s > 86400) s = Math.floor(s / 1000);
  if (s <= 0 || s > 86400) return '-';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const pad = (n) => String(n).padStart(2, '0');
  if (h > 0) return `${h}h ${pad(m)}m`;
  if (m > 0) return `${m}m ${pad(sec)}s`;
  return `${sec}s`;
}

function isValidEmail(email) {
  if (!email) return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(String(email).trim());
}
function sanitizeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

// Timestamps are stored as local (server) time using strftime(..., 'localtime').
// Format: "YYYY-MM-DDTHH:MM:SS.sss" — when parsed by `new Date(str)` (no Z),
// JS treats it as local time, which matches the stored value. No Z appended.
function parseDbTime(t) {
  if (!t) return 0;
  if (typeof t === 'number') return t;
  const s = String(t);
  // Strip any trailing Z from legacy UTC-stored rows so we parse as local.
  const normalized = s.endsWith('Z') ? s.slice(0, -1) : s;
  // Convert "YYYY-MM-DD HH:MM:SS" to ISO-ish for consistent parsing.
  const iso = normalized.includes('T') ? normalized : normalized.replace(' ', 'T');
  return new Date(iso).getTime();
}

// Current local time as ISO-like string matching DB storage format.
function nowLocalIso() {
  const d = new Date();
  const pad = (n, w = 2) => String(n).padStart(w, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
}
// Public aliases with the canonical names used in the rest of the team's spec.
const getLocalTime = nowLocalIso;
const parseLocalTime = (s) => {
  const ms = parseDbTime(s);
  if (!ms) return null;
  const d = new Date(ms);
  return isNaN(d) ? null : d;
};
// Compute elapsed seconds between two stored local-ISO timestamps,
// clamped to (0, 86400). Returns 0 on bad input.
function calcTimeDiff(startStr, endStr) {
  const a = parseDbTime(startStr);
  const b = parseDbTime(endStr);
  if (!a || !b || b <= a) return 0;
  const t = Math.floor((b - a) / 1000);
  return t > 0 && t < 86400 ? t : 0;
}
// Display helper — same output as formatToIST(): "DD/MM/YYYY, hh:mm AM/PM".
function formatDisplay(str) {
  if (!str) return '-';
  const d = parseLocalTime(str);
  if (!d) return '-';
  const pad = (n) => String(n).padStart(2, '0');
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(h)}:${pad(d.getMinutes())} ${ampm}`;
}

// Produce a human-readable message from a stored audit entry.
function describeAudit(entry) {
  const a = entry.action || '';
  let d = {};
  try { d = typeof entry.details === 'string' ? JSON.parse(entry.details || '{}') : (entry.details || {}); } catch (e) { d = {}; }
  const actor = entry.actor_name ? `${entry.actor_name}${entry.actor_email ? ' (' + entry.actor_email + ')' : ''}` : (d.actorName || d.email || 'Unknown');
  const role = entry.actor_role || d.role || 'user';
  const roleLabel = role === 'super_admin' ? 'Super Admin' : role === 'admin' ? 'Admin' : role === 'candidate' ? 'Candidate' : 'User';
  const targetName = d.targetName || d.candidateName || d.name || d.email || entry.target_id || '';
  const testName = d.testName || d.test || '';
  const pct = d.percentage != null ? `${d.percentage}%` : '';
  const grade = d.grade ? ` (${d.grade})` : '';
  const count = d.count != null ? d.count : (d.assigned != null ? d.assigned : '');

  switch (a) {
    case 'login': return `${roleLabel} ${actor} logged in`;
    case 'logout': return `${roleLabel} ${actor} logged out`;
    case 'login_failed': return `Failed login attempt for ${d.email || 'unknown email'}${d.reason ? ' (' + d.reason + ')' : ''}`;
    case 'create_candidate': return `Created candidate account for ${targetName}`;
    case 'delete_candidate': return `Deleted candidate ${targetName}`;
    case 'bulk_import_candidates': return `Bulk imported ${count} candidates${d.skipped ? ' (' + d.skipped + ' skipped)' : ''}`;
    case 'reset_password': return `Reset password for ${targetName}`;
    case 'deactivate_user': return `Deactivated ${targetName}`;
    case 'activate_user': return `Activated ${targetName}`;
    case 'create_admin': return `Created admin account for ${targetName}`;
    case 'delete_admin': return `Deleted admin ${targetName}`;
    case 'assign_test':
    case 'grant_permission': return `Granted access to "${testName}" for ${targetName}`;
    case 'revoke_permission':
    case 'revoke_test': return `Revoked access to "${testName}" from ${targetName}`;
    case 'restore_permission': return `Restored access to "${testName}" for ${targetName}`;
    case 'reset_attempts': return `Reset attempts for "${testName}" for ${targetName}`;
    case 'analysis_only': return `Set analysis-only mode for "${testName}" for ${targetName}`;
    case 'bulk_grant_permissions': return `Bulk assigned "${testName}" to ${count} candidates`;
    case 'create_test': return `Created new test "${testName}"${d.type ? ' (' + d.type + ')' : ''}`;
    case 'edit_test':
    case 'update_test': return `Updated test "${testName}"`;
    case 'delete_test': return `Deleted test "${testName}"`;
    case 'start_test': return `${actor} started test "${testName}"`;
    case 'submit_test': return `${actor} submitted "${testName}"${pct ? ' — Score: ' + pct : ''}${grade}`;
    case 'auto_submit': return `Test "${testName}" auto-submitted for ${targetName || actor}${d.reason ? ' (' + d.reason + ')' : ''}`;
    case 'create_interview_test': return `Created interview test "${d.name || testName}"`;
    case 'assign_interview': return `Assigned interview to ${d.assigned || count} candidates`;
    case 'evaluate_interview': return `Evaluated ${d.evaluated}/${d.total} interview answers`;
    case 'approve_interview': return `Approved interview submission`;
    case 'override_interview_score': return `Overrode interview score to ${d.finalScore}`;
    case 'assign_interview_prep': return `Assigned interview-prep tests${count ? ' to ' + count : ''}`;
    case 'db_backup': return `Downloaded database backup`;
    default: return `${a.replace(/_/g,' ')}${testName ? ' — ' + testName : ''}${targetName ? ' — ' + targetName : ''}`;
  }
}

function categorizeAudit(action) {
  if (/login$|logout/.test(action)) return action === 'login_failed' ? 'danger' : 'success';
  if (/grant|assign|restore/.test(action)) return 'info';
  if (/revoke|delete|auto_submit|login_failed/.test(action)) return 'danger';
  if (/reset_password|edit|update|create_test/.test(action)) return 'warning';
  if (/create_candidate|bulk_import|create_admin/.test(action)) return 'purple';
  return 'default';
}

// Format a DB/ISO timestamp as "DD/MM/YYYY, hh:mm AM/PM" (local time).
function formatToIST(dateStr) {
  if (!dateStr) return null;
  const ms = parseDbTime(dateStr);
  if (!ms) return null;
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, '0');
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = pad(d.getMinutes());
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${day}/${month}/${year}, ${pad(hours)}:${minutes} ${ampm}`;
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
// ONLINE CANDIDATE TRACKING
// userId -> lastSeen (ms). Considered online if seen within ONLINE_WINDOW_MS.
// ============================================================
const onlineCandidates = new Map();
const ONLINE_WINDOW_MS = 3 * 60 * 1000;
const IDLE_WINDOW_MS = 10 * 60 * 1000;
function markCandidateSeen(userId) {
  if (userId) onlineCandidates.set(userId, Date.now());
}
function isCandidateOnline(userId) {
  const last = onlineCandidates.get(userId);
  return !!(last && Date.now() - last < ONLINE_WINDOW_MS);
}
function getRelativeTime(timestamp) {
  if (!timestamp) return 'Never';
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return mins + ' minute' + (mins > 1 ? 's' : '') + ' ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + ' hour' + (hrs > 1 ? 's' : '') + ' ago';
  const days = Math.floor(hrs / 24);
  return days + ' day' + (days > 1 ? 's' : '') + ' ago';
}
function getOnlineStatusTier(lastSeen) {
  if (!lastSeen) return 'offline';
  const diff = Date.now() - lastSeen;
  if (diff < ONLINE_WINDOW_MS) return 'online';
  if (diff < IDLE_WINDOW_MS) return 'idle';
  return 'offline';
}
app.use((req, res, next) => {
  if (req.path.startsWith('/api/candidate/')) {
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(auth.slice(7));
        if (decoded && decoded.role === 'candidate' && decoded.id) {
          markCandidateSeen(decoded.id);
        }
      } catch (e) { /* ignore */ }
    }
  }
  next();
});

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
app.post('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  handler: (req, res /*, next, options*/) => {
    return res.status(429).json({
      error: 'RATE_LIMITED',
      message: 'Too many login attempts. Please wait 15 minutes',
    });
  },
}), (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'MISSING_CREDENTIALS', message: 'Email and password required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email);
    if (!user) {
      logAudit(db, { actorId: null, actorRole: null, action: 'login_failed', targetType: 'user', targetId: null, details: `Failed login attempt for email: ${email}` });
      return res.status(400).json({ error: 'EMAIL_NOT_FOUND', message: 'No account found with this email address' });
    }
    if (!user.is_active) {
      logAudit(db, { actorId: user.id, actorRole: user.role, action: 'login_failed', targetType: 'user', targetId: user.id, details: `Failed login attempt for email: ${email}` });
      return res.status(403).json({ error: 'ACCOUNT_INACTIVE', message: 'Your account has been deactivated. Contact your administrator' });
    }
    if (!comparePassword(password, user.password)) {
      logAudit(db, { actorId: user.id, actorRole: user.role, action: 'login_failed', targetType: 'user', targetId: user.id, details: `Failed login attempt for email: ${email}` });
      return res.status(400).json({ error: 'INVALID_PASSWORD', message: 'Incorrect password. Please try again' });
    }

    const token = generateToken(user);
    db.prepare("UPDATE users SET last_login = strftime('%Y-%m-%dT%H:%M:%f','now','localtime') WHERE id = ?").run(user.id);

    const roleLabelLogin = user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Candidate';
    logAudit(db, {
      actorId: user.id,
      actorRole: user.role,
      action: 'login',
      targetType: 'user',
      targetId: user.id,
      details: `${roleLabelLogin} ${user.name} (${user.email}) logged in successfully`
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
app.post('/api/auth/logout', authMiddleware, (req, res) => {
  try {
    logAudit(db, { actorId: req.user.id, actorRole: req.user.role, action: 'logout', targetType: 'user', targetId: req.user.id, details: { email: req.user.email } });
    if (req.user.role === 'candidate') onlineCandidates.delete(req.user.id);
  } catch (e) { /* ignore */ }
  res.json({ status: 'ok' });
});

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
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    const safeName = sanitizeHtml(name.trim());

    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email);
    if (existing) return res.status(409).json({ error: 'Email already exists' });

    const id = uuidv4();
    const hashed = hashPassword(password);

    db.prepare(`
      INSERT INTO users (id, name, email, password, role, created_by)
      VALUES (?, ?, ?, ?, 'admin', ?)
    `).run(id, safeName, email, hashed, req.user.id);

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

// --- Online candidate status (shared by super + admin) ---
function buildOnlineStatusResponse() {
  const rows = db.prepare("SELECT id FROM users WHERE role = 'candidate'").all();
  const out = {};
  for (const r of rows) {
    const last = onlineCandidates.get(r.id);
    out[r.id] = {
      status: getOnlineStatusTier(last),
      lastSeen: last ? formatToIST(new Date(last).toISOString()) : null,
      lastSeenMs: last || null,
      lastSeenRelative: getRelativeTime(last),
    };
  }
  return out;
}
app.get('/api/super/candidates/online-status', authMiddleware, requireRole('super_admin'), (req, res) => {
  res.json(buildOnlineStatusResponse());
});
app.get('/api/admin/candidates/online-status', authMiddleware, requireRole('admin'), (req, res) => {
  res.json(buildOnlineStatusResponse());
});
app.get('/api/candidate/ping', authMiddleware, requireRole('candidate'), (req, res) => {
  markCandidateSeen(req.user.id);
  res.json({ status: 'ok', timestamp: Date.now() });
});

// --- Candidate management (super admin) ---

app.get('/api/super/candidates', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const candidates = db.prepare(`
      SELECT u.id, u.name, u.email, u.is_active, u.created_at, u.last_login, u.created_by,
             u.batch_id, b.name as batch_name, b.code as batch_code,
             (SELECT COUNT(*) FROM test_permissions WHERE candidate_id = u.id) as permissions_count,
             (SELECT COUNT(*) FROM test_sessions WHERE candidate_id = u.id AND status = 'submitted') as completed_tests,
             (SELECT ROUND(AVG(percentage),1) FROM test_sessions WHERE candidate_id = u.id AND status = 'submitted') as avg_score,
             (SELECT MAX(percentage) FROM test_sessions WHERE candidate_id = u.id AND status = 'submitted') as best_score,
             (SELECT name FROM users WHERE id = u.created_by) as created_by_name
      FROM users u
      LEFT JOIN batches b ON b.id = u.batch_id
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
    const { name, email, password, batch_id } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'NAME_REQUIRED', message: 'Candidate name is required' });
    }
    if (!email || !String(email).trim()) {
      return res.status(400).json({ error: 'EMAIL_REQUIRED', message: 'Email address is required' });
    }
    if (!password || String(password).length < 6) {
      return res.status(400).json({ error: 'PASSWORD_REQUIRED', message: 'Password must be at least 6 characters' });
    }
    if (!batch_id) {
      return res.status(400).json({ error: 'BATCH_REQUIRED', message: 'Batch code is required to create a candidate' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'INVALID_EMAIL', message: 'Invalid email format' });
    }
    const safeName = sanitizeHtml(name.trim());

    const existing = db.prepare(`
      SELECT u.id, u.name, u.email, u.batch_id, b.code AS batch_code
      FROM users u
      LEFT JOIN batches b ON u.batch_id = b.id
      WHERE LOWER(u.email) = LOWER(?)
    `).get(email);
    if (existing) {
      const sameName  = (existing.name || '') === safeName;
      const existingBatch = existing.batch_id || null;
      const newBatch = batch_id || null;
      const sameBatch = String(existingBatch || '') === String(newBatch || '');
      const existingCandidate = {
        id: existing.id, name: existing.name, email: existing.email,
        batchCode: existing.batch_code || null,
      };
      if (sameName && sameBatch) {
        return res.status(409).json({
          error: 'DUPLICATE_CANDIDATE',
          message: 'A candidate with this name, email and batch already exists',
          existingCandidate,
        });
      }
      return res.status(409).json({
        error: 'EMAIL_EXISTS',
        message: 'An account with this email already exists',
        existingCandidate,
      });
    }

    const b = db.prepare('SELECT id, code, name FROM batches WHERE id = ?').get(batch_id);
    if (!b) return res.status(400).json({ error: 'BATCH_NOT_FOUND', message: 'Selected batch does not exist' });
    const resolvedBatchId = b.id, resolvedBatchCode = b.code;

    const id = uuidv4();
    const hashed = hashPassword(password);

    db.prepare(`
      INSERT INTO users (id, name, email, password, role, created_by, batch_id)
      VALUES (?, ?, ?, ?, 'candidate', ?, ?)
    `).run(id, safeName, email, hashed, req.user.id, resolvedBatchId);

    logAudit(db, {
      actorId: req.user.id, actorRole: 'super_admin',
      action: 'create_candidate', targetType: 'user', targetId: id,
      details: `Created candidate account for ${safeName} (${email}) in batch ${resolvedBatchCode || 'none'}`
    });

    res.status(201).json({ id, name: safeName, email, role: 'candidate', batch_id: resolvedBatchId, batchCode: resolvedBatchCode });
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

// ========== CANDIDATE PERFORMANCE (shared helper) ==========
function buildCandidatePerformance(candidateId) {
  const candidate = db.prepare(`
    SELECT u.id, u.name, u.email, u.created_at, u.created_by, u.is_active, u.last_login,
           creator.name as created_by_name
    FROM users u
    LEFT JOIN users creator ON u.created_by = creator.id
    WHERE u.id = ? AND u.role = 'candidate'
  `).get(candidateId);
  if (!candidate) return null;

  const permissions = db.prepare(`
    SELECT tp.*, t.name as test_name, t.test_type, t.passing_percentage,
           t.available_from as t_available_from, t.available_until as t_available_until
    FROM test_permissions tp
    JOIN tests t ON tp.test_id = t.id
    WHERE tp.candidate_id = ?
  `).all(candidateId);

  const sessions = db.prepare(`
    SELECT ts.*, t.name as test_name, t.test_type, t.passing_percentage, t.total_questions as t_total_questions
    FROM test_sessions ts
    JOIN tests t ON ts.test_id = t.id
    WHERE ts.candidate_id = ?
    ORDER BY COALESCE(ts.end_time, ts.start_time) DESC
  `).all(candidateId);

  const totalAssigned = permissions.length;
  const attempted = sessions.filter(s => !!s.start_time);
  const completed = sessions.filter(s => s.status === 'submitted' || s.status === 'timed_out' || !!s.end_time);
  const passedSessions = completed.filter(s => {
    if (s.passed != null) return !!s.passed;
    if (s.percentage != null && s.passing_percentage != null) return s.percentage >= s.passing_percentage;
    return false;
  });
  const failedCount = completed.length - passedSessions.length;

  const pcts = completed.map(s => s.percentage).filter(p => p != null);
  const avg = pcts.length ? pcts.reduce((a,b)=>a+b,0) / pcts.length : 0;
  const best = pcts.length ? Math.max(...pcts) : 0;
  const worst = pcts.length ? Math.min(...pcts) : 0;

  let totalTime = 0;
  for (const s of sessions) {
    if (s.time_taken != null) { totalTime += Number(s.time_taken) || 0; continue; }
    if (s.start_time && s.end_time) {
      const a = new Date(s.start_time).getTime();
      const b = new Date(s.end_time).getTime();
      if (!isNaN(a) && !isNaN(b) && b > a) totalTime += Math.floor((b - a) / 1000);
    }
  }

  const passRate = completed.length > 0 ? (passedSessions.length / completed.length) * 100 : 0;
  const violations = sessions.reduce((sum, s) => sum + (Number(s.tab_violations) || 0), 0);

  const gradeOf = (pct) => {
    if (pct == null) return null;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
  };

  const gradeDistribution = { 'A+':0, 'A':0, 'B':0, 'C':0, 'D':0, 'F':0 };
  for (const s of completed) {
    const g = gradeOf(s.percentage);
    if (g && gradeDistribution.hasOwnProperty(g)) gradeDistribution[g]++;
  }

  // Attempt numbering per test (oldest = 1)
  const byTest = {};
  const orderedAsc = [...sessions].sort((a,b) => {
    const ax = new Date(a.start_time || a.created_at || 0).getTime();
    const bx = new Date(b.start_time || b.created_at || 0).getTime();
    return ax - bx;
  });
  for (const s of orderedAsc) {
    byTest[s.test_id] = (byTest[s.test_id] || 0) + 1;
    s._attemptNumber = byTest[s.test_id];
  }

  const testResults = sessions.map(s => {
    let timeTaken = null;
    if (s.time_taken != null) timeTaken = Number(s.time_taken);
    else if (s.start_time && s.end_time) {
      const a = new Date(s.start_time).getTime();
      const b = new Date(s.end_time).getTime();
      if (!isNaN(a) && !isNaN(b) && b > a) timeTaken = Math.floor((b - a) / 1000);
    }
    return {
      testId: s.test_id,
      testName: s.test_name,
      testType: s.test_type || 'mcq',
      score: s.score,
      totalQuestions: s.total_questions != null ? s.total_questions : s.t_total_questions,
      percentage: s.percentage,
      grade: s.grade || gradeOf(s.percentage),
      passed: s.passed != null ? !!s.passed : (s.percentage != null && s.passing_percentage != null ? s.percentage >= s.passing_percentage : false),
      timeTaken,
      startedAt: s.start_time,
      submittedAt: s.end_time,
      attemptNumber: s._attemptNumber,
      violations: Number(s.tab_violations) || 0,
    };
  });

  // Count sessions per test (fallback for attempt_count)
  const sessionCountByTest = {};
  for (const s of sessions) {
    sessionCountByTest[s.test_id] = (sessionCountByTest[s.test_id] || 0) + 1;
  }

  const nowMs = Date.now();
  const assignedTests = permissions.map(p => {
    const attemptCount = p.attempt_count != null ? Number(p.attempt_count) : (sessionCountByTest[p.test_id] || 0);
    const maxAttempts = p.max_attempts != null ? Number(p.max_attempts) : null;
    const availFrom = p.t_available_from;
    const availUntil = p.t_available_until;
    let status = 'Available';
    if (p.status === 'revoked') status = 'Expired';
    else if (availUntil && new Date(availUntil).getTime() < nowMs) status = 'Expired';
    else if (availFrom && new Date(availFrom).getTime() > nowMs) status = 'Pending';
    else if (maxAttempts && maxAttempts > 0 && attemptCount >= maxAttempts) status = 'Completed';
    return {
      testId: p.test_id,
      testName: p.test_name,
      testType: p.test_type || 'mcq',
      status,
      maxAttempts,
      attemptCount,
      availableFrom: availFrom || null,
      availableUntil: availUntil || null,
    };
  });

  const recentActivity = db.prepare(`
    SELECT id, actor_id, actor_role, action, target_type, target_id, details, timestamp
    FROM audit_log
    WHERE target_id = ? OR actor_id = ?
    ORDER BY timestamp DESC
    LIMIT 5
  `).all(candidateId, candidateId).map(r => ({
    id: r.id,
    action: r.action,
    targetType: r.target_type,
    details: r.details,
    createdAt: r.timestamp,
    actorRole: r.actor_role,
  }));

  return {
    candidate: (() => {
      const lastSeen = onlineCandidates.get(candidate.id);
      return {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        createdAt: candidate.created_at,
        createdBy: candidate.created_by_name || candidate.created_by || null,
        accountStatus: candidate.is_active ? 'Active' : 'Inactive',
        status: getOnlineStatusTier(lastSeen),
        lastSeen: lastSeen ? formatToIST(new Date(lastSeen).toISOString()) : null,
        lastSeenRelative: getRelativeTime(lastSeen),
      };
    })(),
    stats: {
      totalAssigned,
      totalAttempted: attempted.length,
      totalCompleted: completed.length,
      available: (() => {
        const nowIso = new Date().toISOString();
        return permissions.filter(p => p.status === 'granted'
          && (p.attempt_count == null || p.attempt_count === 0)
          && (!p.t_available_until || p.t_available_until > nowIso)).length;
      })(),
      inProgress: sessions.filter(s => s.status === 'in_progress' || (s.start_time && !s.end_time)).length,
      totalPassed: passedSessions.length,
      totalFailed: failedCount,
      averageScore: Number(avg.toFixed(2)),
      bestScore: Number(best.toFixed(2)),
      worstScore: Number(worst.toFixed(2)),
      totalTimeTaken: totalTime,
      passRate: Number(passRate.toFixed(2)),
      violations,
    },
    testResults,
    assignedTests,
    gradeDistribution,
    recentActivity,
  };
}

app.get('/api/super/candidates/:id/performance', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const data = buildCandidatePerformance(req.params.id);
    if (!data) return res.status(404).json({ error: 'Candidate not found' });
    res.json(data);
  } catch (err) {
    console.error('[super/candidates/:id/performance]', err);
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
    const c = db.prepare("SELECT * FROM users WHERE id = ? AND role = 'candidate'").get(req.params.id);
    if (!c) return res.status(404).json({ error: 'Candidate not found' });

    db.prepare("DELETE FROM test_permissions WHERE candidate_id = ?").run(req.params.id);
    db.prepare("DELETE FROM test_sessions WHERE candidate_id = ?").run(req.params.id);
    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);

    logAudit(db, {
      actorId: req.user.id, actorRole: 'super_admin',
      action: 'delete_candidate', targetType: 'user', targetId: req.params.id,
      details: `Deleted candidate ${c.name} (${c.email})`,
      deletedData: JSON.stringify(c)
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
    const admin = db.prepare("SELECT * FROM users WHERE id = ? AND role = 'admin'").get(req.params.id);
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
      action: 'delete_admin', targetType: 'user', targetId: req.params.id,
      details: `Deleted admin ${admin.name} (${admin.email})`,
      deletedData: JSON.stringify(admin)
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
      INSERT INTO test_permissions (id, candidate_id, test_id, max_attempts, granted_by, granted_at)
      VALUES (?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%f','now','localtime'))
    `).run(id, candidateId, testId, maxAttempts || 1, req.user.id);

    const tN = db.prepare('SELECT name FROM tests WHERE id = ?').get(testId);
    const cN = db.prepare('SELECT name, email FROM users WHERE id = ?').get(candidateId);
    logAudit(db, {
      actorId: req.user.id, actorRole: 'super_admin',
      action: 'grant_permission', targetType: 'test_permission', targetId: id,
      details: `Granted access to test "${tN?.name || testId}" for candidate ${cN?.name || candidateId} (${cN?.email || ''})`
    });

    res.status(201).json({ id, candidateId, testId, status: 'granted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/super/permissions/:id/revoke', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const info = db.prepare(`SELECT tp.candidate_id, tp.test_id, t.name AS test_name, u.name AS cand_name, u.email AS cand_email
      FROM test_permissions tp LEFT JOIN tests t ON t.id=tp.test_id LEFT JOIN users u ON u.id=tp.candidate_id WHERE tp.id = ?`).get(req.params.id);
    db.prepare("UPDATE test_permissions SET status = 'revoked' WHERE id = ?").run(req.params.id);
    logAudit(db, {
      actorId: req.user.id, actorRole: 'super_admin',
      action: 'revoke_permission', targetType: 'test_permission', targetId: req.params.id,
      details: info ? `Revoked access to test "${info.test_name}" from candidate ${info.cand_name} (${info.cand_email})` : 'Revoked permission'
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
    const expires = expiresAt || (function(){const d=new Date(Date.now()+24*60*60*1000);const p=(n,w=2)=>String(n).padStart(w,0);return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())+"T"+p(d.getHours())+":"+p(d.getMinutes())+":"+p(d.getSeconds())+"."+p(d.getMilliseconds(),3);})();
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
        id: t.id, name: t.name, test_type: t.test_type, total_questions: t.total_questions,
        totalAttempts: stats.submitted_count || 0,
        avgScore: stats.avg_score ? Math.round(stats.avg_score) : 0,
        passRate: stats.submitted_count > 0 ? Math.round(((stats.passed_count || 0) / stats.submitted_count) * 100) : 0,
        activeNow: stats.active_now || 0
      };
    });

    // Recent activity from audit log
    const recentActivity = db.prepare(`
      SELECT al.*, u.name as actor_name, u.email as actor_email
      FROM audit_log al
      LEFT JOIN users u ON al.actor_id = u.id
      ORDER BY al.timestamp DESC
      LIMIT 20
    `).all().map(a => {
      const detailsObj = a.details ? (() => { try { return JSON.parse(a.details); } catch(e) { return {}; } })() : {};
      return {
        ...a,
        details: detailsObj,
        message: describeAudit(a),
        category: categorizeAudit(a.action),
        timestamp_ist: formatToIST(a.timestamp),
        performed_by: a.actor_name ? `${a.actor_name}${a.actor_email ? ' (' + a.actor_email + ')' : ''}` : null,
      };
    });

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
// TESTS FOR DROPDOWN (grouped: regular + interview prep)
// ============================================================
function buildTestsForDropdown(filterByAdminId) {
  const baseSql = filterByAdminId
    ? `SELECT t.*, u.name as creator_name FROM tests t LEFT JOIN users u ON t.created_by = u.id
       WHERE t.is_active = 1 AND (t.is_custom = 0 OR (t.is_custom = 1 AND t.created_by = ?)) ORDER BY t.name`
    : `SELECT t.*, u.name as creator_name FROM tests t LEFT JOIN users u ON t.created_by = u.id
       WHERE t.is_active = 1 ORDER BY t.name`;
  const rows = filterByAdminId ? db.prepare(baseSql).all(filterByAdminId) : db.prepare(baseSql).all();
  const regular = [], interviewPrep = [];
  for (const t of rows) {
    const item = {
      id: t.id,
      name: t.name,
      test_type: t.test_type,
      is_custom: t.is_custom,
      is_interview_prep: t.is_interview_prep ? 1 : 0,
      total_questions: t.total_questions || 0,
      created_by_name: t.creator_name || 'System'
    };
    if (t.is_interview_prep) interviewPrep.push(item); else regular.push(item);
  }
  // Also include external interview_tests (from interview_tests table) for super admin only
  if (!filterByAdminId) {
    try {
      const iTests = db.prepare(`SELECT id, name FROM interview_tests WHERE is_active = 1 ORDER BY name`).all();
      for (const t of iTests) {
        interviewPrep.push({ id: `interview:${t.id}`, name: t.name, test_type: 'interview', is_custom: 0, is_interview_prep: 1, total_questions: 0, created_by_name: 'System' });
      }
    } catch (e) { /* table may not exist */ }
  }
  return { regular, interviewPrep };
}
app.get('/api/super/tests/all-for-dropdown', authMiddleware, requireRole('super_admin'), (req, res) => {
  try { res.json(buildTestsForDropdown(null)); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});
app.get('/api/admin/tests/all-for-dropdown', authMiddleware, requireRole('admin'), (req, res) => {
  try { res.json(buildTestsForDropdown(req.user.id)); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
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

    if (!name || !String(name).trim()) return res.status(400).json({ error: 'NAME_REQUIRED', message: 'Test name is required' });
    if (!durationMinutes || Number(durationMinutes) <= 0) return res.status(400).json({ error: 'DURATION_REQUIRED', message: 'Duration is required' });
    if (Number(durationMinutes) > 480) return res.status(400).json({ error: 'INVALID_DURATION', message: 'Duration cannot exceed 480 minutes' });
    if (passingPercentage == null || passingPercentage === '' || Number(passingPercentage) < 1 || Number(passingPercentage) > 100) {
      return res.status(400).json({ error: 'INVALID_PERCENTAGE', message: 'Passing percentage must be between 1 and 100' });
    }
    if (mcqCount === 0 && codingCount === 0) return res.status(400).json({ error: 'NO_QUESTIONS', message: 'Must include MCQ questions or coding problems (or both)' });

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

    if (!name || !String(name).trim()) return res.status(400).json({ error: 'NAME_REQUIRED', message: 'Test name is required' });
    if (!durationMinutes || Number(durationMinutes) <= 0) return res.status(400).json({ error: 'DURATION_REQUIRED', message: 'Duration is required' });
    if (Number(durationMinutes) > 480) return res.status(400).json({ error: 'INVALID_DURATION', message: 'Duration cannot exceed 480 minutes' });
    if (passingPercentage == null || passingPercentage === '' || Number(passingPercentage) < 1 || Number(passingPercentage) > 100) {
      return res.status(400).json({ error: 'INVALID_PERCENTAGE', message: 'Passing percentage must be between 1 and 100' });
    }
    if (mcqCount === 0 && codingCount === 0) return res.status(400).json({ error: 'NO_QUESTIONS', message: 'Must include MCQ questions or coding problems (or both)' });

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
      action: 'delete_test', targetType: 'test', targetId: testId,
      details: `Deleted test "${test.name}"`,
      deletedData: JSON.stringify(test)
    });

    res.json({ success: true, deletedSessions: submittedCount });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error: ' + err.message }); }
});

// ============================================================

app.get('/api/super/results', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const { testId, batchId, sessionId, search, status, dateFrom, dateTo, page, limit, sortBy, sortOrder } = req.query;
    const hasFilters = testId || batchId || sessionId || search || status || dateFrom || dateTo || page || limit || sortBy || sortOrder;
    let where = "ts.status = 'submitted'";
    const params = [];
    if (testId) { where += ' AND ts.test_id = ?'; params.push(testId); }
    if (batchId) { where += ' AND u.batch_id = ?'; params.push(batchId); }
    if (sessionId) { where += ' AND ts.session_id = ?'; params.push(sessionId); }
    if (search) {
      where += ' AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ?)';
      const q = `%${String(search).toLowerCase()}%`;
      params.push(q, q);
    }
    if (status === 'pass') where += ' AND ts.passed = 1';
    else if (status === 'fail') where += ' AND (ts.passed = 0 OR ts.passed IS NULL)';
    if (dateFrom) { where += ' AND ts.end_time >= ?'; params.push(dateFrom); }
    if (dateTo) { where += ' AND ts.end_time <= ?'; params.push(dateTo + ' 23:59:59'); }

    const SORT_COLS = {
      date: 'ts.end_time', percentage: 'ts.percentage', score: 'ts.score',
      candidate: 'u.name', test: 't.name', time: 'ts.time_taken',
    };
    const sortCol = SORT_COLS[sortBy] || 'ts.end_time';
    const sortDir = String(sortOrder).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const baseSelect = `
      SELECT ts.id, ts.id as session_id, ts.candidate_id, ts.test_id, ts.status,
             ts.start_time, ts.start_time as started_at, ts.end_time, ts.end_time as submitted_at,
             ts.score, ts.total_questions, ts.percentage, ts.passed, ts.grade,
             ts.time_taken, ts.time_taken as time_taken_seconds,
             ts.session_id as drive_session_id, s.session_code, s.name AS session_name,
             COALESCE(ts.tab_violations, 0) as tab_violations,
             COALESCE(ts.violation_blocked, 0) as violation_blocked,
             COALESCE(ts.auto_submitted, 0) as auto_submitted,
             u.name as candidate_name, u.email as candidate_email, u.batch_id,
             b.name as batch_name, b.code as batch_code,
             t.name as test_name, t.passing_percentage
      FROM test_sessions ts
      JOIN users u ON ts.candidate_id = u.id
      JOIN tests t ON ts.test_id = t.id
      LEFT JOIN batches b ON b.id = u.batch_id
      LEFT JOIN sessions s ON s.id = ts.session_id
      WHERE ${where}
      ORDER BY ${sortCol} ${sortDir}
    `;

    if (hasFilters && (page || limit)) {
      const p = Math.max(1, parseInt(page) || 1);
      const l = Math.min(500, parseInt(limit) || 50);
      const offset = (p - 1) * l;
      const total = db.prepare(`SELECT COUNT(*) as c FROM test_sessions ts JOIN users u ON ts.candidate_id = u.id JOIN tests t ON ts.test_id = t.id WHERE ${where}`).get(...params).c;
      const results = db.prepare(baseSelect + ' LIMIT ? OFFSET ?').all(...params, l, offset);
      return res.json({ results, total, page: p, limit: l });
    }

    const results = db.prepare(baseSelect).all(...params);
    if (hasFilters) return res.json({ results, total: results.length });
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
    const filename = `skillforge_results_${nowLocalIso().split('T')[0]}.csv`;
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

function enrichSessionDetail(session) {
  let questions = [];
  let answers = {};
  try { questions = session.questions_json ? JSON.parse(session.questions_json) : []; } catch (e) { questions = []; }
  try { answers = session.answers_json ? JSON.parse(session.answers_json) : {}; } catch (e) { answers = {}; }
  let result = null;
  try { result = session.result_json ? JSON.parse(session.result_json) : null; } catch (e) { result = null; }

  const enriched = (Array.isArray(questions) ? questions : []).map((q, idx) => {
    const qid = q && q.id != null ? q.id : null;
    let userAnswerRaw;
    if (qid != null && Object.prototype.hasOwnProperty.call(answers, qid)) userAnswerRaw = answers[qid];
    else if (qid != null && Object.prototype.hasOwnProperty.call(answers, String(qid))) userAnswerRaw = answers[String(qid)];
    else if (Object.prototype.hasOwnProperty.call(answers, idx)) userAnswerRaw = answers[idx];
    else if (Object.prototype.hasOwnProperty.call(answers, String(idx))) userAnswerRaw = answers[String(idx)];
    else userAnswerRaw = undefined;

    const isSkipped = userAnswerRaw === undefined || userAnswerRaw === null || userAnswerRaw === '';
    const correctIdx = (q && typeof q.answer === 'number') ? q.answer : (q && q.answer != null ? parseInt(q.answer, 10) : null);
    const options = Array.isArray(q?.options) ? q.options : [];
    const userIdx = isSkipped ? null : (typeof userAnswerRaw === 'number' ? userAnswerRaw : parseInt(userAnswerRaw, 10));
    const isCorrect = !isSkipped && correctIdx != null && userIdx === correctIdx;

    return {
      displayId: q?.displayId || idx + 1,
      id: qid,
      subject: q?.subject,
      topic: q?.topic,
      difficulty: q?.difficulty,
      type: q?.type || 'mcq',
      question: q?.question || q?.question_text || q?.text || '',
      code_snippet: q?.code_snippet || '',
      options,
      correctAnswerIndex: correctIdx,
      correctAnswerText: correctIdx != null && options[correctIdx] != null ? options[correctIdx] : null,
      correctAnswerLetter: correctIdx != null ? String.fromCharCode(65 + correctIdx) : null,
      userAnswerIndex: userIdx != null && !isNaN(userIdx) ? userIdx : null,
      userAnswerText: !isSkipped && userIdx != null && !isNaN(userIdx) && options[userIdx] != null ? options[userIdx] : null,
      userAnswerLetter: !isSkipped && userIdx != null && !isNaN(userIdx) ? String.fromCharCode(65 + userIdx) : null,
      isCorrect,
      isSkipped,
      explanation: q?.explanation || '',
    };
  });

  const correctCount = enriched.filter(q => q.isCorrect).length;
  const skippedCount = enriched.filter(q => q.isSkipped).length;
  const wrongCount = enriched.length - correctCount - skippedCount;

  // For hybrid tests: enrich coding problems from result_json
  let codingProblems = [];
  let codingEarned = 0, codingTotal = 0;
  const testType = session.test_type || 'mcq';
  if (testType === 'hybrid') {
    try {
      const bestScores = session.best_scores_json ? JSON.parse(session.best_scores_json) : {};
      const codingResults = session.coding_results_json ? JSON.parse(session.coding_results_json) : {};
      const problemIds = session.hybrid_problem_ids_json ? JSON.parse(session.hybrid_problem_ids_json) : [];
      problemIds.forEach(pid => {
        const p = db.prepare('SELECT id, title, difficulty, points, section FROM coding_problems WHERE id = ?').get(pid);
        if (!p) return;
        const best = bestScores[pid] || 0;
        const cr = codingResults[pid] || { status: 'not_attempted', passedCases: 0, totalCases: 0, score: 0 };
        codingEarned += best;
        codingTotal += p.points;
        codingProblems.push({
          id: p.id, title: p.title, difficulty: p.difficulty, section: p.section,
          maxPoints: p.points, earned: best, status: cr.status || 'not_attempted',
          passedCases: cr.passedCases || 0, totalCases: cr.totalCases || 0,
        });
      });
    } catch (e) { /* ignore parse errors */ }
  }

  const summary = {
    mcqCorrect: correctCount,
    mcqWrong: wrongCount,
    mcqSkipped: skippedCount,
    mcqTotal: enriched.length,
    mcqPercentage: enriched.length > 0 ? Math.round((correctCount / enriched.length) * 100) : 0,
  };
  if (testType === 'hybrid') {
    summary.codingEarned = codingEarned;
    summary.codingTotal = codingTotal;
    summary.codingPercentage = codingTotal > 0 ? Math.round((codingEarned / codingTotal) * 100) : 0;
    summary.codingProblems = codingProblems.length;
  }

  const out = { ...session, questions: enriched, answers, result,
    timeTakenSeconds: session.time_taken || 0,
    timeTakenFormatted: formatTimeTaken(session.time_taken),
    codingProblems,
    summary,
  };
  delete out.questions_json;
  delete out.answers_json;
  delete out.result_json;
  return out;
}

app.get('/api/super/results/:sessionId', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const session = db.prepare(`
      SELECT ts.*, u.name as candidate_name, u.email as candidate_email, t.name as test_name, t.test_type
      FROM test_sessions ts
      JOIN users u ON ts.candidate_id = u.id
      JOIN tests t ON ts.test_id = t.id
      WHERE ts.id = ?
    `).get(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(enrichSessionDetail(session));
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
             u.batch_id, b.name as batch_name, b.code as batch_code,
             (SELECT COUNT(*) FROM test_permissions WHERE candidate_id = u.id) as permissions_count,
             (SELECT COUNT(*) FROM test_sessions WHERE candidate_id = u.id AND status = 'submitted') as completed_tests,
             (SELECT ROUND(AVG(percentage),1) FROM test_sessions WHERE candidate_id = u.id AND status = 'submitted') as avg_score,
             (SELECT MAX(percentage) FROM test_sessions WHERE candidate_id = u.id AND status = 'submitted') as best_score
      FROM users u
      LEFT JOIN batches b ON b.id = u.batch_id
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
    const { name, email, password, batch_id } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'NAME_REQUIRED', message: 'Candidate name is required' });
    }
    if (!email || !String(email).trim()) {
      return res.status(400).json({ error: 'EMAIL_REQUIRED', message: 'Email address is required' });
    }
    if (!password || String(password).length < 6) {
      return res.status(400).json({ error: 'PASSWORD_REQUIRED', message: 'Password must be at least 6 characters' });
    }
    if (!batch_id) {
      return res.status(400).json({ error: 'BATCH_REQUIRED', message: 'Batch code is required to create a candidate' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'INVALID_EMAIL', message: 'Invalid email format' });
    }
    const safeName = sanitizeHtml(name.trim());

    const existing = db.prepare(`
      SELECT u.id, u.name, u.email, u.batch_id, b.code AS batch_code
      FROM users u
      LEFT JOIN batches b ON u.batch_id = b.id
      WHERE LOWER(u.email) = LOWER(?)
    `).get(email);
    if (existing) {
      const sameName  = (existing.name || '') === safeName;
      const existingBatch = existing.batch_id || null;
      const newBatch = batch_id || null;
      const sameBatch = String(existingBatch || '') === String(newBatch || '');
      const existingCandidate = {
        id: existing.id, name: existing.name, email: existing.email,
        batchCode: existing.batch_code || null,
      };
      if (sameName && sameBatch) {
        return res.status(409).json({
          error: 'DUPLICATE_CANDIDATE',
          message: 'A candidate with this name, email and batch already exists',
          existingCandidate,
        });
      }
      return res.status(409).json({
        error: 'EMAIL_EXISTS',
        message: 'An account with this email already exists',
        existingCandidate,
      });
    }

    const b = db.prepare('SELECT id, code, name FROM batches WHERE id = ?').get(batch_id);
    if (!b) return res.status(400).json({ error: 'BATCH_NOT_FOUND', message: 'Selected batch does not exist' });
    const resolvedBatchId = b.id, resolvedBatchCode = b.code;

    const id = uuidv4();
    const hashed = hashPassword(password);

    db.prepare(`
      INSERT INTO users (id, name, email, password, role, created_by, batch_id)
      VALUES (?, ?, ?, ?, 'candidate', ?, ?)
    `).run(id, safeName, email, hashed, req.user.id, resolvedBatchId);

    logAudit(db, {
      actorId: req.user.id, actorRole: 'admin',
      action: 'create_candidate', targetType: 'user', targetId: id,
      details: `Created candidate account for ${safeName} (${email}) in batch ${resolvedBatchCode || 'none'}`
    });

    res.status(201).json({ id, name: safeName, email, role: 'candidate', batch_id: resolvedBatchId, batchCode: resolvedBatchCode });
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

app.get('/api/admin/candidates/:id/performance', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const owns = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'candidate' AND created_by = ?").get(req.params.id, req.user.id);
    if (!owns) return res.status(404).json({ error: 'Candidate not found' });
    const data = buildCandidatePerformance(req.params.id);
    if (!data) return res.status(404).json({ error: 'Candidate not found' });
    res.json(data);
  } catch (err) {
    console.error('[admin/candidates/:id/performance]', err);
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
    const c = db.prepare("SELECT * FROM users WHERE id = ? AND role = 'candidate' AND created_by = ?").get(req.params.id, req.user.id);
    if (!c) return res.status(404).json({ error: 'Candidate not found' });

    db.prepare("DELETE FROM test_permissions WHERE candidate_id = ?").run(req.params.id);
    db.prepare("DELETE FROM test_sessions WHERE candidate_id = ?").run(req.params.id);
    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);

    logAudit(db, {
      actorId: req.user.id, actorRole: 'admin',
      action: 'delete_candidate', targetType: 'user', targetId: req.params.id,
      details: `Deleted candidate ${c.name} (${c.email})`,
      deletedData: JSON.stringify(c)
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

    // Verify candidate exists (admins can grant permissions to any candidate)
    const candidate = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'candidate'").get(candidateId);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    const id = uuidv4();
    db.prepare(`
      INSERT INTO test_permissions (id, candidate_id, test_id, max_attempts, granted_by, granted_at)
      VALUES (?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%f','now','localtime'))
    `).run(id, candidateId, testId, maxAttempts || 1, req.user.id);

    const tN2 = db.prepare('SELECT name FROM tests WHERE id = ?').get(testId);
    const cN2 = db.prepare('SELECT name, email FROM users WHERE id = ?').get(candidateId);
    logAudit(db, {
      actorId: req.user.id, actorRole: 'admin',
      action: 'grant_permission', targetType: 'test_permission', targetId: id,
      details: `Granted access to test "${tN2?.name || testId}" for candidate ${cN2?.name || candidateId} (${cN2?.email || ''})`
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
      WHERE tp.id = ? AND (u.created_by = ? OR tp.granted_by = ?)
    `).get(req.params.id, req.user.id, req.user.id);
    if (!perm) return res.status(404).json({ error: 'Permission not found' });

    const infoA = db.prepare(`SELECT tp.candidate_id, tp.test_id, t.name AS test_name, u.name AS cand_name, u.email AS cand_email
      FROM test_permissions tp LEFT JOIN tests t ON t.id=tp.test_id LEFT JOIN users u ON u.id=tp.candidate_id WHERE tp.id = ?`).get(req.params.id);
    db.prepare("UPDATE test_permissions SET status = 'revoked' WHERE id = ?").run(req.params.id);
    logAudit(db, {
      actorId: req.user.id, actorRole: 'admin',
      action: 'revoke_permission', targetType: 'test_permission', targetId: req.params.id,
      details: infoA ? `Revoked access to test "${infoA.test_name}" from candidate ${infoA.cand_name} (${infoA.cand_email})` : 'Revoked permission'
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
      WHERE tp.id = ? AND (u.created_by = ? OR tp.granted_by = ?)
    `).get(req.params.id, req.user.id, req.user.id);
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
      WHERE tp.id = ? AND (u.created_by = ? OR tp.granted_by = ?)
    `).get(req.params.id, req.user.id, req.user.id);
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
      WHERE tp.id = ? AND (u.created_by = ? OR tp.granted_by = ?)
    `).get(req.params.id, req.user.id, req.user.id);
    if (!perm) return res.status(404).json({ error: 'Permission not found' });

    const { expiresAt } = req.body;
    const expires = expiresAt || (function(){const d=new Date(Date.now()+24*60*60*1000);const p=(n,w=2)=>String(n).padStart(w,0);return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())+"T"+p(d.getHours())+":"+p(d.getMinutes())+":"+p(d.getSeconds())+"."+p(d.getMilliseconds(),3);})();
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
    const filename = `skillforge_results_${nowLocalIso().split('T')[0]}.csv`;
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
      SELECT ts.*, u.name as candidate_name, u.email as candidate_email, t.name as test_name, t.test_type
      FROM test_sessions ts
      JOIN users u ON ts.candidate_id = u.id
      JOIN tests t ON ts.test_id = t.id
      WHERE ts.id = ? AND u.created_by = ?
    `).get(req.params.sessionId, req.user.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(enrichSessionDetail(session));
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
      SELECT al.*, u.name as actor_name, u.email as actor_email
      FROM audit_log al
      LEFT JOIN users u ON al.actor_id = u.id
      WHERE al.actor_id = ? OR al.target_id IN (
        SELECT id FROM users WHERE created_by = ?
      )
      ORDER BY al.timestamp DESC
      LIMIT 20
    `).all(req.user.id, req.user.id).map(a => {
      const detailsObj = a.details ? (() => { try { return JSON.parse(a.details); } catch(e) { return {}; } })() : {};
      return {
        ...a,
        details: detailsObj,
        message: describeAudit(a),
        category: categorizeAudit(a.action),
        timestamp_ist: formatToIST(a.timestamp),
        performed_by: a.actor_name ? `${a.actor_name}${a.actor_email ? ' (' + a.actor_email + ')' : ''}` : null,
      };
    });

    const allTests = db.prepare('SELECT * FROM tests WHERE is_active = 1').all();
    const testStats = allTests.map(t => {
      const s = db.prepare(`
        SELECT COUNT(*) as total_attempts,
               AVG(CASE WHEN ts.status='submitted' THEN ts.percentage END) as avg_score,
               SUM(CASE WHEN ts.status='submitted' AND ts.passed=1 THEN 1 ELSE 0 END) as passed_count,
               SUM(CASE WHEN ts.status='submitted' THEN 1 ELSE 0 END) as submitted_count
        FROM test_sessions ts JOIN users u ON ts.candidate_id = u.id
        WHERE ts.test_id = ? AND u.created_by = ?
      `).get(t.id, req.user.id);
      return {
        id: t.id, name: t.name, test_type: t.test_type, total_questions: t.total_questions,
        totalAttempts: s.submitted_count || 0,
        avgScore: s.avg_score ? Math.round(s.avg_score) : 0,
        passRate: s.submitted_count > 0 ? Math.round(((s.passed_count || 0) / s.submitted_count) * 100) : 0,
      };
    }).filter(t => t.totalAttempts > 0);

    res.json({ candidates, testsAssigned, liveSessions, passRate, totalSessions, recentActivity, testStats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/results', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const { testId, batchId, sessionId, search, status, dateFrom, dateTo, page, limit, sortBy, sortOrder } = req.query;
    const hasFilters = testId || batchId || sessionId || search || status || dateFrom || dateTo || page || limit || sortBy || sortOrder;
    let where = "ts.status = 'submitted' AND u.created_by = ?";
    const params = [req.user.id];
    if (testId) { where += ' AND ts.test_id = ?'; params.push(testId); }
    if (batchId) { where += ' AND u.batch_id = ?'; params.push(batchId); }
    if (sessionId) { where += ' AND ts.session_id = ?'; params.push(sessionId); }
    if (search) {
      where += ' AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ?)';
      const q = `%${String(search).toLowerCase()}%`;
      params.push(q, q);
    }
    if (status === 'pass') where += ' AND ts.passed = 1';
    else if (status === 'fail') where += ' AND (ts.passed = 0 OR ts.passed IS NULL)';
    if (dateFrom) { where += ' AND ts.end_time >= ?'; params.push(dateFrom); }
    if (dateTo) { where += ' AND ts.end_time <= ?'; params.push(dateTo + ' 23:59:59'); }

    const SORT_COLS = {
      date: 'ts.end_time', percentage: 'ts.percentage', score: 'ts.score',
      candidate: 'u.name', test: 't.name', time: 'ts.time_taken',
    };
    const sortCol = SORT_COLS[sortBy] || 'ts.end_time';
    const sortDir = String(sortOrder).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const baseSelect = `
      SELECT ts.id, ts.id as session_id, ts.candidate_id, ts.test_id, ts.status,
             ts.start_time, ts.start_time as started_at, ts.end_time, ts.end_time as submitted_at,
             ts.score, ts.total_questions, ts.percentage, ts.passed, ts.grade,
             ts.time_taken, ts.time_taken as time_taken_seconds,
             ts.session_id as drive_session_id, s.session_code, s.name AS session_name,
             COALESCE(ts.tab_violations, 0) as tab_violations,
             COALESCE(ts.violation_blocked, 0) as violation_blocked,
             COALESCE(ts.auto_submitted, 0) as auto_submitted,
             u.name as candidate_name, u.email as candidate_email, u.batch_id,
             b.name as batch_name, b.code as batch_code,
             t.name as test_name, t.passing_percentage
      FROM test_sessions ts
      JOIN users u ON ts.candidate_id = u.id
      JOIN tests t ON ts.test_id = t.id
      LEFT JOIN batches b ON b.id = u.batch_id
      LEFT JOIN sessions s ON s.id = ts.session_id
      WHERE ${where}
      ORDER BY ${sortCol} ${sortDir}
    `;

    if (hasFilters && (page || limit)) {
      const p = Math.max(1, parseInt(page) || 1);
      const l = Math.min(500, parseInt(limit) || 50);
      const offset = (p - 1) * l;
      const total = db.prepare(`SELECT COUNT(*) as c FROM test_sessions ts JOIN users u ON ts.candidate_id = u.id JOIN tests t ON ts.test_id = t.id WHERE ${where}`).get(...params).c;
      const results = db.prepare(baseSelect + ' LIMIT ? OFFSET ?').all(...params, l, offset);
      return res.json({ results, total, page: p, limit: l });
    }

    const results = db.prepare(baseSelect).all(...params);
    if (hasFilters) return res.json({ results, total: results.length });
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
    const fullUser = db.prepare(`
      SELECT u.id, u.name, u.email, u.batch_id, b.name as batch_name, b.code as batch_code
      FROM users u LEFT JOIN batches b ON b.id = u.batch_id
      WHERE u.id = ?
    `).get(candidateId);

    // Use one permission per test_id: prefer granted > completed > analysis_only > revoked/expired.
    // Within the same priority, take the most recently granted one.
    const permissions = db.prepare(`
      SELECT tp.*, t.name as test_name, t.description as test_description,
             t.duration_minutes, t.passing_percentage, t.total_questions,
             t.test_type, COALESCE(t.is_interview_prep, 0) as is_interview_prep,
             u.name as granted_by_name
      FROM test_permissions tp
      JOIN tests t ON tp.test_id = t.id
      LEFT JOIN users u ON tp.granted_by = u.id
      WHERE tp.candidate_id = ?
        AND COALESCE(t.test_type, 'mcq') != 'interview'
        AND tp.id = (
          SELECT tp2.id FROM test_permissions tp2
          WHERE tp2.candidate_id = tp.candidate_id AND tp2.test_id = tp.test_id
          ORDER BY
            CASE tp2.status
              WHEN 'granted'       THEN 0
              WHEN 'completed'     THEN 1
              WHEN 'analysis_only' THEN 2
              ELSE                      3
            END,
            tp2.granted_at DESC
          LIMIT 1
        )
      ORDER BY tp.granted_at DESC
    `).all(candidateId);

    const tests = permissions.map(perm => {
      const sessions = db.prepare(`
        SELECT id, status, start_time, end_time, score, total_questions, percentage, passed, grade, time_taken,
               COALESCE(tab_violations, 0) as tab_violations,
               COALESCE(violation_blocked, 0) as violation_blocked,
               COALESCE(auto_submitted, 0) as auto_submitted,
               COALESCE(attempt_number, 1) as attempt_number
        FROM test_sessions
        WHERE candidate_id = ? AND test_id = ?
        ORDER BY start_time DESC
      `).all(candidateId, perm.test_id).map(s => ({
        ...s,
        violationCount: s.tab_violations || 0,
        violationBlocked: (s.violation_blocked === 1) || ((s.tab_violations || 0) >= 3),
        autoSubmitted: s.auto_submitted === 1,
        attemptNumber: s.attempt_number || 1,
      }));

      let status = 'locked';
      const inProgress = sessions.find(s => s.status === 'in_progress');
      if (perm.status === 'revoked') status = 'locked';
      else if (perm.analysis_only === 1) {
        status = (perm.analysis_expires_at && new Date(perm.analysis_expires_at) < new Date()) ? 'expired' : 'analysis_only';
      }
      else if (inProgress) status = 'in_progress';
      else if (parseInt(perm.attempt_count) >= parseInt(perm.max_attempts)) status = 'completed';
      else if (perm.status === 'granted') status = 'available';

      const submittedSessions = sessions.filter(s => s.status === 'submitted');
      const validSubmitted = submittedSessions.filter(s => !s.violationBlocked);
      const bestSession = validSubmitted.sort((a, b) => (b.percentage || 0) - (a.percentage || 0))[0];
      const latestSubmitted = submittedSessions[0] || null;
      const allBlocked = submittedSessions.length > 0 && validSubmitted.length === 0;

      return {
        // camelCase for frontend
        testId: perm.test_id,
        testName: perm.test_name,
        testDescription: perm.test_description || '',
        testType: perm.test_type || 'mcq',
        isInterviewPrep: perm.is_interview_prep === 1,
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
        violationBlocked: allBlocked,
        latestViolationCount: latestSubmitted?.violationCount || 0,
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

    const regular_tests = tests.filter(t => !t.isInterviewPrep);
    const interview_prep_tests = tests.filter(t => t.isInterviewPrep);

    // Drive session: most-recent active session the candidate is attached to
    let activeSession = null;
    try {
      const s = db.prepare(`
        SELECT s.id, s.session_code, s.name, s.date_from, s.date_to, s.tunnel_url, s.status
        FROM sessions s
        JOIN test_permissions tp ON tp.session_id = s.id
        WHERE tp.candidate_id = ? AND s.status = 'active'
        ORDER BY s.date_from DESC LIMIT 1
      `).get(candidateId);
      if (s) {
        const now = Date.now();
        const from = parseDbTime(s.date_from);
        const to = parseDbTime(s.date_to);
        let derived = 'active';
        if (now < from) derived = 'upcoming';
        else if (now > to) derived = 'expired';
        activeSession = {
          sessionCode: s.session_code,
          sessionName: s.name,
          dateFrom: s.date_from,
          dateTo: s.date_to,
          tunnelUrl: s.tunnel_url || null,
          status: derived,
        };
      }
    } catch (e) { console.error('activeSession fetch error:', e); }

    res.json({
      candidate: { id: fullUser?.id || candidateId, name: fullUser?.name || req.user.name, email: fullUser?.email || req.user.email, batch_id: fullUser?.batch_id || null, batch_name: fullUser?.batch_name || null, batch_code: fullUser?.batch_code || null },
      tests,
      regular_tests,
      interview_prep_tests,
      activeSession
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
      let subjectScores = {};
      try { const r = JSON.parse(s.result_json || '{}'); subjectScores = r.subjectScores || {}; } catch(e) {}

      // Compute correct/skipped/wrong from stored data
      // s.score = number of correct MCQ answers (set at submission time)
      let correctCount = s.score || 0;
      let skippedCount = 0;
      let wrongCount = 0;
      try {
        const questions = JSON.parse(s.questions_json || '[]');
        const answers = JSON.parse(s.answers_json || '{}');
        questions.forEach(q => {
          const ans = answers[String(q.id)];
          if (ans == null || ans === '' || ans === -1) skippedCount++;
        });
        wrongCount = Math.max(0, questions.length - correctCount - skippedCount);
      } catch(e) {}

      return {
        sessionId: s.id, testId: s.test_id, testName: s.test_name, attemptNumber: idx + 1,
        submittedAt: s.end_time || s.submitted_at, score: s.score || 0,
        total: s.total_questions || 100, percentage: Math.round(s.percentage || 0),
        passed: s.passed === 1, timeTaken: s.time_taken || 0, subjectScores,
        correctCount, wrongCount, skippedCount,
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

    // Per-test attempt counter so multi-attempt tests show "t2 #1", "t2 #2" etc.
    const testAttemptCounters = {};
    const trend = sessionData.map((s) => {
      testAttemptCounters[s.testId] = (testAttemptCounters[s.testId] || 0) + 1;
      return {
        label: s.testName,
        attemptNum: testAttemptCounters[s.testId],
        testName: s.testName, percentage: s.percentage, passed: s.passed,
        date: s.submittedAt ? new Date(s.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '',
      };
    });

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

// Shared analytics logic for admin/super to view any candidate's analytics
function getCandidateAnalytics(candidateId) {
  const sessions = db.prepare(`
    SELECT ts.*, t.name as test_name, t.total_questions, t.passing_percentage, t.duration_minutes
    FROM test_sessions ts JOIN tests t ON ts.test_id = t.id
    WHERE ts.candidate_id = ? AND ts.status = 'submitted' ORDER BY ts.end_time ASC
  `).all(candidateId);
  if (sessions.length === 0) return { hasData: false, sessions: [] };

  const sessionData = sessions.map((s) => {
    let subjectScores = {};
    try { const r = JSON.parse(s.result_json || '{}'); subjectScores = r.subjectScores || {}; } catch(e) {}
    let correctCount = s.score || 0, skippedCount = 0, wrongCount = 0;
    try {
      const questions = JSON.parse(s.questions_json || '[]');
      const answers = JSON.parse(s.answers_json || '{}');
      questions.forEach(q => { const ans = answers[String(q.id)]; if (ans == null || ans === '' || ans === -1) skippedCount++; });
      wrongCount = Math.max(0, questions.length - correctCount - skippedCount);
    } catch(e) {}
    return {
      sessionId: s.id, testId: s.test_id, testName: s.test_name, submittedAt: s.end_time || s.submitted_at,
      score: s.score || 0, total: s.total_questions || 100, percentage: Math.round(s.percentage || 0),
      passed: s.passed === 1, timeTaken: s.time_taken || 0, subjectScores, correctCount, wrongCount, skippedCount,
    };
  });

  const totalAttempts = sessionData.length;
  const totalPassed = sessionData.filter(s => s.passed).length;
  const avgScore = Math.round(sessionData.reduce((a, s) => a + s.percentage, 0) / totalAttempts);
  const bestScore = Math.max(...sessionData.map(s => s.percentage));
  const latestScore = sessionData[sessionData.length - 1].percentage;
  const improvement = sessionData.length > 1 ? latestScore - sessionData[0].percentage : 0;

  const subjectAgg = {};
  sessionData.forEach(s => {
    const sess = db.prepare('SELECT questions_json FROM test_sessions WHERE id=?').get(s.sessionId);
    const validSubjects = new Set();
    try { JSON.parse(sess?.questions_json || '[]').forEach(q => { if (q.subject) validSubjects.add(q.subject); }); } catch(e) {}
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
    .map(([name, d]) => ({ name, correct: d.correct, total: d.total, percentage: Math.round((d.correct / d.total) * 100), testNames: d.testNames }))
    .sort((a, b) => b.percentage - a.percentage);

  const testAttemptCounters = {};
  const trend = sessionData.map(s => {
    testAttemptCounters[s.testId] = (testAttemptCounters[s.testId] || 0) + 1;
    return {
      label: s.testName, attemptNum: testAttemptCounters[s.testId],
      testName: s.testName, percentage: s.percentage, passed: s.passed,
      date: s.submittedAt ? new Date(s.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '',
    };
  });

  return {
    hasData: true,
    overview: { totalAttempts, totalPassed, avgScore, bestScore, latestScore, improvement },
    trend, subjectBreakdown,
    strengths: subjectBreakdown.filter(s => s.percentage >= 70 && s.total >= 3).slice(0, 3),
    weaknesses: subjectBreakdown.filter(s => s.percentage < 60 && s.total >= 3).sort((a,b) => a.percentage - b.percentage).slice(0, 3),
    sessions: sessionData,
  };
}

app.get('/api/super/analytics/:candidateId', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const candidate = db.prepare('SELECT id FROM users WHERE id = ? AND role = ?').get(req.params.candidateId, 'candidate');
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    res.json(getCandidateAnalytics(req.params.candidateId));
  } catch (err) { console.error('Analytics error:', err); res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/analytics/:candidateId', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const candidate = db.prepare('SELECT id FROM users WHERE id = ? AND role = ? AND created_by = ?').get(req.params.candidateId, 'candidate', req.user.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    res.json(getCandidateAnalytics(req.params.candidateId));
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

    // Attempt number for this new session = completed attempts + 1.
    // Resuming an existing in-progress session reuses its stored attempt_number,
    // so we only consult this value for fresh inserts below.
    const newAttemptNumber = (permission.attempt_count || 0) + 1;

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
      // Fall back to all python problems if none are linked to this test specifically
      let rawProblems = db.prepare('SELECT * FROM coding_problems WHERE test_id = ?').all(testId);
      if (rawProblems.length === 0) {
        // Coding test created via design-test: problems may not be stored with this test_id.
        // Use the test's coding_problem_count to pick a seeded-random subset of all python problems.
        const testRecord2 = db.prepare('SELECT coding_problem_count FROM tests WHERE id = ?').get(testId);
        const wantCount = testRecord2?.coding_problem_count || 1;
        const allPython = db.prepare("SELECT * FROM coding_problems WHERE evaluation_type = 'python' OR section LIKE '%Python%' ORDER BY id").all();
        if (allPython.length > 0) {
          const shuffled = seededShuffle(allPython.map(p => p.id), hashCode(candidateId + testId + '_coding'));
          const picked = shuffled.slice(0, wantCount);
          rawProblems = picked.map(id => allPython.find(p => p.id === id)).filter(Boolean);
        }
      }
      if (rawProblems.length === 0) {
        return res.status(400).json({ error: 'No coding problems are available for this test yet. Please contact your administrator.' });
      }
      const allProblems = rawProblems;
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
        INSERT INTO test_sessions (id, candidate_id, test_id, permission_id, status, start_time, duration_minutes,
          total_questions, code_map_json, coding_results_json, best_scores_json, attempt_number)
        VALUES (?, ?, ?, ?, 'in_progress', strftime('%Y-%m-%dT%H:%M:%f','now','localtime'), ?, ?, '{}', '{}', '{}', ?)
      `).run(sessionId, candidateId, testId, permission.id, permission.duration_minutes, allProblems.length, newAttemptNumber);

      logAudit(db, {
        actorId: candidateId, actorRole: 'candidate',
        action: 'start_test', targetType: 'test_session', targetId: sessionId,
        details: { testId, testType: 'coding', problemCount: allProblems.length, totalPoints }
      });

      return res.json({
        testType: 'coding', sessionId,
        startTime: nowLocalIso(), start_time: nowLocalIso(),
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
        // First try problems specific to this test, then fall back to general python problems
        let candidateProblems = db.prepare("SELECT id FROM coding_problems WHERE test_id = ? ORDER BY id").all(testId);
        if (candidateProblems.length === 0) {
          candidateProblems = db.prepare("SELECT id FROM coding_problems WHERE evaluation_type = 'python' ORDER BY id").all();
        }
        const shuffled = seededShuffle(candidateProblems.map(p => p.id), hashCode(candidateId + testId + '_coding'));
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
        INSERT INTO test_sessions (id, candidate_id, test_id, permission_id, status, start_time, duration_minutes,
          questions_json, answers_json, total_questions, code_map_json, coding_results_json, best_scores_json, hybrid_problem_ids_json, attempt_number)
        VALUES (?, ?, ?, ?, 'in_progress', strftime('%Y-%m-%dT%H:%M:%f','now','localtime'), ?, ?, '{}', ?, '{}', '{}', '{}', ?, ?)
      `).run(sessionId, candidateId, testId, permission.id, permission.duration_minutes,
        JSON.stringify(mcqQuestions), mcqQuestions.length, JSON.stringify(selectedProblemIds), newAttemptNumber);

      logAudit(db, {
        actorId: candidateId, actorRole: 'candidate',
        action: 'start_test', targetType: 'test_session', targetId: sessionId,
        details: { testId, testType: 'hybrid', mcqCount: mcqQuestions.length, codingCount: safeProblems.length, totalPoints }
      });

      return res.json({
        testType: 'hybrid', sessionId,
        startTime: nowLocalIso(), start_time: nowLocalIso(),
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
        INSERT INTO test_sessions (id, candidate_id, test_id, permission_id, status, start_time, duration_minutes, answers_json, attempt_number)
        VALUES (?, ?, ?, ?, 'in_progress', strftime('%Y-%m-%dT%H:%M:%f','now','localtime'), ?, '{}', ?)
      `).run(sessionId, candidateId, testId, permission.id, permission.duration_minutes, newAttemptNumber);

      return res.json({
        testType: 'mcq',
        sessionId,
        startTime: nowLocalIso(),
        safeQuestions: [],
        durationMinutes: permission.duration_minutes,
        message: 'This test uses external question system'
      });
    }

    db.prepare(`
      INSERT INTO test_sessions (id, candidate_id, test_id, permission_id, status, start_time, duration_minutes, questions_json, answers_json, total_questions, attempt_number)
      VALUES (?, ?, ?, ?, 'in_progress', strftime('%Y-%m-%dT%H:%M:%f','now','localtime'), ?, ?, '{}', ?, ?)
    `).run(
      sessionId, candidateId, testId, permission.id,
      permission.duration_minutes,
      JSON.stringify(result.questions),
      result.questions.length,
      newAttemptNumber
    );

    logAudit(db, {
      actorId: candidateId, actorRole: 'candidate',
      action: 'start_test', targetType: 'test_session', targetId: sessionId,
      details: { testId, questionCount: result.questions.length }
    });

    res.json({
      testType: 'mcq',
      sessionId,
      startTime: nowLocalIso(),
      start_time: nowLocalIso(),
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
      // Calculate actual elapsed seconds (capped at test duration)
      const autoTimeTaken = Math.min(
        calcTimeDiff(session.start_time, nowLocalIso()),
        (test?.duration_minutes || 90) * 60
      ) || (test?.duration_minutes || 90) * 60;
      if (testType === 'coding') {
        const bestScores = JSON.parse(session.best_scores_json || '{}');
        const allProblems = db.prepare('SELECT * FROM coding_problems WHERE test_id = ?').all(testId);
        const totalPoints = allProblems.reduce((s, p) => s + p.points, 0);
        const earnedPoints = Object.values(bestScores).reduce((a, b) => a + b, 0);
        const pct = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
        db.prepare(`UPDATE test_sessions SET status='timed_out', end_time=strftime('%Y-%m-%dT%H:%M:%f','now','localtime'),
          score=?, total_questions=?, percentage=?, passed=?, time_taken=? WHERE id=?`)
          .run(earnedPoints, allProblems.length, pct, pct >= 60 ? 1 : 0, autoTimeTaken, session.id);
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
        db.prepare(`UPDATE test_sessions SET status='timed_out', end_time=strftime('%Y-%m-%dT%H:%M:%f','now','localtime'),
          score=?, total_questions=?, percentage=?, passed=?, time_taken=? WHERE id=?`)
          .run(score, total, pct, pct >= 60 ? 1 : 0, autoTimeTaken, session.id);
      }
      db.prepare('UPDATE test_permissions SET attempt_count=attempt_count+1 WHERE candidate_id=? AND test_id=?')
        .run(candidateId, testId);
      return res.json({ hasActiveSession: false, timedOut: true });
    }

    // Coding test active session
    if (testType === 'coding') {
      let rawActiveProblems = db.prepare('SELECT * FROM coding_problems WHERE test_id = ?').all(testId);
      if (rawActiveProblems.length === 0) {
        const testRecord3 = db.prepare('SELECT coding_problem_count FROM tests WHERE id = ?').get(testId);
        const wantCount2 = testRecord3?.coding_problem_count || 1;
        const allPython2 = db.prepare("SELECT * FROM coding_problems WHERE evaluation_type = 'python' OR section LIKE '%Python%' ORDER BY id").all();
        if (allPython2.length > 0) {
          const shuffled2 = seededShuffle(allPython2.map(p => p.id), hashCode(candidateId + testId + '_coding'));
          const picked2 = shuffled2.slice(0, wantCount2);
          rawActiveProblems = picked2.map(id => allPython2.find(p => p.id === id)).filter(Boolean);
        }
      }
      const allProblems = rawActiveProblems;
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
        problems: safeProblems.length > 0 ? safeProblems : null,
        totalPoints, sections,
        startTime: session.start_time, durationMinutes: test?.duration_minutes || 90,
        testName: test?.name || '', remainingSeconds: Math.floor(remainingMs / 1000),
        codeMap, codingResults, bestScores,
        hasActiveSession: safeProblems.length > 0
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
    const { sessionId: reqSessionId, problemId, code } = req.body;
    const candidateId = req.user.id;

    // Look up session by ID, or fall back to active session for this test
    let session;
    if (reqSessionId) {
      session = db.prepare('SELECT * FROM test_sessions WHERE id = ? AND candidate_id = ? AND test_id = ? AND status = ?')
        .get(reqSessionId, candidateId, testId, 'in_progress');
    }
    if (!session) {
      session = db.prepare('SELECT * FROM test_sessions WHERE candidate_id = ? AND test_id = ? AND status = ? ORDER BY start_time DESC LIMIT 1')
        .get(candidateId, testId, 'in_progress');
    }
    if (!session) return res.status(404).json({ error: 'Session not found or not active' });

    // Look up problem by ID (hybrid tests may use problems from other test_ids)
    let problem = db.prepare('SELECT * FROM coding_problems WHERE id = ? AND test_id = ?').get(problemId, testId);
    if (!problem) problem = db.prepare('SELECT * FROM coding_problems WHERE id = ?').get(problemId);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    // Save code
    const codeMap = JSON.parse(session.code_map_json || '{}');
    codeMap[problemId] = code;
    db.prepare('UPDATE test_sessions SET code_map_json = ? WHERE id = ?').run(JSON.stringify(codeMap), session.id);

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
    const { sessionId: reqSessionId, problemId, code, customInput } = req.body;
    const candidateId = req.user.id;

    // Look up session by ID, or fall back to active session for this test
    let session;
    if (reqSessionId) {
      session = db.prepare('SELECT * FROM test_sessions WHERE id = ? AND candidate_id = ? AND test_id = ? AND status = ?')
        .get(reqSessionId, candidateId, testId, 'in_progress');
    }
    if (!session) {
      session = db.prepare('SELECT * FROM test_sessions WHERE candidate_id = ? AND test_id = ? AND status = ? ORDER BY start_time DESC LIMIT 1')
        .get(candidateId, testId, 'in_progress');
    }
    if (!session) return res.status(404).json({ error: 'Session not found or not active' });

    // Look up problem by ID (hybrid tests may use problems from other test_ids)
    let problem = db.prepare('SELECT * FROM coding_problems WHERE id = ? AND test_id = ?').get(problemId, testId);
    if (!problem) problem = db.prepare('SELECT * FROM coding_problems WHERE id = ?').get(problemId);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    // Save code
    const codeMap = JSON.parse(session.code_map_json || '{}');
    codeMap[problemId] = code;
    db.prepare('UPDATE test_sessions SET code_map_json = ? WHERE id = ?').run(JSON.stringify(codeMap), session.id);

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
    const { sessionId: reqSessionId, problemId, code } = req.body;
    const candidateId = req.user.id;

    // Look up session by ID, or fall back to active session for this test
    let session;
    if (reqSessionId) {
      session = db.prepare('SELECT * FROM test_sessions WHERE id = ? AND candidate_id = ? AND test_id = ? AND status = ?')
        .get(reqSessionId, candidateId, testId, 'in_progress');
    }
    if (!session) {
      session = db.prepare('SELECT * FROM test_sessions WHERE candidate_id = ? AND test_id = ? AND status = ? ORDER BY start_time DESC LIMIT 1')
        .get(candidateId, testId, 'in_progress');
    }
    if (!session) return res.status(404).json({ error: 'Session not found or not active' });

    // Look up problem by ID (hybrid tests may use problems from other test_ids)
    let problem = db.prepare('SELECT * FROM coding_problems WHERE id = ? AND test_id = ?').get(problemId, testId);
    if (!problem) problem = db.prepare('SELECT * FROM coding_problems WHERE id = ?').get(problemId);
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
      .run(JSON.stringify(codeMap), JSON.stringify(codingResults), JSON.stringify(bestScores), session.id);

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

    // Mark auto-submission triggered by violations
    const isAutoSubmit = req.body.auto === true || req.body.auto === 1;
    const violationCount = session.tab_violations || 0;
    const isViolationBlocked = isAutoSubmit && violationCount >= 3 ? 1 : 0;
    if (isAutoSubmit) {
      db.prepare('UPDATE test_sessions SET auto_submitted = 1 WHERE id = ?').run(sessionId);
    }
    if (isViolationBlocked) {
      db.prepare('UPDATE test_sessions SET violation_blocked = 1 WHERE id = ?').run(sessionId);
    }

    // Time taken — clamped via calcTimeDiff (0..86400 seconds)
    const timeTaken = calcTimeDiff(session.start_time, getLocalTime());

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
        SET status = 'submitted', end_time = strftime('%Y-%m-%dT%H:%M:%f','now','localtime'), score = ?, total_questions = ?,
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
      const timeTaken = calcTimeDiff(session.start_time, getLocalTime());

      // Merge submitted answers with session answers before saving
      const hybridMergedAnswers = { ...sessionAnswers };
      for (const [k, v] of Object.entries(submittedAnswers)) {
        const parsed = parseInt(v, 10);
        if (!isNaN(parsed)) hybridMergedAnswers[String(k)] = parsed;
      }

      const hybridGrade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : percentage >= 50 ? 'D' : 'F';
      const hybridResultJson = JSON.stringify({
        testType: 'hybrid', passed, percentage,
        mcqScore, mcqTotal, codingEarned, codingTotal,
        score: mcqScore + codingEarned, total: mcqTotal + problemIds.length,
        grade: hybridGrade, timeTaken
      });

      db.prepare(`
        UPDATE test_sessions SET status='submitted', end_time=strftime('%Y-%m-%dT%H:%M:%f','now','localtime'),
          answers_json=?, score=?, total_questions=?, percentage=?, passed=?, time_taken=?,
          coding_results_json=?, result_json=?, grade=?
        WHERE id=?
      `).run(
        JSON.stringify(hybridMergedAnswers), mcqScore + codingEarned,
        mcqTotal + problemIds.length, percentage, passed ? 1 : 0, timeTaken,
        session.coding_results_json, hybridResultJson, hybridGrade, session.id
      );

      // BUG FIX: respect max_attempts instead of always setting 'completed'
      const hybridPerm = session.permission_id
        ? db.prepare('SELECT * FROM test_permissions WHERE id = ?').get(session.permission_id)
        : db.prepare('SELECT * FROM test_permissions WHERE candidate_id = ? AND test_id = ?').get(candidateId, testId);
      if (hybridPerm) {
        const newAttemptCount = hybridPerm.attempt_count + 1;
        const newPermStatus = newAttemptCount >= hybridPerm.max_attempts ? 'completed' : 'granted';
        db.prepare('UPDATE test_permissions SET attempt_count = ?, status = ? WHERE id = ?')
          .run(newAttemptCount, newPermStatus, hybridPerm.id);
      }

      logAudit(db, { actorId: candidateId, actorRole: 'candidate', action: 'submit_test', targetType: 'test_session', targetId: session.id, details: { testType: 'hybrid', mcqScore, mcqTotal, codingEarned, codingTotal, percentage, grade: hybridGrade } });

      return res.json({
        result: {
          testType: 'hybrid', passed, percentage,
          mcqScore, mcqTotal, codingEarned, codingTotal,
          score: mcqScore + codingEarned, total: mcqTotal + problemIds.length,
          grade: hybridGrade, timeTaken
        }
      });
    }

    // ===== MCQ TEST SUBMIT (existing flow) =====
    const questions = session.questions_json ? JSON.parse(session.questions_json) : [];

    // BUG FIX: merge session-saved answers with any answers submitted in body
    // Body answers are the freshest (in-flight saves may not have hit DB yet)
    const sessionAnswers = session.answers_json ? JSON.parse(session.answers_json) : {};
    const bodyAnswers = req.body.answers || {};
    const answers = { ...sessionAnswers };
    for (const [k, v] of Object.entries(bodyAnswers)) {
      const parsed = parseInt(v, 10);
      if (!isNaN(parsed)) answers[String(k)] = parsed;
    }

    // Guard: no questions means nothing to score
    if (questions.length === 0) {
      return res.status(400).json({ error: 'no_questions', message: 'Session has no questions. Please start a new test.' });
    }

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

      // BUG FIX: use String key lookup + handle both answer/answer_index field names
      const qKey = String(q.id);
      const userAnswer = answers[qKey];
      // BUG FIX: handle both q.answer (int) and q.answer_index field names
      const correctAnswer = q.answer_index !== undefined ? parseInt(q.answer_index, 10)
        : q.answer !== undefined ? parseInt(q.answer, 10) : -1;
      if (userAnswer !== undefined && parseInt(userAnswer, 10) === correctAnswer) {
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
      SET status = 'submitted', end_time = strftime('%Y-%m-%dT%H:%M:%f','now','localtime'), score = ?, total_questions = ?,
          percentage = ?, passed = ?, grade = ?, time_taken = ?, result_json = ?, answers_json = ?
      WHERE id = ?
    `).run(score, total, percentage, passed, grade, timeTaken, resultJson, JSON.stringify(answers), sessionId);

    // Update permission
    if (session.permission_id) {
      const perm = db.prepare('SELECT * FROM test_permissions WHERE id = ?').get(session.permission_id);
      if (perm) {
        const newAttemptCount = perm.attempt_count + 1;
        const newStatus = newAttemptCount >= perm.max_attempts ? 'completed' : 'granted';
        db.prepare('UPDATE test_permissions SET attempt_count = ?, status = ? WHERE id = ?')
          .run(newAttemptCount, newStatus, session.permission_id);
      }
    } else {
      // Fallback: update by candidate_id + test_id
      const perm2 = db.prepare('SELECT * FROM test_permissions WHERE candidate_id = ? AND test_id = ?').get(candidateId, testId);
      if (perm2) {
        const newAttemptCount = perm2.attempt_count + 1;
        const newStatus = newAttemptCount >= perm2.max_attempts ? 'completed' : 'granted';
        db.prepare('UPDATE test_permissions SET attempt_count = ?, status = ? WHERE id = ?')
          .run(newAttemptCount, newStatus, perm2.id);
      }
    }

    logAudit(db, {
      actorId: candidateId, actorRole: 'candidate',
      action: 'submit_test', targetType: 'test_session', targetId: sessionId,
      details: { testId, score, total, percentage, passed, grade }
    });

    res.json({
      result: { score, total, percentage, passed: !!passed, grade, subjectScores, timeTaken }
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
      SELECT ts.*, u.name as candidate_name, u.email as candidate_email, t.name as test_name, t.test_type
      FROM test_sessions ts
      JOIN users u ON u.id = ts.candidate_id
      JOIN tests t ON t.id = ts.test_id
      WHERE ts.id = ? AND ts.candidate_id = ? AND ts.test_id = ? AND ts.status IN ('submitted','timed_out')
    `).get(sessionId, candidateId, testId);

    if (!session) return res.status(404).json({ error: 'Session not found or not yet submitted' });

    // Block review for sessions terminated by anti-cheat violations
    if (session.violation_blocked || (session.tab_violations || 0) >= 3) {
      return res.status(403).json({
        error: 'VIOLATION_BLOCKED',
        message: 'Your test was terminated due to tab switching violations. Results are not available.',
        violationCount: session.tab_violations || 0,
      });
    }

    const permission = db.prepare(
      'SELECT max_attempts FROM test_permissions WHERE id = ? OR (candidate_id = ? AND test_id = ?) LIMIT 1'
    ).get(session.permission_id, candidateId, testId);

    const testType = session.test_type || 'mcq';

    if (testType === 'coding') {
      const resultData = session.result_json ? JSON.parse(session.result_json) : {};
      const codeMap = session.code_map_json ? JSON.parse(session.code_map_json) : {};
      return res.json({
        testType: 'coding',
        testName: session.test_name,
        attemptNumber: session.attempt_number || 1,
        maxAttempts: permission?.max_attempts || 1,
        submittedAt: session.end_time,
        startedAt: session.start_time,
        percentage: session.percentage,
        passed: session.passed === 1,
        grade: session.grade,
        score: session.score,
        total: session.total_questions,
        timeTaken: session.time_taken,
        violationCount: session.tab_violations || 0,
        result: resultData,
        codeMap,
      });
    }

    // MCQ / hybrid review — reuse the admin-style enriched shape
    const enriched = enrichSessionDetail(session);
    const { questions, summary, codingProblems } = enriched;

    res.json({
      testType,
      testName: session.test_name,
      attemptNumber: session.attempt_number || 1,
      maxAttempts: permission?.max_attempts || 1,
      submittedAt: session.end_time,
      startedAt: session.start_time,
      score: session.score,
      total: session.total_questions,
      percentage: session.percentage,
      passed: session.passed === 1,
      grade: session.grade,
      timeTaken: session.time_taken,
      violationCount: session.tab_violations || 0,
      questions,
      summary,
      codingProblems: codingProblems || [],
      // Legacy field kept for any older callers
      review: questions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// MONITORING
// ============================================================

function buildLiveMonitorRows(scopedAdminId) {
  const sql = `
    SELECT ts.id, ts.candidate_id, ts.test_id, ts.start_time, ts.answers_json,
           ts.coding_results_json, ts.best_scores_json, ts.tab_violations,
           u.name as candidate_name, u.email as candidate_email, u.created_by,
           t.name as test_name, t.duration_minutes, t.test_type, t.total_questions
    FROM test_sessions ts
    JOIN users u ON ts.candidate_id = u.id
    JOIN tests t ON ts.test_id = t.id
    WHERE ts.status = 'in_progress' ${scopedAdminId ? 'AND u.created_by = ?' : ''}
  `;
  const liveSessions = scopedAdminId ? db.prepare(sql).all(scopedAdminId) : db.prepare(sql).all();

  const now = Date.now();
  return liveSessions.map(s => {
    const startMs = parseDbTime(s.start_time);
    const elapsedSec = Math.max(0, Math.floor((now - startMs) / 1000));
    const lastSeen = onlineCandidates.get(s.candidate_id);
    const idleSec = lastSeen ? Math.floor((now - lastSeen) / 1000) : null;
    const status = idleSec != null && idleSec > 120 ? 'idle' : 'active';

    let answeredCount = 0;
    const totalQuestions = s.total_questions || 0;
    if (s.test_type === 'coding') {
      const cr = s.coding_results_json ? JSON.parse(s.coding_results_json) : {};
      answeredCount = Object.keys(cr).length;
    } else {
      const answers = s.answers_json ? JSON.parse(s.answers_json) : {};
      answeredCount = Object.keys(answers).length;
    }

    return {
      sessionId: s.id,
      candidateId: s.candidate_id,
      candidateName: s.candidate_name,
      email: s.candidate_email,
      testId: s.test_id,
      testName: s.test_name,
      testType: s.test_type || 'mcq',
      startedAt: formatToIST(s.start_time),
      startTime: s.start_time,
      timeElapsedSeconds: elapsedSec,
      questionsAnswered: answeredCount,
      totalQuestions,
      durationMinutes: s.duration_minutes,
      violations: s.tab_violations || 0,
      status,
      lastActivity: lastSeen ? formatToIST(new Date(lastSeen).toISOString()) : null,
      lastActivityMs: lastSeen || null,
    };
  });
}

app.get('/api/monitor/live', authMiddleware, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const scope = req.user.role === 'admin' ? req.user.id : null;
    res.json(buildLiveMonitorRows(scope));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

function getActiveSessionCount(scopedAdminId) {
  const sql = scopedAdminId
    ? `SELECT COUNT(*) as c FROM test_sessions ts JOIN users u ON u.id = ts.candidate_id
       WHERE ts.status = 'in_progress' AND u.created_by = ?`
    : `SELECT COUNT(*) as c FROM test_sessions WHERE status = 'in_progress'`;
  const row = scopedAdminId ? db.prepare(sql).get(scopedAdminId) : db.prepare(sql).get();
  return row ? (row.c || 0) : 0;
}

app.get('/api/super/monitor/active-count', authMiddleware, requireRole('super_admin'), (req, res) => {
  try { res.json({ count: getActiveSessionCount(null) }); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/admin/monitor/active-count', authMiddleware, requireRole('admin'), (req, res) => {
  try { res.json({ count: getActiveSessionCount(req.user.id) }); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ============================================================
// TUNNEL
// ============================================================

let ngrokProcess = null;
let ngrokUrl = null;
let ngrokRunning = false;

const probeNgrokApi = () => new Promise((resolve) => {
  const http = require('http');
  const req = http.get('http://127.0.0.1:4040/api/tunnels', { timeout: 1500 }, (resp) => {
    let data = ''; resp.on('data', c => data += c);
    resp.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        const tunnel = parsed.tunnels?.find(t => t.proto === 'https') || parsed.tunnels?.[0];
        resolve(tunnel?.public_url || null);
      } catch { resolve(null); }
    });
  });
  req.on('error', () => resolve(null));
  req.on('timeout', () => { req.destroy(); resolve(null); });
});

app.get('/api/tunnel/status', async (req, res) => {
  try {
    const lanIp = getLanIp();
    const stored = db.prepare("SELECT value FROM config WHERE key = 'ngrok_url'").get();
    const live = await probeNgrokApi();
    if (live) {
      ngrokUrl = live;
      ngrokRunning = true;
      if (!stored || stored.value !== live) {
        db.prepare("INSERT OR REPLACE INTO config (key, value, updated_at) VALUES ('ngrok_url', ?, strftime('%Y-%m-%dT%H:%M:%f','now','localtime'))").run(live);
      }
    } else if (!ngrokProcess) {
      ngrokRunning = false;
      ngrokUrl = null;
    }
    const url = ngrokUrl || (live ? live : null);
    let activeSession = null;
    try {
      const sidRow = db.prepare("SELECT value FROM config WHERE key = 'ngrok_session_id'").get();
      if (sidRow && sidRow.value) {
        const s = db.prepare('SELECT id, session_code, name, tunnel_url FROM sessions WHERE id = ?').get(sidRow.value);
        if (s) activeSession = { id: s.id, code: s.session_code, name: s.name, tunnelUrl: s.tunnel_url || url };
      }
    } catch (e) {}
    res.json({
      lanIp,
      lanUrl: `http://${lanIp}:${PORT}`,
      ngrokUrl: url,
      ngrokRunning,
      url,
      status: ngrokRunning ? 'running' : 'stopped',
      activeSession
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
    if (ngrokProcess) return res.status(400).json({ error: 'ngrok already running' });

    const { sessionId } = req.body || {};
    let sessionRow = null;
    if (sessionId) {
      sessionRow = db.prepare("SELECT id, session_code, name, status FROM sessions WHERE id = ?").get(sessionId);
      if (!sessionRow) return res.status(404).json({ error: 'Session not found' });
      if (sessionRow.status !== 'active') return res.status(400).json({ error: 'Session is not active' });
      db.prepare("INSERT OR REPLACE INTO config (key, value, updated_at) VALUES ('ngrok_session_id', ?, strftime('%Y-%m-%dT%H:%M:%f','now','localtime'))").run(sessionId);
    } else {
      try { db.prepare("DELETE FROM config WHERE key = 'ngrok_session_id'").run(); } catch(e){}
    }

    ngrokProcess = spawn('ngrok', ['http', String(PORT)], { detached: true, stdio: 'ignore', shell: true });
    ngrokRunning = true;
    ngrokUrl = null;

    ngrokProcess.on('error', (err) => {
      console.error('ngrok spawn error:', err);
      ngrokRunning = false;
      ngrokProcess = null;
    });
    ngrokProcess.on('close', (code) => {
      console.log('ngrok closed with code', code);
      ngrokRunning = false;
      ngrokUrl = null;
      ngrokProcess = null;
      try { db.prepare("DELETE FROM config WHERE key = 'ngrok_url'").run(); } catch(e){}
    });
    ngrokProcess.unref();

    const pollNgrokUrl = async (retries = 15) => {
      const http = require('http');
      const fetchOnce = () => new Promise((resolve) => {
        http.get('http://127.0.0.1:4040/api/tunnels', (resp) => {
          let data = ''; resp.on('data', c => data += c);
          resp.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(null); } });
        }).on('error', () => resolve(null));
      });
      for (let i = 0; i < retries; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const data = await fetchOnce();
        const tunnel = data?.tunnels?.find(t => t.proto === 'https') || data?.tunnels?.[0];
        if (tunnel?.public_url) {
          ngrokUrl = tunnel.public_url;
          try {
            db.prepare("INSERT OR REPLACE INTO config (key, value, updated_at) VALUES ('ngrok_url', ?, strftime('%Y-%m-%dT%H:%M:%f','now','localtime'))").run(ngrokUrl);
          } catch(e) { console.error('config save error', e); }
          if (sessionRow) {
            try {
              db.prepare('UPDATE sessions SET tunnel_url = ? WHERE id = ?').run(ngrokUrl, sessionRow.id);
              logAudit(db, { actorId: req.user.id, actorRole: req.user.role, action: `Started ngrok tunnel for session ${sessionRow.session_code}: ${ngrokUrl}`, targetType: 'session', targetId: sessionRow.id, details: { code: sessionRow.session_code, url: ngrokUrl } });
            } catch(e) { console.error('session tunnel update error', e); }
          }
          return ngrokUrl;
        }
      }
      return null;
    };
    pollNgrokUrl();

    res.json({ success: true, message: 'ngrok starting...', status: 'starting' });
  } catch (err) {
    console.error(err);
    ngrokRunning = false; ngrokProcess = null;
    res.status(500).json({ error: 'Failed to start ngrok' });
  }
});

app.post('/api/tunnel/ngrok/stop', authMiddleware, requireRole('super_admin', 'admin'), (req, res) => {
  try {
    if (ngrokProcess) {
      try { spawn('taskkill', ['/pid', String(ngrokProcess.pid), '/f', '/t'], { shell: true }); } catch(e){}
      ngrokProcess = null;
    }
    ngrokUrl = null;
    ngrokRunning = false;
    db.prepare("DELETE FROM config WHERE key = 'ngrok_url'").run();
    res.json({ success: true, status: 'stopped', ngrokUrl: null, url: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to stop ngrok' });
  }
});

app.post('/api/tunnel/ngrok/auth-token', authMiddleware, requireRole('super_admin', 'admin'), (req, res) => {
  const { token } = req.body || {};
  if (!token || typeof token !== 'string' || token.length < 10) {
    return res.status(400).json({ error: 'Invalid token' });
  }
  try {
    const proc = spawn('ngrok', ['config', 'add-authtoken', token], { shell: true });
    let stderr = '';
    proc.stderr?.on('data', c => stderr += c);
    proc.on('close', (code) => {
      if (code === 0) res.json({ success: true });
      else res.status(500).json({ error: 'ngrok config failed: ' + stderr });
    });
    proc.on('error', (e) => res.status(500).json({ error: e.message }));
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    log.push({ type: type || 'tab_switch', timestamp: timestamp || nowLocalIso() });

    const blocked = violations >= 3 ? 1 : 0;
    db.prepare('UPDATE test_sessions SET tab_violations = ?, violation_log_json = ?, violation_blocked = ? WHERE id = ?')
      .run(violations, JSON.stringify(log), blocked, sessionId);

    const warningLevel = violations >= 3 ? 'auto_submit' : violations >= 1 ? 'warning' : null;
    res.json({ violations, warningLevel, violationBlocked: !!blocked });
  } catch (err) {
    console.error('Violation tracking error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// RUN CODE — Company coding problems
// ============================================================

app.post('/api/candidate/run-code', authMiddleware, requireRole('candidate'), (req, res) => {
  try {
    const { code, language, problemId } = req.body;
    if (!code) return res.status(400).json({ error: 'No code provided' });

    if (language === 'sql') {
      return res.json({ output: '-- SQL query validated. Results would appear when connected to a live database.\n\n' + code, testResults: [] });
    }

    // Run Python code
    const fs = require('fs');
    const path = require('path');
    const { execSync } = require('child_process');
    const tmpFile = path.join(require('os').tmpdir(), `sf_run_${Date.now()}_${Math.random().toString(36).slice(2)}.py`);

    fs.writeFileSync(tmpFile, code);
    let output = '';
    try {
      output = execSync(`python "${tmpFile}"`, { timeout: 10000, encoding: 'utf8', maxBuffer: 1024 * 1024 });
    } catch (execErr) {
      output = execErr.stderr || execErr.stdout || execErr.message || 'Execution error';
    }
    try { fs.unlinkSync(tmpFile); } catch (e) {}

    // Check test cases if problem exists
    let testResults = [];
    if (problemId) {
      try {
        const problem = db.prepare('SELECT test_cases FROM company_coding_problems WHERE id=?').get(problemId);
        if (problem && problem.test_cases) {
          const cases = JSON.parse(problem.test_cases);
          const outputTrimmed = output.trim();
          testResults = cases.map(tc => ({
            expected: tc.expected,
            actual: outputTrimmed.split('\n')[0] || outputTrimmed,
            passed: outputTrimmed.includes(tc.expected.trim())
          }));
        }
      } catch (e) {}
    }

    res.json({ output: output || '(no output)', testResults });
  } catch (err) {
    res.status(500).json({ error: err.message, output: 'Server error: ' + err.message });
  }
});

// ============================================================
// BATCHES
// ============================================================
const BATCH_CODE_RE = /^[A-Z0-9-]+$/;

function listBatchesFor(scope, adminId) {
  const where = scope === 'admin' ? 'WHERE b.created_by = ?' : '';
  const params = scope === 'admin' ? [adminId] : [];
  return db.prepare(`
    SELECT b.id, b.name, b.code, b.description, b.is_active as isActive,
           b.created_by as createdBy, b.created_at as createdAt,
           (SELECT name FROM users WHERE id = b.created_by) as createdByName,
           (SELECT COUNT(*) FROM users WHERE batch_id = b.id AND role = 'candidate') as candidateCount,
           (SELECT COUNT(DISTINCT tp.test_id)
              FROM test_permissions tp
              JOIN users u ON u.id = tp.candidate_id
              WHERE u.batch_id = b.id) as assignedTestsCount
    FROM batches b ${where}
    ORDER BY b.created_at DESC
  `).all(...params);
}

function createBatchHandler(req, res, role) {
  try {
    const { name, description } = req.body;
    let { code } = req.body;
    if (!name || !code) return res.status(400).json({ error: 'Name and code are required' });
    code = String(code).trim().toUpperCase();
    if (!BATCH_CODE_RE.test(code)) return res.status(400).json({ error: 'Code must contain only uppercase letters, numbers, and hyphens' });
    const existing = db.prepare('SELECT id FROM batches WHERE code = ?').get(code);
    if (existing) return res.status(409).json({ error: 'Batch code already exists' });
    const id = 'batch_' + require('crypto').randomBytes(6).toString('hex');
    db.prepare(`INSERT INTO batches (id, name, code, description, is_active, created_by) VALUES (?, ?, ?, ?, 1, ?)`)
      .run(id, String(name).trim(), code, description ? String(description).trim() : null, req.user.id);
    logAudit(db, { actorId: req.user.id, actorRole: role, action: `Created batch ${code} - ${name}`, targetType: 'batch', targetId: id, details: { code, name } });
    res.status(201).json({ id, name, code, description, isActive: 1 });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
}

function updateBatchHandler(req, res, role) {
  try {
    const { name, description, isActive } = req.body;
    const batch = db.prepare('SELECT * FROM batches WHERE id = ?').get(req.params.id);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    if (role === 'admin' && batch.created_by !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    const newName = name != null ? String(name).trim() : batch.name;
    const newDesc = description != null ? String(description).trim() : batch.description;
    const newActive = isActive != null ? (isActive ? 1 : 0) : batch.is_active;
    db.prepare('UPDATE batches SET name = ?, description = ?, is_active = ? WHERE id = ?')
      .run(newName, newDesc, newActive, req.params.id);
    logAudit(db, { actorId: req.user.id, actorRole: role, action: `Updated batch ${batch.code}`, targetType: 'batch', targetId: req.params.id, details: { name: newName, isActive: newActive } });
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
}

function deleteBatchHandler(req, res, role) {
  try {
    const batch = db.prepare('SELECT * FROM batches WHERE id = ?').get(req.params.id);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    if (role === 'admin' && batch.created_by !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    const count = db.prepare("SELECT COUNT(*) as c FROM users WHERE batch_id = ?").get(req.params.id).c;
    if (count > 0) return res.status(400).json({ error: 'Cannot delete batch with assigned candidates' });
    db.prepare('DELETE FROM batches WHERE id = ?').run(req.params.id);
    logAudit(db, { actorId: req.user.id, actorRole: role, action: 'delete_batch', targetType: 'batch', targetId: req.params.id,
      details: `Deleted batch ${batch.code} - ${batch.name}`,
      deletedData: JSON.stringify(batch) });
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
}

app.get('/api/super/batches', authMiddleware, requireRole('super_admin'), (req, res) => {
  try { res.json(listBatchesFor('super', req.user.id)); } catch (e) { res.status(500).json({ error: 'Server error' }); }
});
app.get('/api/admin/batches', authMiddleware, requireRole('admin'), (req, res) => {
  try { res.json(listBatchesFor('admin', req.user.id)); } catch (e) { res.status(500).json({ error: 'Server error' }); }
});
app.post('/api/super/batches', authMiddleware, requireRole('super_admin'), (req, res) => createBatchHandler(req, res, 'super_admin'));
app.post('/api/admin/batches', authMiddleware, requireRole('admin'), (req, res) => createBatchHandler(req, res, 'admin'));
app.put('/api/super/batches/:id', authMiddleware, requireRole('super_admin'), (req, res) => updateBatchHandler(req, res, 'super_admin'));
app.put('/api/admin/batches/:id', authMiddleware, requireRole('admin'), (req, res) => updateBatchHandler(req, res, 'admin'));
app.delete('/api/super/batches/:id', authMiddleware, requireRole('super_admin'), (req, res) => deleteBatchHandler(req, res, 'super_admin'));
app.delete('/api/admin/batches/:id', authMiddleware, requireRole('admin'), (req, res) => deleteBatchHandler(req, res, 'admin'));

// ---------- Assign Tests to Batch ----------
function assignTestsToBatchHandler(req, res, role) {
  try {
    const { testIds, maxAttempts, availableFrom, availableUntil } = req.body || {};
    if (!Array.isArray(testIds) || testIds.length === 0) {
      return res.status(400).json({ error: 'testIds is required' });
    }
    const maxAtt = Math.max(1, parseInt(maxAttempts, 10) || 1);
    const batch = db.prepare('SELECT * FROM batches WHERE id = ?').get(req.params.id);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    if (role === 'admin' && batch.created_by !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    // Validate all tests exist
    const tests = [];
    for (const tid of testIds) {
      const t = db.prepare('SELECT id, name FROM tests WHERE id = ?').get(tid);
      if (!t) return res.status(400).json({ error: `Test not found: ${tid}` });
      tests.push(t);
    }

    const candidates = db.prepare("SELECT id FROM users WHERE batch_id = ? AND role = 'candidate'").all(req.params.id);
    const crypto = require('crypto');

    const existsStmt = db.prepare('SELECT id FROM test_permissions WHERE candidate_id = ? AND test_id = ?');
    const insertStmt = db.prepare(`
      INSERT INTO test_permissions (id, candidate_id, test_id, status, max_attempts, attempt_count, available_from, available_until, granted_by, granted_at)
      VALUES (?, ?, ?, 'granted', ?, 0, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%f','now','localtime'))
    `);

    let totalAssigned = 0, totalSkipped = 0;
    const details = [];

    const tx = db.transaction(() => {
      for (const t of tests) {
        let assigned = 0, skipped = 0;
        for (const c of candidates) {
          const existing = existsStmt.get(c.id, t.id);
          if (existing) { skipped++; continue; }
          const tpId = 'tp_' + crypto.randomBytes(8).toString('hex');
          insertStmt.run(tpId, c.id, t.id, maxAtt, availableFrom || null, availableUntil || null, req.user.id);
          assigned++;
        }
        totalAssigned += assigned;
        totalSkipped += skipped;
        details.push({ testId: t.id, testName: t.name, assigned, skipped });
      }
    });
    tx();

    logAudit(db, {
      actorId: req.user.id, actorRole: role,
      action: `Assigned ${tests.length} tests to batch ${batch.code} for ${candidates.length} candidates (${totalAssigned} permissions created, ${totalSkipped} skipped)`,
      targetType: 'batch', targetId: batch.id,
      details: { testIds, maxAttempts: maxAtt, totalAssigned, skipped: totalSkipped }
    });

    res.json({
      success: true,
      totalCandidates: candidates.length,
      totalTests: tests.length,
      totalAssigned,
      skipped: totalSkipped,
      details
    });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
}

function getAssignedTestsForBatchHandler(req, res, role) {
  try {
    const batch = db.prepare('SELECT * FROM batches WHERE id = ?').get(req.params.id);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    if (role === 'admin' && batch.created_by !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const rows = db.prepare(`
      SELECT tp.test_id as testId,
             t.name as testName,
             t.test_type as testType,
             COUNT(DISTINCT tp.candidate_id) as candidatesAssigned
      FROM test_permissions tp
      JOIN users u ON u.id = tp.candidate_id
      JOIN tests t ON t.id = tp.test_id
      WHERE u.batch_id = ?
      GROUP BY tp.test_id, t.name, t.test_type
      ORDER BY t.name
    `).all(req.params.id);

    const completedStmt = db.prepare(`
      SELECT COUNT(DISTINCT ts.candidate_id) as completed,
             SUM(CASE WHEN ts.passed = 1 THEN 1 ELSE 0 END) as passed,
             COUNT(*) as totalSubmissions
      FROM test_sessions ts
      JOIN users u ON u.id = ts.candidate_id
      WHERE u.batch_id = ? AND ts.test_id = ? AND ts.status IN ('submitted','timed_out')
    `);

    const out = rows.map(r => {
      const stats = completedStmt.get(req.params.id, r.testId) || { completed: 0, passed: 0, totalSubmissions: 0 };
      const completed = stats.completed || 0;
      const passed = stats.passed || 0;
      const passRate = completed > 0 ? Math.round((passed / completed) * 100) : 0;
      return {
        testId: r.testId,
        testName: r.testName,
        testType: r.testType,
        candidatesAssigned: r.candidatesAssigned,
        candidatesCompleted: completed,
        passRate
      };
    });
    res.json(out);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
}

function revokeTestFromBatchHandler(req, res, role) {
  try {
    const { testId } = req.body || {};
    if (!testId) return res.status(400).json({ error: 'testId is required' });
    const batch = db.prepare('SELECT * FROM batches WHERE id = ?').get(req.params.id);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    if (role === 'admin' && batch.created_by !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    const test = db.prepare('SELECT id, name FROM tests WHERE id = ?').get(testId);
    if (!test) return res.status(400).json({ error: 'Test not found' });

    const allPerms = db.prepare(`
      SELECT tp.id, tp.status, tp.attempt_count
      FROM test_permissions tp
      JOIN users u ON u.id = tp.candidate_id
      WHERE u.batch_id = ? AND tp.test_id = ?
    `).all(req.params.id, testId);

    const eligible = allPerms.filter(p => p.status === 'granted' && (p.attempt_count || 0) === 0);
    const skipped = allPerms.length - eligible.length;
    const delStmt = db.prepare('DELETE FROM test_permissions WHERE id = ?');
    const tx = db.transaction(() => { for (const p of eligible) delStmt.run(p.id); });
    tx();

    logAudit(db, {
      actorId: req.user.id, actorRole: role,
      action: `Revoked test ${test.name} from batch ${batch.code} (${eligible.length} permissions revoked)`,
      targetType: 'batch', targetId: batch.id,
      details: { testId, revoked: eligible.length, skipped }
    });

    res.json({ revoked: eligible.length, skipped });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
}

app.post('/api/super/batches/:id/assign-tests', authMiddleware, requireRole('super_admin'), (req, res) => assignTestsToBatchHandler(req, res, 'super_admin'));
app.post('/api/admin/batches/:id/assign-tests', authMiddleware, requireRole('admin'), (req, res) => assignTestsToBatchHandler(req, res, 'admin'));
app.get('/api/super/batches/:id/assigned-tests', authMiddleware, requireRole('super_admin'), (req, res) => getAssignedTestsForBatchHandler(req, res, 'super_admin'));
app.get('/api/admin/batches/:id/assigned-tests', authMiddleware, requireRole('admin'), (req, res) => getAssignedTestsForBatchHandler(req, res, 'admin'));
app.delete('/api/super/batches/:id/revoke-test', authMiddleware, requireRole('super_admin'), (req, res) => revokeTestFromBatchHandler(req, res, 'super_admin'));
app.delete('/api/admin/batches/:id/revoke-test', authMiddleware, requireRole('admin'), (req, res) => revokeTestFromBatchHandler(req, res, 'admin'));

// Candidate update (with batch assignment) — used by batch management flows
function updateCandidateHandler(req, res, role) {
  try {
    const scope = role === 'admin' ? ' AND created_by = ?' : '';
    const scopeParams = role === 'admin' ? [req.user.id] : [];
    const candidate = db.prepare(`SELECT id, name, batch_id FROM users WHERE id = ? AND role = 'candidate'${scope}`).get(req.params.id, ...scopeParams);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    const { name, email, batch_id } = req.body;
    const updates = [];
    const params = [];
    if (name != null) { updates.push('name = ?'); params.push(String(name).trim()); }
    if (email != null) { updates.push('email = ?'); params.push(String(email).trim()); }
    let oldBatchCode = null, newBatchCode = null, newBatchIdResolved = undefined;
    if (batch_id !== undefined) {
      const normalized = batch_id === '' || batch_id == null ? null : batch_id;
      if (normalized) {
        const b = db.prepare('SELECT id, code FROM batches WHERE id = ?').get(normalized);
        if (!b) return res.status(400).json({ error: 'Batch not found' });
        newBatchCode = b.code;
        newBatchIdResolved = b.id;
      } else {
        newBatchIdResolved = null;
      }
      updates.push('batch_id = ?');
      params.push(newBatchIdResolved);
      if (candidate.batch_id) {
        const old = db.prepare('SELECT code FROM batches WHERE id = ?').get(candidate.batch_id);
        oldBatchCode = old?.code || null;
      }
    }
    if (updates.length === 0) return res.json({ success: true });
    params.push(req.params.id);
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    if (batch_id !== undefined && (candidate.batch_id || null) !== (newBatchIdResolved || null)) {
      logAudit(db, { actorId: req.user.id, actorRole: role, action: `Moved candidate ${candidate.name} from batch ${oldBatchCode || 'none'} to batch ${newBatchCode || 'none'}`, targetType: 'user', targetId: req.params.id, details: { oldBatchCode, newBatchCode } });
    }
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
}
app.put('/api/super/candidates/:id', authMiddleware, requireRole('super_admin'), (req, res) => updateCandidateHandler(req, res, 'super_admin'));
app.put('/api/admin/candidates/:id', authMiddleware, requireRole('admin'), (req, res) => updateCandidateHandler(req, res, 'admin'));

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
      candidates.forEach((c, idx) => {
        const rowNum = idx + 1;
        if (!c.name || !c.email || !c.password) {
          results.errors.push({ row: rowNum, email: c.email || 'unknown', reason: 'Missing name, email or password' });
          return;
        }
        let batchId = null;
        const rawCode = (c.batchCode || '').toString().trim().toUpperCase();
        if (rawCode) {
          const b = db.prepare('SELECT id, code FROM batches WHERE code = ?').get(rawCode);
          if (!b) { results.errors.push({ row: rowNum, email: c.email, reason: `Batch code ${rawCode} not found` }); return; }
          batchId = b.id;
        }
        const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(c.email);
        if (existing) { results.skipped.push({ row: rowNum, email: c.email, reason: 'Email already exists' }); return; }
        const id = uuidv4();
        const hashed = hashPassword(c.password);
        db.prepare(`INSERT INTO users (id, name, email, password, role, created_by, batch_id) VALUES (?, ?, ?, ?, 'candidate', ?, ?)`)
          .run(id, c.name.trim(), c.email.trim(), hashed, req.user.id, batchId);
        results.created.push({ id, name: c.name, email: c.email, batch_id: batchId });
      });
    });
    insertMany();
    results.success = results.created.length;
    const firstBatchCodeS = (candidates.find(c => c.batchCode)?.batchCode || '').toString().trim().toUpperCase() || 'none';
    logAudit(db, {
      actorId: req.user.id, actorRole: 'super_admin',
      action: 'bulk_import_candidates', targetType: 'user', targetId: null,
      details: `Bulk imported ${results.created.length} candidates into batch ${firstBatchCodeS} (${results.skipped.length} skipped)`
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
      candidates.forEach((c, idx) => {
        const rowNum = idx + 1;
        if (!c.name || !c.email || !c.password) {
          results.errors.push({ row: rowNum, email: c.email || 'unknown', reason: 'Missing name, email or password' });
          return;
        }
        let batchId = null;
        const rawCode = (c.batchCode || '').toString().trim().toUpperCase();
        if (rawCode) {
          const b = db.prepare('SELECT id, code FROM batches WHERE code = ?').get(rawCode);
          if (!b) { results.errors.push({ row: rowNum, email: c.email, reason: `Batch code ${rawCode} not found` }); return; }
          batchId = b.id;
        }
        const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(c.email);
        if (existing) { results.skipped.push({ row: rowNum, email: c.email, reason: 'Email already exists' }); return; }
        const id = uuidv4();
        const hashed = hashPassword(c.password);
        db.prepare(`INSERT INTO users (id, name, email, password, role, created_by, batch_id) VALUES (?, ?, ?, ?, 'candidate', ?, ?)`)
          .run(id, c.name.trim(), c.email.trim(), hashed, req.user.id, batchId);
        results.created.push({ id, name: c.name, email: c.email, batch_id: batchId });
      });
    });
    insertMany();
    results.success = results.created.length;
    const firstBatchCodeA = (candidates.find(c => c.batchCode)?.batchCode || '').toString().trim().toUpperCase() || 'none';
    logAudit(db, {
      actorId: req.user.id, actorRole: 'admin',
      action: 'bulk_import_candidates', targetType: 'user', targetId: null,
      details: `Bulk imported ${results.created.length} candidates into batch ${firstBatchCodeA} (${results.skipped.length} skipped)`
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

function enrichLeaderboardRow(r) {
  return {
    rank: r.rank,
    session_id: r.session_id,
    candidate_id: r.candidate_id,
    candidate_name: r.candidate_name,
    candidate_email: r.candidate_email,
    test_id: r.test_id,
    test_name: r.test_name,
    test_is_active: r.test_is_active,
    score: r.score,
    total_questions: r.total_questions,
    percentage: r.percentage,
    grade: r.grade,
    passed: r.passed,
    time_taken_seconds: r.time_taken || 0,
    time_taken: r.time_taken,
    completed_at: r.completed_at,
    submitted_at: r.completed_at,
    submitted_at_ist: formatToIST(r.completed_at),
  };
}

app.get('/api/super/leaderboard', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const { testId } = req.query;
    const tests = db.prepare("SELECT id, name, is_active FROM tests ORDER BY is_active DESC, name").all();
    const sql = `
      SELECT u.id as candidate_id, u.name as candidate_name, u.email as candidate_email,
             ts.percentage, ts.score, ts.total_questions, ts.grade, ts.passed,
             ts.end_time as completed_at, ts.time_taken,
             t.name as test_name, t.is_active as test_is_active,
             ts.id as session_id, ts.test_id
      FROM test_sessions ts
      JOIN users u ON ts.candidate_id = u.id
      JOIN tests t ON ts.test_id = t.id
      WHERE ts.status = 'submitted' ${testId ? 'AND ts.test_id = ?' : ''}
      ORDER BY ts.percentage DESC, ts.end_time ASC`;
    const allRows = testId ? db.prepare(sql).all(testId) : db.prepare(sql).all();
    const seen = new Set();
    const deduped = [];
    for (const r of allRows) {
      const key = r.candidate_id + '_' + r.test_id;
      if (!seen.has(key)) { seen.add(key); deduped.push({ ...r, rank: deduped.length + 1 }); }
    }
    res.json({ tests, leaderboard: deduped.map(enrichLeaderboardRow) });
  } catch (err) { console.error('Leaderboard error:', err); res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/admin/leaderboard', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const { testId } = req.query;
    const tests = db.prepare("SELECT id, name, is_active FROM tests ORDER BY is_active DESC, name").all();
    const sql = `
      SELECT u.id as candidate_id, u.name as candidate_name, u.email as candidate_email,
             ts.percentage, ts.score, ts.total_questions, ts.grade, ts.passed,
             ts.end_time as completed_at, ts.time_taken,
             t.name as test_name, t.is_active as test_is_active,
             ts.id as session_id, ts.test_id
      FROM test_sessions ts
      JOIN users u ON ts.candidate_id = u.id
      JOIN tests t ON ts.test_id = t.id
      WHERE ts.status = 'submitted' AND u.created_by = ? ${testId ? 'AND ts.test_id = ?' : ''}
      ORDER BY ts.percentage DESC, ts.end_time ASC`;
    const params = testId ? [req.user.id, testId] : [req.user.id];
    const allRows = db.prepare(sql).all(...params);
    const seen = new Set();
    const deduped = [];
    for (const r of allRows) {
      const key = r.candidate_id + '_' + r.test_id;
      if (!seen.has(key)) { seen.add(key); deduped.push({ ...r, rank: deduped.length + 1 }); }
    }
    res.json({ tests, leaderboard: deduped.map(enrichLeaderboardRow) });
  } catch (err) { console.error('Leaderboard error:', err); res.status(500).json({ error: 'Server error' }); }
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

function updateDesignTestHandler(req, res, role) {
  try {
    const { name, description, durationMinutes, passingPercentage,
      subjectsJson, subjects, difficultyJson, difficultyDistribution,
      typeQuotasJson, typeQuotas, codingProblemCount, totalQuestions } = req.body || {};
    if (!name || !String(name).trim()) return res.status(400).json({ error: 'NAME_REQUIRED', message: 'Test name is required' });
    if (durationMinutes != null && (Number(durationMinutes) <= 0 || Number(durationMinutes) > 480)) {
      return res.status(400).json({ error: 'INVALID_DURATION', message: 'Duration must be between 1 and 480 minutes' });
    }
    if (passingPercentage != null && (Number(passingPercentage) < 1 || Number(passingPercentage) > 100)) {
      return res.status(400).json({ error: 'INVALID_PERCENTAGE', message: 'Passing percentage must be between 1 and 100' });
    }
    const scopeCheck = role === 'admin' ? ' AND created_by = ?' : '';
    const params = role === 'admin' ? [req.params.testId, req.user.id] : [req.params.testId];
    const test = db.prepare('SELECT * FROM tests WHERE id = ?' + scopeCheck).get(...params);
    if (!test) return res.status(404).json({ error: 'Test not found' });

    const sJson = subjectsJson != null ? subjectsJson : (Array.isArray(subjects) ? JSON.stringify(subjects) : test.subjects_json);
    const dJson = difficultyJson != null ? difficultyJson : (difficultyDistribution ? JSON.stringify(difficultyDistribution) : test.difficulty_json);
    const tJson = typeQuotasJson != null ? typeQuotasJson : (typeQuotas ? JSON.stringify(typeQuotas) : test.type_quotas_json);
    const codingCount = codingProblemCount != null ? Math.max(0, Number(codingProblemCount)) : (test.coding_problem_count || 0);
    const mcqCount = totalQuestions != null ? Math.max(0, Number(totalQuestions)) : (test.total_questions || 0);

    if (mcqCount === 0 && codingCount === 0) {
      return res.status(400).json({ error: 'NO_QUESTIONS', message: 'Must include MCQ questions or coding problems (or both)' });
    }

    if (totalQuestions != null && mcqCount > 0) {
      const subjectsArr = Array.isArray(subjects) ? subjects : (sJson ? JSON.parse(sJson) : []);
      if (!subjectsArr.length) {
        return res.status(400).json({ error: 'NO_SUBJECTS', message: 'Select at least one subject for MCQ questions' });
      }
      const placeholders = subjectsArr.map(() => '?').join(',');
      const avail = db.prepare(`SELECT COUNT(*) as cnt FROM questions WHERE subject IN (${placeholders})`).get(...subjectsArr);
      if (avail.cnt < mcqCount) {
        return res.status(400).json({ error: 'POOL_TOO_SMALL', message: `Only ${avail.cnt} questions available for selected subjects. Requested ${mcqCount}.` });
      }
    }
    if (codingProblemCount != null && codingCount > 0) {
      const availCoding = db.prepare("SELECT COUNT(*) as cnt FROM coding_problems WHERE evaluation_type = 'python'").get();
      if (availCoding.cnt < codingCount) {
        return res.status(400).json({ error: 'CODING_POOL_TOO_SMALL', message: `Only ${availCoding.cnt} Python coding problems available. Requested ${codingCount}.` });
      }
    }

    const newTestType = codingCount > 0 && mcqCount > 0 ? 'hybrid' : codingCount > 0 ? 'coding' : 'mcq';

    db.prepare(`
      UPDATE tests SET name = ?, description = ?, duration_minutes = ?, passing_percentage = ?,
        subjects_json = ?, difficulty_json = ?, type_quotas_json = ?, coding_problem_count = ?,
        total_questions = ?, test_type = ?
      WHERE id = ?
    `).run(
      String(name).trim(),
      description != null ? description : test.description,
      durationMinutes != null ? Number(durationMinutes) : test.duration_minutes,
      passingPercentage != null ? Number(passingPercentage) : test.passing_percentage,
      sJson, dJson, tJson, codingCount, mcqCount, newTestType,
      req.params.testId
    );
    logAudit(db, { actorId: req.user.id, actorRole: role, action: 'edit_test',
      targetType: 'test', targetId: req.params.testId, details: { name, durationMinutes, passingPercentage, totalQuestions: mcqCount, codingProblemCount: codingCount, testType: newTestType } });
    res.json(db.prepare('SELECT * FROM tests WHERE id = ?').get(req.params.testId));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
}
app.put('/api/super/design-test/:testId', authMiddleware, requireRole('super_admin'), (req, res) => updateDesignTestHandler(req, res, 'super_admin'));
app.put('/api/admin/design-test/:testId', authMiddleware, requireRole('admin'), (req, res) => updateDesignTestHandler(req, res, 'admin'));

function toggleTestStatusHandler(req, res, role) {
  try {
    const scopeCheck = role === 'admin' ? ' AND created_by = ?' : '';
    const params = role === 'admin' ? [req.params.testId, req.user.id] : [req.params.testId];
    const test = db.prepare('SELECT id, name, is_active FROM tests WHERE id = ?' + scopeCheck).get(...params);
    if (!test) return res.status(404).json({ error: 'Test not found' });
    const newStatus = test.is_active ? 0 : 1;
    db.prepare('UPDATE tests SET is_active = ? WHERE id = ?').run(newStatus, req.params.testId);
    logAudit(db, {
      actorId: req.user.id, actorRole: role, action: newStatus ? 'activate_test' : 'deactivate_test',
      targetType: 'test', targetId: req.params.testId, details: { name: test.name }
    });
    res.json({ success: true, is_active: newStatus, message: newStatus ? 'Test activated' : 'Test deactivated' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
}
app.put('/api/super/design-test/:testId/toggle-status', authMiddleware, requireRole('super_admin'), (req, res) => toggleTestStatusHandler(req, res, 'super_admin'));
app.put('/api/admin/design-test/:testId/toggle-status', authMiddleware, requireRole('admin'), (req, res) => toggleTestStatusHandler(req, res, 'admin'));

// ============================================================
// PASSWORD RESET BY ADMIN
// ============================================================

app.put('/api/super/users/:id/password', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const newPassword = req.body.newPassword || req.body.password;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashPassword(newPassword), req.params.id);
    logAudit(db, { actorId: req.user.id, actorRole: 'super_admin', action: 'reset_password',
      targetType: 'user', targetId: req.params.id, details: `Reset password for candidate ${user.name} (${user.email})` });
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

function adminResetPassword(req, res) {
  try {
    const newPassword = req.body.newPassword || req.body.password;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const candidate = db.prepare("SELECT id, name, email FROM users WHERE id = ? AND role = 'candidate'").get(req.params.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashPassword(newPassword), req.params.id);
    logAudit(db, { actorId: req.user.id, actorRole: 'admin', action: 'reset_password',
      targetType: 'user', targetId: req.params.id, details: `Reset password for candidate ${candidate.name} (${candidate.email})` });
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
}
app.put('/api/admin/candidates/:id/password', authMiddleware, requireRole('admin'), adminResetPassword);
app.put('/api/admin/candidates/:id/reset-password', authMiddleware, requireRole('admin'), adminResetPassword);

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

// Assign an interview-prep test (lives in tests table) to candidates via test_permissions
function assignInterviewPrep(req, res, role) {
  try {
    const testId = req.params.id;
    const { candidateIds, maxAttempts } = req.body;
    const test = db.prepare('SELECT id, is_interview_prep FROM tests WHERE id = ?').get(testId);
    if (!test) return res.status(404).json({ error: 'Test not found' });
    if (test.is_interview_prep !== 1) return res.status(400).json({ error: 'Not an interview prep test' });
    if (!Array.isArray(candidateIds) || candidateIds.length === 0) return res.status(400).json({ error: 'candidateIds required' });
    const results = { assigned: 0, skipped: 0 };
    const tx = db.transaction(() => {
      for (const cid of candidateIds) {
        const c = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'candidate'").get(cid);
        if (!c) continue;
        const existing = db.prepare('SELECT id FROM test_permissions WHERE candidate_id = ? AND test_id = ? AND status = ?').get(cid, testId, 'granted');
        if (existing) { results.skipped++; continue; }
        db.prepare("INSERT INTO test_permissions (id, candidate_id, test_id, max_attempts, granted_by, granted_at) VALUES (?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%f','now','localtime'))")
          .run(uuidv4(), cid, testId, maxAttempts || 1, req.user.id);
        results.assigned++;
      }
    });
    tx();
    logAudit(db, { actorId: req.user.id, actorRole: role, action: 'assign_interview_prep',
      targetType: 'test', targetId: testId, details: results });
    res.json(results);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
}
app.post('/api/super/tests/:id/assign-interview', authMiddleware, requireRole('super_admin'), (req, res) => assignInterviewPrep(req, res, 'super_admin'));
app.post('/api/admin/tests/:id/assign-interview', authMiddleware, requireRole('admin'), (req, res) => assignInterviewPrep(req, res, 'admin'));

// Return ids of candidates currently granted access to a test
function listAssignees(req, res) {
  try {
    const rows = db.prepare(`SELECT candidate_id FROM test_permissions WHERE test_id = ? AND status = 'granted'`).all(req.params.id);
    res.json({ assignees: rows.map(r => r.candidate_id) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
}
app.get('/api/super/tests/:id/assignees', authMiddleware, requireRole('super_admin'), listAssignees);
app.get('/api/admin/tests/:id/assignees', authMiddleware, requireRole('admin'), listAssignees);

// Update editable fields on a test (used by interview-prep edit modal)
function updateTestMeta(req, res, role) {
  try {
    const testId = req.params.id;
    const existing = db.prepare('SELECT id FROM tests WHERE id = ?').get(testId);
    if (!existing) return res.status(404).json({ error: 'Test not found' });
    const { name, description, duration_minutes, passing_percentage } = req.body;
    if (!name || String(name).trim() === '') return res.status(400).json({ error: 'Name required' });
    const dur = parseInt(duration_minutes);
    const pass = parseFloat(passing_percentage);
    if (isNaN(dur) || dur < 1) return res.status(400).json({ error: 'Invalid duration' });
    if (isNaN(pass) || pass < 0 || pass > 100) return res.status(400).json({ error: 'Invalid passing percentage' });
    db.prepare('UPDATE tests SET name = ?, description = ?, duration_minutes = ?, passing_percentage = ? WHERE id = ?')
      .run(String(name).trim(), description || '', dur, pass, testId);
    logAudit(db, { actorId: req.user.id, actorRole: role, action: 'update_test',
      targetType: 'test', targetId: testId, details: { name, duration_minutes: dur, passing_percentage: pass } });
    res.json({ ok: true, test: db.prepare('SELECT * FROM tests WHERE id = ?').get(testId) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
}
app.put('/api/super/tests/:id', authMiddleware, requireRole('super_admin'), (req, res) => updateTestMeta(req, res, 'super_admin'));
app.put('/api/admin/tests/:id', authMiddleware, requireRole('admin'), (req, res) => updateTestMeta(req, res, 'admin'));

app.post('/api/super/permissions/bulk', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const { candidateIds, maxAttempts } = req.body;
    const testIds = req.body.testIds || (req.body.testId ? [req.body.testId] : null);
    if (!candidateIds || !Array.isArray(candidateIds) || !testIds || !Array.isArray(testIds) || testIds.length === 0) {
      return res.status(400).json({ error: 'candidateIds array and testId/testIds required' });
    }
    const results = { granted: [], skipped: [], errors: [] };
    const insert = db.transaction(() => {
      for (const candidateId of candidateIds) {
        const candidate = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'candidate'").get(candidateId);
        if (!candidate) { results.errors.push({ candidateId, reason: 'Not found' }); continue; }
        for (const testId of testIds) {
          const existing = db.prepare('SELECT id FROM test_permissions WHERE candidate_id = ? AND test_id = ? AND status = ?').get(candidateId, testId, 'granted');
          if (existing) { results.skipped.push({ candidateId, testId, reason: 'Already assigned' }); continue; }
          const id = uuidv4();
          db.prepare("INSERT INTO test_permissions (id, candidate_id, test_id, max_attempts, granted_by, granted_at) VALUES (?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%f','now','localtime'))")
            .run(id, candidateId, testId, maxAttempts || 1, req.user.id);
          results.granted.push({ id, candidateId, testId });
        }
      }
    });
    insert();
    logAudit(db, { actorId: req.user.id, actorRole: 'super_admin', action: 'bulk_grant_permissions',
      targetType: 'test', targetId: testIds.join(','), details: { granted: results.granted.length, skipped: results.skipped.length } });
    res.json(results);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/admin/permissions/bulk', authMiddleware, requireRole('admin'), (req, res) => {
  try {
    const { candidateIds, maxAttempts } = req.body;
    const testIds = req.body.testIds || (req.body.testId ? [req.body.testId] : null);
    if (!candidateIds || !Array.isArray(candidateIds) || !testIds || !Array.isArray(testIds) || testIds.length === 0) {
      return res.status(400).json({ error: 'candidateIds array and testId/testIds required' });
    }
    const results = { granted: [], skipped: [], errors: [] };
    const insert = db.transaction(() => {
      for (const candidateId of candidateIds) {
        const candidate = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'candidate'").get(candidateId);
        if (!candidate) { results.errors.push({ candidateId, reason: 'Not found' }); continue; }
        for (const testId of testIds) {
          const existing = db.prepare('SELECT id FROM test_permissions WHERE candidate_id = ? AND test_id = ? AND status = ?').get(candidateId, testId, 'granted');
          if (existing) { results.skipped.push({ candidateId, testId, reason: 'Already assigned' }); continue; }
          const id = uuidv4();
          db.prepare("INSERT INTO test_permissions (id, candidate_id, test_id, max_attempts, granted_by, granted_at) VALUES (?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%f','now','localtime'))")
            .run(id, candidateId, testId, maxAttempts || 1, req.user.id);
          results.granted.push({ id, candidateId, testId });
        }
      }
    });
    insert();
    logAudit(db, { actorId: req.user.id, actorRole: 'admin', action: 'bulk_grant_permissions',
      targetType: 'test', targetId: testIds.join(','), details: { granted: results.granted.length, skipped: results.skipped.length } });
    res.json(results);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ============================================================
// AUDIT LOG VIEWER (with pagination)
// ============================================================

function buildAuditLogResponse(req, restrictAdminId) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 50);
  const offset = (page - 1) * limit;
  const { action, actorId, search, category, dateFrom, dateTo } = req.query;

  let where = '1=1';
  const params = [];
  if (action) { where += ' AND al.action = ?'; params.push(action); }
  if (actorId) { where += ' AND al.actor_id = ?'; params.push(actorId); }
  if (search) {
    where += ' AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(al.action) LIKE ? OR LOWER(al.details) LIKE ?)';
    const q = `%${search.toLowerCase()}%`;
    params.push(q, q, q, q);
  }
  if (dateFrom) { where += ' AND al.timestamp >= ?'; params.push(dateFrom); }
  if (dateTo) { where += ' AND al.timestamp <= ?'; params.push(dateTo + 'T23:59:59.999'); }
  if (category) {
    const groups = {
      login: ["'login','logout','login_failed'"],
      permission: ["'assign_test','grant_permission','revoke_permission','revoke_test','restore_permission','reset_attempts','analysis_only','bulk_grant_permissions'"],
      candidate: ["'create_candidate','delete_candidate','bulk_import_candidates','reset_password','deactivate_user','activate_user'"],
      test: ["'create_test','edit_test','update_test','delete_test','start_test','submit_test','auto_submit'"],
    };
    if (groups[category]) { where += ` AND al.action IN (${groups[category]})`; }
  }
  if (restrictAdminId) {
    where += ' AND (al.actor_id = ? OR al.target_id IN (SELECT id FROM users WHERE created_by = ?))';
    params.push(restrictAdminId, restrictAdminId);
  }

  const total = db.prepare(`SELECT COUNT(*) as c FROM audit_log al LEFT JOIN users u ON al.actor_id = u.id WHERE ${where}`).get(...params).c;
  const logs = db.prepare(`
    SELECT al.*, u.name as actor_name, u.email as actor_email, u.role as actor_role
    FROM audit_log al LEFT JOIN users u ON al.actor_id = u.id
    WHERE ${where}
    ORDER BY al.timestamp DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset).map(a => {
    const detailsObj = a.details ? (() => { try { return JSON.parse(a.details); } catch(e) { return {}; } })() : {};
    // If details is a plain string (new humanized format), keep it as string; else JSON obj.
    let detailsOut = detailsObj;
    let detailsStr = a.details || '';
    if (typeof a.details === 'string') {
      try { JSON.parse(a.details); } catch (e) { detailsOut = a.details; }
    }
    return {
      ...a,
      details: detailsOut,
      deleted_data: a.deleted_data || null,
      is_reverted: a.is_reverted ? 1 : 0,
      reverted_at: a.reverted_at || null,
      reverted_by: a.reverted_by || null,
      timestamp_ist: formatToIST(a.timestamp),
      message: (typeof detailsOut === 'string' && detailsOut) ? detailsOut : describeAudit({ ...a, details: (typeof detailsOut === 'object' ? detailsOut : {}) }),
      category: categorizeAudit(a.action),
      performed_by: a.actor_name ? `${a.actor_name}${a.actor_email ? ' (' + a.actor_email + ')' : ''}` : null,
    };
  });

  const actions = db.prepare('SELECT DISTINCT action FROM audit_log ORDER BY action').all().map(r => r.action);
  return { logs, total, page, limit, pages: Math.ceil(total / limit), actions };
}

app.get('/api/super/audit-log', authMiddleware, requireRole('super_admin'), (req, res) => {
  try { res.json(buildAuditLogResponse(req, null)); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});
app.get('/api/admin/audit-log', authMiddleware, requireRole('admin'), (req, res) => {
  try { res.json(buildAuditLogResponse(req, req.user.id)); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ---------- REVERT AUDIT ENTRY ----------
const bcryptLib = require('bcryptjs');
function revertAuditEntry(req, res, scope) {
  try {
    const entry = db.prepare('SELECT * FROM audit_log WHERE id = ?').get(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Audit entry not found' });
    if (scope === 'admin' && entry.actor_id !== req.user.id) {
      return res.status(403).json({ error: 'You may only revert your own deletions' });
    }
    if (entry.is_reverted) return res.status(400).json({ error: 'Already reverted' });
    if (!entry.deleted_data) return res.status(400).json({ error: 'Nothing to revert' });

    let data;
    try { data = JSON.parse(entry.deleted_data); }
    catch (e) { return res.status(400).json({ error: 'Corrupted deleted data' }); }

    const revertedBy = req.user.name || req.user.id;
    const now = nowLocalIso();
    let message = '';
    let auditMsg = '';

    const tx = db.transaction(() => {
      if (entry.action === 'delete_candidate') {
        const clash = db.prepare('SELECT id FROM users WHERE id = ? OR LOWER(email) = LOWER(?)').get(data.id, data.email || '');
        if (clash) { const e = new Error('A user with this id or email already exists'); e.status = 409; throw e; }
        const restoredPw = bcryptLib.hashSync('Restored@123', 10);
        db.prepare(`INSERT INTO users (id, name, email, password, role, is_active, created_by, created_at, last_login, batch_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
          data.id, data.name, data.email, restoredPw, data.role || 'candidate',
          data.is_active != null ? data.is_active : 1,
          data.created_by || null, data.created_at || now, data.last_login || null, data.batch_id || null
        );
        message = `Candidate ${data.name} restored successfully. Temporary password: Restored@123`;
        auditMsg = `Reverted deletion of candidate ${data.name} (${data.email})`;
      } else if (entry.action === 'delete_test') {
        const clash = db.prepare('SELECT id FROM tests WHERE id = ?').get(data.id);
        if (clash) { const e = new Error('A test with this id already exists'); e.status = 409; throw e; }
        const cols = ['id','name','description','port','duration_minutes','passing_percentage','total_questions','is_active','created_at','test_type','created_by','subjects_json','difficulty_json','type_quotas_json','is_custom','coding_problem_count','available_from','available_until','is_interview_prep'];
        const vals = cols.map(c => data[c] != null ? data[c] : null);
        db.prepare(`INSERT INTO tests (${cols.join(',')}) VALUES (${cols.map(()=>'?').join(',')})`).run(...vals);
        message = `Test "${data.name}" restored successfully`;
        auditMsg = `Reverted deletion of test "${data.name}"`;
      } else {
        const e = new Error('This action type cannot be reverted'); e.status = 400; throw e;
      }
      db.prepare('UPDATE audit_log SET is_reverted = 1, reverted_at = ?, reverted_by = ? WHERE id = ?')
        .run(now, revertedBy, entry.id);
      logAudit(db, {
        actorId: req.user.id, actorRole: req.user.role,
        action: 'revert_' + entry.action, targetType: entry.target_type, targetId: entry.target_id,
        details: auditMsg
      });
    });
    try { tx(); }
    catch (e) { return res.status(e.status || 500).json({ error: e.message || 'Revert failed' }); }

    res.json({ success: true, message });
  } catch (err) {
    console.error('Revert audit error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}
app.post('/api/super/audit-log/:id/revert', authMiddleware, requireRole('super_admin'), (req, res) => revertAuditEntry(req, res, 'super'));
app.post('/api/admin/audit-log/:id/revert', authMiddleware, requireRole('admin'), (req, res) => revertAuditEntry(req, res, 'admin'));

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
  db.prepare("INSERT OR REPLACE INTO app_settings(key,value,updated_at) VALUES(?,?,strftime('%Y-%m-%dT%H:%M:%f','now','localtime'))").run(key, value);
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
      insertQ.run(testId, q.questionNum || q.question_num || i + 1,
        q.questionText || q.question_text,
        q.modelAnswer || q.model_answer || q.expected_answer || '',
        q.questionType || q.question_type || 'short',
        q.maxScore || q.max_score || q.marks || 10);
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
        insertQ.run(req.params.id, q.questionNum || q.question_num || i + 1,
          q.questionText || q.question_text,
          q.modelAnswer || q.model_answer || q.expected_answer || '',
          q.questionType || q.question_type || 'short',
          q.maxScore || q.max_score || q.marks || 10);
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
        s.started_at ? formatToIST(s.started_at) : '',
        s.completed_at ? formatToIST(s.completed_at) : ''].map(escCsv).join(',');
    });
    const csv = [header.map(escCsv).join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="interview_results_${nowLocalIso().split('T')[0]}.csv"`);
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
      UPDATE interview_answers SET ai_score=?,ai_reasoning=?,ai_strengths=?,ai_missing=?,final_score=?,evaluated_at=strftime('%Y-%m-%dT%H:%M:%f','now','localtime')
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
        insertQ.run(req.params.id, q.questionNum || q.question_num || i + 1,
          q.questionText || q.question_text,
          q.modelAnswer || q.model_answer || q.expected_answer || '',
          q.questionType || q.question_type || 'short',
          q.maxScore || q.max_score || q.marks || 10);
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
    const update = db.prepare(`UPDATE interview_answers SET ai_score=?,ai_reasoning=?,ai_strengths=?,ai_missing=?,final_score=?,evaluated_at=strftime('%Y-%m-%dT%H:%M:%f','now','localtime') WHERE id=?`);
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

    db.prepare("UPDATE interview_sessions SET status='submitted',submitted_at=strftime('%Y-%m-%dT%H:%M:%f','now','localtime') WHERE id=?").run(req.params.sessionId);
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
      timestamp: nowLocalIso(),
    });
  } catch (e) { res.status(500).json({ status: 'error', error: e.message }); }
});

// DB backup (super admin only — streams a copy of the SQLite file)
app.get('/api/super/backup', authMiddleware, requireRole('super_admin'), (req, res) => {
  try {
    const fs = require('fs');
    const dbPath = path.join(__dirname, 'skillforge.db');
    if (!fs.existsSync(dbPath)) return res.status(404).json({ error: 'Database file not found' });
    const filename = `skillforge_backup_${nowLocalIso().split('T')[0]}.db`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    fs.createReadStream(dbPath).pipe(res);
    logAudit(db, { actorId: req.user.id, actorRole: 'super_admin', action: 'db_backup', targetType: 'database', targetId: 'skillforge.db', details: {} });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============================================================
// CATCH-ALL: serve frontend (MUST be last — after all API routes)
// ============================================================

// ============================================================
// DRIVE SESSIONS
// ============================================================

function buildSessionCode(batchCode, dateFrom) {
  const d = new Date(dateFrom);
  const pad = n => String(n).padStart(2, '0');
  return `SES-${batchCode}-${pad(d.getDate())}${pad(d.getMonth() + 1)}${d.getFullYear()}`;
}

function ensureUniqueSessionCode(base) {
  let code = base;
  let n = 2;
  while (db.prepare('SELECT 1 FROM sessions WHERE session_code = ?').get(code)) {
    code = `${base}-${n}`;
    n++;
  }
  return code;
}

function computeSessionStats(sessionId) {
  const totalCandidates = db.prepare('SELECT COUNT(*) as c FROM test_permissions WHERE session_id = ?').get(sessionId).c;
  const appeared = db.prepare('SELECT COUNT(*) as c FROM test_sessions WHERE session_id = ?').get(sessionId).c;
  const passed = db.prepare("SELECT COUNT(*) as c FROM test_sessions WHERE session_id = ? AND passed = 1 AND status IN ('submitted','timed_out')").get(sessionId).c;
  const completed = db.prepare("SELECT COUNT(*) as c FROM test_sessions WHERE session_id = ? AND status IN ('submitted','timed_out')").get(sessionId).c;
  const failed = Math.max(0, completed - passed);
  const avgRow = db.prepare("SELECT AVG(percentage) as a FROM test_sessions WHERE session_id = ? AND status IN ('submitted','timed_out')").get(sessionId);
  const avgScore = avgRow.a != null ? Math.round(avgRow.a * 10) / 10 : null;
  return { totalCandidates, appeared, passed, failed, avgScore };
}

function serializeSession(row) {
  const stats = computeSessionStats(row.id);
  const now = Date.now();
  const from = parseDbTime(row.date_from);
  const to = parseDbTime(row.date_to);
  let derivedStatus = row.status;
  if (row.status !== 'completed' && row.status !== 'cancelled') {
    if (from && now < from) derivedStatus = 'upcoming';
    else if (to && now > to) {
      derivedStatus = 'completed';
      try { db.prepare("UPDATE sessions SET status = 'completed' WHERE id = ?").run(row.id); } catch (e) {}
    } else derivedStatus = 'active';
  }
  return {
    id: row.id,
    sessionCode: row.session_code,
    name: row.name,
    batchId: row.batch_id,
    batchCode: row.batch_code,
    batchName: row.batch_name,
    testId: row.test_id,
    testName: row.test_name,
    dateFrom: row.date_from,
    dateTo: row.date_to,
    tunnelType: row.tunnel_type,
    tunnelUrl: row.tunnel_url,
    notes: row.notes,
    status: derivedStatus,
    storedStatus: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at,
    ...stats,
  };
}

function listSessionsFor(scope, adminId) {
  try {
    db.prepare(`
      UPDATE test_sessions
      SET session_id = (SELECT tp.session_id FROM test_permissions tp WHERE tp.id = test_sessions.permission_id)
      WHERE session_id IS NULL
        AND permission_id IN (SELECT id FROM test_permissions WHERE session_id IS NOT NULL)
    `).run();
  } catch (e) { /* ignore */ }
  const where = scope === 'admin' ? 'WHERE b.created_by = ?' : '';
  const params = scope === 'admin' ? [adminId] : [];
  const rows = db.prepare(`
    SELECT s.*, b.code as batch_code, b.name as batch_name, t.name as test_name
    FROM sessions s
    JOIN batches b ON b.id = s.batch_id
    JOIN tests t ON t.id = s.test_id
    ${where}
    ORDER BY s.created_at DESC
  `).all(...params);
  return rows.map(serializeSession);
}

function createSessionHandler(req, res, role) {
  try {
    const { name, batchId, testId, dateFrom, dateTo, tunnelType, notes } = req.body || {};
    if (!name || !batchId || !testId || !dateFrom || !dateTo) {
      return res.status(400).json({ error: 'name, batchId, testId, dateFrom, dateTo are required' });
    }
    const batch = db.prepare('SELECT id, code, created_by FROM batches WHERE id = ?').get(batchId);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    if (role === 'admin' && batch.created_by !== req.user.id) return res.status(403).json({ error: 'Not authorized for this batch' });
    const test = db.prepare('SELECT id, name FROM tests WHERE id = ?').get(testId);
    if (!test) return res.status(404).json({ error: 'Test not found' });

    const id = 'session_' + Date.now() + require('crypto').randomBytes(3).toString('hex');
    const baseCode = buildSessionCode(batch.code, dateFrom);
    const sessionCode = ensureUniqueSessionCode(baseCode);
    const tType = tunnelType === 'ngrok' ? 'ngrok' : 'lan';

    db.prepare(`
      INSERT INTO sessions (id, session_code, name, batch_id, test_id, date_from, date_to, tunnel_type, tunnel_url, notes, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, 'active', ?)
    `).run(id, sessionCode, String(name).trim(), batchId, testId, dateFrom, dateTo, tType, notes ? String(notes).trim() : null, req.user.id);

    // Bulk grant permissions
    const candidates = db.prepare("SELECT id FROM users WHERE batch_id = ? AND role = 'candidate' AND is_active = 1").all(batchId);
    const existsStmt = db.prepare('SELECT 1 FROM test_permissions WHERE candidate_id = ? AND test_id = ?');
    const insertStmt = db.prepare(`
      INSERT INTO test_permissions (id, candidate_id, test_id, session_id, max_attempts, attempt_count, status, granted_by, granted_at, available_from, available_until)
      VALUES (?, ?, ?, ?, 1, 0, 'granted', ?, strftime('%Y-%m-%dT%H:%M:%f','now','localtime'), ?, ?)
    `);
    let assignedCount = 0;
    const tx = db.transaction(() => {
      for (const c of candidates) {
        if (existsStmt.get(c.id, testId)) continue;
        const permId = 'perm_' + require('crypto').randomBytes(8).toString('hex');
        insertStmt.run(permId, c.id, testId, id, req.user.id, dateFrom, dateTo);
        assignedCount++;
      }
    });
    tx();

    logAudit(db, { actorId: req.user.id, actorRole: role, action: `Created session ${sessionCode} - ${name} with ${assignedCount} candidates assigned to test ${test.name}`, targetType: 'session', targetId: id, details: { code: sessionCode, name, batchId, testId, assignedCount } });

    const row = db.prepare(`
      SELECT s.*, b.code as batch_code, b.name as batch_name, t.name as test_name
      FROM sessions s JOIN batches b ON b.id = s.batch_id JOIN tests t ON t.id = s.test_id
      WHERE s.id = ?
    `).get(id);
    res.status(201).json({ ...serializeSession(row), assignedCount });
  } catch (err) {
    console.error('createSession error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

function updateSessionHandler(req, res, role) {
  try {
    const { name, dateFrom, dateTo, status, notes } = req.body || {};
    const s = db.prepare(`
      SELECT s.*, b.created_by as batch_created_by
      FROM sessions s JOIN batches b ON b.id = s.batch_id
      WHERE s.id = ?
    `).get(req.params.id);
    if (!s) return res.status(404).json({ error: 'Session not found' });
    if (role === 'admin' && s.batch_created_by !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const newName = name != null ? String(name).trim() : s.name;
    const newFrom = dateFrom != null ? dateFrom : s.date_from;
    const newTo = dateTo != null ? dateTo : s.date_to;
    const newNotes = notes != null ? String(notes).trim() : s.notes;
    const allowedStatus = ['active', 'completed', 'expired', 'cancelled'];
    const newStatus = status != null && allowedStatus.includes(status) ? status : s.status;

    db.prepare('UPDATE sessions SET name = ?, date_from = ?, date_to = ?, notes = ?, status = ? WHERE id = ?')
      .run(newName, newFrom, newTo, newNotes, newStatus, req.params.id);

    let actionText = `Updated session ${s.session_code}`;
    if (newStatus === 'completed' && s.status !== 'completed') {
      db.prepare("UPDATE test_permissions SET status = 'completed' WHERE session_id = ?").run(req.params.id);
      actionText = `Completed session ${s.session_code}`;
    }
    logAudit(db, { actorId: req.user.id, actorRole: role, action: actionText, targetType: 'session', targetId: req.params.id, details: { code: s.session_code, status: newStatus } });
    res.json({ success: true });
  } catch (err) {
    console.error('updateSession error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

function deleteSessionHandler(req, res, role) {
  try {
    const s = db.prepare(`
      SELECT s.*, b.created_by as batch_created_by
      FROM sessions s JOIN batches b ON b.id = s.batch_id
      WHERE s.id = ?
    `).get(req.params.id);
    if (!s) return res.status(404).json({ error: 'Session not found' });
    if (role === 'admin' && s.batch_created_by !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    if (s.status === 'completed' || s.status === 'cancelled') return res.status(400).json({ error: 'Completed sessions cannot be deleted' });
    const usedCount = db.prepare('SELECT COUNT(*) as c FROM test_sessions WHERE session_id = ?').get(req.params.id).c;
    if (usedCount > 0) return res.status(400).json({ error: 'Cannot delete: candidates have already attempted tests in this session' });
    db.prepare('DELETE FROM test_permissions WHERE session_id = ?').run(req.params.id);
    db.prepare('DELETE FROM sessions WHERE id = ?').run(req.params.id);
    logAudit(db, { actorId: req.user.id, actorRole: role, action: `Deleted session ${s.session_code}`, targetType: 'session', targetId: req.params.id, details: { code: s.session_code } });
    res.json({ success: true });
  } catch (err) {
    console.error('deleteSession error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

app.get('/api/super/sessions', authMiddleware, requireRole('super_admin'), (req, res) => {
  try { res.json(listSessionsFor('super', req.user.id)); } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});
app.get('/api/admin/sessions', authMiddleware, requireRole('admin'), (req, res) => {
  try { res.json(listSessionsFor('admin', req.user.id)); } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});
app.post('/api/super/sessions', authMiddleware, requireRole('super_admin'), (req, res) => createSessionHandler(req, res, 'super_admin'));
app.post('/api/admin/sessions', authMiddleware, requireRole('admin'), (req, res) => createSessionHandler(req, res, 'admin'));
app.put('/api/super/sessions/:id', authMiddleware, requireRole('super_admin'), (req, res) => updateSessionHandler(req, res, 'super_admin'));
app.put('/api/admin/sessions/:id', authMiddleware, requireRole('admin'), (req, res) => updateSessionHandler(req, res, 'admin'));
app.delete('/api/super/sessions/:id', authMiddleware, requireRole('super_admin'), (req, res) => deleteSessionHandler(req, res, 'super_admin'));
app.delete('/api/admin/sessions/:id', authMiddleware, requireRole('admin'), (req, res) => deleteSessionHandler(req, res, 'admin'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
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
