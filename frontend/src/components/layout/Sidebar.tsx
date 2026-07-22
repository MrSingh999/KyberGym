import { NavLink, useLocation } from "react-router";
import { cn } from "../../lib/utils";
import { useSidebarStore } from "../../store/sidebar.store";
import { useAuthStore } from "../../store/auth.store";
import { NavGroup } from "../../constants/navigation";
import { ChevronLeft, ChevronRight, X, Dumbbell, Sparkles, Shield, User } from "lucide-react";
import { Sheet, SheetContent } from "../ui/sheet";

interface SidebarProps {
  groups: NavGroup[];
  role: "superadmin" | "owner" | "member";
}

export function Sidebar({ groups, role }: SidebarProps) {
  const { isCollapsed: sidebarCollapsed, toggleSidebar, isMobileDrawerOpen: mobileDrawerOpen, setMobileDrawerOpen } = useSidebarStore();
  const { user } = useAuthStore();
  const location = useLocation();

  const brandTitle = 
    role === "superadmin" ? "HEAVEN'S SUPER" :
    role === "owner" ? "HEAVEN'S ARENA" : "MEMBER PORTAL";

  const roleSubtitle = 
    role === "superadmin" ? "Super Admin" :
    role === "owner" ? "Gym Management" : "Member Workspace";

  const renderNavItems = (isMobile = false) => (
    <div className="flex-1 overflow-y-auto py-3 space-y-4 custom-scrollbar">
      {groups.map((group, index) => (
        <div key={index} className="px-2.5">
          {(!sidebarCollapsed || isMobile) && (
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5 px-3">
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
                  title={sidebarCollapsed && !isMobile ? item.name : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 rounded-lg text-xs font-semibold transition-all duration-150 relative group cursor-pointer border",
                    isMobile ? "min-h-[44px]" : sidebarCollapsed ? "py-2.5 justify-center" : "py-2 justify-start",
                    isActive 
                      ? "bg-surface border-border-default text-text-primary shadow-2xs dark:shadow-none" 
                      : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover/70"
                  )}
                >
                  {isActive && (!sidebarCollapsed || isMobile) && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-r-full" />
                  )}
                  <item.icon className={cn(
                    "shrink-0 transition-all duration-150", 
                    isMobile ? "size-5" : "size-4",
                    isActive ? "text-text-primary scale-105" : "text-text-muted group-hover:text-text-primary"
                  )} />
                  
                  {(!sidebarCollapsed || isMobile) && (
                    <span className="truncate flex-1 tracking-tight">{item.name}</span>
                  )}

                  {isActive && sidebarCollapsed && !isMobile && (
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 size-1.5 bg-primary rounded-full" />
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
          "hidden lg:flex flex-col h-screen border-r border-border-default bg-canvas/95 backdrop-blur-lg transition-all duration-300 relative z-20 select-none",
          sidebarCollapsed ? "w-[64px]" : "w-[240px]"
        )}
      >
        {/* Header Branding */}
        <div className="h-[64px] flex items-center border-b border-border-default px-3.5 justify-between relative shrink-0">
          <div className={cn("font-bold text-sm tracking-tight text-text-primary truncate transition-opacity flex items-center gap-2.5", sidebarCollapsed ? "opacity-0 w-0" : "opacity-100")}>
            <div className="size-8 rounded-lg bg-action-bg text-action-text flex items-center justify-center shadow-xs shrink-0 ring-1 ring-border-default">
              <Dumbbell className="size-4" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold tracking-wide text-text-primary truncate">{brandTitle}</span>
              <span className="text-[10px] text-text-muted font-normal truncate">{roleSubtitle}</span>
            </div>
          </div>

          {sidebarCollapsed && (
            <div className="size-8 rounded-lg bg-action-bg text-action-text flex items-center justify-center shadow-xs mx-auto ring-1 ring-border-default">
              <Dumbbell className="size-4" />
            </div>
          )}

          <button 
            onClick={toggleSidebar}
            title={sidebarCollapsed ? "Expand Sidebar (⌘\\)" : "Collapse Sidebar (⌘\\)"}
            className="absolute -right-3 top-5 bg-surface border border-border-default rounded-full p-1 text-text-muted hover:text-text-primary hover:bg-surface-hover shadow-xs z-50 transition-all hover:scale-110 active:scale-95"
          >
            {sidebarCollapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
          </button>
        </div>

        {/* Navigation Items */}
        {renderNavItems(false)}

        {/* Footer Workspace / Plan Widget */}
        <div className="p-3 border-t border-border-default bg-surface/50 shrink-0">
          {!sidebarCollapsed ? (
            <div className="p-2.5 rounded-xl border border-border-default bg-canvas/80 shadow-2xs flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="size-4" />
              </div>
              <div className="flex flex-col flex-1 truncate">
                <span className="text-xs font-bold text-text-primary truncate">KyberGym Pro</span>
                <span className="text-[10px] text-text-muted truncate">Unlimited Operations</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="KyberGym Pro Active">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="size-4" />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Sheet */}
      <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
        <SheetContent
          side="left"
          className="w-[280px] p-0 bg-canvas border-r border-border-default flex flex-col gap-0 shadow-elevated"
          showCloseButton={false}
        >
          {/* Mobile Drawer Header */}
          <div className="h-[64px] flex items-center justify-between border-b border-border-default px-4 shrink-0">
            <div className="font-bold text-sm tracking-tight text-text-primary flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-action-bg text-action-text flex items-center justify-center shadow-xs">
                <Dumbbell className="size-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-wide text-text-primary">{brandTitle}</span>
                <span className="text-[10px] text-text-muted">{roleSubtitle}</span>
              </div>
            </div>
            <button 
              onClick={() => setMobileDrawerOpen(false)} 
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-hover transition-colors"
              aria-label="Close navigation drawer"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* User Brief Banner on Mobile Drawer */}
          {user && (
            <div className="px-4 py-3 bg-surface/60 border-b border-border-default flex items-center gap-3">
              <div className="size-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="flex flex-col flex-1 truncate">
                <span className="text-xs font-semibold text-text-primary truncate">{user.name || "User"}</span>
                <span className="text-[10px] text-text-muted truncate">{user.email}</span>
              </div>
            </div>
          )}

          {/* Mobile Navigation List */}
          {renderNavItems(true)}

          {/* Drawer Footer */}
          <div className="p-4 border-t border-border-default bg-surface/50 text-center">
            <span className="text-[11px] font-medium text-text-muted">KyberGym Management v2.4</span>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

