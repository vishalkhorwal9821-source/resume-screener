import sqlite3
import json
import os
from datetime import datetime

# Fallback to /tmp if current directory is read-only (common in serverless environments like Vercel)
current_dir_writable = os.access(".", os.W_OK)
DB_PATH = os.getenv(
    "DB_PATH",
    "/tmp/resume_screener.db" if (os.getenv("VERCEL") or not current_dir_writable) else "resume_screener.db",
)


def init_db():
    """Initialize the SQLite database."""
    # Ensure directory exists (e.g. /tmp on Vercel)
    db_dir = os.path.dirname(DB_PATH)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create sessions table
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

    # Create users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL
        )
    """)

    # Seed default credentials dynamically
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        from auth import hash_password
        cursor.execute("INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
                       ("admin@hr.com", hash_password("admin123"), "Admin"))
        cursor.execute("INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
                       ("recruiter@hr.com", hash_password("recruit123"), "Recruiter"))
                       
    conn.commit()
    conn.close()

# Auto-initialize database when this module is imported on Vercel
try:
    init_db()
except Exception as db_err:
    print(f"Database initialization error on import: {db_err}")

def create_user(email: str, password_hash: str, role: str) -> bool:
    """Create a new user. Returns True if successful, False if email already exists."""
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)", (email, password_hash, role))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def get_user(email: str) -> Optional[dict]:
    """Retrieve user details by email."""
    init_db()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "email": row["email"],
            "password_hash": row["password_hash"],
            "role": row["role"]
        }
    return None

def get_session(session_id: str) -> Optional[dict]:
    """Retrieve a single screening session by session_id."""
    init_db()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sessions WHERE session_id = ?", (session_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "session_id": row["session_id"],
            "job_description": row["job_description"],
            "results": json.loads(row["results"]),
            "created_by": row["created_by"],
            "created_at": row["created_at"]
        }
    return None

def save_session(session_id: str, job_description: str, results: list, created_by: str):
    """Save or update a screening session."""
    init_db()  # Defensive execution check
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if session exists to run UPDATE instead of INSERT
    cursor.execute("SELECT id FROM sessions WHERE session_id = ?", (session_id,))
    row = cursor.fetchone()
    if row:
        cursor.execute("""
            UPDATE sessions 
            SET results = ?, created_at = ?
            WHERE session_id = ?
        """, (json.dumps(results), datetime.utcnow().isoformat(), session_id))
    else:
        cursor.execute("""
            INSERT INTO sessions (session_id, job_description, results, created_by, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (session_id, job_description, json.dumps(results), created_by, datetime.utcnow().isoformat()))
        
    conn.commit()
    conn.close()

def get_all_sessions(created_by: str = None):
    """Get all sessions, optionally filtered by user."""
    init_db()  # Defensive execution check
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

