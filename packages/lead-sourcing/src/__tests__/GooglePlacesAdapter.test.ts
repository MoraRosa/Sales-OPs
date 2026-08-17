import { describe, it, expect, vi, beforeEach } from "vitest";
import { GooglePlacesAdapter } from "../adapters/GooglePlacesAdapter.js";

describe("GooglePlacesAdapter", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("maps a Places API response into DiscoveredProspect shape", async () => {
    const mockResponse = {
      places: [
        {
          displayName: { text: "Bright Nails Studio" },
          formattedAddress: "123 Main St, Calgary, AB",
          websiteUri: "https://brightnails.example.com",
          internationalPhoneNumber: "+1 403-555-0100",
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    }) as unknown as typeof fetch;

    const adapter = new GooglePlacesAdapter("fake-key");
    const results = await adapter.search({ industry: "nail salon", city: "Calgary" });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      businessName: "Bright Nails Studio",
      website: "https://brightnails.example.com",
      phone: "+1 403-555-0100",
      city: "Calgary",
      source: "google_places",
    });
  });

  it("throws with a readable message on a non-ok response instead of failing silently", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => "API key not authorized for Places API (New)",
    }) as unknown as typeof fetch;

    const adapter = new GooglePlacesAdapter("bad-key");
    await expect(adapter.search({ industry: "nail salon", city: "Calgary" })).rejects.toThrow(
      /403/
    );
  });

  it("returns an empty array rather than throwing when no places are found", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as unknown as typeof fetch;

    const adapter = new GooglePlacesAdapter("fake-key");
    const results = await adapter.search({ industry: "dog walker", city: "Nowhere" });
    expect(results).toEqual([]);
  });
});
