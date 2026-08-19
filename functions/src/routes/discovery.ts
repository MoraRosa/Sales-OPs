import { onRequest } from "firebase-functions/v2/https";
import { TABS } from "@peak-empire/sheets-client";
import { GooglePlacesAdapter, YelpAdapter, ManualEntryAdapter } from "@peak-empire/lead-sourcing";
import { getSheetsClient } from "../sheetsAuth.js";
import { config, SHEETS_SECRETS, PLACES_SECRETS } from "../config.js";
import { buildExistingKeySet, partitionNew, newProspectId } from "../logic/discovery.js";

/**
 * POST /discoverProspects
 * body: { industry: string, city: string, region?: string, sources?: ("google_places"|"yelp")[] }
 * Runs the requested discovery adapters, dedupes against existing
 * Prospects rows by businessName + city, and appends new rows.
 */
export const discoverProspects = onRequest(
  { cors: true, secrets: [...SHEETS_SECRETS, ...PLACES_SECRETS] },
  async (req, res) => {
  try {
    const { industry, city, region, sources = ["google_places"] } = req.body ?? {};
    if (!industry || !city) {
      res.status(400).json({ error: "industry and city are required" });
      return;
    }

    const sheets = getSheetsClient();
    const existing = await sheets.getRows(TABS.PROSPECTS);
    const existingKeys = buildExistingKeySet(existing);

    const adapters = [];
    if (sources.includes("google_places")) {
      adapters.push(new GooglePlacesAdapter(config.googlePlacesApiKey()));
    }
    if (sources.includes("yelp") && config.yelpApiKey()) {
      adapters.push(new YelpAdapter(config.yelpApiKey()));
    }

    const found = (
      await Promise.all(adapters.map((a) => a.search({ industry, city, region })))
    ).flat();

    const { fresh, duplicateCount } = partitionNew(found, existingKeys);

    for (const prospect of fresh) {
      await sheets.appendRow(TABS.PROSPECTS, {
        ...prospect,
        id: newProspectId(),
        status: "new",
        dateAdded: new Date().toISOString().slice(0, 10),
        contactAttempts: 0,
      });
    }

    res.json({ found: found.length, added: fresh.length, skippedDuplicates: duplicateCount });
  } catch (err) {
    console.error("[discoverProspects]", err);
    res.status(500).json({ error: "Discovery failed" });
  }
});

/**
 * POST /addManualProspect
 * body: matches ManualEntryAdapter#addOne input
 * For businesses no API can find -- Instagram/Facebook-only shops, referrals.
 */
export const addManualProspect = onRequest({ cors: true, secrets: [...SHEETS_SECRETS] }, async (req, res) => {
  try {
    const adapter = new ManualEntryAdapter();
    const prospect = adapter.addOne(req.body ?? {});

    if (!prospect.businessName || !prospect.industry) {
      res.status(400).json({ error: "businessName and industry are required" });
      return;
    }

    const sheets = getSheetsClient();
    await sheets.appendRow(TABS.PROSPECTS, {
      ...prospect,
      id: newProspectId(),
      status: "new",
      dateAdded: new Date().toISOString().slice(0, 10),
      contactAttempts: 0,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("[addManualProspect]", err);
    res.status(500).json({ error: "Could not add prospect" });
  }
});