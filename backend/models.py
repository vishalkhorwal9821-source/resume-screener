from pydantic import BaseModel
from typing import List, Optional

class LoginRequest(BaseModel):
    email: str
    password: str

class CandidateResult(BaseModel):
    candidate_name: str
    filename: str
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    education_level: str
    final_score: float
    bias_free_score: float
    tfidf_similarity: float
    skill_match_score: float
    experience_years: float
    recommendation: str
    professional_summary: str
    matched_skills: List[str]
    missing_skills: List[str]
    all_resume_skills: List[str]
    bias_flags: List[str]
    has_bias_flags: bool

class SessionResponse(BaseModel):
    session_id: str
    total_resumes: int
    results: List[CandidateResult]
    screened_at: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    role: str

