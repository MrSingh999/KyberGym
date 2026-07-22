import { useLocation, useNavigate } from "react-router";
import { ChevronRight, Menu, Moon, Sun, Search, User, Settings, LogOut, Shield, Home, Plus, Activity } from "lucide-react";
import { toast } from "sonner";
import { useSearchStore } from "../../store/search.store";
import { useSidebarStore } from "../../store/sidebar.store";
import { NotificationCenter } from "./NotificationCenter";
import { useTheme } from "../../providers/ThemeProvider";
import { useAuthStore } from "../../store/auth.store";
import { authApi } from "../../features/auth/api/auth.api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function Breadcrumbs() {
  const location = useLocation();
  const navigate = useNavigate();
  const paths = location.pathname.split('/').filter(p => p);

  if (paths.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1.5 text-xs font-medium text-text-secondary">
      <button
        onClick={() => navigate("/")}
        className="p-1 rounded-md hover:bg-surface-hover hover:text-text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
        title="Home"
      >
        <Home className="size-3.5" />
      </button>
      {paths.map((path, index) => {
        const isLast = index === paths.length - 1;
        const text = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
        const routeTo = "/" + paths.slice(0, index + 1).join("/");

        return (
          <div key={path} className="flex items-center gap-1.5">
            <ChevronRight className="size-3.5 text-text-muted/60" />
            {isLast ? (
              <span className="px-2 py-0.5 rounded-full bg-surface border border-border-default text-text-primary font-semibold shadow-2xs">
                {text}
              </span>
            ) : (
              <button
                onClick={() => navigate(routeTo)}
                className="hover:text-text-primary transition-colors px-1 py-0.5 rounded hover:bg-surface-hover/60"
              >
                {text}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function PageTitleMobile() {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(p => p);
  if (paths.length === 0) {
    return (
      <div className="md:hidden flex items-center gap-2">
        <span className="font-bold text-sm tracking-tight text-text-primary">KyberGym</span>
      </div>
    );
  }
  const lastPath = paths[paths.length - 1];
  const text = lastPath.charAt(0).toUpperCase() + lastPath.slice(1).replace(/-/g, ' ');
  return (
    <div className="md:hidden flex items-center gap-2">
      <span className="font-bold text-xs uppercase tracking-wider text-text-primary bg-surface px-2.5 py-1 rounded-md border border-border-default font-mono">
        {text}
      </span>
    </div>
  );
}

export function Navbar() {
  const { setMobileDrawerOpen } = useSidebarStore();
  const { setOpen: setSearchOpen } = useSearchStore();
  const { theme, setTheme } = useTheme();
  const { user, logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if the API call fails, clear local state
    }
    storeLogout();
    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || "U";

  const getProfilePath = () => {
    if (!user) return "/login";
    if (user.role === "superadmin") return "/super-admin/settings";
    if (user.role === "owner") return "/admin/settings";
    return "/member/profile";
  };

  const getDashboardPath = () => {
    if (!user) return "/login";
    if (user.role === "superadmin") return "/super-admin/dashboard";
    if (user.role === "owner") return "/admin/dashboard";
    return "/member/dashboard";
  };

  const getRoleBadge = () => {
    if (user?.role === "superadmin") return "Super Admin";
    if (user?.role === "owner") return "Gym Owner";
    return "Member";
  };

  return (
    <header className="h-[64px] border-b border-border-default bg-canvas/80 backdrop-blur-xl sticky top-0 flex items-center justify-between px-3 sm:px-4 lg:px-6 z-30 transition-all">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2 lg:hidden text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-hover transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="size-5" />
        </button>
        <PageTitleMobile />
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* System status pill (Desktop only) */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-text-secondary bg-surface border border-border-default rounded-full shadow-2xs">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Online</span>
        </div>

        {/* Global Search Trigger (Desktop) */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden sm:flex items-center text-xs text-text-muted bg-surface/90 border border-border-default hover:border-border-hover hover:bg-surface-hover px-3 py-1.5 rounded-lg transition-all shadow-2xs w-48 lg:w-60 group cursor-pointer"
        >
          <Search className="size-3.5 mr-2 group-hover:text-text-primary transition-colors" />
          <span className="group-hover:text-text-primary transition-colors">Search command...</span>
          <kbd className="ml-auto text-[10px] font-mono bg-canvas px-1.5 py-0.5 rounded border border-border-default text-text-muted shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Quick Action Button (Desktop) */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-action-bg text-action-text hover:bg-action-bg-hover transition-all shadow-xs active:scale-95"
        >
          <Plus className="size-3.5" />
          <span>Quick Action</span>
        </button>

        {/* Search Icon Trigger (Mobile) */}
        <button
          onClick={() => setSearchOpen(true)}
          className="sm:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-text-muted hover:text-text-primary rounded-full hover:bg-surface-hover transition-colors"
          aria-label="Search"
        >
          <Search className="size-5" />
        </button>

        {/* Notification Center Trigger */}
        <NotificationCenter />

        {/* Theme Switcher Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-surface-hover transition-colors text-text-muted hover:text-text-primary outline-none active:rotate-12 transition-transform"
          aria-label="Toggle dark/light theme"
        >
          {theme === 'dark' ? <Sun className="size-5 text-amber-400" /> : <Moon className="size-5 text-slate-700" />}
        </button>

        {/* User Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="min-h-[44px] flex items-center gap-2 p-1 rounded-full hover:bg-surface-hover transition-colors outline-none cursor-pointer focus:ring-2 focus:ring-ring"
              aria-label="User Profile Menu"
            >
              <div className="relative">
                <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-border-default">
                  {initials}
                </div>
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-canvas" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60 mr-2 sm:mr-4 border-border-default bg-canvas shadow-elevated p-1.5 rounded-xl" align="end">
            <DropdownMenuLabel className="p-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-text-primary truncate">{user?.name || "User"}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface border border-border-default text-text-secondary uppercase tracking-wider">
                    {getRoleBadge()}
                  </span>
                </div>
                <span className="text-xs text-text-muted font-normal truncate">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border-default" />
            <DropdownMenuGroup className="space-y-0.5">
              <DropdownMenuItem onClick={() => navigate(getDashboardPath())} className="min-h-[40px] cursor-pointer rounded-lg">
                <Shield className="size-4 mr-2 text-text-muted" />
                <span>Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(getProfilePath())} className="min-h-[40px] cursor-pointer rounded-lg">
                <User className="size-4 mr-2 text-text-muted" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/admin/settings")} className="min-h-[40px] cursor-pointer rounded-lg">
                <Settings className="size-4 mr-2 text-text-muted" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-border-default" />
            <DropdownMenuItem variant="destructive" onClick={handleLogout} className="min-h-[40px] cursor-pointer rounded-lg text-error focus:text-error">
              <LogOut className="size-4 mr-2" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

