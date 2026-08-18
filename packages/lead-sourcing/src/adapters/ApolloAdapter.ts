import type { EnrichmentPort } from "../DiscoveryPort.js";

/**
 * Contact enrichment only -- never discovery. Called once, on demand,
 * when a prospect is promoted past Qualification and you actually want
 * the owner's name/email. Never batch-call this; Apollo's credit
 * pricing punishes bulk enrichment of prospects you may never call.
 *
 * IMPORTANT LIMITATION: Apollo's /people/match endpoint enriches a
 * specific, already-identified person (matched by name+domain or
 * email) -- it does not reliably "find the owner of this company"
 * from a business name alone. For prospects with no website (exactly
 * the ones the scoring engine rates highest -- see
 * packages/scoring/src/computeQualification.ts), there's no domain to
 * match against, so Apollo will often return nothing useful. Treat a
 * null result as expected, not a bug -- it just means this prospect
 * needs a phone call or manual lookup instead.
 */
export class ApolloAdapter implements EnrichmentPort {
  readonly sourceName = "apollo";

  constructor(private apiKey: string) {}

  async enrich(businessName: string, website?: string) {
    const domain = website ? extractDomain(website) : undefined;

    const res = await fetch("https://api.apollo.io/api/v1/people/match", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify({
        organization_name: businessName,
        domain,
        reveal_personal_emails: false,
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

function extractDomain(website: string): string {
  try {
    return new URL(website.startsWith("http") ? website : `https://${website}`).hostname.replace(
      /^www\./,
      ""
    );
  } catch {
    return website;
  }
}