import { onRequest } from "firebase-functions/v2/https";
import { TABS } from "@peak-empire/sheets-client";
import { getSheetsClient } from "../sheetsAuth.js";
import { newOpportunityId, newCustomerId, computePipelineTotals } from "../logic/opportunities.js";
import { SHEETS_SECRETS } from "../config.js";

/**
 * POST /createOpportunity
 * body: { prospectId, name, plan?, dealValue?, mrr?, setupFee?, expectedClose? }
 * Always starts at stage "discovery" -- move it forward via updateOpportunityStage.
 */
export const createOpportunity = onRequest({ cors: true, secrets: [...SHEETS_SECRETS] }, async (req, res) => {
  try {
    const body = req.body ?? {};
    if (!body.prospectId || !body.name) {
      res.status(400).json({ error: "prospectId and name are required" });
      return;
    }

    const sheets = getSheetsClient();
    const id = newOpportunityId();
    await sheets.appendRow(TABS.OPPORTUNITIES, {
      id,
      prospectId: body.prospectId,
      name: body.name,
      plan: body.plan ?? "",
      stage: "discovery",
      dealValue: body.dealValue ?? "",
      mrr: body.mrr ?? "",
      setupFee: body.setupFee ?? "",
      expectedClose: body.expectedClose ?? "",
      notes: body.notes ?? "",
    });

    res.json({ ok: true, id });
  } catch (err) {
    console.error("[createOpportunity]", err);
    res.status(500).json({ error: "Could not create opportunity" });
  }
});

/**
 * GET /opportunities
 * Every opportunity, joined with its prospect's business name, plus
 * pipeline totals (deal value / MRR in flight) for the Dashboard.
 */
export const opportunities = onRequest({ cors: true, secrets: [...SHEETS_SECRETS] }, async (_req, res) => {
  try {
    const sheets = getSheetsClient();
    const [opps, prospects] = await Promise.all([
      sheets.getRows(TABS.OPPORTUNITIES),
      sheets.getRows(TABS.PROSPECTS),
    ]);

    const prospectsById = new Map(prospects.map((p) => [p.id, p]));
    const enriched = opps.map((o) => ({
      ...o,
      businessName: prospectsById.get(o.prospectId)?.businessName ?? "Unknown",
    }));

    res.json({ opportunities: enriched, totals: computePipelineTotals(opps) });
  } catch (err) {
    console.error("[opportunities]", err);
    res.status(500).json({ error: "Could not load opportunities" });
  }
});

/**
 * POST /updateOpportunityStage
 * body: { opportunityId, stage, lostReason? }
 * Moving to "won" creates a Customer row and flips the prospect's
 * status. Moving to "lost" flips the prospect's status and records why.
 */
export const updateOpportunityStage = onRequest({ cors: true, secrets: [...SHEETS_SECRETS] }, async (req, res) => {
  try {
    const { opportunityId, stage, lostReason } = req.body ?? {};
    if (!opportunityId || !stage) {
      res.status(400).json({ error: "opportunityId and stage are required" });
      return;
    }

    const sheets = getSheetsClient();
    const opps = await sheets.getRows(TABS.OPPORTUNITIES);
    const opportunity = opps.find((o) => o.id === opportunityId);
    if (!opportunity) {
      res.status(404).json({ error: "Opportunity not found" });
      return;
    }

    const patch: Record<string, unknown> = { stage };
    if (stage === "won" || stage === "lost") {
      patch.closedAt = new Date().toISOString().slice(0, 10);
    }
    if (stage === "lost" && lostReason) {
      patch.lostReason = lostReason;
    }
    await sheets.updateRow(TABS.OPPORTUNITIES, "id", opportunityId, patch);

    if (stage === "won") {
      await sheets.appendRow(TABS.CUSTOMERS, {
        id: newCustomerId(),
        prospectId: opportunity.prospectId,
        plan: opportunity.plan,
        mrr: opportunity.mrr,
        setupFee: opportunity.setupFee,
        startDate: new Date().toISOString().slice(0, 10),
        status: "active",
      });
      await sheets.updateRow(TABS.PROSPECTS, "id", opportunity.prospectId, { status: "customer" });
    } else if (stage === "lost") {
      await sheets.updateRow(TABS.PROSPECTS, "id", opportunity.prospectId, { status: "lost" });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("[updateOpportunityStage]", err);
    res.status(500).json({ error: "Could not update opportunity" });
  }
});

/** GET /customers */
export const customers = onRequest({ cors: true, secrets: [...SHEETS_SECRETS] }, async (_req, res) => {
  try {
    const sheets = getSheetsClient();
    const [rows, prospects] = await Promise.all([
      sheets.getRows(TABS.CUSTOMERS),
      sheets.getRows(TABS.PROSPECTS),
    ]);
    const prospectsById = new Map(prospects.map((p) => [p.id, p]));
    const enriched = rows.map((c) => ({
      ...c,
      businessName: prospectsById.get(c.prospectId)?.businessName ?? "Unknown",
    }));
    res.json({ customers: enriched });
  } catch (err) {
    console.error("[customers]", err);
    res.status(500).json({ error: "Could not load customers" });
  }
});
