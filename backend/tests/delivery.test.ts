import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "@/app";
import { registerTenantWithWidget } from "./helpers";

const app = createApp();

describe("widget delivery", () => {
  it("serves the versioned bundle with an immutable cache header", async () => {
    const res = await request(app).get("/widget.v1.js");
    expect(res.status).toBe(200);
    expect(res.headers["cache-control"]).toBe("public, max-age=31536000, immutable");
    expect(res.headers["content-type"]).toContain("javascript");
    // A basic smoke check that this is really the widget bundle, not an
    // empty/placeholder file — full DOM rendering is verified separately
    // with a real browser (see EVIDENCE.md) since a browser engine isn't a
    // safe assumption for `npm test` on an arbitrary evaluator machine.
    expect(res.text).toContain("wp-widget");
    expect(res.text.length).toBeGreaterThan(500);
  });

  it("404s for an unknown SDK version", async () => {
    const res = await request(app).get("/widget.v999.js");
    expect(res.status).toBe(404);
  });

  it("redirects /widget.js to the current version", async () => {
    const res = await request(app).get("/widget.js");
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/widget.v1.js");
  });

  it("serves public widget config with a short cache and no auth", async () => {
    const { widget } = await registerTenantWithWidget(app, "delivery-config");
    const res = await request(app).get(`/api/widgets/${widget.id}/config`);
    expect(res.status).toBe(200);
    expect(res.headers["cache-control"]).toBe("public, max-age=60");
    expect(res.headers["access-control-allow-origin"]).toBe("*");
    expect(res.body.id).toBe(widget.id);
    expect(res.body.tenantId).toBeUndefined();
  });

  it("returns 404 for config of an unknown widget", async () => {
    const res = await request(app).get("/api/widgets/00000000-0000-0000-0000-000000000000/config");
    expect(res.status).toBe(404);
  });
});
