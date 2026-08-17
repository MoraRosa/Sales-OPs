import type { EmailPort, SendEmailInput, SendEmailResult } from "../EmailPort.js";

/**
 * Resend has a generous free tier for this volume (3,000 emails/month,
 * 100/day) and a simple API -- reasonable default sender. Swappable
 * for Postmark or anything else without touching a caller, same as
 * every other adapter in this package.
 */
export class ResendAdapter implements EmailPort {
  readonly providerName = "resend";

  constructor(private apiKey: string, private fromAddress: string) {}

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        from: input.fromName ? `${input.fromName} <${this.fromAddress}>` : this.fromAddress,
        to: input.to,
        subject: input.subject,
        text: input.body,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return { sent: false, error: `${res.status}: ${errorText}` };
    }

    const data = (await res.json()) as { id?: string };
    return { sent: true, messageId: data.id };
  }
}
