import { NavLink, useLocation } from "react-router";
import { cn } from "../../lib/utils";
import { useSidebarStore } from "../../store/sidebar.store";
import { NavGroup } from "../../constants/navigation";
import { ChevronLeft, ChevronRight, X, Dumbbell } from "lucide-react";

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
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 px-3 font-mono">
              {group.title}
            </h4>
          )}
          <div className="space-y-1">
            {group.items.map((item) => {
              const isActive = location.pathname.startsWith(item.href) && 
                               (!["/super-admin", "/admin", "/member"].includes(item.href) || location.pathname === item.href);
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-[6px] text-xs font-mono uppercase tracking-wider transition-all relative group cursor-pointer border border-transparent",
                    isActive 
                      ? "bg-surface border-border-default text-text-primary shadow-sm" 
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-hover/50"
                  )}
                >
                  <item.icon className={cn("w-4 h-4 shrink-0", sidebarCollapsed ? "mx-auto" : "mr-2.5", isActive ? "text-text-primary" : "text-text-muted group-hover:text-text-primary")} />
                  
                  {!sidebarCollapsed && <span>{item.name}</span>}
                  
                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-surface border border-border-default text-text-primary text-[10px] font-mono rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-elevated">
                      {item.name}
                    </div>
                  )}
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
            <Dumbbell className="w-4 h-4 text-text-primary shrink-0" />
            {brandName}
          </div>
          <button 
            onClick={toggleSidebar}
            className="absolute -right-3 top-4 bg-surface border border-border-default rounded-full p-1 text-text-muted hover:text-text-primary shadow-sm z-50 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>
        {renderNavItems(groups)}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-[240px] bg-canvas border-r border-border-default z-50 lg:hidden flex flex-col transform transition-transform duration-300",
          mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-14 flex items-center justify-between border-b border-border-default px-4">
          <div className="font-bold text-sm text-text-primary flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-text-primary shrink-0" />
            {brandName}
          </div>
          <button onClick={() => setMobileDrawerOpen(false)} className="p-2 text-text-muted hover:text-text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>
        {renderNavItems(groups)}
      </aside>
    </>
  );
}
