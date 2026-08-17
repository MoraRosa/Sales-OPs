/**
 * ONE-OFF, REVIEWED migration of the old flattened "Leads" tab (501 rows,
 * 68 columns) into the normalized Prospects/Research/Qualification/
 * Opportunities tabs. Per data-migration/README.md's mapping.
 *
 * This script is NOT wired into any npm script and does not run
 * automatically. Per Epic 9 in PLANNER.md: read it, adjust the column
 * mapping below to match your actual old-workbook headers exactly
 * (open Peak_Sales_Intelligence_Tracker_V2_Draft.xlsx's Leads tab and
 * compare), then run it with --dry-run first.
 *
 * Usage:
 *   SHEET_ID=... GOOGLE_SERVICE_ACCOUNT_JSON='...' \
 *     npx tsx scripts/migrate-leads.ts --workbook data-migration/Peak_Sales_Intelligence_Tracker_V2_Draft.xlsx --dry-run
 *
 * Remove --dry-run only once the dry-run output looks correct.
 */
import { google } from "googleapis";
import xlsx from "xlsx";
import { TABS } from "../packages/sheets-client/src/schema.js";

interface OldLeadRow {
  [column: string]: string | number | undefined;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const workbookIdx = args.indexOf("--workbook");
  const workbookPath = workbookIdx !== -1 ? args[workbookIdx + 1] : undefined;
  const dryRun = args.includes("--dry-run");
  if (!workbookPath) {
    console.error("Usage: --workbook <path-to-old-xlsx> [--dry-run]");
    process.exit(1);
  }
  return { workbookPath, dryRun };
}

/**
 * ADJUST THIS: map each old "Leads" column name to where it lands.
 * Left side must match the OLD workbook's exact header text. Verify
 * against the real headers before running -- this is a starting
 * guess based on the mapping in data-migration/README.md, not a
 * guarantee the exact strings match your workbook.
 */
function splitOldRow(old: OldLeadRow, newId: string) {
  const prospect = {
    id: newId,
    businessName: old["Business Name"] ?? "",
    website: old["Website"] ?? "",
    phone: old["Phone"] ?? "",
    city: old["City"] ?? "",
    source: old["Lead Source"] ?? "manual",
    status: old["Status"] ?? "new",
    dateAdded: old["Date Added"] ?? "",
    contactAttempts: old["Contact Attempts"] ?? 0,
  };

  const research = {
    prospectId: newId,
    websiteQuality: old["Website Quality"] ?? "",
    techStack: old["Tech Stack"] ?? "",
    painPoints: old["Pain Points"] ?? "",
    yearsInBusiness: old["Years in Business"] ?? "",
  };

  const qualification = {
    prospectId: newId,
    fitScore: old["Fit Score"] ?? "",
    buyingLikelihood: old["Engagement Score"] ?? "",
    totalScore: old["Total Lead Score"] ?? "",
    temperature: old["Lead Temperature"] ?? "",
  };

  const opportunity =
    old["Pipeline Stage"] && old["Pipeline Stage"] !== ""
      ? {
          id: `OPP-MIG-${newId}`,
          prospectId: newId,
          name: `${prospect.businessName} opportunity`,
          stage: old["Pipeline Stage"],
          dealValue: old["Estimated Deal Value"] ?? "",
          mrr: old["Estimated MRR"] ?? "",
        }
      : null;

  return { prospect, research, qualification, opportunity };
}

async function main() {
  const { workbookPath, dryRun } = parseArgs();

  const workbook = xlsx.readFile(workbookPath);
  const sheet = workbook.Sheets["Leads"];
  if (!sheet) {
    console.error('No "Leads" tab found in the given workbook.');
    process.exit(1);
  }
  const oldRows = xlsx.utils.sheet_to_json<OldLeadRow>(sheet);
  console.log(`Read ${oldRows.length} rows from the old Leads tab.`);

  const split = oldRows.map((row, i) => splitOldRow(row, `PROS-MIG-${i + 1}`));

  console.log("--- First 3 rows after splitting (sanity check) ---");
  console.log(JSON.stringify(split.slice(0, 3), null, 2));

  if (dryRun) {
    console.log(`\nDry run only -- ${split.length} rows would be written. Re-run without --dry-run once this looks right.`);
    return;
  }

  const sheetId = process.env.SHEET_ID;
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!sheetId || !credentialsJson) {
    console.error("Set SHEET_ID and GOOGLE_SERVICE_ACCOUNT_JSON first (not needed for --dry-run).");
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(credentialsJson),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  const appendAll = async (tab: string, headerOrder: string[], rows: Record<string, unknown>[]) => {
    if (rows.length === 0) return;
    const values = rows.map((r) => headerOrder.map((h) => String(r[h] ?? "")));
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${tab}!A1`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values },
    });
    console.log(`Wrote ${rows.length} rows to ${tab}.`);
  };

  await appendAll(TABS.PROSPECTS, [
    "id", "businessName", "industry", "subIndustry", "serviceType", "website", "phone",
    "email", "city", "region", "country", "instagram", "facebook", "linkedin",
    "primaryContactName", "primaryContactRole", "isDecisionMaker", "source",
    "sourceDetail", "status", "dateAdded", "lastContact", "nextFollowUp",
    "contactAttempts", "notes",
  ], split.map((s) => s.prospect));

  await appendAll(TABS.RESEARCH, [
    "prospectId", "hasWebsite", "websiteQuality", "googleRating", "reviewCount",
    "yearsInBusiness", "socialFollowers", "techStack", "decisionMaker", "painPoints",
    "researchNotes", "researchedAt",
  ], split.map((s) => s.research));

  await appendAll(TABS.QUALIFICATION, [
    "prospectId", "fitScore", "buyingLikelihood", "totalScore", "temperature",
    "bestTimeToCall", "busySeason", "slowSeason", "followUpAfter", "seasonalNotes", "priority",
  ], split.map((s) => s.qualification));

  const opportunities = split.map((s) => s.opportunity).filter((o) => o !== null);
  await appendAll(TABS.OPPORTUNITIES, [
    "id", "prospectId", "name", "plan", "stage", "probability", "dealValue", "mrr",
    "setupFee", "expectedClose", "closedAt", "lostReason", "notes",
  ], opportunities as Record<string, unknown>[]);

  console.log("\nMigration complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
