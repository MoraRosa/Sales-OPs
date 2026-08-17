import type { EnrichmentPort } from "../DiscoveryPort.js";

/**
 * Contact enrichment only -- never discovery. Called once, on demand,
 * when a prospect is promoted past Qualification and you actually want
 * the owner's name/email. Never batch-call this; Apollo's credit
 * pricing punishes bulk enrichment of prospects you may never call.
 */
export class ApolloAdapter implements EnrichmentPort {
  readonly sourceName = "apollo";

  constructor(private apiKey: string) {}

  async enrich(businessName: string, website?: string) {
    const res = await fetch("https://api.apollo.io/v1/people/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: this.apiKey,
        organization_name: businessName,
        domain: website,
      }),
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      person?: { name?: string; title?: string; email?: string; linkedin_url?: string };
    };
    if (!data.person) return null;

    return {
      primaryContactName: data.person.name,
      primaryContactRole: data.person.title,
      email: data.person.email,
      linkedin: data.person.linkedin_url,
    };
  }
}
