from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import List
import uvicorn
import os
import uuid
from datetime import datetime

from auth import create_access_token, verify_token, hash_password, verify_password
from parser import extract_text_from_pdf, extract_text_from_docx
from scorer import score_resume
from database import init_db, save_session, get_all_sessions
from exporter import export_to_excel, export_to_pdf_report
from models import LoginRequest

app = FastAPI(title="AI Resume Screener API")

frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
extra_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

USERS = {
    "admin@hr.com": {"password": hash_password("admin123"), "role": "Admin"},
    "recruiter@hr.com": {"password": hash_password("recruit123"), "role": "Recruiter"},
}
ALLOWED_EXTENSIONS = {".pdf", ".docx"}
MAX_FILE_SIZE_MB = float(os.getenv("MAX_FILE_SIZE_MB", "8"))

@app.on_event("startup")
async def startup():
    init_db()

@app.post("/auth/login")
async def login(req: LoginRequest):
    user = USERS.get(req.email)
    if not user or not verify_password(req.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": req.email, "role": user["role"]})
    return {"access_token": token, "role": user["role"], "email": req.email}

@app.post("/screen")
async def screen_resumes(
    job_description: str = Form(...),
    resumes: List[UploadFile] = File(...),
    token_data: dict = Depends(verify_token)
):
    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty")
    if not resumes:
        raise HTTPException(status_code=400, detail="No resumes uploaded")

    results = []
    rejected_files = []

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

    if not results:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "No resumes could be screened.",
                "rejected_files": rejected_files,
            },
        )

    results.sort(key=lambda x: x["final_score"], reverse=True)

    session_id = str(uuid.uuid4())
    save_session(session_id, job_description, results, token_data["sub"])

    return {
        "session_id": session_id,
        "screened_by": token_data["sub"],
        "total_resumes": len(results),
        "rejected_files": rejected_files,
        "results": results,
        "screened_at": datetime.utcnow().isoformat()
    }

@app.get("/sessions")
async def get_sessions(token_data: dict = Depends(verify_token)):
    sessions = get_all_sessions(token_data["sub"] if token_data["role"] == "Recruiter" else None)
    return sessions

@app.get("/export/excel/{session_id}")
async def export_excel(session_id: str, token_data: dict = Depends(verify_token)):
    sessions = get_all_sessions()
    session = next((s for s in sessions if s["session_id"] == session_id), None)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    filepath = export_to_excel(session)
    return FileResponse(filepath, filename=f"screened_{session_id[:8]}.xlsx",
                        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

@app.get("/export/pdf/{session_id}")
async def export_pdf(session_id: str, token_data: dict = Depends(verify_token)):
    sessions = get_all_sessions()
    session = next((s for s in sessions if s["session_id"] == session_id), None)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    filepath = export_to_pdf_report(session)
    return FileResponse(filepath, filename=f"report_{session_id[:8]}.pdf", media_type="application/pdf")

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
