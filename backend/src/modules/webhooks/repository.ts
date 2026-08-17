import { prisma } from "@/lib/prisma";
import crypto from "node:crypto";

export function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function verifyWebhookSignature(secret: string, payload: string, signature: string): boolean {
  const expectedSig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
}

export async function createWebhook(
  tenantId: string,
  url: string,
  events: string[],
) {
  const secret = generateWebhookSecret();
  return prisma.webhook.create({
    data: {
      tenantId,
      url,
      events,
      secret,
    },
  });
}

export async function getWebhook(tenantId: string, webhookId: string) {
  return prisma.webhook.findFirst({
    where: {
      id: webhookId,
      tenantId,
    },
  });
}

export async function listWebhooks(tenantId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.webhook.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.webhook.count({ where: { tenantId } }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}

export async function updateWebhook(
  tenantId: string,
  webhookId: string,
  data: { url?: string; events?: string[]; isActive?: boolean },
) {
  return prisma.webhook.updateMany({
    where: {
      id: webhookId,
      tenantId,
    },
    data,
  });
}

export async function deleteWebhook(tenantId: string, webhookId: string) {
  return prisma.webhook.deleteMany({
    where: {
      id: webhookId,
      tenantId,
    },
  });
}

export async function listWebhookLogs(webhookId: string, tenantId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.webhookLog.findMany({
      where: {
        webhookId,
        tenantId,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.webhookLog.count({
      where: {
        webhookId,
        tenantId,
      },
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

export async function createWebhookLog(
  webhookId: string,
  tenantId: string,
  event: string,
  payload: Record<string, unknown>,
  status?: number,
  response?: string,
  error?: string,
) {
  return prisma.webhookLog.create({
    data: {
      webhookId,
      tenantId,
      event,
      payload,
      status,
      response,
      error,
    },
  });
}

export async function getActiveWebhooks(events: string[]) {
  return prisma.webhook.findMany({
    where: {
      isActive: true,
      events: {
        hasSome: events,
      },
    },
    include: { tenant: true },
  });
}
