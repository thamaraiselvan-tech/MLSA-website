# MLSA Chapter Platform

Official website for the Microsoft Learn Student Ambassador chapter at Saranathan College of
Engineering. Public pages for daily updates and events, plus an admin dashboard to post updates,
manage events, and track registrations with automatic email confirmations.

## Stack

- **Frontend:** Plain HTML + CSS + Bootstrap 5 + vanilla JavaScript — no build step, no npm install
- **Backend:** FastAPI + SQLModel (SQLite locally, Postgres in production) → deploy to Render
- **Auth:** JWT-based admin login (single admin account, bootstrapped from env vars)
- **Email:** SMTP (Gmail App Password works out of the box) for registration confirmations

## Project structure

```
mlsa-website/
  backend/     FastAPI app
  frontend/    Static HTML/CSS/JS site
```

Every page is a self-contained `.html` file. `frontend/css/style.css` has all colors as CSS
variables at the top. `frontend/js/*.js` has one file per page's logic, plus `api.js` (every
backend call, in plain `fetch()`) and `auth.js` (admin login/session handling).

## Local development

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then edit .env with real values
uvicorn main:app --reload --port 8000
```

The first time it starts, it creates an admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in
`.env`. API docs are auto-generated at `http://localhost:8000/docs`.

### Frontend

No install step. Just check `frontend/js/config.js` has the right `API_BASE` (defaults to
`http://localhost:8000`, matching the backend above), then serve the folder with any static
file server — opening `index.html` directly via `file://` will block the API calls in most
browsers:

```bash
cd frontend
python3 -m http.server 8080
```

Visit `http://localhost:8080`. Sign in at `/admin-login.html` with the credentials from your
backend `.env`.

## Setting up email confirmations (Gmail)

1. Turn on 2-Step Verification on the Gmail account you'll send from.
2. Create an **App Password**: Google Account → Security → App passwords.
3. Put that 16-character password in `SMTP_PASSWORD` in `backend/.env` (not your normal Gmail
   password), and your Gmail address in `SMTP_USER`.

Until SMTP credentials are set, registrations still work — the confirmation email is just skipped
and logged, so testing never breaks because of missing email setup.

## Deploying

### Backend → Render

1. Push this repo to GitHub.
2. New Web Service on Render, pointing at `backend/`.
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add all variables from `.env.example` as environment variables. For a persistent database,
   attach a Render Postgres instance and set `DATABASE_URL` to its connection string (SQLite on
   Render's free tier is wiped on every deploy).
6. Set `FRONTEND_ORIGIN` to your Vercel URL once you have it.

### Frontend → any static host (Vercel, Netlify, GitHub Pages, Render Static Site)

1. Before deploying, open `frontend/js/config.js` and set `API_BASE` to your live Render backend
   URL (e.g. `https://your-backend.onrender.com`).
2. Import the repo, set the root directory to `frontend/`. No build command needed — it's static
   files, so leave build command blank and set the output/publish directory to `frontend/` itself
   (or wherever your host expects the site root).
3. Deploy.

## Admin workflow

- **Updates tab:** post daily announcements/achievements, pin important ones to the top of the feed.
- **Events tab:** create/edit events with date, location, capacity, and a registration deadline.
- **Registrations tab:** pick an event, see everyone registered, export as CSV, check whether
  confirmation emails went out.

## Notes on the official MLSA badge

The badge image at `frontend/assets/mlsa-badge.png` is the official Microsoft asset, included
unmodified. If you use it elsewhere, keep it as-is per Microsoft's brand guidelines for the
ambassador program.
