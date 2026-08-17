import { X } from "lucide-react";
import { useState } from "react";

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Loading"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function ErrorBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss?: () => void;
}) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <div
      role="alert"
      className="animate-fade-in flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400"
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          onClick={handleDismiss}
          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function SuccessBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss?: () => void;
}) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <div
      role="alert"
      className="animate-fade-in flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 shadow-sm dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-400"
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          onClick={handleDismiss}
          className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-slate-700">
      {Icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <Icon className="h-8 w-8 text-slate-400 dark:text-slate-500" />
        </div>
      )}
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
        {description && (
          <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function PageSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  );
}

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="h-12 w-12 text-white" />
        <p className="text-sm font-medium text-white">Please wait...</p>
      </div>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 ${className}`}
    />
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
