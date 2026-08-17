import type { Prospect } from "@peak-empire/shared-types";

/** A prospect as returned by a discovery source, before it has an internal id. */
export type DiscoveredProspect = Omit<Prospect, "id" | "dateAdded" | "contactAttempts" | "status">;

/**
 * Every discovery source -- an API or a human typing into a form --
 * implements this. Nothing downstream (Functions routes, the dashboard)
 * cares which adapter produced a prospect; they all normalize to the
 * same shape. Add a new source by adding a new adapter, never by
 * changing a caller.
 */
export interface DiscoveryPort {
  readonly sourceName: Prospect["source"];
  search(query: DiscoveryQuery): Promise<DiscoveredProspect[]>;
}

export interface DiscoveryQuery {
  industry: string;
  city: string;
  region?: string;
  limit?: number;
}

/** On-demand contact enrichment -- called per-prospect, never bulk. */
export interface EnrichmentPort {
  readonly sourceName: string;
  enrich(businessName: string, website?: string): Promise<{
    primaryContactName?: string;
    primaryContactRole?: string;
    email?: string;
    linkedin?: string;
  } | null>;
}
