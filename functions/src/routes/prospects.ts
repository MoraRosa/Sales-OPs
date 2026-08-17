import { onRequest } from "firebase-functions/v2/https";
import { TABS } from "@peak-empire/sheets-client";
import { getSheetsClient } from "../sheetsAuth.js";
import { buildProspectDetail } from "../logic/prospectDetail.js";
import { SHEETS_SECRETS } from "../config.js";

/**
 * GET /prospectDetail?prospectId=PROS-xxxx
 * Everything the Timeline/detail view needs, joined in one response
 * so the web app makes one call instead of five.
 */
export const prospectDetail = onRequest({ cors: true, secrets: [...SHEETS_SECRETS] }, async (req, res) => {
  try {
    const prospectId = req.query.prospectId as string | undefined;
    if (!prospectId) {
      res.status(400).json({ error: "prospectId query param is required" });
      return;
    }

    const sheets = getSheetsClient();
    const [prospects, research, qualification, activities, timeline] = await Promise.all([
      sheets.getRows(TABS.PROSPECTS),
      sheets.getRows(TABS.RESEARCH),
      sheets.getRows(TABS.QUALIFICATION),
      sheets.getRows(TABS.ACTIVITIES),
      sheets.getRows(TABS.TIMELINE),
    ]);

    const detail = buildProspectDetail(prospectId, prospects, research, qualification, activities, timeline);
    if (!detail) {
      res.status(404).json({ error: "Prospect not found" });
      return;
    }

    res.json(detail);
  } catch (err) {
    console.error("[prospectDetail]", err);
    res.status(500).json({ error: "Could not load prospect detail" });
  }
});
