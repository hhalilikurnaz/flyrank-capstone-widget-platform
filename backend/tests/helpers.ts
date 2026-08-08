import { randomUUID } from "node:crypto";
import request from "supertest";
import type { Express } from "express";

export function uniqueEmail(prefix: string) {
  return `${prefix}-${randomUUID()}@example.test`;
}

export async function registerTenant(app: Express, prefix = "tenant") {
  const email = uniqueEmail(prefix);
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Test Tenant", email, password: "supersecret123" });
  return { token: res.body.token as string, tenantId: res.body.tenant.id as string, email };
}

export async function createWidget(app: Express, token: string, overrides: Record<string, unknown> = {}) {
  const res = await request(app)
    .post("/api/widgets")
    .set("Authorization", `Bearer ${token}`)
    .send({ type: "SIGNUP", title: "Test Widget", ...overrides });
  return res.body.widget as { id: string; tenantId: string; fields: Array<{ name: string; required: boolean }> };
}

export async function registerTenantWithWidget(app: Express, prefix = "tenant") {
  const tenant = await registerTenant(app, prefix);
  const widget = await createWidget(app, tenant.token);
  return { ...tenant, widget };
}
