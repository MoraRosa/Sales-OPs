/** Scoring and seasonality data used to prioritize outreach. */
export interface Qualification {
  prospectId: string;
  fitScore: number; // 0-100, how well Peak solves their problems
  buyingLikelihood: number; // 0-100
  totalScore: number; // weighted combination, see Scoring_Rules catalog
  temperature: "cold" | "warm" | "hot";
  bestTimeToCall?: string;
  busySeason?: string;
  slowSeason?: string;
  followUpAfter?: string; // ISO date -- e.g. "call back after Nov 15"
  seasonalNotes?: string;
  priority: "low" | "medium" | "high";
}
