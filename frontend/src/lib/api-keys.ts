import { api } from "./api";
import type { ApiKey, CreateApiKeyResponse } from "./types";

export interface CreateApiKeyPayload {
  name: string;
  expiresAt?: string;
}

export interface ListApiKeysResponse {
  items: ApiKey[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function listApiKeys(page = 1, limit = 20): Promise<ListApiKeysResponse> {
  return api.get(`/api/api-keys?page=${page}&limit=${limit}`);
}

export async function createApiKey(payload: CreateApiKeyPayload): Promise<CreateApiKeyResponse> {
  return api.post("/api/api-keys", payload);
}

export async function revokeApiKey(id: string): Promise<{ message: string }> {
  return api.patch(`/api/api-keys/${id}/revoke`, {});
}

export async function deleteApiKey(id: string): Promise<{ message: string }> {
  return api.delete(`/api/api-keys/${id}`);
}
