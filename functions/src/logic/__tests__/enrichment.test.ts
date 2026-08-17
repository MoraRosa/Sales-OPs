import { describe, it, expect } from "vitest";
import { buildEnrichmentPatch } from "../enrichment.js";

describe("buildEnrichmentPatch", () => {
  it("includes every field Apollo returned", () => {
    const patch = buildEnrichmentPatch({
      primaryContactName: "Alex Rivera",
      primaryContactRole: "Owner",
      email: "alex@brightnails.example.com",
      linkedin: "https://linkedin.com/in/alexrivera",
    });
    expect(patch).toEqual({
      primaryContactName: "Alex Rivera",
      primaryContactRole: "Owner",
      email: "alex@brightnails.example.com",
      linkedin: "https://linkedin.com/in/alexrivera",
    });
  });

  it("omits fields Apollo didn't find rather than writing blanks over existing data", () => {
    const patch = buildEnrichmentPatch({ primaryContactName: "Alex Rivera" });
    expect(patch).toEqual({ primaryContactName: "Alex Rivera" });
    expect(patch.email).toBeUndefined();
  });

  it("returns an empty object for a fully-empty result instead of throwing", () => {
    expect(buildEnrichmentPatch({})).toEqual({});
  });
});
