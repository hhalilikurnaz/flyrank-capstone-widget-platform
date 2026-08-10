import { Link, NavLink, Outlet } from "react-router-dom";
import { Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navItems = [
  { to: "/dashboard", label: "Dashboard", end: true },
  { to: "/widgets", label: "Widgets", end: false },
  { to: "/submissions", label: "Submissions", end: false },
  { to: "/templates", label: "Templates", end: false },
];

export function Layout() {
  const { tenant, logout } = useAuth();

  return (
    <div className="flex min-h-full">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between px-5 py-5">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Widget Platform</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Lead capture dashboard</p>
          </div>
          <ThemeToggle className="text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" />
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">{tenant?.name}</p>
              <p className="truncate text-xs text-slate-400 dark:text-slate-500">{tenant?.email}</p>
            </div>
            <Link
              to="/settings"
              aria-label="Settings"
              title="Settings"
              className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <Settings className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
          <button
            onClick={logout}
            className="mt-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-slate-50 px-8 py-8 dark:bg-slate-950">
        <Outlet />
      </main>
    </div>
  );
}
