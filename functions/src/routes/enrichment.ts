import { onRequest } from "firebase-functions/v2/https";
import { TABS } from "@peak-empire/sheets-client";
import { ApolloAdapter } from "@peak-empire/lead-sourcing";
import { getSheetsClient } from "../sheetsAuth.js";
import { config, SHEETS_SECRETS, APOLLO_SECRETS } from "../config.js";
import { buildEnrichmentPatch } from "../logic/enrichment.js";

/**
 * POST /enrichProspect
 * body: { prospectId: string }
 * Called on demand, once, per prospect -- never in bulk. See
 * ApolloAdapter's own doc comment for why: Apollo's credit pricing
 * punishes enriching prospects you may never call.
 */
export const enrichProspect = onRequest({ cors: true, secrets: [...SHEETS_SECRETS, ...APOLLO_SECRETS] }, async (req, res) => {
  try {
    const { prospectId } = req.body ?? {};
    if (!prospectId) {
      res.status(400).json({ error: "prospectId is required" });
      return;
    }

    if (!config.apolloApiKey()) {
      res.status(400).json({ error: "Apollo is not configured (APOLLO_API_KEY missing)" });
      return;
    }

    const sheets = getSheetsClient();
    const prospects = await sheets.getRows(TABS.PROSPECTS);
    const prospect = prospects.find((p) => p.id === prospectId);
    if (!prospect) {
      res.status(404).json({ error: "Prospect not found" });
      return;
    }

    const adapter = new ApolloAdapter(config.apolloApiKey());
    const result = await adapter.enrich(prospect.businessName, prospect.website || undefined);

    if (!result) {
      res.json({ ok: true, found: false });
      return;
    }

    const patch = buildEnrichmentPatch(result);
    if (Object.keys(patch).length > 0) {
      await sheets.updateRow(TABS.PROSPECTS, "id", prospectId, patch);
    }

    res.json({ ok: true, found: true, patch });
  } catch (err) {
    console.error("[enrichProspect]", err);
    res.status(500).json({ error: "Could not enrich prospect" });
  }
});
