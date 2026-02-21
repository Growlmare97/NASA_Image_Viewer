# NASA Image Viewer

Simple front-end app that fetches NASA's Astronomy Picture of the Day (APOD) for any selected date.

## Features

- Pick any date from **1995-06-16** to today.
- Add a short dedication message (for example, a memory note).
- Fetch APOD metadata using NASA's public API.
- Supports both image and video APOD entries.
- Save the loaded result as PDF using the browser print dialog.

## Run locally

```bash
python -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Export to PDF

1. Choose a date and (optionally) write a dedication.
2. Click **Find Picture**.
3. Click **Save / Print PDF**.
4. In the browser print dialog, choose **Save as PDF**.

## API notes

This app uses NASA's `DEMO_KEY` by default:

- Endpoint: `https://api.nasa.gov/planetary/apod`
- Docs: https://api.nasa.gov/

For production/high usage, replace `DEMO_KEY` in `app.js` with your own API key.
