import { api } from "./api";
import type { Webhook, WebhookLog } from "./types";

export interface CreateWebhookPayload {
  url: string;
  events: string[];
}

export interface ListWebhooksResponse {
  items: Webhook[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ListWebhookLogsResponse {
  items: WebhookLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function listWebhooks(page = 1, limit = 20): Promise<ListWebhooksResponse> {
  return api.get(`/api/webhooks?page=${page}&limit=${limit}`);
}

export async function createWebhook(payload: CreateWebhookPayload): Promise<Webhook> {
  return api.post("/api/webhooks", payload);
}

export async function updateWebhook(id: string, payload: Partial<CreateWebhookPayload>): Promise<{ message: string }> {
  return api.patch(`/api/webhooks/${id}`, payload);
}

export async function deleteWebhook(id: string): Promise<{ message: string }> {
  return api.delete(`/api/webhooks/${id}`);
}

export async function testWebhook(id: string): Promise<{ success: boolean; statusCode: number }> {
  return api.post(`/api/webhooks/${id}/test`, {});
}

export async function listWebhookLogs(webhookId: string, page = 1, limit = 20): Promise<ListWebhookLogsResponse> {
  return api.get(`/api/webhooks/${webhookId}/logs?page=${page}&limit=${limit}`);
}

export const WEBHOOK_EVENTS = [
  { value: "submission.created", label: "New Submission" },
  { value: "submission.flagged", label: "Spam Detected" },
];
