import { useState, useEffect } from "react";
import { Trash2, TestTube, CheckCircle, AlertCircle, Clock } from "lucide-react";
import {
  listWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  testWebhook,
  listWebhookLogs,
  WEBHOOK_EVENTS,
} from "@/lib/webhooks";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorBanner, PageSpinner, SuccessBanner } from "@/components/ui/Feedback";
import type { Webhook } from "@/lib/types";

export function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newEvents, setNewEvents] = useState<string[]>(["submission.created"]);
  const [creating, setCreating] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<string | null>(null);

  useEffect(() => {
    loadWebhooks();
  }, []);

  async function loadWebhooks() {
    try {
      setError(null);
      const result = await listWebhooks(1, 50);
      setWebhooks(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load webhooks");
    }
  }

  async function handleCreateWebhook() {
    if (!newUrl.trim()) {
      setError("Webhook URL is required");
      return;
    }

    if (newEvents.length === 0) {
      setError("Select at least one event");
      return;
    }

    try {
      setCreating(true);
      setError(null);
      await createWebhook({
        url: newUrl,
        events: newEvents,
      });
      setNewUrl("");
      setNewEvents(["submission.created"]);
      setShowCreateForm(false);
      await loadWebhooks();
      setSuccess("Webhook created successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create webhook");
    } finally {
      setCreating(false);
    }
  }

  async function handleTestWebhook(id: string) {
    try {
      setTesting(id);
      setError(null);
      const result = await testWebhook(id);
      setSuccess(`Webhook test successful (${result.statusCode})`);
      await loadWebhooks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Webhook test failed");
    } finally {
      setTesting(null);
    }
  }

  async function handleDeleteWebhook(id: string, url: string) {
    if (!confirm(`Delete webhook for ${url}?`)) {
      return;
    }

    try {
      setError(null);
      await deleteWebhook(id);
      setWebhooks((prev) => prev?.filter((w) => w.id !== id) || null);
      setSuccess("Webhook deleted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete webhook");
    }
  }

  if (webhooks === null && !error) return <PageSpinner />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Webhooks</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Send real-time notifications to external systems</p>
        </div>
        {!showCreateForm && (
          <Button onClick={() => setShowCreateForm(true)}>Add Webhook</Button>
        )}
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      {success && <SuccessBanner message={success} onDismiss={() => setSuccess(null)} />}

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader title="Add New Webhook" />
          <div className="space-y-4 px-5 pb-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Webhook URL</label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://your-server.com/webhook"
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Events</label>
              <div className="mt-2 space-y-2">
                {WEBHOOK_EVENTS.map((event) => (
                  <label key={event.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newEvents.includes(event.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewEvents([...newEvents, event.value]);
                        } else {
                          setNewEvents(newEvents.filter((v) => v !== event.value));
                        }
                      }}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{event.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreateWebhook} disabled={creating}>
                {creating ? "Creating..." : "Create Webhook"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewUrl("");
                  setNewEvents(["submission.created"]);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {webhooks && webhooks.length === 0 ? (
        <EmptyState
          title="No webhooks yet"
          description="Create a webhook to receive real-time notifications about submissions"
          action={
            <Button onClick={() => setShowCreateForm(true)}>Add Webhook</Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {webhooks?.map((webhook) => (
            <Card key={webhook.id}>
              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 break-all">{webhook.url}</p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      Created {new Date(webhook.createdAt).toLocaleDateString()}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {webhook.events.map((event) => (
                        <span
                          key={event}
                          className="inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200"
                        >
                          {WEBHOOK_EVENTS.find((e) => e.value === event)?.label || event}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleTestWebhook(webhook.id)}
                      disabled={testing === webhook.id}
                    >
                      <TestTube className="h-3.5 w-3.5" />
                      {testing === webhook.id ? "Testing..." : "Test"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDeleteWebhook(webhook.id, webhook.url)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {expandedLogs === webhook.id && (
                  <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Recent Deliveries</p>
                    <div className="space-y-1 text-xs">
                      <p className="text-slate-600 dark:text-slate-400">Loading delivery history...</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setExpandedLogs(expandedLogs === webhook.id ? null : webhook.id)}
                  className="mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  {expandedLogs === webhook.id ? "Hide logs" : "View logs"}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-6 bg-blue-50 dark:bg-blue-950">
        <CardHeader title="Webhook Security" subtitle="How to verify webhook authenticity" />
        <div className="space-y-3 px-5 pb-5 text-sm text-slate-700 dark:text-slate-300">
          <p>Each webhook includes a signature header for verification:</p>
          <code className="block rounded bg-slate-900 p-3 font-mono text-slate-100 text-xs break-words">
            X-Webhook-Signature: sha256=...
          </code>
          <p>Verify using your webhook secret (provided at creation):</p>
          <code className="block rounded bg-slate-900 p-3 font-mono text-slate-100 text-xs">
            {`const crypto = require('crypto');
const signature = req.headers['x-webhook-signature'];
const computed = crypto
  .createHmac('sha256', secret)
  .update(body)
  .digest('hex');
const valid = computed === signature;`}
          </code>
        </div>
      </Card>
    </div>
  );
}
