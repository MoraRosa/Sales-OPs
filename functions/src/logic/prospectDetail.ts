export interface ProspectDetail {
  prospect: Record<string, string>;
  research?: Record<string, string>;
  qualification?: Record<string, string>;
  activities: Record<string, string>[];
  timeline: Record<string, string>[];
}

/**
 * Pure assembly of everything the Timeline/detail view needs for one
 * prospect -- joins across five tabs by prospectId, sorts history
 * newest-first. Kept separate from the route so it's unit-testable
 * without a live Sheet.
 */
export function buildProspectDetail(
  prospectId: string,
  prospects: Record<string, string>[],
  research: Record<string, string>[],
  qualification: Record<string, string>[],
  activities: Record<string, string>[],
  timeline: Record<string, string>[]
): ProspectDetail | null {
  const prospect = prospects.find((p) => p.id === prospectId);
  if (!prospect) return null;

  const byDateDesc = (a: Record<string, string>, b: Record<string, string>) =>
    (b.date || "").localeCompare(a.date || "");

  return {
    prospect,
    research: research.find((r) => r.prospectId === prospectId),
    qualification: qualification.find((q) => q.prospectId === prospectId),
    activities: activities.filter((a) => a.prospectId === prospectId).sort(byDateDesc),
    timeline: timeline.filter((t) => t.prospectId === prospectId).sort(byDateDesc),
  };
}
