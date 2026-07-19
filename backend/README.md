# Not currently in use

This backend (FastAPI + Postgres, admin dashboard, live registration, image uploads) was the
original dynamic version of the site. The live site now uses the static version in `../frontend/`
instead — see the root `README.md`.

This folder is kept here in case you want the dynamic version back later (multi-admin logins,
live registration with CSV export, a proper admin dashboard instead of editing JS files directly).
It was fully working and tested as of when it was set aside — nothing here is broken, it's just
not what's deployed right now.

If you do want to revive it, the backend code itself needs no changes — just redeploy it (see the
git history / prior conversation for the original deployment steps). You'd also want the old
dynamic frontend back (this version's `frontend/` folder is now static-only and won't call this
backend) — ask and it can be regenerated alongside reconnecting the two.
