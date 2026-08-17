import { AppError } from "@/lib/errors";
import * as repository from "./repository";
import type { CreateApiKeyInput, ListApiKeysInput } from "./schema";

export async function createApiKeyService(tenantId: string, input: CreateApiKeyInput) {
  const expiresAt = input.expiresAt ? new Date(input.expiresAt) : undefined;

  if (expiresAt && expiresAt <= new Date()) {
    throw AppError.badRequest("Expiration date must be in the future");
  }

  const { apiKey, fullKey } = await repository.createApiKey(tenantId, input.name, expiresAt);

  return {
    id: apiKey.id,
    name: apiKey.name,
    key: fullKey,
    keyPreview: fullKey.slice(0, 8) + "..." + fullKey.slice(-4),
    expiresAt: apiKey.expiresAt?.toISOString() ?? null,
    createdAt: apiKey.createdAt.toISOString(),
  };
}

export async function listApiKeysService(tenantId: string, input?: ListApiKeysInput) {
  const result = await repository.listApiKeys(tenantId, input?.page, input?.limit);

  return {
    items: result.items.map((key) => ({
      id: key.id,
      name: key.name,
      keyPreview: key.keyHash.slice(0, 8) + "...",
      lastUsedAt: key.lastUsedAt?.toISOString() ?? null,
      expiresAt: key.expiresAt?.toISOString() ?? null,
      isActive: key.isActive,
      createdAt: key.createdAt.toISOString(),
    })),
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      pages: result.pages,
    },
  };
}

export async function revokeApiKeyService(tenantId: string, keyId: string) {
  const result = await repository.revokeApiKey(tenantId, keyId);

  if (!result.count) {
    throw AppError.notFound("API key not found");
  }

  return { message: "API key revoked" };
}

export async function deleteApiKeyService(tenantId: string, keyId: string) {
  const result = await repository.deleteApiKey(tenantId, keyId);

  if (!result.count) {
    throw AppError.notFound("API key not found");
  }

  return { message: "API key deleted" };
}
