/** Sending is a separate concern from discovery/enrichment -- its own port. */
export interface SendEmailInput {
  to: string;
  subject: string;
  body: string;
  fromName?: string;
}

export interface SendEmailResult {
  sent: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailPort {
  readonly providerName: string;
  send(input: SendEmailInput): Promise<SendEmailResult>;
}
