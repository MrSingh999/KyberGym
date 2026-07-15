import { Outlet } from "react-router";
import { Sidebar } from "../components/layout/Sidebar";
import { Navbar } from "../components/layout/Navbar";
import { BottomNav } from "../components/layout/BottomNav";
import { CommandPalette } from "../components/layout/CommandPalette";
import { FeatureInitializer } from "../features/auth/providers/FeatureInitializer";
import { TenantInitializer } from "../features/auth/providers/TenantInitializer";
import { MEMBER_NAVIGATION } from "../constants/navigation";

export function MemberLayout() {
  return (
    <div className="flex h-screen w-full bg-canvas overflow-hidden">
      <Sidebar groups={MEMBER_NAVIGATION} role="member" />
      
      <div className="flex-1 flex flex-col h-full relative z-0">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-[80px] lg:pb-6">
          <FeatureInitializer>
            <TenantInitializer>
              <Outlet />
            </TenantInitializer>
          </FeatureInitializer>
        </main>
      </div>
      
      <BottomNav groups={MEMBER_NAVIGATION} />
      <CommandPalette />
    </div>
  );
}
