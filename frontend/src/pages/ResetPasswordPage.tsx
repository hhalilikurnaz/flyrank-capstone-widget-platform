import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { api, ApiError } from "@/lib/api";
import type { Tenant } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { ErrorBanner } from "@/components/ui/Feedback";

export function ResetPasswordPage() {
  const { t } = useLanguage();
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const linkIsValid = Boolean(email && token);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.post<{ tenant: Tenant; token: string }>(
        "/api/auth/reset-password",
        { email, token, newPassword },
        { auth: false },
      );
      setSession(res.tenant, res.token);
      navigate("/dashboard");
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
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.auth.resetPassword.subtitle}</p>
        </div>

        {!linkIsValid ? (
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <ErrorBanner message={t.auth.resetPassword.invalidLink} />
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            {error && <ErrorBanner message={error} />}
            <div>
              <Label htmlFor="newPassword">{t.auth.resetPassword.newPassword}</Label>
              <Input
                id="newPassword"
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{t.auth.resetPassword.passwordHint}</p>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? t.auth.resetPassword.submitting : t.auth.resetPassword.submit}
            </Button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            {t.auth.resetPassword.backToLogin}
          </Link>
        </p>
      </div>
    </div>
  );
}
