import { describe, it, expect } from "vitest";
import { buildProspectDetail } from "../prospectDetail.js";

const prospects = [{ id: "PROS-1", businessName: "Bright Nails" }];
const research = [{ prospectId: "PROS-1", hasWebsite: "false" }];
const qualification = [{ prospectId: "PROS-1", priority: "high" }];
const activities = [
  { prospectId: "PROS-1", date: "2026-08-01", outcome: "no_answer" },
  { prospectId: "PROS-1", date: "2026-08-05", outcome: "callback_requested" },
];
const timeline = [
  { prospectId: "PROS-1", date: "2026-08-01", note: "First call, no answer" },
  { prospectId: "PROS-1", date: "2026-08-05", note: "Callback requested for next week" },
];

describe("buildProspectDetail", () => {
  it("returns null for an unknown prospectId instead of throwing", () => {
    expect(buildProspectDetail("PROS-999", prospects, research, qualification, activities, timeline)).toBeNull();
  });

  it("joins research and qualification by prospectId", () => {
    const detail = buildProspectDetail("PROS-1", prospects, research, qualification, activities, timeline);
    expect(detail?.research?.hasWebsite).toBe("false");
    expect(detail?.qualification?.priority).toBe("high");
  });

  it("sorts activities and timeline newest-first", () => {
    const detail = buildProspectDetail("PROS-1", prospects, research, qualification, activities, timeline);
    expect(detail?.activities[0].date).toBe("2026-08-05");
    expect(detail?.timeline[0].date).toBe("2026-08-05");
  });

  it("omits research/qualification rather than erroring when a prospect has none yet", () => {
    const detail = buildProspectDetail("PROS-1", prospects, [], [], activities, timeline);
    expect(detail?.research).toBeUndefined();
    expect(detail?.qualification).toBeUndefined();
  });
});
