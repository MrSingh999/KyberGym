import { Outlet } from "react-router";

export function MemberLayout() {
  return (
    <div className="flex flex-col h-screen w-full bg-canvas">
      {/* Mobile Top Header */}
      <header className="md:hidden h-[64px] border-b border-subtle bg-canvas/80 backdrop-blur-md sticky top-0 flex items-center px-4 z-10">
        <div className="font-heading font-bold text-lg text-primary">KyberGym Portal</div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex w-[240px] flex-col border-r border-default bg-surface p-4 z-10">
          <div className="font-heading font-bold text-xl mb-8">Member Portal</div>
          <div className="text-sm text-muted">Navigation...</div>
        </div>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-[80px] md:pb-6 relative z-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden h-[64px] border-t border-subtle bg-surface fixed bottom-0 left-0 right-0 flex items-center justify-around z-10 pb-safe">
        <div className="text-xs text-muted">Nav Item</div>
        <div className="text-xs text-muted">Nav Item</div>
        <div className="text-xs text-muted">Nav Item</div>
      </nav>
    </div>
  );
}
