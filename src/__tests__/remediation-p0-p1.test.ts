import { describe, it, expect, vi } from "vitest";
import { withRetry } from "../lib/prisma";

// Re-import equality functions from MapDataSync
// Test the exact structural comparison logic used in MapDataSync
interface MarkerData {
  id: string;
  type: "gig" | "internship" | "user" | "college";
  lat: number;
  lng: number;
  title?: string;
  subtitle?: string;
  location?: string;
  compensation?: string;
  url?: string;
  isPremium?: boolean;
  distanceMeters?: number;
}

function areMarkersEqual(prev: MarkerData[], next: MarkerData[]): boolean {
  if (prev === next) return true;
  if (prev.length !== next.length) return false;
  for (let i = 0; i < prev.length; i++) {
    const p = prev[i];
    const n = next[i];
    if (!p || !n) return false;
    if (
      p.id !== n.id ||
      p.lat !== n.lat ||
      p.lng !== n.lng ||
      p.type !== n.type ||
      p.title !== n.title ||
      p.subtitle !== n.subtitle ||
      p.compensation !== n.compensation ||
      p.url !== n.url ||
      p.isPremium !== n.isPremium ||
      p.location !== n.location ||
      p.distanceMeters !== n.distanceMeters
    ) {
      return false;
    }
  }
  return true;
}

function areLocationsEqual(
  prev: { lat: number; lng: number } | null | undefined,
  next: { lat: number; lng: number } | null | undefined
): boolean {
  if (prev === next) return true;
  if (!prev && !next) return true;
  if (!prev || !next) return false;
  return prev.lat === next.lat && prev.lng === next.lng;
}

describe("P0: MapDataSync Infinite Loop Prevention", () => {
  it("should bail out when new array reference contains identical markers", () => {
    const initialMarkers: MarkerData[] = [
      { id: "1", type: "gig", lat: 12.97, lng: 77.59, title: "React Dev", compensation: "₹10,000" },
      { id: "2", type: "internship", lat: 17.38, lng: 78.48, title: "Data Analyst", compensation: "₹15,000" }
    ];

    // New array reference with same content
    const reRenderMarkers: MarkerData[] = [
      { id: "1", type: "gig", lat: 12.97, lng: 77.59, title: "React Dev", compensation: "₹10,000" },
      { id: "2", type: "internship", lat: 17.38, lng: 78.48, title: "Data Analyst", compensation: "₹15,000" }
    ];

    expect(initialMarkers).not.toBe(reRenderMarkers); // Different references
    expect(areMarkersEqual(initialMarkers, reRenderMarkers)).toBe(true);

    // Simulated functional setState updater
    const nextState = areMarkersEqual(initialMarkers, reRenderMarkers) ? initialMarkers : reRenderMarkers;
    expect(nextState).toBe(initialMarkers); // Exact same reference retained -> React bails out of re-render!
  });

  it("should detect marker coordinate change and trigger state update", () => {
    const prevMarkers: MarkerData[] = [
      { id: "1", type: "gig", lat: 12.97, lng: 77.59, title: "React Dev" }
    ];
    const movedMarkers: MarkerData[] = [
      { id: "1", type: "gig", lat: 13.08, lng: 80.27, title: "React Dev" } // Coordinates changed
    ];

    expect(areMarkersEqual(prevMarkers, movedMarkers)).toBe(false);
    const nextState = areMarkersEqual(prevMarkers, movedMarkers) ? prevMarkers : movedMarkers;
    expect(nextState).toBe(movedMarkers); // State updates to new coordinates
  });

  it("should detect marker addition and removal", () => {
    const empty: MarkerData[] = [];
    const one: MarkerData[] = [{ id: "1", type: "gig", lat: 12.97, lng: 77.59 }];
    const two: MarkerData[] = [
      { id: "1", type: "gig", lat: 12.97, lng: 77.59 },
      { id: "2", type: "internship", lat: 17.38, lng: 78.48 }
    ];

    expect(areMarkersEqual(empty, one)).toBe(false);
    expect(areMarkersEqual(one, two)).toBe(false);
    expect(areMarkersEqual(two, one)).toBe(false);
  });

  it("should handle user location equality correctly", () => {
    expect(areLocationsEqual(null, null)).toBe(true);
    expect(areLocationsEqual({ lat: 12.97, lng: 77.59 }, { lat: 12.97, lng: 77.59 })).toBe(true);
    expect(areLocationsEqual({ lat: 12.97, lng: 77.59 }, { lat: 13.00, lng: 77.59 })).toBe(false);
    expect(areLocationsEqual({ lat: 12.97, lng: 77.59 }, null)).toBe(false);
  });
});

describe("P0: Prisma Bounded Retry & Anti-Thundering-Herd Logic", () => {
  it("should not retry on AbortError", async () => {
    let callCount = 0;
    const abortErr = new Error("This operation was aborted");
    abortErr.name = "AbortError";

    await expect(
      withRetry(async () => {
        callCount++;
        throw abortErr;
      }, 2, 50)
    ).rejects.toThrow("This operation was aborted");

    expect(callCount).toBe(1); // Exactly 1 attempt, zero retries
  });

  it("should retry transient connection error at most bounded retries (2 total attempts)", async () => {
    let callCount = 0;
    const transientErr = new Error("Error in PostgreSQL connection: Error { kind: Closed, cause: None }");

    await expect(
      withRetry(async () => {
        callCount++;
        throw transientErr;
      }, 2, 20)
    ).rejects.toThrow("Error in PostgreSQL connection: Error { kind: Closed, cause: None }");

    expect(callCount).toBe(2); // Exactly 1 initial + 1 retry = 2 attempts total (no retry storm)
  });

  it("should succeed if retry recovers", async () => {
    let callCount = 0;
    const transientErr = new Error("Connection reset by peer");

    const result = await withRetry(async () => {
      callCount++;
      if (callCount === 1) throw transientErr;
      return "recovered_data";
    }, 2, 20);

    expect(result).toBe("recovered_data");
    expect(callCount).toBe(2);
  });
});

describe("P1: AI SSE Streaming Protocol Compatibility", () => {
  it("should correctly buffer and parse fragmented SSE data across chunk boundaries", () => {
    // Simulate network chunks cut mid-JSON
    const chunks = [
      'data: {"del',
      'ta":"Hello "}\n\ndata: {"delta":"',
      'world!"}\n\ndata: [DONE]\n\n'
    ];

    let fullContent = "";
    let buffer = "";

    for (const chunk of chunks) {
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(":")) continue;
        if (trimmed === "data: [DONE]") break;

        if (trimmed.startsWith("data:")) {
          try {
            const parsed = JSON.parse(trimmed.slice(5).trim());
            if (parsed.delta) fullContent += parsed.delta;
          } catch {}
        }
      }
    }

    expect(fullContent).toBe("Hello world!");
  });
});
