# NASA Image Viewer

A front-end app that fetches NASA's Astronomy Picture of the Day (APOD) for selected dates and lets you organize memories around them.

## Features

- Pick any date from **1995-06-16** to today.
- Add a short dedication note to the selected APOD.
- Save entries to **favourites** (stored in localStorage).
- Browse a **gallery** for the last 7/14/30 days.
- **Filter gallery by topic** (Moon, Mars, Sun, Galaxy, etc.).
- Save/print a cleaner APOD card to PDF with **Export Card (PDF)**.
- Subscribe/unsubscribe an email preference for daily APOD delivery setup.

## Run locally

```bash
python -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Daily email subscription note

This static app stores subscription preferences locally in your browser.
To actually send automated daily emails, connect the subscription flow to an email provider/backend (for example EmailJS, Resend, or SendGrid).

## API notes

This app uses NASA's `DEMO_KEY` by default:

- Endpoint: `https://api.nasa.gov/planetary/apod`
- Docs: https://api.nasa.gov/

For production/high usage, replace `DEMO_KEY` in `app.js` with your own API key.
