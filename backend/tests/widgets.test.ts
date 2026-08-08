import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "@/app";
import { createWidget, registerTenant, registerTenantWithWidget } from "./helpers";

const app = createApp();

describe("widget management API", () => {
  it("rejects requests without a valid token", async () => {
    const res = await request(app).get("/api/widgets");
    expect(res.status).toBe(401);
  });

  it("answers a PATCH preflight with the dashboard's CORS policy, not the public one", async () => {
    // Regression test: publicCors used to be mounted app-wide with no path
    // filter (for the public /:id/config route), which meant it answered
    // every OPTIONS preflight in the whole app -- including this one --
    // with its restricted GET/POST/OPTIONS methods list, silently breaking
    // PATCH/DELETE from the real dashboard frontend. Caught via a real
    // browser, not curl (curl doesn't send preflight).
    const res = await request(app)
      .options("/api/widgets/00000000-0000-0000-0000-000000000000")
      .set("Origin", "http://localhost:5173")
      .set("Access-Control-Request-Method", "PATCH");
    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-methods"]).toContain("PATCH");
  });

  it("serves widget config publicly with its own CORS, without exposing the rest of the router", async () => {
    const { widget } = await registerTenantWithWidget(app, "widgets-config-cors");
    const res = await request(app)
      .options(`/api/widgets/${widget.id}/config`)
      .set("Origin", "http://a-site-we-dont-control.example")
      .set("Access-Control-Request-Method", "GET");
    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe("*");
  });

  it("rejects an invalid create payload", async () => {
    const tenant = await registerTenant(app, "widgets-invalid");
    const res = await request(app)
      .post("/api/widgets")
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({ type: "NOT_A_TYPE" });
    expect(res.status).toBe(400);
  });

  it("lets a tenant fully manage its own widget", async () => {
    const tenant = await registerTenant(app, "widgets-crud");
    const widget = await createWidget(app, tenant.token, { title: "Original title" });
    expect(widget.id).toBeTruthy();

    const patchRes = await request(app)
      .patch(`/api/widgets/${widget.id}`)
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({ title: "Updated title" });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.widget.title).toBe("Updated title");

    const deleteRes = await request(app)
      .delete(`/api/widgets/${widget.id}`)
      .set("Authorization", `Bearer ${tenant.token}`);
    expect(deleteRes.status).toBe(204);

    const getRes = await request(app)
      .get(`/api/widgets/${widget.id}`)
      .set("Authorization", `Bearer ${tenant.token}`);
    expect(getRes.status).toBe(404);
  });

  it("enforces tenant isolation: tenant B cannot read or modify tenant A's widget", async () => {
    const tenantA = await registerTenant(app, "widgets-tenant-a");
    const tenantB = await registerTenant(app, "widgets-tenant-b");
    const widget = await createWidget(app, tenantA.token);

    const readRes = await request(app)
      .get(`/api/widgets/${widget.id}`)
      .set("Authorization", `Bearer ${tenantB.token}`);
    expect(readRes.status).toBe(404);

    const patchRes = await request(app)
      .patch(`/api/widgets/${widget.id}`)
      .set("Authorization", `Bearer ${tenantB.token}`)
      .send({ title: "Hijacked" });
    expect(patchRes.status).toBe(404);

    const listRes = await request(app).get("/api/widgets").set("Authorization", `Bearer ${tenantB.token}`);
    expect(listRes.body.widgets).toHaveLength(0);
  });
});
