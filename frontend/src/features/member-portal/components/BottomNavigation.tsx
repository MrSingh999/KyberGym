import { NavLink } from "react-router";

export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: "Home", path: "/member", icon: "🏠" },
  { label: "Workout", path: "/member/workout", icon: "💪" },
  { label: "Attendance", path: "/member/attendance", icon: "📅" },
  { label: "Profile", path: "/member/profile", icon: "👤" },
];

export function BottomNavigation() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background-paper border-t border-border-default md:hidden"
      aria-label="Member Bottom Navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/member"}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-3 py-1 text-xs transition-colors ${
                isActive
                  ? "text-brand-500 font-semibold"
                  : "text-text-secondary hover:text-text-primary"
              }`
            }
          >
            <span className="text-lg leading-none mb-1">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
