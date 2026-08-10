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

/**
 * Sends the password reset link. Callers MUST wrap this in try/catch (or
 * await notifyPasswordResetSafely below) — a dead SMTP server must never
 * turn an already-issued reset token into a failed request, since that
 * would also leak whether the email exists via a differing error response.
 */
export async function notifyPasswordReset(tenantEmail: string, resetUrl: string) {
  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: tenantEmail,
    subject: "Reset your Widget Platform password",
    text: `We received a request to reset your password. This link expires in 1 hour:\n\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`,
  });
}

export async function notifyPasswordResetSafely(tenantEmail: string, resetUrl: string) {
  try {
    await notifyPasswordReset(tenantEmail, resetUrl);
  } catch (err) {
    logger.warn("Password reset email failed to send", { error: (err as Error)?.message });
  }
}
