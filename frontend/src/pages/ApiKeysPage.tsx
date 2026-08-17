import { useState, useEffect } from "react";
import { Copy, Eye, EyeOff, Trash2, Shield, AlertCircle } from "lucide-react";
import { listApiKeys, createApiKey, revokeApiKey, deleteApiKey } from "@/lib/api-keys";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorBanner, PageSpinner, SuccessBanner } from "@/components/ui/Feedback";
import type { ApiKey, CreateApiKeyResponse } from "@/lib/types";

export function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyExpiry, setNewKeyExpiry] = useState("");
  const [newKey, setNewKey] = useState<CreateApiKeyResponse | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleKeyId, setVisibleKeyId] = useState<string | null>(null);

  useEffect(() => {
    loadApiKeys();
  }, []);

  async function loadApiKeys() {
    try {
      setError(null);
      const result = await listApiKeys(1, 50);
      setApiKeys(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load API keys");
    }
  }

  async function handleCreateKey() {
    if (!newKeyName.trim()) {
      setError("Key name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const created = await createApiKey({
        name: newKeyName,
        expiresAt: newKeyExpiry || undefined,
      });
      setNewKey(created);
      setNewKeyName("");
      setNewKeyExpiry("");
      setShowCreateForm(false);
      await loadApiKeys();
      setSuccess(`API key "${created.name}" created successfully`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create API key");
    } finally {
      setLoading(false);
    }
  }

  async function handleRevokeKey(id: string, name: string) {
    if (!confirm(`Revoke API key "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError(null);
      await revokeApiKey(id);
      setApiKeys((prev) => prev?.map((k) => (k.id === id ? { ...k, isActive: false } : k)) || null);
      setSuccess(`API key "${name}" revoked`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke API key");
    }
  }

  async function handleDeleteKey(id: string, name: string) {
    if (!confirm(`Delete API key "${name}" permanently?`)) {
      return;
    }

    try {
      setError(null);
      await deleteApiKey(id);
      setApiKeys((prev) => prev?.filter((k) => k.id !== id) || null);
      setSuccess(`API key "${name}" deleted`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete API key");
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minExpiryDate = tomorrow.toISOString().split("T")[0];

  if (apiKeys === null && !error) return <PageSpinner />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">API Keys</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage programmatic access to your account</p>
        </div>
        {!showCreateForm && (
          <Button onClick={() => setShowCreateForm(true)}>Create API Key</Button>
        )}
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      {success && <SuccessBanner message={success} onDismiss={() => setSuccess(null)} />}

      {newKey && (
        <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardHeader title="API Key Created" subtitle="Save this key securely — you won't see it again" />
          <div className="space-y-4 px-5 pb-5">
            <div className="rounded bg-white p-3 font-mono text-sm text-slate-900 dark:bg-slate-900 dark:text-slate-100">
              <div className="flex items-center justify-between gap-2">
                <code>{newKey.key}</code>
                <button
                  onClick={() => copyToClipboard(newKey.key, "full-key")}
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  <Copy className="h-4 w-4" />
                  {copiedId === "full-key" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Expiration</label>
              <p className="mt-1 text-sm">
                {newKey.expiresAt ? new Date(newKey.expiresAt).toLocaleDateString() : "Never"}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setNewKey(null)}
              className="w-full"
            >
              Done
            </Button>
          </div>
        </Card>
      )}

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader title="Create New API Key" />
          <div className="space-y-4 px-5 pb-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Key Name</label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Production API Key"
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Expires (Optional)</label>
              <input
                type="date"
                value={newKeyExpiry}
                onChange={(e) => setNewKeyExpiry(e.target.value)}
                min={minExpiryDate}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreateKey} disabled={loading}>
                {loading ? "Creating..." : "Create"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewKeyName("");
                  setNewKeyExpiry("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {apiKeys && apiKeys.length === 0 ? (
        <EmptyState
          title="No API keys yet"
          description="Create your first API key to enable programmatic access to your account"
          action={
            <Button onClick={() => setShowCreateForm(true)}>Create API Key</Button>
          }
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Key</th>
                  <th className="px-5 py-3 font-medium">Expires</th>
                  <th className="px-5 py-3 font-medium">Last Used</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys?.map((key) => (
                  <tr
                    key={key.id}
                    className={`border-b border-slate-50 last:border-0 dark:border-slate-800/60 ${
                      !key.isActive ? "opacity-50" : ""
                    }`}
                  >
                    <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">{key.name}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {visibleKeyId === key.id ? key.keyPreview.replace("...", "") : key.keyPreview}
                        </code>
                        <button
                          onClick={() => copyToClipboard(key.keyPreview, key.id)}
                          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                      {key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                      {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${
                          key.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        }`}
                      >
                        <Shield className="h-3 w-3" />
                        {key.isActive ? "Active" : "Revoked"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {key.isActive ? (
                        <button
                          onClick={() => handleRevokeKey(key.id, key.name)}
                          className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDeleteKey(key.id, key.name)}
                          className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="inline h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card className="mt-6 bg-blue-50 dark:bg-blue-950">
        <CardHeader title="Using API Keys" subtitle="How to authenticate with your API" />
        <div className="space-y-3 px-5 pb-5 text-sm text-slate-700 dark:text-slate-300">
          <p>Add your API key to request headers:</p>
          <code className="block rounded bg-slate-900 p-3 font-mono text-slate-100">
            {`curl -H "Authorization: Bearer sk_live_..." https://api.widget-platform.local/api/...`}
          </code>
          <p className="mt-3">Or in your code:</p>
          <code className="block rounded bg-slate-900 p-3 font-mono text-slate-100">
            {`Authorization: Bearer <your-api-key>`}
          </code>
        </div>
      </Card>
    </div>
  );
}
