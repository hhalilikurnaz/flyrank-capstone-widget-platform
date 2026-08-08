import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";
import type { LoginInput, RegisterInput } from "./schema";

const SALT_ROUNDS = 12;

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
