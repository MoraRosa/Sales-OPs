import { onRequest } from "firebase-functions/v2/https";
import { TABS } from "@peak-empire/sheets-client";
import { getSheetsClient } from "../sheetsAuth.js";
import { buildCallQueue } from "../logic/callQueue.js";
import { SHEETS_SECRETS } from "../config.js";

function newActivityId(): string {
  return `ACT-${Date.now().toString(36).toUpperCase()}`;
}

/**
 * POST /logCall
 * body: matches Activity minus id -- writes to Activities and appends
 * a one-line entry to Timeline so the relationship history reads like
 * a story, not a table.
 */
export const logCall = onRequest({ cors: true, secrets: [...SHEETS_SECRETS] }, async (req, res) => {
  try {
    const body = req.body ?? {};
    if (!body.prospectId || !body.outcome) {
      res.status(400).json({ error: "prospectId and outcome are required" });
      return;
    }

    const sheets = getSheetsClient();
    const activityId = newActivityId();
    const date = body.date ?? new Date().toISOString().slice(0, 10);

    await sheets.appendRow(TABS.ACTIVITIES, {
      id: activityId,
      prospectId: body.prospectId,
      date,
      activityType: body.activityType ?? "call",
      outcome: body.outcome,
      objection: body.objection ?? "",
      summary: body.summary ?? "",
      followUpRequired: Boolean(body.followUpDate),
      followUpDate: body.followUpDate ?? "",
      nextAction: body.nextAction ?? "",
    });

    await sheets.appendRow(TABS.TIMELINE, {
      id: `TL-${Date.now().toString(36).toUpperCase()}`,
      prospectId: body.prospectId,
      date,
      note: body.summary || `Call outcome: ${body.outcome}`,
    });

    await sheets.updateRow(TABS.PROSPECTS, "id", body.prospectId, {
      lastContact: date,
      lastContactChannel: "call",
      ...(body.followUpDate ? { nextFollowUp: body.followUpDate } : {}),
    });

    res.json({ ok: true, activityId });
  } catch (err) {
    console.error("[logCall]", err);
    res.status(500).json({ error: "Could not log call" });
  }
});

/**
 * GET /callQueue
 * Computed view, not a stored tab -- joins Prospects + Qualification,
 * sorts by priority then soonest follow-up. Recomputed on every
 * request rather than cached in the Sheet, since the whole point is
 * that nobody hand-maintains a queue. Ranking logic itself lives in
 * ../logic/callQueue.ts so it's unit-testable without the emulator.
 */
export const callQueue = onRequest({ cors: true, secrets: [...SHEETS_SECRETS] }, async (_req, res) => {
  try {
    const sheets = getSheetsClient();
    const [prospects, qualification] = await Promise.all([
      sheets.getRows(TABS.PROSPECTS),
      sheets.getRows(TABS.QUALIFICATION),
    ]);

    res.json({ queue: buildCallQueue(prospects, qualification) });
  } catch (err) {
    console.error("[callQueue]", err);
    res.status(500).json({ error: "Could not build call queue" });
  }
});
