import { useLocation, useNavigate } from "react-router";
import { ChevronRight, Menu, Moon, Sun, Search, User, Settings, LogOut, Shield } from "lucide-react";
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
  const paths = location.pathname.split('/').filter(p => p);

  if (paths.length === 0) return null;

  return (
    <div className="hidden md:flex items-center text-sm font-medium text-text-secondary">
      {paths.map((path, index) => {
        const isLast = index === paths.length - 1;
        const text = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
        return (
          <div key={path} className="flex items-center">
            {index > 0 && <ChevronRight className="w-4 h-4 mx-1 opacity-50" />}
            <span className={isLast ? "text-text-primary" : "hover:text-text-primary cursor-pointer transition-colors"}>
              {text}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function PageTitleMobile() {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(p => p);
  if (paths.length === 0) return <span className="md:hidden font-bold text-sm tracking-tight text-text-primary">KyberGym</span>;
  const lastPath = paths[paths.length - 1];
  const text = lastPath.charAt(0).toUpperCase() + lastPath.slice(1).replace(/-/g, ' ');
  return (
    <span className="md:hidden font-bold text-sm text-text-primary tracking-tight font-mono uppercase">
      {text}
    </span>
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

  return (
    <header className="h-[64px] border-b border-border-default bg-canvas/80 backdrop-blur-md sticky top-0 flex items-center justify-between px-4 lg:px-6 z-30">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="p-2 -ml-2 lg:hidden text-text-muted hover:text-text-primary transition-colors"
        >
          <Menu className="size-5" />
        </button>
        <PageTitleMobile />
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden sm:flex items-center text-sm text-text-muted bg-surface border border-border-default hover:border-border-hover px-3 py-1.5 rounded-md transition-all shadow-sm w-64"
        >
          <Search className="size-4 mr-2" />
          <span>Search...</span>
          <kbd className="ml-auto text-xs bg-canvas px-1.5 py-0.5 rounded border border-border-default font-sans text-text-muted">
            ⌘K
          </kbd>
        </button>

        <button
          onClick={() => setSearchOpen(true)}
          className="sm:hidden p-2 text-text-muted hover:text-text-primary rounded-full hover:bg-surface-hover transition-colors"
        >
          <Search className="size-5" />
        </button>

        <NotificationCenter />

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full hover:bg-surface-hover transition-colors text-text-muted hover:text-text-primary outline-none"
        >
          {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 ml-2 p-1 rounded-full hover:bg-surface-hover transition-colors outline-none">
              <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm">
                {initials}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mr-4" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium text-text-primary truncate">{user?.name || "User"}</span>
                <span className="text-xs text-text-muted font-normal truncate">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate(getProfilePath())}>
                <User className="size-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(getDashboardPath())}>
                <Shield className="size-4 mr-2" />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
                <Settings className="size-4 mr-2" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOut className="size-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
