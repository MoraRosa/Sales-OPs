import type { DiscoveryPort, DiscoveryQuery, DiscoveredProspect } from "../DiscoveryPort.js";

/**
 * For the businesses no API can find -- Instagram/Facebook-only shops,
 * word of mouth, a sign on a truck. There is no automated search here
 * by design: Meta's Graph API does not support arbitrary local-business
 * discovery for third parties, so this stays a human typing into a
 * quick-add form. The adapter's job is just to normalize that input
 * into the same DiscoveredProspect shape as every API source.
 */
export class ManualEntryAdapter implements DiscoveryPort {
  readonly sourceName = "manual" as const;

  // search() is unused for manual entry -- prospects arrive via addOne(),
  // called directly from the quick-add form in the app.
  async search(_query: DiscoveryQuery): Promise<DiscoveredProspect[]> {
    return [];
  }

  addOne(input: {
    businessName: string;
    industry: string;
    city?: string;
    phone?: string;
    email?: string;
    instagram?: string;
    facebook?: string;
    notes?: string;
  }): DiscoveredProspect {
    return {
      businessName: input.businessName,
      industry: input.industry,
      city: input.city,
      phone: input.phone,
      email: input.email,
      instagram: input.instagram,
      facebook: input.facebook,
      notes: input.notes,
      source: this.sourceName,
      sourceDetail: "quick-add form",
    };
  }
}
