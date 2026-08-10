import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "@/app";
import { transporter } from "@/modules/notifications/mailer";
import { registerTenant } from "./helpers";

const app = createApp();

function extractResetToken(emailText: string) {
  const match = emailText.match(/token=([a-f0-9]+)/);
  if (!match) throw new Error("No reset token found in email body");
  return match[1]!;
}

describe("password reset", () => {
  it("returns the same response for an existing and a non-existent email (no enumeration)", async () => {
    const { email } = await registerTenant(app, "reset-enum");
    const spy = vi.spyOn(transporter, "sendMail").mockResolvedValue(undefined as never);

    const existing = await request(app).post("/api/auth/forgot-password").send({ email });
    const missing = await request(app).post("/api/auth/forgot-password").send({ email: "no-such-account@example.test" });

    expect(existing.status).toBe(200);
    expect(missing.status).toBe(200);
    expect(existing.body).toEqual(missing.body);
    expect(spy).toHaveBeenCalledTimes(1); // only for the real account
    spy.mockRestore();
  });

  it("lets a tenant reset their password with a valid token and log in with the new password", async () => {
    const { email } = await registerTenant(app, "reset-happy");
    const spy = vi.spyOn(transporter, "sendMail").mockResolvedValue(undefined as never);

    await request(app).post("/api/auth/forgot-password").send({ email });
    const emailBody = spy.mock.calls[0]![0].text as string;
    const token = extractResetToken(emailBody);
    spy.mockRestore();

    const resetRes = await request(app).post("/api/auth/reset-password").send({ email, token, newPassword: "brandnewpassword123" });
    expect(resetRes.status).toBe(200);
    expect(resetRes.body.token).toBeDefined();

    const loginRes = await request(app).post("/api/auth/login").send({ email, password: "brandnewpassword123" });
    expect(loginRes.status).toBe(200);
  });

  it("rejects an invalid or expired token", async () => {
    const { email } = await registerTenant(app, "reset-invalid");
    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ email, token: "not-a-real-token", newPassword: "brandnewpassword123" });
    expect(res.status).toBe(400);
  });

  it("does not let a stale token be reused after a successful reset", async () => {
    const { email } = await registerTenant(app, "reset-reuse");
    const spy = vi.spyOn(transporter, "sendMail").mockResolvedValue(undefined as never);
    await request(app).post("/api/auth/forgot-password").send({ email });
    const token = extractResetToken(spy.mock.calls[0]![0].text as string);
    spy.mockRestore();

    await request(app).post("/api/auth/reset-password").send({ email, token, newPassword: "firstnewpassword123" });
    const secondAttempt = await request(app)
      .post("/api/auth/reset-password")
      .send({ email, token, newPassword: "secondnewpassword123" });
    expect(secondAttempt.status).toBe(400);
  });
});

describe("profile and password management", () => {
  it("updates the tenant's name and email", async () => {
    const { token, email } = await registerTenant(app, "profile-update");
    const res = await request(app)
      .patch("/api/auth/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated Name", email });
    expect(res.status).toBe(200);
    expect(res.body.tenant.name).toBe("Updated Name");
  });

  it("rejects a profile update to an email already used by another tenant", async () => {
    const tenantA = await registerTenant(app, "profile-conflict-a");
    const tenantB = await registerTenant(app, "profile-conflict-b");
    const res = await request(app)
      .patch("/api/auth/me")
      .set("Authorization", `Bearer ${tenantA.token}`)
      .send({ name: "Tenant A", email: tenantB.email });
    expect(res.status).toBe(409);
  });

  it("changes the password when the current password is correct", async () => {
    const { token, email } = await registerTenant(app, "change-pw");
    const res = await request(app)
      .post("/api/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: "supersecret123", newPassword: "evennewerpassword123" });
    expect(res.status).toBe(200);

    const loginRes = await request(app).post("/api/auth/login").send({ email, password: "evennewerpassword123" });
    expect(loginRes.status).toBe(200);
  });

  it("rejects a password change with the wrong current password", async () => {
    const { token } = await registerTenant(app, "change-pw-wrong");
    const res = await request(app)
      .post("/api/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: "totally-wrong", newPassword: "evennewerpassword123" });
    expect(res.status).toBe(401);
  });
});
