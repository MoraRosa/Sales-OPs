import { describe, it, expect } from "vitest";
import { applyTemplate, buildEmailTimelineNote } from "../email.js";

describe("applyTemplate", () => {
  it("replaces every matching placeholder", () => {
    const result = applyTemplate("Hi {{businessName}}, saw you're in {{industry}}.", {
      businessName: "Bright Nails",
      industry: "nail salon",
    });
    expect(result).toBe("Hi Bright Nails, saw you're in nail salon.");
  });

  it("leaves an unmatched placeholder visible rather than blanking it silently", () => {
    const result = applyTemplate("Hi {{businessName}}, {{missingVar}} here.", {
      businessName: "Bright Nails",
    });
    expect(result).toBe("Hi Bright Nails, {{missingVar}} here.");
  });

  it("returns the text unchanged when there are no placeholders", () => {
    expect(applyTemplate("No placeholders here.", {})).toBe("No placeholders here.");
  });
});

describe("buildEmailTimelineNote", () => {
  it("includes the subject line", () => {
    expect(buildEmailTimelineNote("Quick question")).toBe("Sent email: Quick question");
  });
});
