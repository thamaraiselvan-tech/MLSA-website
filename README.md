# MLSA Chapter Platform

Official website for the Microsoft Learn Student Ambassador chapter at Saranathan College of
Engineering. Public pages for daily updates and events, plus an admin dashboard to post updates,
manage events, track registrations with automatic email confirmations, add photos, and manage
multiple admin logins for the core team.

## Stack

- **Frontend:** Plain HTML + CSS + Bootstrap 5 + vanilla JavaScript — no build step, no npm install
- **Backend:** FastAPI + SQLModel (SQLite locally, Postgres in production) → deploy to Render
- **Auth:** JWT-based admin login, multiple admin accounts supported
- **Email:** SMTP (Gmail App Password works out of the box) for registration confirmations
- **Images:** Uploaded via the admin dashboard, stored on the backend's disk, served at `/uploads/...`

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
`.env`. Add teammates after that from the dashboard's Team tab (see below) rather than env vars.
API docs are auto-generated at `http://localhost:8000/docs`.

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

### 1. Push to GitHub

Both Render and Vercel deploy from a GitHub repo. If you haven't already:

```bash
cd mlsa-website
git init
git add .
git commit -m "Initial commit"
```

Create an empty repo on GitHub, then follow its "push an existing repository" instructions.

### 2. Backend → Render

1. Render dashboard → **New** → **Web Service** → connect your repo.
2. **Root directory:** `backend`
3. **Build command:** `pip install -r requirements.txt`
4. **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables (Render → your service → Environment) — copy every key from
   `backend/.env.example` with real values. At minimum: `SECRET_KEY`, `ADMIN_EMAIL`,
   `ADMIN_PASSWORD`, `ADMIN_NAME`.
6. Leave `FRONTEND_ORIGIN` for now — you'll set it after step 3 gives you a frontend URL.
7. Deploy. Render gives you a URL like `https://mlsa-backend.onrender.com` — note it down.

**For a database that survives redeploys:** Render → **New** → **PostgreSQL** (free tier
available). Copy its "Internal Database URL", set it as `DATABASE_URL` on your backend service.
Without this, SQLite works but resets every time you redeploy.

**For uploaded images that survive redeploys:** Render's free tier has no persistent disk, so
`/uploads` is wiped on every redeploy too — same tradeoff as SQLite. Options, roughly in order of
effort: (a) live with it for now — fine while you're posting content often anyway, (b) add a
**Persistent Disk** to your service (Render paid instance types only) mounted at the path in
`UPLOAD_DIR`, or (c) switch to an external image host like Cloudinary's free tier if this becomes
a real problem.

### 3. Frontend → Vercel

1. Before deploying, open `frontend/js/config.js` and set `API_BASE` to your Render backend URL
   from step 2 (e.g. `https://mlsa-backend.onrender.com`). Commit and push this change.
2. Vercel dashboard → **Add New** → **Project** → import your repo.
3. **Root Directory:** `frontend`
4. **Framework Preset:** Other (it's static files — no build command, no output directory needed).
5. Deploy. Vercel gives you a URL like `https://mlsa-sce.vercel.app`.
6. Back on Render, set `FRONTEND_ORIGIN` on the backend to this Vercel URL, so the browser's CORS
   check allows the frontend to call the API. Redeploy the backend after adding it.

### 4. Custom domain (e.g. mlsa-sce.in)

If you haven't registered a domain yet, any registrar works (GoDaddy, Namecheap, BigRock, etc.) —
none of the steps below depend on which one.

**Pointing the domain at your frontend (Vercel):**
1. Vercel → your project → **Settings** → **Domains** → enter your domain → **Add**.
2. Vercel shows you exactly which DNS record to add. Typically:
   - Root domain (`mlsa-sce.in`): an **A record** pointing to `76.76.21.21`
   - `www` subdomain: a **CNAME record** pointing to `cname.vercel-dns.com`
3. Add that record in your domain registrar's DNS settings (not on Vercel — on whichever site you
   bought the domain from).
4. DNS changes can take anywhere from a few minutes to a few hours to propagate.

**Optional — custom subdomain for the API** (e.g. `api.mlsa-sce.in` instead of the `.onrender.com`
URL): Render → your service → **Settings** → **Custom Domain** → add `api.mlsa-sce.in` → Render
gives you a CNAME to add at your registrar, same idea as above.

**After adding a custom domain**, update two things:
- `frontend/js/config.js` → `API_BASE` (if you gave the backend a custom domain too)
- Backend's `FRONTEND_ORIGIN` env var on Render → add your new custom domain alongside the
  `.vercel.app` one (comma-separated), then redeploy the backend

## Admin workflow

- **Updates tab:** post daily announcements/achievements, attach an optional photo, pin important
  ones to the top of the feed.
- **Events tab:** create/edit events with date, location, capacity, an optional photo, and a
  registration deadline.
- **Registrations tab:** pick an event, see everyone registered, export as CSV, check whether
  confirmation emails went out.
- **Team tab:** add more admin accounts for core team members (they sign in with the email/password
  you set for them), or remove someone who's stepped down. You can't remove your own account while
  signed in as it, and the system always keeps at least one admin.

## Notes on the official MLSA badge

The badge image at `frontend/assets/mlsa-badge.png` is the official Microsoft asset, included
unmodified. If you use it elsewhere, keep it as-is per Microsoft's brand guidelines for the
ambassador program.
