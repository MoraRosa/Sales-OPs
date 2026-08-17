/**
 * Weights for combining the five scoring components into a single
 * priority. Lives in code (not the Sheet) for now -- promote to the
 * Scoring_Rules tab as live config once you want to tune it without
 * a redeploy.
 */
export interface ScoringWeights {
  industryFit: number;
  digitalPresenceGap: number;
  businessMaturity: number;
  engagement: number;
  decisionMakerAccess: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  industryFit: 0.3,
  digitalPresenceGap: 0.2,
  businessMaturity: 0.2,
  engagement: 0.15,
  decisionMakerAccess: 0.15,
};
