import { describe, it, expect, vi, beforeEach } from "vitest";
import { ResendAdapter } from "../adapters/ResendAdapter.js";

describe("ResendAdapter", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns sent:true with a messageId on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "msg_123" }),
    }) as unknown as typeof fetch;

    const adapter = new ResendAdapter("fake-key", "hello@peak-empire.example.com");
    const result = await adapter.send({
      to: "alex@brightnails.example.com",
      subject: "Quick question about your booking process",
      body: "Hi Alex, ...",
    });

    expect(result).toEqual({ sent: true, messageId: "msg_123" });
  });

  it("returns sent:false with an error message rather than throwing on failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      text: async () => "Invalid `to` field",
    }) as unknown as typeof fetch;

    const adapter = new ResendAdapter("fake-key", "hello@peak-empire.example.com");
    const result = await adapter.send({
      to: "not-an-email",
      subject: "x",
      body: "y",
    });

    expect(result.sent).toBe(false);
    expect(result.error).toContain("422");
  });
});
