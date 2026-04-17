#!/usr/bin/env python3
"""
sync_questions.py  –  Update question tables from seed_questions.sql

Run this after pulling new code to get the latest questions/problems
WITHOUT touching any student data (users, test_sessions, audit_log, etc.)

Usage:
    python3 sync_questions.py
"""

import sqlite3
import os
import sys

DB_PATH = os.path.join(os.path.dirname(__file__), 'skillforge.db')
SEED_PATH = os.path.join(os.path.dirname(__file__), 'seed_questions.sql')


def main():
    if not os.path.exists(DB_PATH):
        print(f"ERROR: Database not found at {DB_PATH}")
        print("If this is a fresh install, first create the DB by running the app once,")
        print("or run:  sqlite3 skillforge.db < schema.sql")
        sys.exit(1)

    if not os.path.exists(SEED_PATH):
        print(f"ERROR: Seed file not found at {SEED_PATH}")
        sys.exit(1)

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Count before
    cur.execute("SELECT COUNT(*) FROM questions")
    q_before = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM coding_problems")
    cp_before = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM coding_test_cases")
    ctc_before = cur.fetchone()[0]

    print(f"Before: {q_before} MCQ questions, {cp_before} coding problems, {ctc_before} test cases")

    # Apply seed
    with open(SEED_PATH, 'r') as f:
        sql = f.read()

    conn.executescript(sql)

    # Count after
    cur.execute("SELECT COUNT(*) FROM questions")
    q_after = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM coding_problems")
    cp_after = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM coding_test_cases")
    ctc_after = cur.fetchone()[0]

    conn.close()

    print(f"After:  {q_after} MCQ questions, {cp_after} coding problems, {ctc_after} test cases")
    print()
    print(f"  MCQ questions:   {q_after - q_before:+d}")
    print(f"  Coding problems: {cp_after - cp_before:+d}")
    print(f"  Test cases:      {ctc_after - ctc_before:+d}")
    print()
    print("Done. Student data (users, test_sessions, audit_log) was NOT touched.")


if __name__ == '__main__':
    main()
