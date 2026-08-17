# Peak Empire
### Sales Intelligence Empire Builder

An app for finding, qualifying, and closing local service-business
prospects (personal trainers, dog walkers, house cleaners, nail techs,
painters, and beyond) for Peak. No spreadsheet data entry -- the app is
the only interface. A Google Sheet holds the data underneath, invisibly.

## Architecture

```
Discovery APIs (Google Places, Yelp) + manual entry
        |
Firebase Cloud Functions  <-- only thing holding secrets, only thing
        |                     that talks to Google Sheets
   Google Sheet
   (the database, never opened by hand)
        ^
        |
React PWA (web/) on GitHub Pages  <-- the only interface, for you + team
```

- `packages/shared-types` -- every entity (Prospect, Research, Qualification,
  Activity, Opportunity, Customer) defined once, imported everywhere.
- `packages/sheets-client` -- the only file that talks to the Sheets API.
  `schema.ts` is the single source of truth for tab/column shape.
- `packages/lead-sourcing` -- `DiscoveryPort` interface with four adapters
  (Google Places, Yelp, manual entry, Apollo enrichment). Swap or add a
  source by adding an adapter, never by changing a caller.
- `functions/` -- Firebase Cloud Functions. Holds every API key. The only
  thing with write access to the Sheet.
- `web/` -- React + TypeScript + Vite + Tailwind + TanStack Query, built
  as a PWA, deployed to GitHub Pages via `.github/workflows/deploy.yml`.

See `PLANNER.md` for the sprint-by-sprint build order.

## Production secrets

Locally, secrets come from `.env`. In production they come from two different
places, because they have different sensitivity:

- **`VITE_FUNCTIONS_BASE_URL`** (just a URL, not sensitive) -- set as a GitHub
  Actions repo secret (Settings > Secrets and variables > Actions). Baked
  into the web build at build time.
- **Everything else** (service account JSON, API keys) -- these must never
  reach the browser, so they live in Google Cloud Secret Manager, set once
  per secret before your first deploy:
  ```bash
  cd functions
  firebase functions:secrets:set SHEET_ID
  firebase functions:secrets:set GOOGLE_SERVICE_ACCOUNT_JSON
  firebase functions:secrets:set GOOGLE_PLACES_API_KEY
  firebase functions:secrets:set YELP_API_KEY        # optional
  firebase functions:secrets:set APOLLO_API_KEY      # optional
  firebase functions:secrets:set RESEND_API_KEY      # optional
  firebase functions:secrets:set FROM_EMAIL          # optional
  ```
  Each command prompts you to paste the value, then stores it encrypted.
  Every route in `functions/src/routes/` declares exactly which secrets it
  needs via the `secrets: [...]` option on `onRequest` (see `config.ts` for
  the shared constants) -- this is what makes `process.env.X` actually
  populated at runtime in the deployed function, not just locally.

## Local setup

1. `pnpm install`
2. Create a Google Sheet, share it with a Google Cloud service account
   (edit access), copy `.env.example` to `.env` and fill it in.
3. `pnpm init-sheet` -- creates every tab with the correct headers.
4. `pnpm functions:serve` -- runs Functions locally against the Firebase emulator.
5. `pnpm dev` -- runs the web app locally.

## Deploying

- **Functions**: `pnpm functions:deploy` (needs a real `.firebaserc` --
  copy `functions/.firebaserc.example` and fill in your Firebase project id).
- **Web**: push to `main`. GitHub Actions builds and deploys `web/` to
  GitHub Pages automatically. Set the `VITE_FUNCTIONS_BASE_URL` repo
  secret to your deployed Functions URL first.
