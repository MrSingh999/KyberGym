import { ChevronRight, Menu, Moon, Sun, Search } from "lucide-react";
import { useLocation } from "react-router";
import { useUIStore } from "../../store/ui";
import { NotificationCenter } from "./NotificationCenter";
import { useTheme } from "../../providers/ThemeProvider";

export function Breadcrumbs() {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(p => p);
  
  if (paths.length === 0) return null;

  return (
    <div className="hidden md:flex items-center text-sm font-medium text-muted">
      {paths.map((path, index) => {
        const isLast = index === paths.length - 1;
        const text = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
        return (
          <div key={path} className="flex items-center">
            {index > 0 && <ChevronRight className="w-4 h-4 mx-1 opacity-50" />}
            <span className={isLast ? "text-primary" : "hover:text-primary cursor-pointer transition-colors"}>
              {text}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function Navbar() {
  const { setMobileDrawerOpen } = useUIStore();
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-[64px] border-b border-subtle bg-canvas/80 backdrop-blur-md sticky top-0 flex items-center justify-between px-4 lg:px-6 z-30">
      <div className="flex items-center">
        <button 
          onClick={() => setMobileDrawerOpen(true)}
          className="p-2 -ml-2 mr-2 lg:hidden text-muted hover:text-primary"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Breadcrumbs />
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Global Search Trigger */}
        <button 
          onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
          className="hidden sm:flex items-center text-sm text-muted bg-surface border border-default hover:border-hover px-3 py-1.5 rounded-md transition-all shadow-sm w-64"
        >
          <Search className="w-4 h-4 mr-2" />
          <span>Search...</span>
          <kbd className="ml-auto text-xs bg-canvas px-1.5 py-0.5 rounded border border-subtle font-sans">
            ⌘K
          </kbd>
        </button>

        {/* Mobile Search Icon */}
        <button className="sm:hidden p-2 text-muted hover:text-primary rounded-full hover:bg-surface-hover transition-colors">
          <Search className="w-5 h-5" />
        </button>

        <NotificationCenter />

        {/* Theme Toggle */}
        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full hover:bg-surface-hover transition-colors text-muted hover:text-primary outline-none"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Profile Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm ml-2 cursor-pointer shadow-sm">
          A
        </div>
      </div>
    </header>
  );
}
