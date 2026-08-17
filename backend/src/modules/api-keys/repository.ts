import { prisma } from "@/lib/prisma";
import crypto from "node:crypto";
import bcryptjs from "bcryptjs";

const SALT_ROUNDS = 12;
const KEY_PREFIX = "sk_live_";
const KEY_LENGTH = 32;

export function generateApiKey(): string {
  return KEY_PREFIX + crypto.randomBytes(KEY_LENGTH).toString("hex");
}

async function hashApiKey(key: string): Promise<string> {
  return bcryptjs.hash(key, SALT_ROUNDS);
}

export async function verifyApiKey(key: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(key, hash);
}

export async function createApiKey(
  tenantId: string,
  name: string,
  expiresAt?: Date,
) {
  const key = generateApiKey();
  const keyHash = await hashApiKey(key);

  const apiKey = await prisma.apiKey.create({
    data: {
      tenantId,
      name,
      keyHash,
      expiresAt,
    },
  });

  return { apiKey, fullKey: key };
}

export async function getApiKey(tenantId: string, keyId: string) {
  return prisma.apiKey.findFirst({
    where: {
      id: keyId,
      tenantId,
      isActive: true,
    },
  });
}

export async function listApiKeys(tenantId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.apiKey.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.apiKey.count({
      where: { tenantId },
    }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}

export async function revokeApiKey(tenantId: string, keyId: string) {
  return prisma.apiKey.updateMany({
    where: {
      id: keyId,
      tenantId,
    },
    data: {
      isActive: false,
    },
  });
}

export async function deleteApiKey(tenantId: string, keyId: string) {
  return prisma.apiKey.deleteMany({
    where: {
      id: keyId,
      tenantId,
    },
  });
}

export async function findApiKeyByHash(keyHash: string) {
  return prisma.apiKey.findUnique({
    where: { keyHash },
    include: { tenant: true },
  });
}

export async function updateApiKeyLastUsed(keyId: string) {
  return prisma.apiKey.update({
    where: { id: keyId },
    data: { lastUsedAt: new Date() },
  });
}

// For verification during authentication
export async function verifyAndGetTenantByKey(key: string) {
  const allKeys = await prisma.apiKey.findMany({
    where: { isActive: true },
    include: { tenant: true },
  });

  for (const apiKey of allKeys) {
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      continue;
    }

    if (await verifyApiKey(key, apiKey.keyHash)) {
      await updateApiKeyLastUsed(apiKey.id);
      return { tenant: apiKey.tenant, apiKey };
    }
  }

  return null;
}
