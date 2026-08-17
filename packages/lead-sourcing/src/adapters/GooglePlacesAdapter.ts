import type { DiscoveryPort, DiscoveryQuery, DiscoveredProspect } from "../DiscoveryPort.js";

/**
 * Discovery source of first resort. Free-tier friendly ($200/mo credit
 * covers thousands of lookups at this volume). Returns real, physically
 * findable local service businesses -- not decision-maker contacts.
 */
export class GooglePlacesAdapter implements DiscoveryPort {
  readonly sourceName = "google_places" as const;

  constructor(private apiKey: string) {}

  async search(query: DiscoveryQuery): Promise<DiscoveredProspect[]> {
    const textQuery = `${query.industry} in ${query.city}${query.region ? ", " + query.region : ""}`;
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": this.apiKey,
        "X-Goog-FieldMask":
          "places.displayName,places.formattedAddress,places.websiteUri,places.internationalPhoneNumber,places.rating,places.userRatingCount",
      },
      body: JSON.stringify({ textQuery, maxResultCount: query.limit ?? 20 }),
    });

    if (!res.ok) {
      throw new Error(`Google Places search failed: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as {
      places?: Array<{
        displayName?: { text?: string };
        formattedAddress?: string;
        websiteUri?: string;
        internationalPhoneNumber?: string;
      }>;
    };

    return (data.places ?? []).map((p) => ({
      businessName: p.displayName?.text ?? "Unknown",
      industry: query.industry,
      website: p.websiteUri,
      phone: p.internationalPhoneNumber,
      city: query.city,
      region: query.region,
      source: this.sourceName,
      sourceDetail: textQuery,
    }));
  }
}
