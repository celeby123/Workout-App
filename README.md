# Zulim Workouts

A workout + weight-loss tracker for Christian & Zulim.

## Get it live on a URL (Vercel — free)

You do NOT need to install anything on your computer. Two routes:

### Route A — Drag & drop (simplest)
1. Go to https://vercel.com and sign up (free, use your email or GitHub).
2. On your computer, this folder needs its dependencies built first.
   If you'd rather skip the terminal entirely, use Route B instead.
3. If you have Node installed: open a terminal in this folder and run:
   ```
   npm install
   npm run build
   ```
   That creates a `dist` folder.
4. In Vercel, click "Add New… → Project → Deploy" and when it asks,
   drag in this whole folder. Vercel auto-detects Vite and builds it.
5. In ~30 seconds you get a URL like `zulim-workouts.vercel.app`.

### Route B — GitHub (no terminal, recommended)
1. Make a free GitHub account at https://github.com
2. Create a new repository, click "uploading an existing file,"
   and drag ALL these files/folders in. Commit.
3. Go to https://vercel.com, sign in with GitHub, click
   "Add New… → Project," pick your repo, and click Deploy.
   Vercel detects Vite automatically — just hit Deploy.
4. You get your live URL in under a minute.

## Put it on your phone
Open the URL in Safari (iPhone) or Chrome (Android) →
Share / menu → "Add to Home Screen." It installs like a real app
with the Zulim icon and runs full-screen. Notifications work while
it's open.

## Notes
- Data saves on each device separately (browser localStorage).
  Both phones won't sync automatically yet — that needs a shared
  login, which is a later add-on.
- The email reminders are a separate piece (reminders.mjs). The app
  works fully without them.

## Run locally (optional)
```
npm install
npm run dev
```
