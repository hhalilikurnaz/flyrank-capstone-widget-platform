import { SubmissionsTable } from "@/components/SubmissionsTable";

export function SubmissionsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Submissions</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Leads collected across all your widgets.</p>
      <div className="mt-6">
        <SubmissionsTable />
      </div>
    </div>
  );
}
