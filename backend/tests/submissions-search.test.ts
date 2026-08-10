import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "@/app";
import { registerTenantWithWidget } from "./helpers";

vi.mock("@/modules/enrichment/enrich", () => ({
  enrichIp: vi.fn().mockResolvedValue({ country: "United States", city: "Berkeley" }),
}));

const app = createApp();

async function submit(widgetId: string, data: Record<string, string>) {
  return request(app)
    .post("/api/submissions")
    .set("Origin", "http://a-site-we-dont-control.example")
    .send({ widgetId, website: "", data });
}

describe("submissions search", () => {
  it("finds a submission by a value inside its data JSON", async () => {
    const { token, widget } = await registerTenantWithWidget(app, "search-data");
    await submit(widget.id, { email: "distinctive-needle@example.com" });
    await submit(widget.id, { email: "someone-else@example.com" });

    const res = await request(app)
      .get("/api/dashboard/submissions")
      .set("Authorization", `Bearer ${token}`)
      .query({ q: "distinctive-needle" });

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.items[0].data.email).toBe("distinctive-needle@example.com");
  });

  it("finds a submission by widget title", async () => {
    const { token, widget } = await registerTenantWithWidget(app, "search-title");
    await submit(widget.id, { email: "a@example.com" });

    const res = await request(app)
      .get("/api/dashboard/submissions")
      .set("Authorization", `Bearer ${token}`)
      .query({ q: "Test Widget" });

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
  });

  it("finds a submission by enriched location", async () => {
    const { token, widget } = await registerTenantWithWidget(app, "search-geo");
    await submit(widget.id, { email: "a@example.com" });

    const res = await request(app)
      .get("/api/dashboard/submissions")
      .set("Authorization", `Bearer ${token}`)
      .query({ q: "Berkeley" });

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
  });

  it("returns no results for a query that matches nothing", async () => {
    const { token, widget } = await registerTenantWithWidget(app, "search-empty");
    await submit(widget.id, { email: "a@example.com" });

    const res = await request(app)
      .get("/api/dashboard/submissions")
      .set("Authorization", `Bearer ${token}`)
      .query({ q: "nothing-matches-this-at-all" });

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
    expect(res.body.items).toEqual([]);
  });

  it("does not leak another tenant's submissions into search results", async () => {
    const tenantA = await registerTenantWithWidget(app, "search-isolation-a");
    const tenantB = await registerTenantWithWidget(app, "search-isolation-b");
    await submit(tenantA.widget.id, { email: "shared-term@example.com" });
    await submit(tenantB.widget.id, { email: "shared-term@example.com" });

    const res = await request(app)
      .get("/api/dashboard/submissions")
      .set("Authorization", `Bearer ${tenantA.token}`)
      .query({ q: "shared-term" });

    expect(res.body.total).toBe(1);
    expect(res.body.items[0].widgetId).toBe(tenantA.widget.id);
  });
});
