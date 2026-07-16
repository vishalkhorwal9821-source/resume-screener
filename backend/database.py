import sqlite3
import json
import os
from datetime import datetime
from typing import Optional
from urllib.parse import urlparse

# Detect database provider
DATABASE_URL = os.getenv("DATABASE_URL")
IS_POSTGRES = DATABASE_URL is not None and (DATABASE_URL.startswith("postgres://") or DATABASE_URL.startswith("postgresql://"))

# Fallback to /tmp if current directory is read-only (common in serverless environments like Vercel)
current_dir_writable = os.access(".", os.W_OK)
DB_PATH = os.getenv(
    "DB_PATH",
    "/tmp/resume_screener.db" if (os.getenv("VERCEL") or not current_dir_writable) else "resume_screener.db",
)

def get_connection():
    if IS_POSTGRES:
        import pg8000.dbapi
        url = urlparse(DATABASE_URL)
        # Handle ssl requirement for serverless cloud databases (like Neon/Supabase)
        return pg8000.dbapi.connect(
            host=url.hostname,
            port=url.port or 5432,
            database=url.path[1:],
            user=url.username,
            password=url.password,
            ssl_context=True
        )
    else:
        return sqlite3.connect(DB_PATH)

def execute_query(cursor, query, params=()):
    if IS_POSTGRES:
        # Replace SQLite placeholder '?' with pg8000 placeholder '%s'
        query = query.replace("?", "%s")
    cursor.execute(query, params)
    return cursor

def fetch_all_as_dict(cursor):
    if not cursor.description:
        return []
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

def fetch_one_as_dict(cursor):
    if not cursor.description:
        return None
    row = cursor.fetchone()
    if not row:
        return None
    columns = [col[0] for col in cursor.description]
    return dict(zip(columns, row))

def init_db():
    """Initialize the SQLite or PostgreSQL database schemas."""
    if not IS_POSTGRES:
        db_dir = os.path.dirname(DB_PATH)
        if db_dir and db_dir != "/tmp" and not os.path.exists(db_dir):
            os.makedirs(db_dir, exist_ok=True)
        
    conn = get_connection()
    cursor = conn.cursor()
    
    if IS_POSTGRES:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id SERIAL PRIMARY KEY,
                session_id VARCHAR(255) UNIQUE NOT NULL,
                job_description TEXT NOT NULL,
                results TEXT NOT NULL,
                created_by VARCHAR(255) NOT NULL,
                created_at VARCHAR(255) NOT NULL
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role VARCHAR(50) NOT NULL
            )
        """)
    else:
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
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL
            )
        """)
        
    conn.commit()
    
    # Seed default credentials dynamically
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        from auth import hash_password
        execute_query(cursor, "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
                       ("admin@hr.com", hash_password("admin123"), "Admin"))
        execute_query(cursor, "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
                       ("recruiter@hr.com", hash_password("recruit123"), "Recruiter"))
        conn.commit()
        
    cursor.close()
    conn.close()

# Auto-initialize database when this module is imported on Vercel
try:
    init_db()
except Exception as db_err:
    print(f"Database initialization error on import: {db_err}")

def create_user(email: str, password_hash: str, role: str) -> bool:
    """Create a new user. Returns True if successful, False if email already exists."""
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    try:
        execute_query(cursor, "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)", (email, password_hash, role))
        conn.commit()
        return True
    except Exception as e:
        err_msg = str(e).lower()
        if "unique" in err_msg or "duplicate" in err_msg or "integrity" in err_msg:
            return False
        raise e
    finally:
        cursor.close()
        conn.close()

def get_user(email: str) -> Optional[dict]:
    """Retrieve user details by email."""
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    execute_query(cursor, "SELECT * FROM users WHERE email = ?", (email,))
    row = fetch_one_as_dict(cursor)
    cursor.close()
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
    conn = get_connection()
    cursor = conn.cursor()
    execute_query(cursor, "SELECT * FROM sessions WHERE session_id = ?", (session_id,))
    row = fetch_one_as_dict(cursor)
    cursor.close()
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
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    
    execute_query(cursor, "SELECT id FROM sessions WHERE session_id = ?", (session_id,))
    row = cursor.fetchone()
    if row:
        execute_query(cursor, """
            UPDATE sessions 
            SET results = ?, created_at = ?
            WHERE session_id = ?
        """, (json.dumps(results), datetime.utcnow().isoformat(), session_id))
    else:
        execute_query(cursor, """
            INSERT INTO sessions (session_id, job_description, results, created_by, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (session_id, job_description, json.dumps(results), created_by, datetime.utcnow().isoformat()))
        
    conn.commit()
    cursor.close()
    conn.close()

def get_all_sessions(created_by: str = None):
    """Get all sessions, optionally filtered by user."""
    init_db()
    conn = get_connection()
    cursor = conn.cursor()

    if created_by:
        execute_query(cursor, "SELECT * FROM sessions WHERE created_by = ? ORDER BY created_at DESC", (created_by,))
    else:
        execute_query(cursor, "SELECT * FROM sessions ORDER BY created_at DESC")

    rows = fetch_all_as_dict(cursor)
    cursor.close()
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
    """Dependency for FastAPI."""
    pass
