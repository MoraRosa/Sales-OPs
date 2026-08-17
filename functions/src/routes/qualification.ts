import { onRequest } from "firebase-functions/v2/https";
import { TABS } from "@peak-empire/sheets-client";
import { computeQualification } from "@peak-empire/scoring";
import { getSheetsClient } from "../sheetsAuth.js";
import { SHEETS_SECRETS } from "../config.js";

/**
 * POST /qualifyProspect
 * body: { prospectId: string }
 * Reads the prospect's Research row + its industry's peakFit from
 * Industry_Catalog, runs the scoring engine, and writes (or updates)
 * the corresponding Qualification row. Called manually from a
 * "Qualify" button on a prospect, or right after discovery -- your
 * call, see PLANNER.md Epic 5.
 */
export const qualifyProspect = onRequest({ cors: true, secrets: [...SHEETS_SECRETS] }, async (req, res) => {
  try {
    const { prospectId } = req.body ?? {};
    if (!prospectId) {
      res.status(400).json({ error: "prospectId is required" });
      return;
    }

    const sheets = getSheetsClient();
    const [prospects, research, industries, existingQualification] = await Promise.all([
      sheets.getRows(TABS.PROSPECTS),
      sheets.getRows(TABS.RESEARCH),
      sheets.getRows(TABS.INDUSTRY_CATALOG),
      sheets.getRows(TABS.QUALIFICATION),
    ]);

    const prospect = prospects.find((p) => p.id === prospectId);
    if (!prospect) {
      res.status(404).json({ error: "Prospect not found" });
      return;
    }

    const prospectResearch = research.find((r) => r.prospectId === prospectId);
    const industry = industries.find((i) => i.industry === prospect.industry);

    const result = computeQualification({
      prospect: {
        contactAttempts: Number(prospect.contactAttempts) || 0,
        isDecisionMaker: prospect.isDecisionMaker === "true",
      },
      research: prospectResearch
        ? {
            hasWebsite: prospectResearch.hasWebsite === "true",
            websiteQuality: prospectResearch.websiteQuality as never,
            yearsInBusiness: Number(prospectResearch.yearsInBusiness) || undefined,
            reviewCount: Number(prospectResearch.reviewCount) || undefined,
          }
        : undefined,
      industryPeakFit: industry ? Number(industry.peakFit) : undefined,
    });

    const alreadyExists = existingQualification.some((q) => q.prospectId === prospectId);
    if (alreadyExists) {
      await sheets.updateRow(TABS.QUALIFICATION, "prospectId", prospectId, result);
    } else {
      await sheets.appendRow(TABS.QUALIFICATION, { prospectId, ...result });
    }

    res.json({ ok: true, qualification: result });
  } catch (err) {
    console.error("[qualifyProspect]", err);
    res.status(500).json({ error: "Could not qualify prospect" });
  }
});
