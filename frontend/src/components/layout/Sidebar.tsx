import { NavLink, useLocation } from "react-router";
import { cn } from "../../lib/utils";
import { useUIStore } from "../../store/ui";
import { NavGroup } from "../../constants/navigation";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";

interface SidebarProps {
  groups: NavGroup[];
  role: "superadmin" | "owner" | "member";
}

export function Sidebar({ groups, role }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebar, mobileDrawerOpen, setMobileDrawerOpen } = useUIStore();
  const location = useLocation();

  const brandName = role === "superadmin" ? "KyberGym Admin" : role === "owner" ? "KyberGym" : "My Gym Portal";

  const renderNavItems = (groups: NavGroup[]) => (
    <div className="flex-1 overflow-y-auto py-4 space-y-6">
      {groups.map((group, index) => (
        <div key={index} className="px-3">
          {!sidebarCollapsed && (
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 px-3">
              {group.title}
            </h4>
          )}
          <div className="space-y-1">
            {group.items.map((item) => {
              const isActive = location.pathname.startsWith(item.href) && 
                               (item.href !== "/dashboard" || location.pathname === "/dashboard");
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative group",
                    isActive 
                      ? "bg-surface-hover text-primary" 
                      : "text-secondary hover:bg-surface-hover hover:text-primary"
                  )}
                >
                  {/* Active Indicator Line */}
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r-full" />
                  )}
                  
                  <item.icon className={cn("w-5 h-5 shrink-0", sidebarCollapsed ? "mx-auto" : "mr-3", isActive ? "text-primary" : "text-muted group-hover:text-primary")} />
                  
                  {!sidebarCollapsed && <span>{item.name}</span>}
                  
                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-elevated border border-default text-primary text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-elevated">
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
          "hidden lg:flex flex-col h-screen border-r border-subtle bg-surface transition-all duration-300 relative z-20",
          sidebarCollapsed ? "w-[80px]" : "w-[260px]"
        )}
      >
        <div className="h-16 flex items-center border-b border-subtle px-4">
          <div className={cn("font-heading font-bold text-lg text-primary truncate transition-opacity", sidebarCollapsed ? "opacity-0 w-0" : "opacity-100")}>
            {brandName}
          </div>
          <button 
            onClick={toggleSidebar}
            className="absolute -right-3 top-5 bg-surface border border-default rounded-full p-1 text-muted hover:text-primary shadow-sm z-50"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
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
          "fixed inset-y-0 left-0 w-[260px] bg-surface border-r border-default z-50 lg:hidden flex flex-col transform transition-transform duration-300",
          mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center justify-between border-b border-subtle px-4">
          <div className="font-heading font-bold text-lg text-primary">{brandName}</div>
          <button onClick={() => setMobileDrawerOpen(false)} className="p-2 text-muted hover:text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>
        {renderNavItems(groups)}
      </aside>
    </>
  );
}
