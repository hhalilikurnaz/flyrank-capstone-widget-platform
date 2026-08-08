import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "@/app";
import { createWidget, registerTenant } from "./helpers";

const app = createApp();

describe("widget management API", () => {
  it("rejects requests without a valid token", async () => {
    const res = await request(app).get("/api/widgets");
    expect(res.status).toBe(401);
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
