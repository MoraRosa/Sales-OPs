import type { DiscoveredProspect } from "@peak-empire/lead-sourcing";

/** Case-insensitive business-name + city key, used to skip re-adding a prospect already in the Sheet. */
export function dedupeKey(businessName: string, city?: string): string {
  return `${businessName}::${city ?? ""}`.toLowerCase();
}

export function buildExistingKeySet(existingRows: Record<string, string>[]): Set<string> {
  return new Set(existingRows.map((r) => dedupeKey(r.businessName, r.city)));
}

/** Splits freshly-discovered prospects into ones already known vs genuinely new. */
export function partitionNew(
  found: DiscoveredProspect[],
  existingKeys: Set<string>
): { fresh: DiscoveredProspect[]; duplicateCount: number } {
  const fresh = found.filter((p) => !existingKeys.has(dedupeKey(p.businessName, p.city)));
  return { fresh, duplicateCount: found.length - fresh.length };
}

export function newProspectId(now: number = Date.now()): string {
  return `PROS-${now.toString(36).toUpperCase()}`;
}
