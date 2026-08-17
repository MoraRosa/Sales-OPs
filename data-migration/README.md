# Data migration reference

`Peak_Sales_Intelligence_Tracker_V2_Draft.xlsx` is the original manual workbook.
It is kept here as reference only -- the app never reads or writes this file.

The `Leads` tab in this workbook is a 68-column flattened table (identity +
research + scoring + opportunity fields all in one row). That shape is
retired. Its columns are split across the normalized tabs defined in
`packages/sheets-client/src/schema.ts`:

| Old `Leads` columns (examples)                          | New home            |
| --------------------------------------------------------- | ------------------- |
| Business Name, Website, Phone, City, Lead Source, Status  | `Prospects`         |
| Website Quality, Tech Stack, Pain Points, Years in Business | `Research`         |
| Fit Score, Engagement Score, Total Lead Score, Temperature | `Qualification`     |
| Pipeline Stage, Estimated Deal Value, Estimated MRR        | `Opportunities`     |

`Call_Queue` is dropped as a stored tab -- it becomes a computed view in the
app (sorted by priority + follow-up date), not data you maintain by hand.

`Feature_Catalog`, `Plan_Catalog`, `Industry_Catalog`, `Lead_Sources`,
`Objections`, `Sales_Templates`, `Scoring_Rules`, `Dropdowns` carry over as-is
-- they're reference/config data, not pipeline data. `scripts/init-sheet.ts`
seeds them into the new Google Sheet from `schema.ts` defaults.

**Correction:** the `Leads` tab has 500 formatted rows but they are empty --
no actual data, just headers and formatting from an unused template. There is
nothing to migrate. `scripts/migrate-leads.ts` exists and works (verified with
a dry run against this real file, which correctly reported 0 rows), but there
is no real data to run it against. It's kept in case a future export ever
needs the same split-and-normalize treatment.
