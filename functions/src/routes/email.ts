import { onRequest } from "firebase-functions/v2/https";
import { TABS } from "@peak-empire/sheets-client";
import { ResendAdapter } from "@peak-empire/lead-sourcing";
import { getSheetsClient } from "../sheetsAuth.js";
import { config, SHEETS_SECRETS, EMAIL_SECRETS } from "../config.js";
import { applyTemplate, buildEmailTimelineNote } from "../logic/email.js";

/** GET /emailTemplates */
export const emailTemplates = onRequest({ cors: true, secrets: [...SHEETS_SECRETS] }, async (_req, res) => {
  try {
    const sheets = getSheetsClient();
    const templates = await sheets.getRows(TABS.EMAIL_TEMPLATES);
    res.json({ templates });
  } catch (err) {
    console.error("[emailTemplates]", err);
    res.status(500).json({ error: "Could not load email templates" });
  }
});

/**
 * POST /sendColdEmail
 * body: { prospectId, subject, body }
 * Sends via Resend, logs an Activity (activityType: "email") and a
 * Timeline entry -- same pattern as logCall, so a prospect's history
 * reads as one story regardless of channel. Also updates
 * lastContact/lastContactChannel on the Prospect row.
 */
export const sendColdEmail = onRequest({ cors: true, secrets: [...SHEETS_SECRETS, ...EMAIL_SECRETS] }, async (req, res) => {
  try {
    const { prospectId, subject, body } = req.body ?? {};
    if (!prospectId || !subject || !body) {
      res.status(400).json({ error: "prospectId, subject, and body are required" });
      return;
    }

    if (!config.resendApiKey() || !config.fromEmail()) {
      res.status(400).json({ error: "Email sending is not configured (RESEND_API_KEY / FROM_EMAIL missing)" });
      return;
    }

    const sheets = getSheetsClient();
    const prospects = await sheets.getRows(TABS.PROSPECTS);
    const prospect = prospects.find((p) => p.id === prospectId);
    if (!prospect) {
      res.status(404).json({ error: "Prospect not found" });
      return;
    }
    if (!prospect.email) {
      res.status(400).json({ error: "This prospect has no email on file" });
      return;
    }

    const finalSubject = applyTemplate(subject, {
      businessName: prospect.businessName,
      industry: prospect.industry,
    });
    const finalBody = applyTemplate(body, {
      businessName: prospect.businessName,
      industry: prospect.industry,
    });

    const adapter = new ResendAdapter(config.resendApiKey(), config.fromEmail());
    const result = await adapter.send({ to: prospect.email, subject: finalSubject, body: finalBody });

    if (!result.sent) {
      res.status(502).json({ error: `Email failed to send: ${result.error}` });
      return;
    }

    const date = new Date().toISOString().slice(0, 10);
    const activityId = `ACT-${Date.now().toString(36).toUpperCase()}`;

    await sheets.appendRow(TABS.ACTIVITIES, {
      id: activityId,
      prospectId,
      date,
      activityType: "email",
      outcome: "email_sent",
      summary: `Subject: ${finalSubject}`,
    });

    await sheets.appendRow(TABS.TIMELINE, {
      id: `TL-${Date.now().toString(36).toUpperCase()}`,
      prospectId,
      date,
      note: buildEmailTimelineNote(finalSubject),
    });

    await sheets.updateRow(TABS.PROSPECTS, "id", prospectId, {
      lastContact: date,
      lastContactChannel: "email",
    });

    res.json({ ok: true, messageId: result.messageId });
  } catch (err) {
    console.error("[sendColdEmail]", err);
    res.status(500).json({ error: "Could not send email" });
  }
});
