import { describe, it, expect } from "vitest";
import { computeQualification } from "../computeQualification.js";

describe("computeQualification", () => {
  it("scores a no-website business as a better fit than one with an excellent website", () => {
    const noWebsite = computeQualification({
      prospect: { contactAttempts: 0 },
      research: { hasWebsite: false },
      industryPeakFit: 70,
    });
    const greatWebsite = computeQualification({
      prospect: { contactAttempts: 0 },
      research: { hasWebsite: true, websiteQuality: "excellent" },
      industryPeakFit: 70,
    });
    expect(noWebsite.fitScore).toBeGreaterThan(greatWebsite.fitScore);
  });

  it("gives higher buying likelihood when the decision maker is confirmed reachable", () => {
    const withDM = computeQualification({
      prospect: { contactAttempts: 0, isDecisionMaker: true },
    });
    const withoutDM = computeQualification({
      prospect: { contactAttempts: 0, isDecisionMaker: false },
    });
    expect(withDM.buyingLikelihood).toBeGreaterThan(withoutDM.buyingLikelihood);
  });

  it("classifies a strong industry fit + no website as hot with high priority", () => {
    const result = computeQualification({
      prospect: { contactAttempts: 0, isDecisionMaker: true },
      research: { hasWebsite: false, yearsInBusiness: 8, reviewCount: 40 },
      industryPeakFit: 90,
    });
    expect(result.temperature).toBe("hot");
    expect(result.priority).toBe("high");
  });

  it("classifies a weak, unresearched, low-fit prospect as cold with low priority", () => {
    const result = computeQualification({
      prospect: { contactAttempts: 6 },
      industryPeakFit: 15,
    });
    expect(result.temperature).toBe("cold");
    expect(result.priority).toBe("low");
  });

  it("de-prioritizes a prospect with many unanswered contact attempts, all else equal", () => {
    const freshLead = computeQualification({ prospect: { contactAttempts: 0 }, industryPeakFit: 50 });
    const manyAttempts = computeQualification({ prospect: { contactAttempts: 6 }, industryPeakFit: 50 });
    expect(manyAttempts.buyingLikelihood).toBeLessThan(freshLead.buyingLikelihood);
  });

  it("defaults missing research and industry data to neutral scores rather than crashing", () => {
    expect(() => computeQualification({ prospect: { contactAttempts: 0 } })).not.toThrow();
  });
});
