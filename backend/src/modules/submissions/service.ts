import { AppError } from "@/lib/errors";
import { findActiveWidgetById } from "@/modules/widgets/repository";
import type { WidgetField } from "@/modules/widgets/schema";
import * as submissionRepository from "./repository";
import type { CreateSubmissionInput } from "./schema";

function validateAgainstWidgetFields(fields: WidgetField[], data: Record<string, string>) {
  const allowedNames = new Set(fields.map((f) => f.name));
  const unknown = Object.keys(data).filter((key) => !allowedNames.has(key));
  if (unknown.length > 0) {
    throw AppError.badRequest("Submission contains unknown fields", { unknown });
  }

  const missing = fields
    .filter((field) => field.required)
    .filter((field) => !data[field.name] || data[field.name]!.trim().length === 0)
    .map((field) => field.name);
  if (missing.length > 0) {
    throw AppError.badRequest("Missing required fields", { missing });
  }
}

export async function submitToWidget(input: CreateSubmissionInput, ip: string) {
  const widget = await findActiveWidgetById(input.widgetId);
  if (!widget) {
    throw AppError.notFound("Widget not found or inactive");
  }

  validateAgainstWidgetFields(widget.fields as unknown as WidgetField[], input.data);

  const submission = await submissionRepository.createSubmission({
    widgetId: widget.id,
    tenantId: widget.tenantId,
    data: input.data,
    ip,
  });

  return submission;
}
