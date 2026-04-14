const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const Papa = require('papaparse');

const dbPath = path.join(__dirname, 'skillforge.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ========== CREATE TABLES ==========

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('super_admin', 'admin', 'candidate')),
    is_active INTEGER DEFAULT 1,
    created_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    last_login TEXT,
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS admin_assignments (
    id TEXT PRIMARY KEY,
    admin_id TEXT NOT NULL,
    assigned_tests TEXT DEFAULT '[]',
    max_candidates INTEGER DEFAULT 100,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (admin_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS tests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    port INTEGER,
    duration_minutes INTEGER DEFAULT 90,
    passing_percentage REAL DEFAULT 60.0,
    total_questions INTEGER DEFAULT 100,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS test_permissions (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL,
    test_id TEXT NOT NULL,
    status TEXT DEFAULT 'granted' CHECK(status IN ('granted', 'completed', 'revoked', 'expired')),
    max_attempts INTEGER DEFAULT 1,
    attempt_count INTEGER DEFAULT 0,
    granted_by TEXT,
    granted_at TEXT DEFAULT (datetime('now')),
    analysis_only INTEGER DEFAULT 0,
    analysis_expires_at TEXT,
    FOREIGN KEY (candidate_id) REFERENCES users(id),
    FOREIGN KEY (test_id) REFERENCES tests(id),
    FOREIGN KEY (granted_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS test_sessions (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL,
    test_id TEXT NOT NULL,
    permission_id TEXT,
    status TEXT DEFAULT 'in_progress' CHECK(status IN ('in_progress', 'submitted', 'timed_out', 'abandoned')),
    start_time TEXT DEFAULT (datetime('now')),
    end_time TEXT,
    duration_minutes INTEGER,
    questions_json TEXT,
    answers_json TEXT DEFAULT '{}',
    score INTEGER,
    total_questions INTEGER,
    percentage REAL,
    passed INTEGER,
    grade TEXT,
    result_json TEXT,
    time_taken INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (candidate_id) REFERENCES users(id),
    FOREIGN KEY (test_id) REFERENCES tests(id),
    FOREIGN KEY (permission_id) REFERENCES test_permissions(id)
  );

  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    csv_id TEXT,
    subject TEXT NOT NULL,
    topic TEXT,
    difficulty TEXT,
    type TEXT DEFAULT 'mcq',
    question TEXT NOT NULL,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_answer TEXT,
    answer_index INTEGER DEFAULT 0,
    explanation TEXT,
    code_snippet TEXT
  );

  CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    actor_id TEXT,
    actor_role TEXT,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    details TEXT,
    timestamp TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS coding_problems (
    id INTEGER PRIMARY KEY,
    test_id TEXT NOT NULL DEFAULT 'test_r3',
    section TEXT NOT NULL,
    title TEXT NOT NULL,
    difficulty TEXT DEFAULT 'Medium',
    points INTEGER DEFAULT 10,
    time_limit INTEGER DEFAULT 5000,
    description TEXT NOT NULL,
    input_format TEXT,
    output_format TEXT,
    constraints_text TEXT,
    starter_code TEXT,
    solution TEXT,
    evaluation_type TEXT DEFAULT 'output' CHECK(evaluation_type IN ('output', 'keyword', 'sql', 'python')),
    required_keywords TEXT,
    required_count INTEGER DEFAULT 0,
    sql_setup TEXT,
    FOREIGN KEY (test_id) REFERENCES tests(id)
  );

  CREATE TABLE IF NOT EXISTS coding_test_cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_id INTEGER NOT NULL,
    input TEXT,
    expected_output TEXT NOT NULL,
    explanation TEXT,
    is_hidden INTEGER DEFAULT 0,
    FOREIGN KEY (problem_id) REFERENCES coding_problems(id)
  );
`);

// ========== INTERVIEW TABLES ==========
db.exec(`
  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS interview_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    extracted_text TEXT,
    created_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS interview_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_id INTEGER NOT NULL,
    question_num INTEGER,
    question_text TEXT NOT NULL,
    model_answer TEXT NOT NULL,
    question_type TEXT DEFAULT 'short',
    max_score INTEGER DEFAULT 10,
    FOREIGN KEY (test_id) REFERENCES interview_tests(id)
  );

  CREATE TABLE IF NOT EXISTS interview_permissions (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL,
    test_id INTEGER NOT NULL,
    status TEXT DEFAULT 'granted',
    granted_by TEXT,
    granted_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS interview_sessions (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL,
    test_id INTEGER NOT NULL,
    status TEXT DEFAULT 'in_progress',
    started_at TEXT DEFAULT (datetime('now')),
    submitted_at TEXT,
    total_max_score INTEGER DEFAULT 0,
    is_approved INTEGER DEFAULT 0,
    admin_notes TEXT
  );

  CREATE TABLE IF NOT EXISTS interview_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    question_id INTEGER NOT NULL,
    answer_text TEXT,
    ai_score INTEGER,
    ai_reasoning TEXT,
    ai_strengths TEXT,
    ai_missing TEXT,
    admin_score INTEGER,
    admin_notes TEXT,
    final_score INTEGER,
    evaluated_at TEXT,
    FOREIGN KEY (session_id) REFERENCES interview_sessions(id),
    FOREIGN KEY (question_id) REFERENCES interview_questions(id)
  );
`);

// ========== MIGRATION-SAFE ALTER TABLES ==========

// Add test_type column to tests table
try { db.exec(`ALTER TABLE tests ADD COLUMN test_type TEXT DEFAULT 'mcq'`); } catch (e) { /* column already exists */ }

// Add coding-specific columns to test_sessions
try { db.exec(`ALTER TABLE test_sessions ADD COLUMN code_map_json TEXT DEFAULT '{}'`); } catch (e) {}
try { db.exec(`ALTER TABLE test_sessions ADD COLUMN coding_results_json TEXT DEFAULT '{}'`); } catch (e) {}
try { db.exec(`ALTER TABLE test_sessions ADD COLUMN best_scores_json TEXT DEFAULT '{}'`); } catch (e) {}

// Add custom test design columns to tests table
try { db.exec(`ALTER TABLE tests ADD COLUMN created_by TEXT`); } catch (e) {}
try { db.exec(`ALTER TABLE tests ADD COLUMN subjects_json TEXT`); } catch (e) {}
try { db.exec(`ALTER TABLE tests ADD COLUMN difficulty_json TEXT`); } catch (e) {}
try { db.exec(`ALTER TABLE tests ADD COLUMN type_quotas_json TEXT`); } catch (e) {}
try { db.exec(`ALTER TABLE tests ADD COLUMN is_custom INTEGER DEFAULT 0`); } catch (e) {}
try { db.exec(`ALTER TABLE tests ADD COLUMN coding_problem_count INTEGER DEFAULT 0`); } catch (e) {}

// Add hybrid session columns
try { db.exec(`ALTER TABLE test_sessions ADD COLUMN hybrid_problem_ids_json TEXT DEFAULT '[]'`); } catch (e) {}

// Add anti-cheat violation tracking columns
try { db.exec(`ALTER TABLE test_sessions ADD COLUMN tab_violations INTEGER DEFAULT 0`); } catch (e) {}
try { db.exec(`ALTER TABLE test_sessions ADD COLUMN violation_log_json TEXT DEFAULT '[]'`); } catch (e) {}

// Add test scheduling columns
try { db.exec(`ALTER TABLE tests ADD COLUMN available_from TEXT`); } catch (e) {}
try { db.exec(`ALTER TABLE tests ADD COLUMN available_until TEXT`); } catch (e) {}

// ========== SEED SUPER ADMIN ==========

const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
if (userCount === 0) {
  const hashedPw = bcrypt.hashSync('SuperAdmin@123', 10);
  db.prepare(`
    INSERT INTO users (id, name, email, password, role, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('super_admin_001', 'Super Admin', 'superadmin@skillforge.com', hashedPw, 'super_admin', 1);
  console.log('[DB] Seeded super admin: superadmin@skillforge.com / SuperAdmin@123');
}

// ========== SEED TESTS ==========

const testCount = db.prepare('SELECT COUNT(*) as c FROM tests').get().c;
if (testCount === 0) {
  const tests = [
    { id: 'test_p1', name: 'Python Round 1', description: 'Python fundamentals assessment', port: 3000, duration: 90, passing: 60.0, total: 100, type: 'mcq' },
    { id: 'test_pqa', name: 'Python QA Round 1', description: 'Python QA comprehensive assessment', port: 3000, duration: 100, passing: 60.0, total: 100, type: 'mcq' },
    { id: 'test_pycode', name: 'Python Coding Challenge', description: 'Python algorithmic coding problems', port: 3000, duration: 120, passing: 60.0, total: 100, type: 'coding' },
  ];

  const insertTest = db.prepare(`
    INSERT INTO tests (id, name, description, port, duration_minutes, passing_percentage, total_questions, test_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const t of tests) {
    insertTest.run(t.id, t.name, t.description, t.port, t.duration, t.passing, t.total, t.type);
  }
  console.log('[DB] Seeded 5 tests');
}

// ========== LOAD QUESTIONS FROM CSV ==========

const questionCount = db.prepare('SELECT COUNT(*) as c FROM questions').get().c;
if (questionCount === 0) {
  const csvFiles = [
    { file: 'python_questions.csv', subject: 'Python' },
    { file: 'python_selenium_questions.csv', subject: 'Python_Selenium' },
    { file: 'pytest_questions.csv', subject: 'Pytest' },
    { file: 'manual_testing_questions.csv', subject: 'Manual_Testing' },
    { file: 'api_testing_questions.csv', subject: 'API_Testing' },
    { file: 'postman_questions.csv', subject: 'Postman' },
    { file: 'python_requests_questions.csv', subject: 'Python_Requests' },
    { file: 'sql_questions.csv', subject: 'SQL' },
  ];

  // Try both possible locations for question_bank
  const possiblePaths = [
    path.join(__dirname, '..', 'question_bank'),
    path.join(__dirname, '..', '..', 'question_bank'),
  ];

  let questionBankPath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      questionBankPath = p;
      break;
    }
  }

  if (questionBankPath) {
    const answerMap = { A: 0, B: 1, C: 2, D: 3 };

    const insertQuestion = db.prepare(`
      INSERT OR IGNORE INTO questions (id, csv_id, subject, topic, difficulty, type, question, option_a, option_b, option_c, option_d, correct_answer, answer_index, explanation, code_snippet)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((rows) => {
      for (const r of rows) {
        insertQuestion.run(
          r.id, r.csv_id, r.subject, r.topic, r.difficulty, r.type,
          r.question, r.option_a, r.option_b, r.option_c, r.option_d,
          r.correct_answer, r.answer_index, r.explanation, r.code_snippet
        );
      }
    });

    let totalLoaded = 0;

    for (const { file, subject } of csvFiles) {
      const filePath = path.join(questionBankPath, file);
      if (!fs.existsSync(filePath)) {
        console.log(`[DB] CSV not found: ${file}, skipping`);
        continue;
      }

      const csvContent = fs.readFileSync(filePath, 'utf8');
      const parsed = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim(),
      });

      const rows = [];
      for (const row of parsed.data) {
        if (!row.id || !row.question) continue;

        const csvSubject = row.subject || subject;
        const compositeId = `${csvSubject}_${row.id}`;
        const correctAnswer = (row.correct_answer || 'A').trim().toUpperCase();
        const idx = answerMap[correctAnswer.charAt(0)];

        rows.push({
          id: compositeId,
          csv_id: row.id,
          subject: csvSubject,
          topic: row.topic || '',
          difficulty: row.difficulty || 'Medium',
          type: row.type || 'mcq',
          question: row.question,
          option_a: row.option_a || '',
          option_b: row.option_b || '',
          option_c: row.option_c || '',
          option_d: row.option_d || '',
          correct_answer: correctAnswer,
          answer_index: idx !== undefined ? idx : 0,
          explanation: row.explanation || '',
          code_snippet: row.code_snippet || '',
        });
      }

      if (rows.length > 0) {
        insertMany(rows);
        totalLoaded += rows.length;
        console.log(`[DB] Loaded ${rows.length} questions from ${file}`);
      }
    }

    console.log(`[DB] Total questions loaded: ${totalLoaded}`);
  } else {
    console.warn('[DB] Question bank directory not found. No questions loaded.');
  }
}

// ========== SEED CODING PROBLEMS ==========

// ========== CLEANUP: Remove Java tests if they exist ==========
try {
  db.prepare("DELETE FROM coding_test_cases WHERE problem_id IN (SELECT id FROM coding_problems WHERE test_id IN ('test_r3'))").run();
  db.prepare("DELETE FROM coding_problems WHERE test_id IN ('test_r3')").run();
  db.prepare("DELETE FROM test_permissions WHERE test_id IN ('test_r1','test_r2','test_r3')").run();
  db.prepare("DELETE FROM test_sessions WHERE test_id IN ('test_r1','test_r2','test_r3')").run();
  db.prepare("DELETE FROM tests WHERE id IN ('test_r1','test_r2','test_r3')").run();
} catch (e) { /* tables may not have those rows */ }

const codingProblemCount = db.prepare('SELECT COUNT(*) as c FROM coding_problems').get().c;
if (codingProblemCount === 0) {
  // Seed Python coding problems
  try {
    const pythonProblems = require('./problems_python');
    if (pythonProblems && pythonProblems.length > 0) {
      const insertProblem = db.prepare(`
        INSERT OR IGNORE INTO coding_problems (id, test_id, section, title, difficulty, points, time_limit, description, input_format, output_format, constraints_text, starter_code, solution, evaluation_type, required_keywords, required_count, sql_setup)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const insertTestCase = db.prepare(`
        INSERT INTO coding_test_cases (problem_id, input, expected_output, explanation, is_hidden)
        VALUES (?, ?, ?, ?, ?)
      `);

      const seedPython = db.transaction(() => {
        for (const p of pythonProblems) {
          insertProblem.run(
            p.id, 'test_pycode', p.section, p.title, p.difficulty, p.points,
            p.timeLimit, p.description, p.inputFormat || '', p.outputFormat || '',
            p.constraints || '', p.starterCode || '', p.solution || '',
            p.evaluationType || 'python', '[]', 0, ''
          );
          if (p.sampleTestCases) {
            for (const tc of p.sampleTestCases) {
              insertTestCase.run(p.id, tc.input || '', tc.expectedOutput, tc.explanation || '', 0);
            }
          }
          if (p.hiddenTestCases) {
            for (const tc of p.hiddenTestCases) {
              insertTestCase.run(p.id, tc.input || '', tc.expectedOutput, tc.explanation || '', 1);
            }
          }
        }
      });

      seedPython();
      console.log(`[DB] Seeded ${pythonProblems.length} Python coding problems with test cases`);
    }
  } catch (e) {
    console.warn('[DB] Could not seed Python coding problems:', e.message);
  }
}

module.exports = db;
