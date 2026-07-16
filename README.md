# AI Resume Screener

A full-stack resume screening product with:
- **FastAPI backend** for parsing, scoring, exports, and session history
- **React + Vite frontend** with a modern glassmorphism UI
- **PDF and DOCX support**
- **Vercel-ready deployment config** for both frontend and backend

## Features

- Upload multiple resumes (PDF/DOCX) and screen against a job description
- Extract and score candidate fit using:
  - Skill match
  - TF-IDF semantic similarity
  - Experience weighting
- Candidate insights:
  - Education level detection
  - Contact extraction (email/phone)
  - Matched vs missing skills
  - Bias-flag keywords
  - Recommendation label (Strong shortlist / Shortlist / Review manually / Not a fit)
- Export session results to **Excel** and **PDF**
- Session history with role-based visibility

## Screening Criteria

Final score formula:

`Final Score = (Skill Match * 50%) + (TF-IDF Similarity * 30%) + (Experience * 20%)`

Bias-free score formula:

`Bias-Free Score = (Skill Match * 60%) + (TF-IDF Similarity * 40%)`

Supported formats:
- `.pdf`
- `.docx`

## Project Structure

```txt
resume-screener/
├── backend/
│   ├── main.py
│   ├── parser.py
│   ├── scorer.py
│   ├── database.py
│   ├── exporter.py
│   ├── auth.py
│   ├── models.py
│   ├── requirements.txt
│   └── vercel.json
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vercel.json
└── README.md
```

## Local Development

### 1) Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs on `http://127.0.0.1:8000`

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

## Environment Variables

### Backend

- `SECRET_KEY`: JWT secret key (required in production)
- `FRONTEND_ORIGIN`: primary frontend origin for CORS
- `CORS_ORIGINS`: optional comma-separated extra origins
- `MAX_FILE_SIZE_MB`: max resume file size (default: 8)

### Frontend

- `VITE_API_URL`: backend API URL (example: `https://your-backend.vercel.app`)

## Vercel Deployment

You can deploy frontend and backend as **two Vercel projects** from the same repo.

### Deploy backend on Vercel
1. Import the repo in Vercel.
2. Set **Root Directory** to `backend`.
3. Vercel will use `backend/vercel.json`.
4. Add environment variables (`SECRET_KEY`, `FRONTEND_ORIGIN`, etc.).
5. Deploy and note backend URL.

### Deploy frontend on Vercel
1. Import the same repo again in Vercel as another project.
2. Set **Root Directory** to `frontend`.
3. Add env var: `VITE_API_URL=<your-backend-vercel-url>`.
4. Deploy.

## Security Notes

- JWT-based auth for API endpoints
- File type and size validation on uploads
- CORS restricted by configured origins
- Avoid committing `.env` and database/export artifacts (`.gitignore` configured)
