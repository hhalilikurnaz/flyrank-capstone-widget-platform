import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";

export function NotFoundPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-950">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500">
        <Sparkles className="h-6 w-6 text-white" strokeWidth={2.5} />
      </span>
      <p className="mt-6 text-6xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">404</p>
      <h1 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <div className="mt-6 flex gap-3">
        <Link to={isAuthenticated ? "/dashboard" : "/"}>
          <Button>{isAuthenticated ? "Go to dashboard" : "Go home"}</Button>
        </Link>
        {!isAuthenticated && (
          <Link to="/login">
            <Button variant="secondary">Sign in</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
