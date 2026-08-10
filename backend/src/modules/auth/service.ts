import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { notifyPasswordResetSafely } from "@/modules/notifications/service";
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from "./schema";

const SALT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function signToken(tenantId: string) {
  return jwt.sign({ tenantId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);
}

export async function registerTenant(input: RegisterInput) {
  const existing = await prisma.tenant.findUnique({ where: { email: input.email } });
  if (existing) {
    throw AppError.conflict("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const tenant = await prisma.tenant.create({
    data: { name: input.name, email: input.email, passwordHash },
  });

  return { tenant: toPublicTenant(tenant), token: signToken(tenant.id) };
}

export async function loginTenant(input: LoginInput) {
  const tenant = await prisma.tenant.findUnique({ where: { email: input.email } });
  if (!tenant) {
    throw AppError.unauthorized("Invalid email or password");
  }

  const valid = await bcrypt.compare(input.password, tenant.passwordHash);
  if (!valid) {
    throw AppError.unauthorized("Invalid email or password");
  }

  return { tenant: toPublicTenant(tenant), token: signToken(tenant.id) };
}

function toPublicTenant(tenant: { id: string; name: string; email: string; createdAt: Date }) {
  return { id: tenant.id, name: tenant.name, email: tenant.email, createdAt: tenant.createdAt };
}

// Always resolves with the same shape regardless of whether the email
// exists — the caller must not be able to distinguish "sent" from "no such
// account" (email enumeration).
export async function requestPasswordReset(input: ForgotPasswordInput) {
  const tenant = await prisma.tenant.findUnique({ where: { email: input.email } });
  if (!tenant) return;

  const token = randomBytes(32).toString("hex");
  const resetTokenHash = await bcrypt.hash(token, SALT_ROUNDS);
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: { resetTokenHash, resetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
  });

  const resetUrl = `${env.FRONTEND_URL}/reset-password?email=${encodeURIComponent(tenant.email)}&token=${token}`;
  await notifyPasswordResetSafely(tenant.email, resetUrl);
}

export async function resetPassword(input: ResetPasswordInput) {
  const tenant = await prisma.tenant.findUnique({ where: { email: input.email } });
  if (!tenant?.resetTokenHash || !tenant.resetTokenExpiresAt || tenant.resetTokenExpiresAt < new Date()) {
    throw AppError.badRequest("This reset link is invalid or has expired");
  }

  const valid = await bcrypt.compare(input.token, tenant.resetTokenHash);
  if (!valid) {
    throw AppError.badRequest("This reset link is invalid or has expired");
  }

  const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
  const updated = await prisma.tenant.update({
    where: { id: tenant.id },
    data: { passwordHash, resetTokenHash: null, resetTokenExpiresAt: null },
  });

  return { tenant: toPublicTenant(updated), token: signToken(updated.id) };
}

export async function updateProfile(tenantId: string, input: UpdateProfileInput) {
  const existing = await prisma.tenant.findUnique({ where: { email: input.email } });
  if (existing && existing.id !== tenantId) {
    throw AppError.conflict("An account with this email already exists");
  }

  const tenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: { name: input.name, email: input.email },
  });
  return toPublicTenant(tenant);
}

export async function changePassword(tenantId: string, input: ChangePasswordInput) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw AppError.notFound("Account not found");
  const valid = await bcrypt.compare(input.currentPassword, tenant.passwordHash);
  if (!valid) {
    throw AppError.unauthorized("Current password is incorrect");
  }

  const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
  await prisma.tenant.update({ where: { id: tenantId }, data: { passwordHash } });
}
