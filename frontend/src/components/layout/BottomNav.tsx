import { NavLink, useLocation } from "react-router";
import { cn } from "../../lib/utils";
import { NavGroup } from "../../constants/navigation";
import { MoreHorizontal } from "lucide-react";
import { useSidebarStore } from "../../store/sidebar.store";

interface BottomNavProps {
  groups: NavGroup[];
}

export function BottomNav({ groups }: BottomNavProps) {
  const { setMobileDrawerOpen } = useSidebarStore();
  const location = useLocation();

  // Extract the top 4 most important primary links across all groups
  const primaryLinks = groups
    .flatMap(g => g.items)
    .filter(item => !['Settings', 'Reports', 'Branding'].includes(item.name))
    .slice(0, 4);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[64px] pb-safe bg-surface/90 backdrop-blur-md border-t border-subtle flex items-center justify-around z-40">
      {primaryLinks.map((item) => {
        const isActive = location.pathname.startsWith(item.href) && 
                         (!["/super-admin", "/admin", "/member"].includes(item.href) || location.pathname === item.href);

        return (
          <NavLink
            key={item.name}
            to={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 touch-target-icon transition-colors",
              isActive ? "text-primary" : "text-muted hover:text-primary"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">{item.name}</span>
          </NavLink>
        );
      })}
      
      {/* "More" button triggers the slide-out drawer for remaining links */}
      <button 
        onClick={() => setMobileDrawerOpen(true)}
        className="flex flex-col items-center justify-center w-full h-full space-y-1 touch-target-icon text-muted hover:text-primary transition-colors"
      >
        <MoreHorizontal className="w-5 h-5" />
        <span className="text-[10px] font-medium tracking-tight">More</span>
      </button>
    </nav>
  );
}
