import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "@/app";
import { transporter } from "@/modules/notifications/mailer";
import { prisma } from "@/lib/prisma";
import { registerTenantWithWidget } from "./helpers";

// These tests exercise validation/CORS/rate-limit/honeypot/side-effect
// behavior, not the geo fallback chain itself (that's covered in isolation,
// with deterministic mocks, in enrichment.test.ts). Stubbing it here keeps
// this suite fast and offline instead of depending on ip-api.com/ipapi.co
// being reachable from wherever `npm test` runs. vitest hoists vi.mock
// above the imports above, regardless of where it's written.
vi.mock("@/modules/enrichment/enrich", () => ({
  enrichIp: vi.fn().mockResolvedValue({ country: null, city: null }),
}));

const app = createApp();

let ipCounter = 1;
function nextIp() {
  ipCounter += 1;
  return `10.${(ipCounter >> 16) & 255}.${(ipCounter >> 8) & 255}.${ipCounter & 255}`;
}

describe("public submission endpoint", () => {
  it("handles a CORS preflight request", async () => {
    const res = await request(app)
      .options("/api/submissions")
      .set("Origin", "http://a-site-we-dont-control.example")
      .set("Access-Control-Request-Method", "POST");
    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe("*");
  });

  it("accepts a valid cross-origin submission and stores it", async () => {
    const { widget } = await registerTenantWithWidget(app, "sub-valid");
    const res = await request(app)
      .post("/api/submissions")
      .set("Origin", "http://a-site-we-dont-control.example")
      .set("X-Forwarded-For", nextIp())
      .send({ widgetId: widget.id, data: { email: "visitor@example.com" } });

    expect(res.status).toBe(201);
    expect(res.headers["access-control-allow-origin"]).toBe("*");
    expect(res.body.id).toBeTruthy();

    const stored = await prisma.submission.findUnique({ where: { id: res.body.id } });
    expect(stored?.data).toEqual({ email: "visitor@example.com" });
  });

  it("rejects a payload missing a required field", async () => {
    const { widget } = await registerTenantWithWidget(app, "sub-missing");
    const res = await request(app)
      .post("/api/submissions")
      .set("X-Forwarded-For", nextIp())
      .send({ widgetId: widget.id, data: {} });
    expect(res.status).toBe(400);
  });

  it("rejects an oversized payload with a clean 413", async () => {
    const { widget } = await registerTenantWithWidget(app, "sub-oversized");
    const res = await request(app)
      .post("/api/submissions")
      .set("X-Forwarded-For", nextIp())
      .send({ widgetId: widget.id, data: { email: "a".repeat(200_000) } });
    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe("PAYLOAD_TOO_LARGE");
  });

  it("returns 404 for an unknown widget", async () => {
    const res = await request(app)
      .post("/api/submissions")
      .set("X-Forwarded-For", nextIp())
      .send({ widgetId: "00000000-0000-0000-0000-000000000000", data: { email: "a@b.com" } });
    expect(res.status).toBe(404);
  });

  it("silently drops a submission that fills the honeypot field", async () => {
    const { widget } = await registerTenantWithWidget(app, "sub-honeypot");
    const res = await request(app)
      .post("/api/submissions")
      .set("X-Forwarded-For", nextIp())
      .send({ widgetId: widget.id, data: { email: "bot@example.com" }, website: "http://spam.example" });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeNull();

    const count = await prisma.submission.count({ where: { widgetId: widget.id } });
    expect(count).toBe(0);
  });

  it("keeps storing the submission even if the confirmation email throws", async () => {
    const { widget } = await registerTenantWithWidget(app, "sub-email-fails");
    const spy = vi.spyOn(transporter, "sendMail").mockRejectedValueOnce(new Error("smtp down"));

    const res = await request(app)
      .post("/api/submissions")
      .set("X-Forwarded-For", nextIp())
      .send({ widgetId: widget.id, data: { email: "visitor@example.com" } });

    expect(res.status).toBe(201);
    const stored = await prisma.submission.findUnique({ where: { id: res.body.id } });
    expect(stored).not.toBeNull();

    spy.mockRestore();
  });

  it("rate-limits a burst from one IP while still serving a different IP", async () => {
    const { widget } = await registerTenantWithWidget(app, "sub-ratelimit");
    const floodIp = nextIp();

    const statuses: number[] = [];
    for (let i = 0; i < 25; i++) {
      const res = await request(app)
        .post("/api/submissions")
        .set("X-Forwarded-For", floodIp)
        .send({ widgetId: widget.id, data: { email: `flood${i}@example.com` } });
      statuses.push(res.status);
    }

    expect(statuses.filter((s) => s === 201).length).toBeLessThanOrEqual(20);
    expect(statuses.filter((s) => s === 429)).not.toHaveLength(0);

    const otherIpRes = await request(app)
      .post("/api/submissions")
      .set("X-Forwarded-For", nextIp())
      .send({ widgetId: widget.id, data: { email: "unaffected@example.com" } });
    expect(otherIpRes.status).toBe(201);
  });
});
