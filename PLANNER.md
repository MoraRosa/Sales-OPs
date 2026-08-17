# Peak Empire -- Sprint planner

Tasks are sized for 1-2 hour sprints. Work top to bottom within an epic;
epics are ordered so each one produces something usable, not just
scaffolding. Check items off as you go -- this file is the map back if
you lose your place.

## Epic 0 -- Scaffold (done)

- [x] Monorepo structure (`packages/`, `functions/`, `web/`)
- [x] `shared-types` matching the real workbook schema
- [x] `sheets-client` with schema-driven read/write/update
- [x] `lead-sourcing` -- DiscoveryPort + Google Places / Yelp / manual / Apollo adapters
- [x] Functions routes: `discoverProspects`, `addManualProspect`, `logCall`, `callQueue`
- [x] Web app shell: routing, Dashboard (call queue), Discovery page (search + quick-add)
- [x] PWA config (manifest, service worker via vite-plugin-pwa)
- [x] GitHub Actions deploy workflow for `web/` -> GitHub Pages

## Epic 1 -- Get it running for real (do this first)

- [ ] Create a Google Cloud project, enable the Sheets API and Places API (New)
- [ ] Create a service account, download its JSON key
- [ ] Create a new Google Sheet, share it with the service account email (Editor)
- [ ] Copy `.env.example` to `.env`, fill in `SHEET_ID` and `GOOGLE_SERVICE_ACCOUNT_JSON`
- [ ] Get a Google Places API key, add to `.env`
- [ ] Run `pnpm install`
- [ ] Run `pnpm init-sheet` -- confirm every tab + header row appears in the real Sheet
- [ ] Sanity check: manually add one row to `Prospects` in the Sheet, confirm the shape matches `schema.ts`

## Epic 2 -- Functions running locally

Done in parallel while you worked Epic 1 (no credentials needed for these):
- [x] Pulled pure logic out of the HTTP handlers into `src/logic/` --
      `discovery.ts` (dedupe + id generation) and `callQueue.ts` (ranking)
      are now unit-tested independent of Firebase or the Sheets API
- [x] 11 unit tests for the logic layer, 5 for the Google Places /
      manual-entry adapters (mocked `fetch`, no real network calls) --
      all 16 passing
- [x] `firebase.json` emulator config (functions on :5001, UI on :4000)
- [x] `functions/local-test/requests.http` -- ready-to-run test requests
      for every route, matching the steps below

Needs your real Firebase project + `.env` (pick up here):
- [ ] `firebase init` inside `functions/` (or adapt if you'd rather not use the CLI wizard --
      `firebase.json` is already written) to connect to a real Firebase project
- [ ] Copy `functions/.firebaserc.example` to `functions/.firebaserc`, set your project id
- [ ] `pnpm functions:serve` -- confirm the emulator boots with no missing-env errors
- [ ] Open `functions/local-test/requests.http` (VS Code + REST Client extension, or copy
      into curl per the README in that folder) and run requests 1-5 in order against the
      real Sheet -- confirm new rows land correctly and the 400-validation case behaves
- [ ] Run `pnpm --filter @peak-empire/functions test` and
      `pnpm --filter @peak-empire/lead-sourcing test` once, just to see the suite green
      on your machine too

## Epic 3 -- Web app running locally

- [ ] Set `VITE_FUNCTIONS_BASE_URL` in `.env` to the local emulator URL
- [ ] `pnpm dev`, confirm Dashboard loads (empty queue is fine)
- [ ] From Discovery, run a real search (e.g. "dog walker" + your city), confirm results
      land in the Sheet and then show up on Dashboard
- [ ] Use the quick-add form, confirm a manual prospect appears the same way
- [ ] Fix whatever's broken -- this is the first true end-to-end pass

## Epic 4 -- Deploy

- [ ] Set every production secret in Secret Manager first (see "Production secrets" in
      README.md) -- `firebase functions:secrets:set SHEET_ID`, then
      `GOOGLE_SERVICE_ACCOUNT_JSON`, `GOOGLE_PLACES_API_KEY`, and any of
      `YELP_API_KEY`/`APOLLO_API_KEY`/`RESEND_API_KEY`/`FROM_EMAIL` you're using.
      Every route already declares which secrets it needs in code -- this step is
      just giving Secret Manager the real values to bind.
- [ ] `pnpm functions:deploy` -- get the real Functions URL
- [ ] Add `VITE_FUNCTIONS_BASE_URL` (the deployed URL) as a GitHub Actions repo secret
- [ ] Push to `main`, confirm the Actions workflow builds and deploys
- [ ] Enable GitHub Pages on the repo (Settings -> Pages -> Source: GitHub Actions)
- [ ] Visit the live URL, confirm Discovery + Dashboard work against the deployed Functions
- [ ] Install it as a PWA on your phone (Add to Home Screen), confirm it opens standalone

## Epic 5 -- Qualification / scoring engine

- [x] Built `packages/scoring` -- pure `computeQualification()` function scoring five
      weighted components (industry fit, digital-presence gap, business maturity,
      engagement, decision-maker access) into fitScore/buyingLikelihood/totalScore/
      temperature/priority. 6 unit tests passing, no I/O.
- [x] Added `qualifyProspect` Functions route -- reads Prospects + Research +
      Industry_Catalog, runs the engine, writes/updates the Qualification row
- [x] Wired a "Score this prospect" button into Dashboard cards that don't have a
      score yet -- calls `qualifyProspect`, refreshes the queue on success
- [ ] Seed `Industry_Catalog` and `Scoring_Rules` tabs with real data (see
      `data-migration/README.md` for the mapping from the old workbook) -- this is
      the one part that needs your judgment on real weights, not code
- [ ] Decide whether to auto-qualify right after discovery instead of the manual
      button -- easy follow-up change to `discoverProspects` once you've used the
      manual version for a bit and know if you want it automatic

## Epic 6 -- Call logging UI polish

- [x] Real log-call form (outcome dropdown, summary, follow-up date, next action) --
      launched from each prospect's detail page, not a placeholder
- [x] Per-prospect detail view (`/prospects/:id`) showing the Timeline as a "story so
      far" list, newest first
- [x] Added `prospectDetail` Functions route + `buildProspectDetail` pure join logic
      (4 unit tests) -- one call assembles Prospect + Research + Qualification +
      Activities + Timeline instead of five round trips
- [x] Dashboard cards now link to their prospect's detail page
- [x] Logging a call invalidates both the detail view and the call queue, so
      `nextFollowUp` and the Timeline update immediately without a manual refresh
- [ ] Follow-up sorting already works (Epic 0's `buildCallQueue`) -- nothing left here
      unless you want overdue follow-ups visually flagged (e.g. red if past today's
      date) rather than just sorted first

## Epic 7 -- Opportunities and Customers

- [x] "Start an opportunity" form on each prospect's detail page (name, deal value, MRR)
      -- always begins at stage "discovery"
- [x] Opportunities page: list with stage dropdown + "Mark won" / "Mark lost" per row
- [x] Marking an opportunity "won" auto-creates the Customer row and flips the
      prospect's status to "customer" -- no manual double-entry
- [x] Marking "lost" prompts for a reason and flips the prospect's status to "lost"
- [x] Customers page: list + active MRR total
- [x] Pipeline totals (deal value + MRR in flight) computed by `computePipelineTotals`
      (4 unit tests) and shown on both the Dashboard and Opportunities page
- [x] Added `createOpportunity`, `opportunities`, `updateOpportunityStage`, `customers`
      Functions routes

## Epic 8 -- Yelp + Apollo wiring

- [x] Added a Yelp checkbox to Discovery -- "Also search Yelp" alongside Google Places,
      passes `sources: ["google_places", "yelp"]` to the existing `discoverProspects` route
- [x] Added `enrichProspect` Functions route + `buildEnrichmentPatch` pure logic (3 unit
      tests) -- fetches from Apollo once, per prospect, only writes fields Apollo actually
      returned (never blanks out existing data)
- [x] "Find owner contact (Apollo)" button on the prospect detail page -- shows contact
      name/role/email once found, becomes "No contact found" rather than erroring silently
      when Apollo has nothing
- [ ] Get a real Yelp Fusion API key and a real Apollo API key, add both to `.env` --
      the only remaining step, needs your accounts

## Epic 9 -- Reference data migration

- [x] Migrated real content from the old workbook into `scripts/seedData.ts` -- Feature
      Catalog (14 features), Plan Catalog (5 tiers), Industry Catalog (11 industries with
      real peakFit scores), Lead Sources, Objections, and Scoring Rules. `init-sheet.ts`
      now writes this real data automatically (skips any tab that already has rows, so
      re-running never clobbers real edits)
- [x] Expanded `shared-types`/`schema.ts` to match the *actual* old-workbook columns for
      these tabs (they had more fields than my first-pass guess -- e.g. Plan_Catalog has
      10 real fields, not 3)
- [x] **Correction to my own earlier claim:** I'd said the `Leads` tab had "501 populated
      rows." I was wrong -- I'd only checked row *count*, never actual cell content. It's
      500 formatted template rows with zero real data in them. Verified properly this time
      (`openpyxl`, checked every cell). `data-migration/README.md` is corrected.
- [x] Wrote `scripts/migrate-leads.ts` anyway (dry-run-first, reviewable, not wired to any
      npm script) in case a future data export needs the same split-and-normalize
      treatment -- dry-run tested against the real file, correctly reports 0 rows to migrate
- [ ] **Worth knowing:** the old workbook's `Scoring_Rules` tab uses 4 equally-weighted
      components (Fit/Engagement/Buying Potential/Accessibility, 0.25 each) -- genuinely
      different from the 5-component model `packages/scoring` actually computes with
      (industry fit/digital-presence gap/business maturity/engagement/decision-maker
      access). The Sheet now has the *original* weights as reference data, but the code
      doesn't read them yet -- it uses its own hardcoded `DEFAULT_WEIGHTS`. Worth deciding
      whether to reconcile these into one model, or keep the Sheet version as documentation
      only. Flagging rather than silently picking one.

## Epic 10 -- Cold email (alongside cold calling)

- [x] Email sourcing: Apollo enrichment (Epic 8) and manual quick-add (email field
      added) both feed `Prospect.email`. No scraper built -- not needed at this volume.
- [x] Added `EmailPort` in `packages/lead-sourcing` + `ResendAdapter` (2 unit tests,
      mocked fetch) -- same swap-one-file pattern as `DiscoveryPort`
- [x] Added `sendColdEmail` Functions route -- sends via Resend, logs an `Activity`
      (`activityType: "email"`, `outcome: "email_sent"`) and a `Timeline` entry, exactly
      like `logCall`. Also sets a new `Prospect.lastContactChannel` field so the app
      knows whether the last touch was a call or an email.
- [x] Added `Email_Templates` tab to the schema + `emailTemplates` route. Template
      bodies support `{{businessName}}` / `{{industry}}` placeholders via a pure
      `applyTemplate()` function (4 unit tests)
- [x] "Send a cold email" form on the prospect detail page -- template picker (if any
      exist), falls back to a note about finding an email first if the prospect has none
- [x] Dashboard cards now show last-touch date + channel ("Last touch: 2026-08-10 (email)")
- [ ] Get a real Resend API key and verify a sending domain -- the only remaining step,
      needs your account. `RESEND_API_KEY` / `FROM_EMAIL` are in `.env.example`.

## Notes

- Every "done" box above is real, working code in this repo -- not a stub. What's marked
  incomplete is genuinely not built yet.
- If a task feels bigger than 2 hours once you're in it, that's a signal to split it --
  add sub-bullets under it rather than pushing through.
