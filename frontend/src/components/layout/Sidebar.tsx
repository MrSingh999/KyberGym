import { NavLink, useLocation } from "react-router";
import { cn } from "../../lib/utils";
import { useSidebarStore } from "../../store/sidebar.store";
import { NavGroup } from "../../constants/navigation";
import { ChevronLeft, ChevronRight, X, Dumbbell } from "lucide-react";
import { Sheet, SheetContent } from "../ui/sheet";

interface SidebarProps {
  groups: NavGroup[];
  role: "superadmin" | "owner" | "member";
}

export function Sidebar({ groups, role }: SidebarProps) {
  const { isCollapsed: sidebarCollapsed, toggleSidebar, isMobileDrawerOpen: mobileDrawerOpen, setMobileDrawerOpen } = useSidebarStore();
  const location = useLocation();

  const brandName = 
    role === "superadmin" ? (
      <span>HEAVEN'S <span className="text-text-secondary font-normal">SUPER</span></span>
    ) : role === "owner" ? (
      <span>HEAVEN'S <span className="text-text-secondary font-normal">ARENA</span></span>
    ) : (
      <span>MEMBER <span className="text-text-secondary font-normal">PORTAL</span></span>
    );

  const renderNavItems = (groups: NavGroup[]) => (
    <div className="flex-1 overflow-y-auto py-4 space-y-5 custom-scrollbar">
      {groups.map((group, index) => (
        <div key={index} className="px-3">
          {!sidebarCollapsed && (
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.12em] mb-2 px-3">
              {group.title}
            </h4>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const isActive = location.pathname.startsWith(item.href) && 
                               (!["/super-admin", "/admin", "/member"].includes(item.href) || location.pathname === item.href);
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-1.5 rounded-[4px] text-sm font-medium transition-all duration-150 relative group cursor-pointer border press-effect",
                    isActive 
                      ? "bg-surface border-border-default text-text-primary font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-none" 
                      : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover/50"
                  )}
                >
                  {isActive && !sidebarCollapsed && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-text-primary rounded-full" />
                  )}
                  <item.icon className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-text-primary" : "text-text-muted group-hover:text-text-primary transition-colors duration-150")} />
                  
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col h-screen border-r border-border-default bg-canvas transition-all duration-300 relative z-20",
          sidebarCollapsed ? "w-[64px]" : "w-[240px]"
        )}
      >
        <div className="h-14 flex items-center border-b border-border-default px-4 justify-between relative">
          <div className={cn("font-bold text-sm tracking-tight text-text-primary truncate transition-opacity flex items-center gap-2", sidebarCollapsed ? "opacity-0 w-0" : "opacity-100")}>
            <Dumbbell className="w-4 h-4 shrink-0" />
            {brandName}
          </div>
          <button 
            onClick={toggleSidebar}
            className="absolute -right-3 top-4 bg-surface border border-border-default rounded-[6px] p-1 text-text-muted hover:text-text-primary hover:bg-surface-hover shadow-xs z-50 transition-all"
          >
            {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>
        {renderNavItems(groups)}
      </aside>

      {/* Mobile Drawer */}
      <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
        <SheetContent
          side="left"
          className="w-[240px] p-0 bg-canvas border-r border-border-default flex flex-col gap-0"
          showCloseButton={false}
        >
          <div className="h-14 flex items-center justify-between border-b border-border-default px-4">
            <div className="font-bold text-sm tracking-tight text-text-primary flex items-center gap-2">
              <Dumbbell className="w-4 h-4 shrink-0" />
              {brandName}
            </div>
            <button onClick={() => setMobileDrawerOpen(false)} className="p-2 text-text-muted hover:text-text-primary">
              <X className="w-4" />
            </button>
          </div>
          {renderNavItems(groups)}
        </SheetContent>
      </Sheet>
    </>
  );
}
