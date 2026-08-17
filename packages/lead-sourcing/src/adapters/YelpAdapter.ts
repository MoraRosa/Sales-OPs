import type { DiscoveryPort, DiscoveryQuery, DiscoveredProspect } from "../DiscoveryPort.js";

/**
 * Free secondary discovery + qualification signal. Good for catching
 * businesses Google Places misses and for review-count/rating data the
 * scoring engine can use.
 */
export class YelpAdapter implements DiscoveryPort {
  readonly sourceName = "yelp" as const;

  constructor(private apiKey: string) {}

  async search(query: DiscoveryQuery): Promise<DiscoveredProspect[]> {
    const params = new URLSearchParams({
      term: query.industry,
      location: query.city,
      limit: String(query.limit ?? 20),
    });
    const res = await fetch(`https://api.yelp.com/v3/businesses/search?${params}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });

    if (!res.ok) {
      throw new Error(`Yelp search failed: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as {
      businesses?: Array<{
        name: string;
        phone?: string;
        url?: string;
        rating?: number;
        review_count?: number;
      }>;
    };

    return (data.businesses ?? []).map((b) => ({
      businessName: b.name,
      industry: query.industry,
      phone: b.phone,
      website: b.url,
      city: query.city,
      region: query.region,
      source: this.sourceName,
      sourceDetail: `yelp:${query.industry}:${query.city}`,
    }));
  }
}
