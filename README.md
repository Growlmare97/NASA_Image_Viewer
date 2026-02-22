# NASA Image Viewer

A front-end app that fetches NASA's Astronomy Picture of the Day (APOD) for selected dates and lets you organize memories around them.

## Features

- Pick any date from **1995-06-16** to today.
- Add a short dedication note to the selected APOD.
- Save entries to **favourites** (stored in localStorage).
- Browse a **gallery** for the last 7/14/30 days.
- **Filter gallery by topic** (Moon, Mars, Sun, Galaxy, etc.).
- Save/print a cleaner APOD card to PDF with **Export Card (PDF)**.
- Subscribe/unsubscribe emails with Netlify Functions + send a test email.
- Run an automatic daily scheduled email via Netlify Scheduled Functions.

## Run locally

```bash
python -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Netlify email automation setup

This repository includes Netlify Functions:

- `/.netlify/functions/subscribe`
- `/.netlify/functions/unsubscribe`
- `/.netlify/functions/send-test-email`
- `/.netlify/functions/daily-apod-email` (scheduled daily at `13:00 UTC`)
- `/.netlify/functions/email-status` (verifies provider/env setup from the UI)

### 1) Create accounts / keys

1. NASA API key: https://api.nasa.gov/
2. Resend API key: https://resend.com/
3. Verify your sender domain/email in Resend.
4. Supabase project: https://supabase.com/

### 2) Create subscribers table in Supabase

Run this SQL in Supabase SQL editor:

```sql
create table if not exists public.subscribers (
  id bigint generated always as identity primary key,
  email text unique not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 3) Configure Netlify environment variables

In **Site settings → Environment variables**, add:

- `NASA_API_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM` (example: `NASA Bot <hello@yourdomain.com>`)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 4) Deploy to Netlify

- Connect this repo to Netlify.
- Netlify reads `netlify.toml` and deploys static files + functions.

### 5) Test in production

1. Open your deployed site.
2. Check the **Connection status** text in the subscription card (it should show connected).
3. Enter your email and click **Subscribe**.
4. Click **Send Test Email**.
5. Confirm delivery in inbox/spam.
6. Verify scheduled sends in Netlify function logs (`daily-apod-email`).


## Managed email provider (done-for-you sending)

If you want a provider to handle delivery infrastructure for you, use **Resend** (already integrated in this project).

- Resend handles deliverability infrastructure, retries, and dashboards.
- You only need to verify a sender domain and set `RESEND_API_KEY` + `EMAIL_FROM` in Netlify.
- Then Netlify scheduled function `daily-apod-email` sends automatically each day.

## API notes

For front-end APOD browsing, this app currently uses NASA's `DEMO_KEY` in `app.js`.
For production/high usage, replace it with your own API key there too.
