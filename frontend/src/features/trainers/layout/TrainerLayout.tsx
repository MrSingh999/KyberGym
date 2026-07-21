import { Outlet, NavLink } from "react-router";
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Dumbbell,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/trainer/dashboard", icon: LayoutDashboard },
  { name: "My Members", href: "/trainer/members", icon: Users },
  { name: "My Profile", href: "/trainer/profile", icon: UserCircle },
];

export function TrainerLayout() {
  const { user, logout } = useAuthStore();

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border-default hidden lg:flex flex-col">
        <div className="p-5 border-b border-border-default">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Trainer Portal</p>
              <p className="text-[10px] text-text-muted font-mono">{user?.name}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-mono transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border-default">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-muted hover:text-destructive hover:bg-destructive/10 transition-colors w-full cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-surface border-b border-border-default px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-text-primary">Trainer Portal</span>
          </div>
          <button onClick={logout} className="p-2 text-text-muted hover:text-destructive cursor-pointer">
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border-default flex justify-around py-2 z-50">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-mono transition-colors ${
                  isActive ? "text-primary" : "text-text-muted"
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1 pb-16 lg:pb-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
