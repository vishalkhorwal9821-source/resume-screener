from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import List, Optional
import uvicorn
import os
import uuid
from datetime import datetime

from auth import create_access_token, verify_token, hash_password, verify_password
from parser import extract_text_from_pdf, extract_text_from_docx
from scorer import score_resume
from database import init_db, save_session, get_all_sessions, get_session, create_user, get_user
from exporter import export_to_excel, export_to_pdf_report
from models import LoginRequest, RegisterRequest


app = FastAPI(title="AI Resume Screener API")

frontend_origin_raw = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
frontend_origin = frontend_origin_raw.strip().rstrip("/")

extra_origins_raw = os.getenv("CORS_ORIGINS", "")
extra_origins = [o.strip().rstrip("/") for o in extra_origins_raw.split(",") if o.strip()]

allow_origins = list(
    dict.fromkeys(
        [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            frontend_origin,
            *extra_origins,
        ]
    )
)

# Regex to match:
# 1. Any localhost or 127.0.0.1 with optional port (e.g., http://localhost:3000)
# 2. Any Vercel deployment domain (e.g., https://resume-screener-fawn-beta.vercel.app)
allow_origin_regex = r"^(https://.*\.vercel\.app|http://localhost(:\d+)?|http://127\.0\.0\.1(:\d+)?)$"

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


ALLOWED_EXTENSIONS = {".pdf", ".docx"}
MAX_FILE_SIZE_MB = float(os.getenv("MAX_FILE_SIZE_MB", "8"))

startup_db_error = None

@app.on_event("startup")
async def startup():
    global startup_db_error
    try:
        init_db()
    except Exception as e:
        import traceback
        startup_db_error = f"{str(e)}\n{traceback.format_exc()}"
        print(f"Error initializing DB on startup: {startup_db_error}")


@app.post("/auth/register")
async def register(req: RegisterRequest):
    try:
        if not req.email or not req.password:
            raise HTTPException(status_code=400, detail="Email and password cannot be empty")
        
        # Email format validation
        import re
        if not re.match(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", req.email):
            raise HTTPException(status_code=400, detail="Invalid email format")
            
        if len(req.password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")
            
        if req.role not in ["Admin", "Recruiter"]:
            raise HTTPException(status_code=400, detail="Role must be either 'Admin' or 'Recruiter'")
            
        success = create_user(req.email, hash_password(req.password), req.role)
        if not success:
            raise HTTPException(status_code=400, detail="User with this email already exists")
            
        return {"status": "success", "message": "User registered successfully"}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Crashed in /auth/register: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Database registration crash: {str(e)}")

@app.post("/auth/login")
async def login(req: LoginRequest):
    try:
        user = get_user(req.email)
        if not user or not verify_password(req.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        token = create_access_token({"sub": req.email, "role": user["role"]})
        return {"access_token": token, "role": user["role"], "email": req.email}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Crashed in /auth/login: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Login query crash: {str(e)}")

@app.post("/screen")
async def screen_resumes(
    job_description: str = Form(...),
    resumes: List[UploadFile] = File(...),
    session_id: Optional[str] = Form(None),
    token_data: dict = Depends(verify_token)
):
    try:
        if not job_description.strip():
            raise HTTPException(status_code=400, detail="Job description cannot be empty")
        if not resumes:
            raise HTTPException(status_code=400, detail="No resumes uploaded")

        results = []
        rejected_files = []

        # Load existing results if appending to a session
        existing_results = []
        if session_id:
            existing_session = get_session(session_id)
            if existing_session:
                existing_results = existing_session["results"]

        for resume_file in resumes:
            content = await resume_file.read()
            filename = resume_file.filename or "unknown"
            extension = os.path.splitext(filename.lower())[1]
            size_mb = len(content) / (1024 * 1024)

            if extension not in ALLOWED_EXTENSIONS:
                rejected_files.append(
                    {
                        "filename": filename,
                        "reason": f"Unsupported format '{extension}'. Only PDF and DOCX are supported.",
                    }
                )
                continue

            if size_mb > MAX_FILE_SIZE_MB:
                rejected_files.append(
                    {
                        "filename": filename,
                        "reason": f"File too large ({size_mb:.1f} MB). Max allowed is {MAX_FILE_SIZE_MB:.1f} MB.",
                    }
                )
                continue

            if extension == ".pdf":
                text = extract_text_from_pdf(content)
            elif extension == ".docx":
                text = extract_text_from_docx(content)
            else:
                text = ""

            if not text.strip():
                rejected_files.append({"filename": filename, "reason": "Could not extract readable text from file."})
                continue

            result = score_resume(text, job_description, filename)
            results.append(result)

        combined_results = existing_results + results

        if not combined_results:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "No resumes could be screened.",
                    "rejected_files": rejected_files,
                },
            )

        combined_results.sort(key=lambda x: x["final_score"], reverse=True)

        active_session_id = session_id or str(uuid.uuid4())
        save_session(active_session_id, job_description, combined_results, token_data["sub"])

        return {
            "session_id": active_session_id,
            "screened_by": token_data["sub"],
            "total_resumes": len(combined_results),
            "rejected_files": rejected_files,
            "results": combined_results,
            "screened_at": datetime.utcnow().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Crashed in /screen: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Database or screening engine crash: {str(e)}")

@app.get("/sessions")
async def get_sessions(token_data: dict = Depends(verify_token)):
    try:
        sessions = get_all_sessions(token_data["sub"] if token_data["role"] == "Recruiter" else None)
        return sessions
    except Exception as e:
        import traceback
        print(f"Crashed in /sessions: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Database session query crash: {str(e)}")

@app.get("/export/excel/{session_id}")
async def export_excel(session_id: str, token_data: dict = Depends(verify_token)):
    try:
        sessions = get_all_sessions()
        session = next((s for s in sessions if s["session_id"] == session_id), None)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        filepath = export_to_excel(session)
        return FileResponse(filepath, filename=f"screened_{session_id[:8]}.xlsx",
                            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Crashed in /export/excel: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Excel generation crash: {str(e)}")

@app.get("/export/pdf/{session_id}")
async def export_pdf(session_id: str, token_data: dict = Depends(verify_token)):
    try:
        sessions = get_all_sessions()
        session = next((s for s in sessions if s["session_id"] == session_id), None)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        filepath = export_to_pdf_report(session)
        return FileResponse(filepath, filename=f"report_{session_id[:8]}.pdf", media_type="application/pdf")
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Crashed in /export/pdf: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"PDF generation crash: {str(e)}")

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "frontend_origin": frontend_origin,
        "allow_origins": allow_origins,
        "allow_origin_regex": allow_origin_regex,
        "startup_db_error": startup_db_error
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
