import { describe, it, expect, vi } from"vitest";

import { POST } from"../app/api/analytics/track/route";

vi.mock("@/lib/analytics", () => ({
 trackEvent: vi.fn().mockResolvedValue(true)
}));

describe("Analytics API", () => {
 it("valid analytics request -> success", async () => {
 const req = new Request("http://localhost/api/analytics/track", {
 method:"POST",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify({ event:"page_view", data: { path:"/home" }, userId:"123" })
 });
 const res = await POST(req);
 expect(res.status).toBe(200);
 const body = await res.json();
 expect(body.success).toBe(true);
 });

 it("empty body -> 400", async () => {
 const req = new Request("http://localhost/api/analytics/track", {
 method:"POST",
 headers: {"Content-Type":"application/json" }
 });
 const res = await POST(req);
 expect(res.status).toBe(400);
 const body = await res.json();
 expect(body.error).toBe("Invalid JSON body");
 });

 it("malformed JSON -> 400", async () => {
 const req = new Request("http://localhost/api/analytics/track", {
 method:"POST",
 headers: {"Content-Type":"application/json" },
 body:"{ bad json"
 });
 const res = await POST(req);
 expect(res.status).toBe(400);
 const body = await res.json();
 expect(body.error).toBe("Invalid JSON body");
 });

 it("missing event -> 400", async () => {
 const req = new Request("http://localhost/api/analytics/track", {
 method:"POST",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify({ data: { path:"/home" } })
 });
 const res = await POST(req);
 expect(res.status).toBe(400);
 const body = await res.json();
 expect(body.error).toBe("Missing event name");
 });

 it("valid event with data -> success", async () => {
 const req = new Request("http://localhost/api/analytics/track", {
 method:"POST",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify({ event:"custom_event", data: { value: 42 } })
 });
 const res = await POST(req);
 expect(res.status).toBe(200);
 const body = await res.json();
 expect(body.success).toBe(true);
 });
});
