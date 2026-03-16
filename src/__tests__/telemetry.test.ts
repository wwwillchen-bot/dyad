import { describe, expect, it } from "vitest";
import { shouldFilterTelemetryException } from "@/ipc/utils/telemetry";
import { RateLimitError } from "@/ipc/utils/retryWithRateLimit";

describe("shouldFilterTelemetryException", () => {
  it("filters the known Supabase auth noise message", () => {
    expect(
      shouldFilterTelemetryException(
        new Error(
          "Supabase access token not found. Please authenticate first.",
        ),
      ),
    ).toBe(true);
  });

  it("filters RateLimitError 429s from retryWithRateLimit", () => {
    const mockResponse = new Response(null, { status: 429 });
    const error = new RateLimitError(
      "Rate limited (429): Too Many Requests",
      mockResponse,
    );

    expect(shouldFilterTelemetryException(error)).toBe(true);
  });

  it("does not filter a plain Error with rate-limit-like message", () => {
    const error = new Error("Rate limited (503): Service Unavailable");

    expect(shouldFilterTelemetryException(error)).toBe(false);
  });

  it("does not filter different Supabase auth failures", () => {
    expect(
      shouldFilterTelemetryException(
        new Error(
          "Supabase access token not found for organization acme. Please authenticate first.",
        ),
      ),
    ).toBe(false);
  });
});
