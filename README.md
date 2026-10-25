# Track and Trace: redesign concept

A clickable prototype of a redesigned India Post Track & Trace page, made for a design exercise. **Not affiliated with India Post or the Government of India.** All data is mock. The page is marked `noindex`.

It is front-end only (Vite + React + Tailwind) with no backend.

## Run locally

```bash
npm install
npm run dev
```

## Screens

Use the scenario bar at the top to switch between them.

| # | Scenario | URL |
|---|---|---|
| 1 | In transit, on time (fictional parcel) | `/track/EZ100000017IN` |
| 2 | Running late (real scan data) | `/track/CX006233096IN` |
| 3 | Delivered (fictional parcel) | `/track/EZ200000025IN` |
| 4 | Shared link view | `/track/CX006233096IN?shared=1` |
| 5 | Complaint, pre-filled | `/complaint/CX006233096IN` |
| 6 | Entry | `/` |
| 7 | What do these codes mean? | `/codes` |

## Where things live

- `src/config.ts`: the disclaimer shown in the top banner and footer
- `src/data/parcels.ts`: mock parcels, including a frozen "now" for each one
- `src/lib/status.ts`: `deriveStatus()` and `groupJourney()`. The status sentence, progress bar and current location all come from the latest scan here.
- `src/i18n.ts`: English and Hindi strings
- `src/pages/`: the Entry, Track, Complaint and Codes screens

## Deploy

See the steps in the chat, or:

1. Create an empty GitHub repo (no README).
2. `git init && git add . && git commit -m "Track and Trace redesign prototype"`
3. `git branch -M main && git remote add origin <repo URL> && git push -u origin main`
4. On vercel.com: Add New → Project → import the repo. Vercel detects Vite (build `npm run build`, output `dist`). Deploy.
5. `vercel.json` makes direct links like `/track/CX006233096IN` work, and adds an `X-Robots-Tag: noindex` header.
