# Valencia Schedule

A clean, mobile-first PWA to view my UPV class schedule during study abroad in Valencia, Spain.

## Features

- **Today view** — live clock, next-class countdown, in-progress indicator with progress bar
- **Week view** — week navigator with colored day dots, day selector, week summary
- **Courses view** — all 6 subjects with theory/practice breakdown and upcoming session info
- **PWA** — install on your phone's home screen for app-like experience
- **Auto-refreshes** every 30 seconds

## Courses

| Code | Subject |
|------|---------|
| 13032 | Estadística |
| 11407 | Sistemas Automáticos |
| 11406 | Empresa y Economía Industrial |
| 11411 | Ciencia de Materiales |
| 13755 | Life Cycle Assessment |
| 13884 | Product Design |

## Running locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser (or on your phone if on the same Wi-Fi).

## Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages → Source → GitHub Actions**
3. The workflow in `.github/workflows/deploy.yml` handles the rest on every push to `main`

Your app will be live at: `https://<your-username>.github.io/<repo-name>/`

## Install on iPhone

1. Open the deployed URL in Safari
2. Tap the **Share** button → **Add to Home Screen**
3. Done — it behaves like a native app!

## Install on Android

1. Open the deployed URL in Chrome
2. Tap the **⋮ menu → Add to Home screen**
