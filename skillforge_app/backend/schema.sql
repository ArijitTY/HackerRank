-- SkillForge database schema
-- Run this to create a fresh empty database
-- Then run seed_questions.sql to populate question data

CREATE TABLE admin_assignments (
    id TEXT PRIMARY KEY,
    admin_id TEXT NOT NULL,
    assigned_tests TEXT DEFAULT '[]',
    max_candidates INTEGER DEFAULT 100,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (admin_id) REFERENCES users(id)
  );

CREATE TABLE app_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  );

CREATE TABLE audit_log (
    id TEXT PRIMARY KEY,
    actor_id TEXT,
    actor_role TEXT,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    details TEXT,
    timestamp TEXT DEFAULT (datetime('now'))
  , deleted_data TEXT, is_reverted INTEGER DEFAULT 0, reverted_at TEXT, reverted_by TEXT);

CREATE TABLE batches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_by TEXT,
    created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now', 'localtime')),
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

CREATE TABLE coding_problems (
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

CREATE TABLE coding_test_cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_id INTEGER NOT NULL,
    input TEXT,
    expected_output TEXT NOT NULL,
    explanation TEXT,
    is_hidden INTEGER DEFAULT 0,
    FOREIGN KEY (problem_id) REFERENCES coding_problems(id)
  );

CREATE TABLE company_coding_problems (
    id TEXT PRIMARY KEY,
    company TEXT NOT NULL,
    test_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT DEFAULT 'Medium',
    language TEXT DEFAULT 'python',
    starter_code TEXT,
    solution_code TEXT,
    test_cases TEXT,
    expected_output TEXT,
    hints TEXT,
    marks INTEGER DEFAULT 10,
    order_index INTEGER DEFAULT 0
  );

CREATE TABLE company_questions (
    id TEXT PRIMARY KEY,
    csv_id INTEGER,
    company TEXT NOT NULL,
    subject TEXT,
    topic TEXT,
    difficulty TEXT,
    type TEXT,
    question TEXT,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_answer TEXT,
    answer_index INTEGER,
    explanation TEXT,
    code_snippet TEXT
  );

CREATE TABLE config (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  );

CREATE TABLE interview_answers (
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

CREATE TABLE interview_permissions (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL,
    test_id INTEGER NOT NULL,
    status TEXT DEFAULT 'granted',
    granted_by TEXT,
    granted_at TEXT DEFAULT (datetime('now'))
  );

CREATE TABLE interview_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_id INTEGER NOT NULL,
    question_num INTEGER,
    question_text TEXT NOT NULL,
    model_answer TEXT NOT NULL,
    question_type TEXT DEFAULT 'short',
    max_score INTEGER DEFAULT 10,
    FOREIGN KEY (test_id) REFERENCES interview_tests(id)
  );

CREATE TABLE interview_sessions (
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

CREATE TABLE interview_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    extracted_text TEXT,
    created_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

CREATE TABLE questions (
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

CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    session_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    batch_id TEXT NOT NULL,
    test_id TEXT NOT NULL,
    date_from TEXT NOT NULL,
    date_to TEXT NOT NULL,
    tunnel_type TEXT DEFAULT 'lan' CHECK(tunnel_type IN ('lan','ngrok')),
    tunnel_url TEXT,
    notes TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active','completed','expired','cancelled')),
    created_by TEXT,
    created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now', 'localtime')),
    FOREIGN KEY (batch_id) REFERENCES batches(id),
    FOREIGN KEY (test_id) REFERENCES tests(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

CREATE TABLE sqlite_sequence(name,seq);

CREATE TABLE test_permissions (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL,
    test_id TEXT NOT NULL,
    status TEXT DEFAULT 'granted' CHECK(status IN ('granted', 'completed', 'revoked', 'expired')),
    max_attempts INTEGER DEFAULT 1,
    attempt_count INTEGER DEFAULT 0,
    granted_by TEXT,
    granted_at TEXT DEFAULT (datetime('now')),
    analysis_only INTEGER DEFAULT 0,
    analysis_expires_at TEXT, session_id TEXT, available_from TEXT, available_until TEXT,
    FOREIGN KEY (candidate_id) REFERENCES users(id),
    FOREIGN KEY (test_id) REFERENCES tests(id),
    FOREIGN KEY (granted_by) REFERENCES users(id)
  );

CREATE TABLE test_sessions (
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
    created_at TEXT DEFAULT (datetime('now')), code_map_json TEXT DEFAULT '{}', coding_results_json TEXT DEFAULT '{}', best_scores_json TEXT DEFAULT '{}', hybrid_problem_ids_json TEXT DEFAULT '[]', tab_violations INTEGER DEFAULT 0, violation_log_json TEXT DEFAULT '[]', session_id TEXT, violation_blocked INTEGER DEFAULT 0, auto_submitted INTEGER DEFAULT 0, attempt_number INTEGER DEFAULT 1,
    FOREIGN KEY (candidate_id) REFERENCES users(id),
    FOREIGN KEY (test_id) REFERENCES tests(id),
    FOREIGN KEY (permission_id) REFERENCES test_permissions(id)
  );

CREATE TABLE tests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    port INTEGER,
    duration_minutes INTEGER DEFAULT 90,
    passing_percentage REAL DEFAULT 60.0,
    total_questions INTEGER DEFAULT 100,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  , test_type TEXT DEFAULT 'mcq', created_by TEXT, subjects_json TEXT, difficulty_json TEXT, type_quotas_json TEXT, is_custom INTEGER DEFAULT 0, coding_problem_count INTEGER DEFAULT 0, available_from TEXT, available_until TEXT, is_interview_prep INTEGER DEFAULT 0);

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('super_admin', 'admin', 'candidate')),
    is_active INTEGER DEFAULT 1,
    created_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    last_login TEXT, batch_id TEXT,
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

CREATE INDEX idx_sessions_candidate ON test_sessions(candidate_id);

CREATE INDEX idx_sessions_test ON test_sessions(test_id);

CREATE INDEX idx_sessions_status ON test_sessions(status);

CREATE INDEX idx_sessions_candidate_test ON test_sessions(candidate_id, test_id);

CREATE INDEX idx_permissions_candidate ON test_permissions(candidate_id);

CREATE INDEX idx_permissions_test ON test_permissions(test_id);

CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_users_created_by ON users(created_by);

CREATE INDEX idx_audit_actor ON audit_log(actor_id);

CREATE INDEX idx_audit_timestamp ON audit_log(timestamp);

CREATE INDEX idx_questions_subject ON questions(subject);

CREATE INDEX idx_users_batch_id ON users(batch_id);

CREATE INDEX idx_sessions_batch_id ON sessions(batch_id);

CREATE INDEX idx_sessions_test_id ON sessions(test_id);

CREATE INDEX idx_test_permissions_session_id ON test_permissions(session_id);
