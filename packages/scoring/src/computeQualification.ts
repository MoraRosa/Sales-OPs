import type { Prospect, Research, Qualification } from "@peak-empire/shared-types";
import { DEFAULT_WEIGHTS, type ScoringWeights } from "./weights.js";

export interface ScoringInput {
  prospect: Pick<Prospect, "isDecisionMaker" | "contactAttempts">;
  research?: Partial<Research>;
  /** From Industry_Catalog.peakFit for this prospect's industry, 0-100. Defaults to 50 (unknown) if not supplied. */
  industryPeakFit?: number;
}

/** How well Peak actually solves this business's problems -- industry fit + how big the gap is (no/poor website = bigger opportunity). */
function scoreDigitalPresenceGap(research?: Partial<Research>): number {
  if (research?.hasWebsite === false) return 100;
  switch (research?.websiteQuality) {
    case "poor":
      return 80;
    case "fair":
      return 60;
    case "good":
      return 30;
    case "excellent":
      return 10;
    default:
      return 50; // unknown -- not yet researched
  }
}

/** Established, stable businesses are safer bets than brand-new ones with no track record. */
function scoreBusinessMaturity(research?: Partial<Research>): number {
  const yearsScore =
    research?.yearsInBusiness !== undefined
      ? Math.min(100, (research.yearsInBusiness / 10) * 100)
      : undefined;
  const reviewScore =
    research?.reviewCount !== undefined
      ? Math.min(100, (research.reviewCount / 50) * 100)
      : undefined;

  const scores = [yearsScore, reviewScore].filter((s): s is number => s !== undefined);
  if (scores.length === 0) return 50; // unknown
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

/**
 * Repeated unanswered attempts without any positive signal is a soft
 * negative -- not a hard rule, since a callback-requested prospect
 * with several attempts is still warm. This scores from contact
 * attempts alone; combine with the temperature narrative (Activities/
 * Timeline) for the real picture, this is a starting signal only.
 */
function scoreEngagement(contactAttempts: number): number {
  if (contactAttempts === 0) return 50; // fresh, unknown
  if (contactAttempts <= 2) return 60;
  if (contactAttempts <= 4) return 40;
  return 25; // many attempts, no movement -- deprioritize without dropping to zero
}

function scoreDecisionMakerAccess(isDecisionMaker?: boolean): number {
  if (isDecisionMaker === true) return 100;
  if (isDecisionMaker === false) return 40; // known gatekeeper
  return 50; // unknown
}

/**
 * Pure scoring function -- no I/O, easy to unit test and to tune.
 * Produces every field of Qualification except the seasonality ones
 * (bestTimeToCall, busySeason, slowSeason, followUpAfter, seasonalNotes),
 * which come from what a rep actually learns on a call, not from data.
 */
export function computeQualification(
  input: ScoringInput,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): Pick<Qualification, "fitScore" | "buyingLikelihood" | "totalScore" | "temperature" | "priority"> {
  const industryFit = input.industryPeakFit ?? 50;
  const digitalPresenceGap = scoreDigitalPresenceGap(input.research);
  const businessMaturity = scoreBusinessMaturity(input.research);
  const engagement = scoreEngagement(input.prospect.contactAttempts ?? 0);
  const decisionMakerAccess = scoreDecisionMakerAccess(input.prospect.isDecisionMaker);

  const fitScore = Math.round(industryFit * 0.6 + digitalPresenceGap * 0.4);
  const buyingLikelihood = Math.round(
    businessMaturity * 0.4 + engagement * 0.3 + decisionMakerAccess * 0.3
  );

  const totalScore = Math.round(
    industryFit * weights.industryFit +
      digitalPresenceGap * weights.digitalPresenceGap +
      businessMaturity * weights.businessMaturity +
      engagement * weights.engagement +
      decisionMakerAccess * weights.decisionMakerAccess
  );

  const temperature: Qualification["temperature"] =
    totalScore >= 70 ? "hot" : totalScore >= 40 ? "warm" : "cold";
  const priority: Qualification["priority"] =
    temperature === "hot" ? "high" : temperature === "warm" ? "medium" : "low";

  return { fitScore, buyingLikelihood, totalScore, temperature, priority };
}
