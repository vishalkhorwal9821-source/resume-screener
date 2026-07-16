import re
from typing import Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

SKILLS_DB = [
    "python", "java", "javascript", "typescript", "c++", "c#", "golang", "rust",
    "kotlin", "swift", "php", "ruby", "scala", "r", "matlab", "go",
    "react", "angular", "vue", "node.js", "django", "flask", "fastapi",
    "spring boot", "express", "next.js", "html", "css", "tailwind",
    "mysql", "postgresql", "mongodb", "redis", "sqlite", "oracle", "cassandra",
    "elasticsearch", "dynamodb", "firebase",
    "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "git", "github",
    "gitlab", "ci/cd", "terraform", "linux", "bash",
    "machine learning", "deep learning", "nlp", "tensorflow", "pytorch", "keras",
    "scikit-learn", "pandas", "numpy", "matplotlib", "sql", "tableau", "power bi",
    "data analysis", "data science", "computer vision", "etl",
    "communication", "teamwork", "leadership", "problem solving", "agile", "scrum",
    "rest api", "graphql", "microservices", "system design", "oop", "data structures",
    "algorithms", "blockchain", "cybersecurity", "testing", "junit", "selenium",
]

EDUCATION_KEYWORDS = [
    ("phd", "PhD/Doctorate"),
    ("doctorate", "PhD/Doctorate"),
    ("master of technology", "Master's"),
    ("m.tech", "Master's"),
    ("master of science", "Master's"),
    ("msc", "Master's"),
    ("master of engineering", "Master's"),
    ("bachelor of technology", "Bachelor's"),
    ("b.tech", "Bachelor's"),
    ("bachelor of engineering", "Bachelor's"),
    ("be ", "Bachelor's"),
    ("bachelor of science", "Bachelor's"),
    ("bsc", "Bachelor's"),
    ("mba", "MBA"),
    ("diploma", "Diploma"),
]

def extract_skills(text: str) -> list:
    text_lower = text.lower()
    found_skills = set()
    for skill in SKILLS_DB:
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, text_lower):
            found_skills.add(skill)
    return sorted(found_skills)

def extract_experience_years(text: str) -> float:
    patterns = [
        r"(\d+(?:\.\d+)?)\+?\s*years?\s*of\s*experience",
        r"experience\s*of\s*(\d+(?:\.\d+)?)\+?\s*years?",
        r"(\d+(?:\.\d+)?)\+?\s*years?\s*experience",
        r"(\d+(?:\.\d+)?)\+?\s*yrs?\s*experience",
    ]
    candidates = []
    for pattern in patterns:
        for match in re.finditer(pattern, text.lower()):
            candidates.append(float(match.group(1)))
    if not candidates:
        return 0.0
    return min(max(candidates), 40.0)

def extract_candidate_name(filename: str) -> str:
    name = filename.replace(".pdf", "").replace(".docx", "").replace("_", " ").replace("-", " ")
    return name.title()

def compute_tfidf_similarity(resume_text: str, jd_text: str) -> float:
    try:
        vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        vectors = vectorizer.fit_transform([jd_text, resume_text])
        similarity = cosine_similarity(vectors[0], vectors[1])[0][0]
        return round(float(similarity), 4)
    except Exception:
        return 0.0

def compute_skill_match(resume_skills: list, jd_skills: list) -> dict:
    if not jd_skills:
        return {"score": 0.5, "matched": [], "missing": []}
    resume_set = set(resume_skills)
    jd_set = sorted(set(jd_skills))
    matched = [s for s in jd_set if s in resume_set]
    missing = [s for s in jd_set if s not in resume_set]
    score = len(matched) / len(jd_skills) if jd_skills else 0
    return {
        "score": round(score, 4),
        "matched": matched,
        "missing": missing
    }

def detect_bias_flags(text: str) -> list:
    bias_words = [
        "male", "female", "he ", "she ", "his ", "her ", "mr.", "mrs.", "ms.",
        "age", "born in", "married", "religion", "caste", "nationality"
    ]
    text_lower = text.lower()
    found = [w.strip() for w in bias_words if w in text_lower]
    return found

def extract_email(text: str) -> Optional[str]:
    match = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
    return match.group(0) if match else None

def extract_phone(text: str) -> Optional[str]:
    match = re.search(r"(?:(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4})", text)
    return match.group(0) if match else None

def extract_education_level(text: str) -> str:
    text_lower = f" {text.lower()} "
    for keyword, label in EDUCATION_KEYWORDS:
        if keyword in text_lower:
            return label
    return "Not identified"

def make_summary(experience_years: float, skill_match_score: float, matched_skills: list, missing_skills: list) -> str:
    strengths = ", ".join(matched_skills[:5]) if matched_skills else "general alignment"
    gaps = ", ".join(missing_skills[:3]) if missing_skills else "no major gaps"
    return (
        f"Shows {experience_years:.1f} years of inferred experience, "
        f"{skill_match_score:.1f}% skill alignment, strengths in {strengths}, "
        f"and gaps in {gaps}."
    )

def recommend_action(final_score_pct: float) -> str:
    if final_score_pct >= 80:
        return "Strong shortlist"
    if final_score_pct >= 65:
        return "Shortlist"
    if final_score_pct >= 45:
        return "Review manually"
    return "Not a fit"

def score_resume(resume_text: str, jd_text: str, filename: str) -> dict:
    resume_skills = extract_skills(resume_text)
    jd_skills = extract_skills(jd_text)
    experience_years = extract_experience_years(resume_text)
    candidate_name = extract_candidate_name(filename)
    bias_flags = detect_bias_flags(resume_text)
    contact_email = extract_email(resume_text)
    contact_phone = extract_phone(resume_text)
    education_level = extract_education_level(resume_text)

    tfidf_score = compute_tfidf_similarity(resume_text, jd_text)
    skill_data = compute_skill_match(resume_skills, jd_skills)

    exp_score = min(experience_years / 10.0, 1.0)
    final_score = (
        skill_data["score"] * 0.50 +
        tfidf_score * 0.30 +
        exp_score * 0.20
    )
    final_score_pct = round(final_score * 100, 1)

    bias_free_score = round((skill_data["score"] * 0.60 + tfidf_score * 0.40) * 100, 1)
    recommendation = recommend_action(final_score_pct)
    professional_summary = make_summary(
        experience_years=experience_years,
        skill_match_score=round(skill_data["score"] * 100, 1),
        matched_skills=skill_data["matched"],
        missing_skills=skill_data["missing"],
    )

    return {
        "candidate_name": candidate_name,
        "filename": filename,
        "contact_email": contact_email,
        "contact_phone": contact_phone,
        "education_level": education_level,
        "final_score": final_score_pct,
        "bias_free_score": bias_free_score,
        "tfidf_similarity": round(tfidf_score * 100, 1),
        "skill_match_score": round(skill_data["score"] * 100, 1),
        "experience_years": experience_years,
        "recommendation": recommendation,
        "professional_summary": professional_summary,
        "matched_skills": skill_data["matched"],
        "missing_skills": skill_data["missing"],
        "all_resume_skills": resume_skills,
        "bias_flags": bias_flags,
        "has_bias_flags": len(bias_flags) > 0,
    }
