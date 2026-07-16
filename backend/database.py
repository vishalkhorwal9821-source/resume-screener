import sqlite3
import json
import os
from datetime import datetime

DB_PATH = "resume_screener.db"

def init_db():
    """Initialize the SQLite database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT UNIQUE NOT NULL,
            job_description TEXT NOT NULL,
            results TEXT NOT NULL,
            created_by TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

def save_session(session_id: str, job_description: str, results: list, created_by: str):
    """Save a screening session."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO sessions (session_id, job_description, results, created_by, created_at)
        VALUES (?, ?, ?, ?, ?)
    """, (session_id, job_description, json.dumps(results), created_by, datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()

def get_all_sessions(created_by: str = None):
    """Get all sessions, optionally filtered by user."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    if created_by:
        cursor.execute("SELECT * FROM sessions WHERE created_by = ? ORDER BY created_at DESC", (created_by,))
    else:
        cursor.execute("SELECT * FROM sessions ORDER BY created_at DESC")

    rows = cursor.fetchall()
    conn.close()

    sessions = []
    for row in rows:
        sessions.append({
            "session_id": row["session_id"],
            "job_description": row["job_description"],
            "results": json.loads(row["results"]),
            "created_by": row["created_by"],
            "created_at": row["created_at"]
        })
    return sessions

def get_db():
    """Dependency for FastAPI (placeholder for future use)."""
    pass
