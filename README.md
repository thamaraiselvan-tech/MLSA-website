# MLSA Chapter Platform

Official website for the Microsoft Learn Student Ambassador chapter at Saranathan College of
Engineering. Fully static — no backend, no database, no server to keep alive. Daily updates and
events are edited directly in two JavaScript files; event registration is handled by embedding a
Google Form right on the event page.

## Why static

An earlier version of this used a live backend (FastAPI + Postgres) for a full admin dashboard and
custom registration system. It worked, but came with real maintenance costs for a small chapter
site: free-tier hosting sleeps and takes ~30s to wake up, uploaded images got wiped on redeploys,
and it needed a database to babysit. This version trades the admin dashboard for a plain data file
you edit directly — in exchange, there's nothing to go down, nothing to pay for, and nothing to
lose on a redeploy. If you ever want the dynamic version back, it's a separate deliverable — ask
and it can be regenerated.

## Stack

Plain HTML + CSS + Bootstrap 5 + vanilla JavaScript. That's it — no build step, no npm install,
no framework, no backend.

## Project structure

```
frontend/
  index.html          Homepage - hero + daily updates feed
  events.html          Events grid
  event.html            Single event page + embedded Google Form
  about.html             About the chapter
  data/
    updates.js            <-- EDIT THIS to post a daily update
    events.js              <-- EDIT THIS to post an event
  css/style.css             All colors as CSS variables at the top
  js/                        Page logic - one file per page
  assets/                     Logos + your own photos
    mlsa-badge.png
    college-logo.png
    updates/                    Put update photos here
    events/                      Put event photos here
```

## Posting an update

Open `data/updates.js`. Copy one of the `{ ... }` blocks, paste it into the list, fill in your own
title/body/date. Save, commit, push. That's the entire workflow — no login, no dashboard.

```js
{
  title: "Certification drive results",
  body: "12 members cleared the AZ-900 exam this month...",
  category: "Achievement",   // General | Workshop | Achievement | Announcement
  date: "2026-07-20",
  pinned: false,
  image: "",                  // e.g. "assets/updates/cert-drive.jpg"
}
```

To remove one, delete its whole block. Full field docs are in the comments at the top of the file.

## Posting an event (with registration)

Open `data/events.js`, same idea. For registration:

1. Go to [Google Forms](https://forms.google.com) → **Blank form**
2. Add whatever fields you want to collect (name, email, department, year, etc.)
3. Click **Send** → click the link icon 🔗 → **Copy**
4. Paste that link into the event's `registrationUrl` field

The event page will embed the form directly — visitors register without ever leaving your site.
Leave `registrationUrl` as `""` and the page shows "Registration opening soon" instead.

**Viewing responses:** Google Forms → the **Responses** tab, or click the green Sheets icon to
export everything to a spreadsheet automatically as people register. This replaces the CSV export
the old admin dashboard had — Google's version updates live and needs no maintenance.

**Email confirmations:** Google Forms → **Settings** (⚙️) → **Responses** → turn on
"Collect email addresses" and "Send responders a copy of their response." No SMTP setup needed.

## Adding photos

Drop the image file into `assets/updates/` or `assets/events/`, then reference it by path in the
matching entry in `data/updates.js` / `data/events.js`, e.g. `image: "assets/events/workshop.jpg"`.
Keep photos reasonably sized (under ~500KB) so pages load fast — most phone cameras produce much
larger files than a website needs; resizing to ~1200px wide is plenty.

## Local preview

No server strictly required — you can open `index.html` directly by double-clicking it, since
everything now loads via plain `<script>` tags instead of `fetch()`. If you'd rather use a local
server anyway (optional):

```bash
cd frontend
python3 -m http.server 8080
```
Visit `http://localhost:8080`.

## Deploying

Since there's no backend, deployment is just "put the `frontend/` folder somewhere that serves
static files." Vercel, Netlify, and GitHub Pages all work well and are free.

**Vercel:**
1. Push this repo to GitHub
2. Vercel → **Add New** → **Project** → import the repo
3. **Root Directory:** `frontend`
4. **Framework Preset:** Other (no build command, no output directory needed)
5. Deploy

**Custom domain:** Vercel → your project → **Settings** → **Domains** → add your domain → follow
the DNS instructions Vercel shows you (usually an A record for the root domain, a CNAME for `www`)
at whichever registrar you bought the domain from.

Every time you edit `data/updates.js` or `data/events.js` and push to GitHub, Vercel redeploys
automatically within about a minute — no manual redeploy step.

## Notes on the logos

Both logos in `assets/` are used as-is / cleaned up from what you provided, unmodified in content
— only cropped, sharpened, and given a matching circular sticker treatment for visual consistency.
Keep them as-is per Microsoft's brand guidelines for the ambassador program.
