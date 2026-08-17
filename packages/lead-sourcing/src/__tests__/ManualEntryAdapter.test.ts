import { describe, it, expect } from "vitest";
import { ManualEntryAdapter } from "../adapters/ManualEntryAdapter.js";

describe("ManualEntryAdapter", () => {
  it("normalizes a quick-add form submission into a DiscoveredProspect", () => {
    const adapter = new ManualEntryAdapter();
    const result = adapter.addOne({
      businessName: "Cozy Cleaners",
      industry: "house cleaning",
      instagram: "@cozycleaners",
    });

    expect(result).toMatchObject({
      businessName: "Cozy Cleaners",
      industry: "house cleaning",
      instagram: "@cozycleaners",
      source: "manual",
    });
  });

  it("search() returns an empty array -- manual entry never bulk-discovers", async () => {
    const adapter = new ManualEntryAdapter();
    const results = await adapter.search({ industry: "x", city: "y" });
    expect(results).toEqual([]);
  });
});
