import { prisma } from "@/lib/prisma";

interface CreateSubmissionRecord {
  widgetId: string;
  tenantId: string;
  data: Record<string, string>;
  ip: string;
  country?: string | null;
  city?: string | null;
}

export function createSubmission(record: CreateSubmissionRecord) {
  return prisma.submission.create({
    data: {
      widgetId: record.widgetId,
      tenantId: record.tenantId,
      data: record.data,
      ip: record.ip,
      country: record.country ?? null,
      city: record.city ?? null,
    },
  });
}
