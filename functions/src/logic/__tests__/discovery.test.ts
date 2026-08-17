import { describe, it, expect } from "vitest";
import { dedupeKey, buildExistingKeySet, partitionNew, newProspectId } from "../discovery.js";
import type { DiscoveredProspect } from "@peak-empire/lead-sourcing";

describe("dedupeKey", () => {
  it("is case-insensitive on both business name and city", () => {
    expect(dedupeKey("Alex's Landscaping", "Calgary")).toBe(
      dedupeKey("ALEX'S LANDSCAPING", "calgary")
    );
  });

  it("treats a missing city as its own key rather than throwing", () => {
    expect(() => dedupeKey("Some Business", undefined)).not.toThrow();
  });
});

describe("buildExistingKeySet", () => {
  it("builds one key per existing Sheet row", () => {
    const rows = [
      { businessName: "Bright Nails", city: "Calgary" },
      { businessName: "Fresh Cuts", city: "Calgary" },
    ];
    const keys = buildExistingKeySet(rows);
    expect(keys.size).toBe(2);
    expect(keys.has(dedupeKey("Bright Nails", "Calgary"))).toBe(true);
  });
});

describe("partitionNew", () => {
  const existing = buildExistingKeySet([{ businessName: "Bright Nails", city: "Calgary" }]);

  const found: DiscoveredProspect[] = [
    { businessName: "Bright Nails", industry: "nail salon", city: "Calgary", source: "google_places" },
    { businessName: "New Shine Detailing", industry: "auto detailing", city: "Calgary", source: "google_places" },
  ];

  it("keeps only prospects not already in the Sheet", () => {
    const { fresh, duplicateCount } = partitionNew(found, existing);
    expect(fresh).toHaveLength(1);
    expect(fresh[0].businessName).toBe("New Shine Detailing");
    expect(duplicateCount).toBe(1);
  });

  it("counts zero duplicates when nothing overlaps", () => {
    const { duplicateCount } = partitionNew(found, new Set());
    expect(duplicateCount).toBe(0);
  });
});

describe("newProspectId", () => {
  it("is stable for a fixed timestamp and uppercase base36", () => {
    expect(newProspectId(1700000000000)).toBe(`PROS-${(1700000000000).toString(36).toUpperCase()}`);
  });

  it("produces different ids for different timestamps", () => {
    expect(newProspectId(1)).not.toBe(newProspectId(2));
  });
});
