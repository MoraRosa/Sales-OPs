export interface QueueRow {
  id: string;
  businessName: string;
  city: string;
  industry: string;
  status: string;
  nextFollowUp: string;
  qualification?: Record<string, string>;
}

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

/**
 * Pure, unit-testable version of the callQueue ranking. Not persisted --
 * the route recomputes this on every request from live Prospects +
 * Qualification rows.
 */
export function buildCallQueue(
  prospects: Record<string, string>[],
  qualification: Record<string, string>[]
): QueueRow[] {
  const qualByProspect = new Map(qualification.map((q) => [q.prospectId, q]));

  return prospects
    .filter((p) => p.status !== "customer" && p.status !== "lost")
    .map((p) => ({ ...(p as unknown as QueueRow), qualification: qualByProspect.get(p.id) }))
    .sort((a, b) => {
      const aPriority = PRIORITY_RANK[a.qualification?.priority ?? "low"] ?? 2;
      const bPriority = PRIORITY_RANK[b.qualification?.priority ?? "low"] ?? 2;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return (a.nextFollowUp || "9999").localeCompare(b.nextFollowUp || "9999");
    });
}
