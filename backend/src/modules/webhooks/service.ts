import { AppError } from "@/lib/errors";
import * as repository from "./repository";
import type { CreateWebhookInput, ListWebhooksInput, TestWebhookInput } from "./schema";

export async function createWebhookService(tenantId: string, input: CreateWebhookInput) {
  const webhook = await repository.createWebhook(tenantId, input.url, input.events);

  return {
    id: webhook.id,
    url: webhook.url,
    events: webhook.events,
    isActive: webhook.isActive,
    createdAt: webhook.createdAt.toISOString(),
  };
}

export async function listWebhooksService(tenantId: string, input?: ListWebhooksInput) {
  const result = await repository.listWebhooks(tenantId, input?.page, input?.limit);

  return {
    items: result.items.map((w) => ({
      id: w.id,
      url: w.url,
      events: w.events,
      isActive: w.isActive,
      createdAt: w.createdAt.toISOString(),
    })),
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      pages: result.pages,
    },
  };
}

export async function updateWebhookService(
  tenantId: string,
  webhookId: string,
  data: { url?: string; events?: string[]; isActive?: boolean },
) {
  const result = await repository.updateWebhook(tenantId, webhookId, data);

  if (!result.count) {
    throw AppError.notFound("Webhook not found");
  }

  return { message: "Webhook updated" };
}

export async function deleteWebhookService(tenantId: string, webhookId: string) {
  const result = await repository.deleteWebhook(tenantId, webhookId);

  if (!result.count) {
    throw AppError.notFound("Webhook not found");
  }

  return { message: "Webhook deleted" };
}

export async function listWebhookLogsService(
  webhookId: string,
  tenantId: string,
  page = 1,
  limit = 20,
) {
  const result = await repository.listWebhookLogs(webhookId, tenantId, page, limit);

  return {
    items: result.items.map((log) => ({
      id: log.id,
      event: log.event,
      status: log.status,
      error: log.error,
      attempts: log.attempts,
      createdAt: log.createdAt.toISOString(),
    })),
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      pages: result.pages,
    },
  };
}

export async function testWebhookService(tenantId: string, input: TestWebhookInput) {
  try {
    const testPayload = {
      event: "webhook.test",
      timestamp: new Date().toISOString(),
      data: {
        message: "This is a test webhook delivery",
      },
    };

    const payloadStr = JSON.stringify(testPayload);
    const signature = require("crypto")
      .createHmac("sha256", "test-secret")
      .update(payloadStr)
      .digest("hex");

    const response = await fetch(input.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-Event": "webhook.test",
      },
      body: payloadStr,
      timeout: 10000,
    }).catch((err) => {
      throw new Error(`Failed to deliver webhook: ${err.message}`);
    });

    if (!response.ok) {
      throw new Error(`Webhook returned status ${response.status}`);
    }

    return { success: true, statusCode: response.status };
  } catch (error) {
    throw AppError.badRequest(
      error instanceof Error ? error.message : "Failed to test webhook",
    );
  }
}

export async function triggerWebhook(event: string, data: Record<string, unknown>) {
  const webhooks = await repository.getActiveWebhooks([event]);

  for (const webhook of webhooks) {
    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    const payloadStr = JSON.stringify(payload);
    const signature = require("crypto")
      .createHmac("sha256", webhook.secret)
      .update(payloadStr)
      .digest("hex");

    try {
      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
          "X-Webhook-Event": event,
        },
        body: payloadStr,
        timeout: 30000,
      });

      await repository.createWebhookLog(
        webhook.id,
        webhook.tenantId,
        event,
        payload,
        response.status,
        await response.text(),
      );
    } catch (error) {
      await repository.createWebhookLog(
        webhook.id,
        webhook.tenantId,
        event,
        payload,
        undefined,
        undefined,
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }
}
