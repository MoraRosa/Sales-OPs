import { describe, it, expect } from "vitest";
import { computePipelineTotals, newOpportunityId, newCustomerId } from "../opportunities.js";

describe("computePipelineTotals", () => {
  const opportunities = [
    { stage: "discovery", dealValue: "500", mrr: "100" },
    { stage: "proposal", dealValue: "1000", mrr: "200" },
    { stage: "won", dealValue: "800", mrr: "150" }, // excluded
    { stage: "lost", dealValue: "300", mrr: "50" }, // excluded
  ];

  it("sums only in-flight stages", () => {
    const totals = computePipelineTotals(opportunities);
    expect(totals.dealValueInFlight).toBe(1500);
    expect(totals.mrrInFlight).toBe(300);
    expect(totals.countInFlight).toBe(2);
  });

  it("treats a blank or non-numeric cell as zero rather than corrupting the total", () => {
    const totals = computePipelineTotals([
      { stage: "discovery", dealValue: "", mrr: "not a number" },
      { stage: "discovery", dealValue: "200", mrr: "40" },
    ]);
    expect(totals.dealValueInFlight).toBe(200);
    expect(totals.mrrInFlight).toBe(40);
  });

  it("returns zeroes for an empty pipeline instead of throwing", () => {
    expect(computePipelineTotals([])).toEqual({
      dealValueInFlight: 0,
      mrrInFlight: 0,
      countInFlight: 0,
    });
  });
});

describe("id generators", () => {
  it("produce distinct, prefixed ids", () => {
    expect(newOpportunityId(1)).toMatch(/^OPP-/);
    expect(newCustomerId(1)).toMatch(/^CUST-/);
    expect(newOpportunityId(1)).not.toBe(newOpportunityId(2));
  });
});
