import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { transporter } from "./mailer";

/**
 * Notifies the widget owner that a new submission arrived. Callers MUST
 * wrap this in try/catch (or await notifySubmissionSafely below) — a dead
 * SMTP server must never turn a stored submission into a failed request.
 */
export async function notifyNewSubmission(tenantEmail: string, widgetTitle: string, submissionId: string) {
  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: tenantEmail,
    subject: `New submission on "${widgetTitle}"`,
    text: `You just received a new submission (id: ${submissionId}). View it in your dashboard.`,
  });
}

export async function notifySubmissionSafely(tenantEmail: string, widgetTitle: string, submissionId: string) {
  try {
    await notifyNewSubmission(tenantEmail, widgetTitle, submissionId);
  } catch (err) {
    logger.warn("Confirmation notification failed; submission was already stored", {
      submissionId,
      error: (err as Error)?.message,
    });
  }
}
