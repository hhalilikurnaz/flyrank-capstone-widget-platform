import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { ErrorBanner } from "@/components/ui/Feedback";

export function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/api/auth/forgot-password", { email }, { auth: false });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t.auth.brand}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {sent ? t.auth.forgotPassword.successTitle : t.auth.forgotPassword.subtitle}
          </p>
        </div>

        {sent ? (
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-400">{t.auth.forgotPassword.successMessage}</p>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            {error && <ErrorBanner message={error} />}
            <div>
              <Label htmlFor="email">{t.auth.forgotPassword.email}</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? t.auth.forgotPassword.submitting : t.auth.forgotPassword.submit}
            </Button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            {t.auth.forgotPassword.backToLogin}
          </Link>
        </p>
      </div>
    </div>
  );
}
