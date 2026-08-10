import { useState, type FormEvent } from "react";
import { KeyRound, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import type { Tenant } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/Feedback";

export function SettingsPage() {
  const { tenant, updateTenant } = useAuth();

  const [name, setName] = useState(tenant?.name ?? "");
  const [email, setEmail] = useState(tenant?.email ?? "");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  async function onSaveProfile(e: FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setProfileSaving(true);
    setProfileSaved(false);
    try {
      const res = await api.patch<{ tenant: Tenant }>("/api/auth/me", { name, email });
      updateTenant(res.tenant);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  }

  async function onChangePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSaving(true);
    setPasswordSaved(false);
    try {
      await api.post("/api/auth/change-password", { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 2000);
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : "Failed to change password");
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Settings</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your account profile and password.</p>

      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader icon={User} title="Profile" subtitle="Your organization name and email." />
          <form onSubmit={onSaveProfile} className="space-y-4 p-5">
            {profileError && <ErrorBanner message={profileError} />}
            <div>
              <Label htmlFor="settings-name">Name</Label>
              <Input id="settings-name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="settings-email">Email</Label>
              <Input id="settings-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="flex items-center justify-end gap-3">
              {profileSaved && <span className="text-sm text-emerald-600 dark:text-emerald-400">Saved</span>}
              <Button type="submit" disabled={profileSaving}>
                {profileSaving ? "Saving..." : "Save profile"}
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader icon={KeyRound} title="Password" subtitle="Change your account password." />
          <form onSubmit={onChangePassword} className="space-y-4 p-5">
            {passwordError && <ErrorBanner message={passwordError} />}
            <div>
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div>
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">At least 8 characters.</p>
            </div>
            <div className="flex items-center justify-end gap-3">
              {passwordSaved && <span className="text-sm text-emerald-600 dark:text-emerald-400">Changed</span>}
              <Button type="submit" disabled={passwordSaving}>
                {passwordSaving ? "Changing..." : "Change password"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
