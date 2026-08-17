import { describe, it, expect } from "vitest";
import { buildCallQueue } from "../callQueue.js";

const prospects = [
  { id: "PROS-1", businessName: "Low Priority Co", city: "Calgary", industry: "cleaning", status: "new", nextFollowUp: "2026-09-01" },
  { id: "PROS-2", businessName: "High Priority Co", city: "Calgary", industry: "cleaning", status: "new", nextFollowUp: "2026-08-20" },
  { id: "PROS-3", businessName: "Already A Customer", city: "Calgary", industry: "cleaning", status: "customer", nextFollowUp: "" },
  { id: "PROS-4", businessName: "Lost Deal", city: "Calgary", industry: "cleaning", status: "lost", nextFollowUp: "" },
  { id: "PROS-5", businessName: "No Score Yet", city: "Calgary", industry: "cleaning", status: "new", nextFollowUp: "2026-08-10" },
];

const qualification = [
  { prospectId: "PROS-1", priority: "low" },
  { prospectId: "PROS-2", priority: "high" },
];

describe("buildCallQueue", () => {
  const queue = buildCallQueue(prospects, qualification);

  it("excludes customers and lost deals", () => {
    const ids = queue.map((r) => r.id);
    expect(ids).not.toContain("PROS-3");
    expect(ids).not.toContain("PROS-4");
  });

  it("ranks high priority above low priority regardless of follow-up date", () => {
    const highIdx = queue.findIndex((r) => r.id === "PROS-2");
    const lowIdx = queue.findIndex((r) => r.id === "PROS-1");
    expect(highIdx).toBeLessThan(lowIdx);
  });

  it("treats an unscored prospect as low priority, not as an error", () => {
    const unscored = queue.find((r) => r.id === "PROS-5");
    expect(unscored).toBeDefined();
    expect(unscored?.qualification).toBeUndefined();
  });

  it("breaks ties within the same priority by soonest follow-up date first", () => {
    // PROS-1 (low, 2026-09-01) and PROS-5 (unscored -> low, 2026-08-10)
    const idx1 = queue.findIndex((r) => r.id === "PROS-1");
    const idx5 = queue.findIndex((r) => r.id === "PROS-5");
    expect(idx5).toBeLessThan(idx1);
  });
});
