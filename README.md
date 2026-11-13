# Starlent AI Video Studio

Private AI video production studio for Starlent Solutions. Phase 1 (foundation) is implemented: authentication, a projects CRUD API, a dashboard UI and the database schema with Row Level Security. AI generation, rendering and export come in later phases (see `docs/ROADMAP.md`).

## Tech stack
- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS, Lucide icons
- **Backend:** Python, FastAPI, Pydantic
- **Database/Auth:** Supabase (PostgreSQL, Auth) with Row Level Security

## Folder structure
```
frontend/             Next.js app (src/app, src/components, src/lib)
backend/              FastAPI app (app/routers, app/services, app/schemas.py) and tests
supabase/migrations/  SQL migrations including RLS policies
docs/                 Roadmap and documentation
```

## Setup

### 1. Supabase
1. Create a Supabase project.
2. Run `supabase/migrations/20261113000000_create_projects.sql` in the SQL editor (or with the Supabase CLI: `supabase db push`).
3. In Authentication, create your user(s) by hand and turn off public sign-ups. There is no sign-up page.
4. Copy the project URL and the **anon** key. The service-role key is not needed and must never be used in the frontend.

### 2. Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                  # fill in SUPABASE_URL, SUPABASE_ANON_KEY
uvicorn app.main:app --reload --port 8000
python -m pytest                                      # run tests
```
The API validates each request's Supabase access token, then calls Supabase with that user's token, so RLS decides what each user can access. Interactive docs: http://localhost:8000/docs

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env.local                            # fill in the three values
npm run dev                                           # http://localhost:3000
npm run lint && npm run build
```

## API (Phase 1)
`GET /health`, `POST/GET /api/projects`, `GET/PATCH/DELETE /api/projects/{id}`. All `/api` routes require `Authorization: Bearer <supabase access token>`.

## Implementation status
- Done: project CRUD, auth gate, dashboard, projects page, coming-soon pages, migration with RLS, unit tests.
- Tested: backend unit tests (mocked Supabase), frontend lint and production build.
- **Not tested against a real Supabase project** (no credentials were available): login, live CRUD, and RLS behaviour. Test these after setup.
