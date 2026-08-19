/**
 * One-time setup script: creates every tab defined in schema.ts inside
 * a blank Google Sheet, with header rows, then seeds the reference
 * catalogs (Feature/Plan/Industry/Objections/Scoring_Rules) from the
 * old workbook's values.
 *
 * Usage:
 *   SHEET_ID=<your-sheet-id> GOOGLE_SERVICE_ACCOUNT_JSON='<json>' \
 *     pnpm tsx scripts/init-sheet.ts
 *
 * Safe to re-run -- skips tabs that already exist rather than
 * overwriting them.
 */
import "dotenv/config";
import { google } from "googleapis";
import { TABS, HEADERS } from "../packages/sheets-client/src/schema.js";
import { SEED_DATA } from "./seedData.js";

async function main() {
  const sheetId = process.env.SHEET_ID;
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!sheetId || !credentialsJson) {
    console.error("Set SHEET_ID and GOOGLE_SERVICE_ACCOUNT_JSON first.");
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(credentialsJson),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  const existing = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const existingTitles = new Set(
    (existing.data.sheets ?? []).map((s) => s.properties?.title)
  );

  const tabsToCreate = Object.values(TABS).filter((t) => !existingTitles.has(t));

  if (tabsToCreate.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: tabsToCreate.map((title) => ({ addSheet: { properties: { title } } })),
      },
    });
    console.log(`Created tabs: ${tabsToCreate.join(", ")}`);
  }

  for (const tab of Object.values(TABS)) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${tab}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [HEADERS[tab]] },
    });
  }
  console.log("Headers written to every tab.");

  for (const [tab, rows] of Object.entries(SEED_DATA)) {
    const existingValues = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${tab}!A2:A2`,
    });
    const alreadyHasData = (existingValues.data.values ?? []).length > 0;
    if (alreadyHasData) {
      console.log(`Skipping seed for ${tab} -- already has data.`);
      continue;
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${tab}!A2`,
      valueInputOption: "RAW",
      requestBody: { values: rows },
    });
    console.log(`Seeded ${rows.length} rows into ${tab}.`);
  }

  const removeDefaultSheet = (existing.data.sheets ?? []).find(
    (s) => s.properties?.title === "Sheet1"
  );
  if (removeDefaultSheet?.properties?.sheetId !== undefined && tabsToCreate.length > 0) {
    console.log('Note: delete the default "Sheet1" tab manually if it is now empty and unused.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
