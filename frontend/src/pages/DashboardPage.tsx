import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "@/lib/api";
import type { DashboardStats, DeviceBreakdownEntry, GeoBreakdownEntry, Submission } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState, ErrorBanner, PageSpinner } from "@/components/ui/Feedback";
import { Button } from "@/components/ui/Button";
import { StatTile } from "@/components/charts/StatTile";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { BarList } from "@/components/charts/BarList";
import { DeviceDonut } from "@/components/charts/DeviceDonut";

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [geo, setGeo] = useState<GeoBreakdownEntry[] | null>(null);
  const [devices, setDevices] = useState<DeviceBreakdownEntry[] | null>(null);
  const [submissions, setSubmissions] = useState<Submission[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<DashboardStats>("/api/dashboard/stats"),
      api.get<{ breakdown: GeoBreakdownEntry[] }>("/api/dashboard/geo-breakdown"),
      api.get<{ breakdown: DeviceBreakdownEntry[] }>("/api/dashboard/device-breakdown"),
      api.get<{ items: Submission[] }>("/api/dashboard/submissions?pageSize=8"),
    ])
      .then(([statsRes, geoRes, deviceRes, subsRes]) => {
        setStats(statsRes);
        setGeo(geoRes.breakdown);
        setDevices(deviceRes.breakdown);
        setSubmissions(subsRes.items);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load dashboard"));
  }, []);

  if (error) return <ErrorBanner message={error} />;
  if (!stats || !geo || !devices || !submissions) return <PageSpinner />;

  if (stats.totalWidgets === 0) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <div className="mt-6">
          <EmptyState
            title="No widgets yet"
            description="Create a widget to start collecting submissions — analytics will show up here once visitors start submitting."
            action={
              <Link to="/widgets/new">
                <Button>New widget</Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">How your widgets are performing.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile label="Impressions" value={stats.totalImpressions} />
        <StatTile label="Submissions" value={stats.totalSubmissions} />
        <StatTile label="Conversion rate" value={stats.conversionRate * 100} format={(n) => `${n.toFixed(1)}%`} />
        <StatTile label="Last 24 hours" value={stats.submissionsLast24h} />
        <StatTile label="Active widgets" value={stats.totalWidgets} />
      </div>

      <Card className="mt-6">
        <CardHeader title="Submissions over time" subtitle="Last 30 days" />
        <div className="p-5">
          <TimeSeriesChart data={stats.timeSeries} />
        </div>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Widget performance" subtitle="Impressions, submissions, and conversion rate per widget" />
        {stats.submissionsPerWidget.length === 0 ? (
          <div className="p-5">
            <p className="text-sm text-slate-400">No activity yet.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Widget</th>
                <th className="px-5 py-3 font-medium text-right">Impressions</th>
                <th className="px-5 py-3 font-medium text-right">Submissions</th>
                <th className="px-5 py-3 font-medium text-right">Conv. rate</th>
              </tr>
            </thead>
            <tbody>
              {stats.submissionsPerWidget.map((w) => (
                <tr key={w.widgetId} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3 font-medium text-slate-900">{w.title}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-slate-600">{w.impressions}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-slate-600">{w.submissions}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-slate-900">{(w.conversionRate * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Geo breakdown" subtitle="By country, from IP enrichment" />
          <div className="p-5">
            <BarList items={geo.map((g) => ({ label: g.country, value: g.count }))} emptyLabel="No geo data yet" />
          </div>
        </Card>
        <Card>
          <CardHeader title="Device breakdown" subtitle="From widget config requests" />
          <div className="p-5">
            <DeviceDonut data={devices} emptyLabel="No views yet" />
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Recent submissions" />
        {submissions.length === 0 ? (
          <div className="p-5">
            <p className="text-sm text-slate-400">No submissions yet.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Widget</th>
                <th className="px-5 py-3 font-medium">Data</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3 text-slate-900">{s.widgetTitle}</td>
                  <td className="max-w-xs truncate px-5 py-3 text-slate-600">
                    {Object.values(s.data).join(", ")}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{s.country ? `${s.city ?? ""} ${s.country}`.trim() : "—"}</td>
                  <td className="px-5 py-3 text-slate-500">{new Date(s.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
