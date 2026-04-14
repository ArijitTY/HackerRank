/**
 * Code Execution Engine
 * Extracted from round3/backend3/server.js
 * Handles Java compilation/execution, SQL execution, and keyword evaluation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Initialize sql.js for SQL problem execution
let initSqlJs;
try { initSqlJs = require('sql.js'); } catch (e) { initSqlJs = null; }
let SQL = null;
(async () => { if (initSqlJs) { SQL = await initSqlJs(); console.log('[CODE-EXEC] sql.js initialized'); } })();

// Check if Java is available at startup
let javaAvailable = false;
try {
  execSync('javac -version', { stdio: 'pipe' });
  javaAvailable = true;
  console.log('[CODE-EXEC] Java compiler (javac) found');
} catch (e) {
  console.warn('[CODE-EXEC] WARNING: javac not found on PATH. Java coding tests will not work.');
}

// Check if Python is available at startup
let pythonCmd = null;
try {
  execSync('python3 --version', { stdio: 'pipe' });
  pythonCmd = 'python3';
  console.log('[CODE-EXEC] Python 3 (python3) found');
} catch (e) {
  try {
    execSync('python --version', { stdio: 'pipe' });
    pythonCmd = 'python';
    console.log('[CODE-EXEC] Python (python) found');
  } catch (e2) {
    console.warn('[CODE-EXEC] WARNING: Python not found on PATH. Python coding tests will not work.');
  }
}

/**
 * Security: strip dangerous Java code patterns
 */
function sanitizeJavaCode(code) {
  const dangerous = [
    /Runtime\s*\.\s*getRuntime\s*\(\s*\)\s*\.\s*exec/g,
    /ProcessBuilder/g,
    /System\s*\.\s*exit/g,
    /java\.io\.File(?!InputStream|OutputStream)/g,
    /java\.net\./g,
    /java\.lang\.reflect/g,
    /SecurityManager/g,
  ];
  for (const pat of dangerous) {
    if (pat.test(code)) {
      return { safe: false, reason: `Forbidden code pattern detected: ${pat.source}` };
    }
  }
  return { safe: true, code };
}

/**
 * Execute Java code with input and time limit
 */
function executeJava(code, input, timeLimit = 5000) {
  if (!javaAvailable) {
    return { status: 'runtime_error', error: 'Java compiler (javac) is not available on this server.', output: '' };
  }

  const id = uuidv4();
  const tmpDir = path.join(os.tmpdir(), `skillforge_${id}`);
  try {
    fs.mkdirSync(tmpDir, { recursive: true });
    const filePath = path.join(tmpDir, 'Solution.java');
    fs.writeFileSync(filePath, code, 'utf8');

    // Compile
    try {
      execSync(`javac "${filePath}"`, { timeout: 10000, cwd: tmpDir, stdio: ['pipe', 'pipe', 'pipe'] });
    } catch (compileErr) {
      const stderr = compileErr.stderr ? compileErr.stderr.toString() : compileErr.message;
      return { status: 'compile_error', error: stderr.replace(new RegExp(tmpDir.replace(/\\/g, '\\\\'), 'g'), ''), output: '' };
    }

    // Run
    const start = Date.now();
    try {
      const inputFile = path.join(tmpDir, 'input.txt');
      fs.writeFileSync(inputFile, input || '', 'utf8');
      const result = execSync(`java -cp "${tmpDir}" Solution < "${inputFile}"`, {
        timeout: timeLimit,
        cwd: tmpDir,
        stdio: ['pipe', 'pipe', 'pipe'],
        maxBuffer: 1024 * 1024
      });
      const elapsed = Date.now() - start;
      return { status: 'success', output: result.toString(), timeTaken: elapsed };
    } catch (runErr) {
      const elapsed = Date.now() - start;
      if (runErr.killed || (runErr.signal && runErr.signal === 'SIGTERM')) {
        return { status: 'time_limit_exceeded', error: `Execution exceeded ${timeLimit}ms`, output: '', timeTaken: elapsed };
      }
      const stderr = runErr.stderr ? runErr.stderr.toString() : runErr.message;
      return { status: 'runtime_error', error: stderr.replace(new RegExp(tmpDir.replace(/\\/g, '\\\\'), 'g'), ''), output: '', timeTaken: elapsed };
    }
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
  }
}

/**
 * Security: strip dangerous Python code patterns
 */
function sanitizePythonCode(code) {
  const dangerous = [
    /import\s+os(?:\s|$|,)/g,
    /import\s+subprocess/g,
    /import\s+shutil/g,
    /from\s+os\s+import/g,
    /from\s+subprocess\s+import/g,
    /__import__/g,
    /exec\s*\(/g,
    /eval\s*\(/g,
    /compile\s*\(/g,
    /open\s*\([^)]*['"][wa]/g,
    /os\.system/g,
    /os\.popen/g,
    /os\.exec/g,
    /os\.remove/g,
    /os\.unlink/g,
    /os\.rmdir/g,
    /socket\./g,
    /import\s+socket/g,
  ];
  for (const pat of dangerous) {
    if (pat.test(code)) {
      return { safe: false, reason: `Forbidden code pattern detected: ${pat.source}` };
    }
  }
  return { safe: true, code };
}

/**
 * Execute Python code with input and time limit
 */
function executePython(code, input, timeLimit = 10000) {
  if (!pythonCmd) {
    return { status: 'runtime_error', error: 'Python is not available on this server.', output: '' };
  }

  const id = uuidv4();
  const tmpDir = path.join(os.tmpdir(), `skillforge_py_${id}`);
  try {
    fs.mkdirSync(tmpDir, { recursive: true });
    const filePath = path.join(tmpDir, 'solution.py');
    fs.writeFileSync(filePath, code, 'utf8');
    const inputFile = path.join(tmpDir, 'input.txt');
    fs.writeFileSync(inputFile, input || '', 'utf8');

    const start = Date.now();
    try {
      const result = execSync(`${pythonCmd} "${filePath}" < "${inputFile}"`, {
        timeout: timeLimit,
        cwd: tmpDir,
        stdio: ['pipe', 'pipe', 'pipe'],
        maxBuffer: 1024 * 1024
      });
      const elapsed = Date.now() - start;
      return { status: 'success', output: result.toString(), timeTaken: elapsed };
    } catch (runErr) {
      const elapsed = Date.now() - start;
      if (runErr.killed || (runErr.signal && runErr.signal === 'SIGTERM')) {
        return { status: 'time_limit_exceeded', error: `Execution exceeded ${timeLimit}ms`, output: '', timeTaken: elapsed };
      }
      const stderr = runErr.stderr ? runErr.stderr.toString() : runErr.message;
      return { status: 'runtime_error', error: stderr.replace(new RegExp(tmpDir.replace(/\\/g, '\\\\'), 'g'), ''), output: '', timeTaken: elapsed };
    }
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
  }
}

/**
 * Execute SQL via sql.js (pure JS SQLite)
 */
function executeSql(query, sqlSetup) {
  if (!SQL) return { status: 'runtime_error', error: 'SQLite not available yet - try again in a moment', output: '' };
  const db = new SQL.Database();
  try {
    db.run(sqlSetup);
    const cleanQuery = query.replace(/;+\s*$/, '').trim();
    const result = db.exec(cleanQuery);
    if (!result || result.length === 0) return { status: 'success', output: '', timeTaken: 0 };
    const rows = result[0].values;
    const output = rows.map(r => r.join('|')).join('\n');
    return { status: 'success', output, timeTaken: 0 };
  } catch (e) {
    return { status: 'runtime_error', error: e.message, output: '' };
  } finally {
    db.close();
  }
}

/**
 * Keyword-based evaluation for Selenium/RestAssured problems
 */
function evaluateKeywords(code, requiredKeywords, requiredCount) {
  let matched = 0;
  const found = [];
  const missing = [];
  for (const kw of requiredKeywords) {
    if (code.includes(kw)) { matched++; found.push(kw); }
    else missing.push(kw);
  }
  const passed = matched >= requiredCount;
  return { passed, matched, total: requiredKeywords.length, required: requiredCount, found, missing };
}

/**
 * Run test cases for a problem based on evaluation type
 */
function runProblem(problem, code, testCases) {
  const results = [];

  // Keyword evaluation (Selenium/RestAssured)
  if (problem.evaluationType === 'keyword') {
    const kwResult = evaluateKeywords(code, problem.requiredKeywords, problem.requiredCount);
    const passCount = kwResult.passed ? testCases.length : 0;
    for (let i = 0; i < testCases.length; i++) {
      results.push({
        caseNum: i + 1,
        passed: kwResult.passed,
        status: kwResult.passed ? 'accepted' : 'wrong_answer',
        output: kwResult.passed ? 'All required patterns found' : `Missing: ${kwResult.missing.join(', ')}`,
        expectedOutput: 'PASS',
        details: kwResult
      });
    }
    return results;
  }

  // SQL evaluation
  if (problem.evaluationType === 'sql') {
    const sqlResult = executeSql(code, problem.sqlSetup);
    if (sqlResult.status !== 'success') {
      for (let i = 0; i < testCases.length; i++) {
        results.push({ caseNum: i + 1, passed: false, status: sqlResult.status, output: sqlResult.error, expectedOutput: testCases[i].expectedOutput });
      }
      return results;
    }
    const actualOutput = sqlResult.output.trim();
    for (let i = 0; i < testCases.length; i++) {
      const expected = testCases[i].expectedOutput.trim();
      const passed = actualOutput === expected;
      results.push({ caseNum: i + 1, passed, status: passed ? 'accepted' : 'wrong_answer', output: actualOutput, expectedOutput: expected, timeTaken: sqlResult.timeTaken });
    }
    return results;
  }

  // Python output-based evaluation
  if (problem.evaluationType === 'python') {
    const check = sanitizePythonCode(code);
    if (!check.safe) {
      for (let i = 0; i < testCases.length; i++) {
        results.push({ caseNum: i + 1, passed: false, status: 'runtime_error', output: check.reason, expectedOutput: testCases[i].expectedOutput });
      }
      return results;
    }

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const execResult = executePython(code, tc.input, problem.timeLimit || 10000);
      if (execResult.status !== 'success') {
        results.push({ caseNum: i + 1, passed: false, status: execResult.status, output: execResult.error || '', expectedOutput: tc.expectedOutput, timeTaken: execResult.timeTaken || 0 });
        continue;
      }
      const actual = execResult.output.trim();
      const expected = tc.expectedOutput.trim();
      const passed = actual === expected;
      results.push({ caseNum: i + 1, passed, status: passed ? 'accepted' : 'wrong_answer', output: actual, expectedOutput: expected, timeTaken: execResult.timeTaken });
    }
    return results;
  }

  // Java output-based evaluation (default)
  const check = sanitizeJavaCode(code);
  if (!check.safe) {
    for (let i = 0; i < testCases.length; i++) {
      results.push({ caseNum: i + 1, passed: false, status: 'compile_error', output: check.reason, expectedOutput: testCases[i].expectedOutput });
    }
    return results;
  }

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const execResult = executeJava(code, tc.input, problem.timeLimit || 5000);
    if (execResult.status === 'compile_error') {
      results.push({ caseNum: i + 1, passed: false, status: 'compile_error', output: execResult.error, expectedOutput: tc.expectedOutput, timeTaken: 0 });
      // If compile error, all remaining cases also fail
      for (let j = i + 1; j < testCases.length; j++) {
        results.push({ caseNum: j + 1, passed: false, status: 'compile_error', output: execResult.error, expectedOutput: testCases[j].expectedOutput, timeTaken: 0 });
      }
      return results;
    }
    if (execResult.status !== 'success') {
      results.push({ caseNum: i + 1, passed: false, status: execResult.status, output: execResult.error || '', expectedOutput: tc.expectedOutput, timeTaken: execResult.timeTaken || 0 });
      continue;
    }
    const actual = execResult.output.trim();
    const expected = tc.expectedOutput.trim();
    const passed = actual === expected;
    results.push({ caseNum: i + 1, passed, status: passed ? 'accepted' : 'wrong_answer', output: actual, expectedOutput: expected, timeTaken: execResult.timeTaken });
  }
  return results;
}

module.exports = {
  sanitizeJavaCode,
  sanitizePythonCode,
  executeJava,
  executePython,
  executeSql,
  evaluateKeywords,
  runProblem,
  isJavaAvailable: () => javaAvailable,
  isPythonAvailable: () => !!pythonCmd
};
