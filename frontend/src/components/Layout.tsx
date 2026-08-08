import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/widgets", label: "Widgets", end: false },
];

export function Layout() {
  const { tenant, logout } = useAuth();

  return (
    <div className="flex min-h-full">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="px-5 py-5">
          <p className="text-sm font-semibold text-slate-900">Widget Platform</p>
          <p className="text-xs text-slate-500">Lead-capture dashboard</p>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-slate-100 px-5 py-4">
          <p className="truncate text-xs font-medium text-slate-700">{tenant?.name}</p>
          <p className="truncate text-xs text-slate-400">{tenant?.email}</p>
          <button onClick={logout} className="mt-2 text-xs font-medium text-slate-500 hover:text-slate-800">
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-slate-50 px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
