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
    <div className="lg:hidden fixed bottom-2 left-0 right-0 px-3 pb-safe z-40 pointer-events-none flex justify-center">
      <nav aria-label="Mobile Navigation" className="pointer-events-auto w-full max-w-md h-[58px] bg-canvas/90 backdrop-blur-xl border border-border-default/80 shadow-elevated rounded-2xl flex items-center justify-around px-2 relative transition-all">
        {primaryLinks.map((item) => {
          const isActive = location.pathname.startsWith(item.href) && 
                           (!["/super-admin", "/admin", "/member"].includes(item.href) || location.pathname === item.href);

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] gap-1 transition-all rounded-xl relative group active:scale-95 cursor-pointer",
                isActive 
                  ? "text-text-primary font-bold" 
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              {isActive && (
                <span className="absolute top-1 w-6 h-0.5 bg-primary rounded-full shadow-xs" />
              )}
              <item.icon className={cn(
                "size-5 transition-transform duration-150", 
                isActive ? "scale-110 text-text-primary" : "text-text-muted group-hover:text-text-primary"
              )} />
              <span className="text-[10px] font-medium tracking-tight truncate max-w-[64px]">{item.name}</span>
            </NavLink>
          );
        })}
        
        {/* "More" button triggers the slide-out drawer for remaining links */}
        <button 
          onClick={() => setMobileDrawerOpen(true)}
          className="flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] gap-1 transition-all rounded-xl text-text-muted hover:text-text-primary active:scale-95 cursor-pointer"
          aria-label="Open full menu"
        >
          <MoreHorizontal className="size-5" />
          <span className="text-[10px] font-medium tracking-tight">More</span>
        </button>
      </nav>
    </div>
  );
}

