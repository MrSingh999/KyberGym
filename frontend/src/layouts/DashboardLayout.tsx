import { Outlet } from "react-router";
import { Sidebar } from "../components/layout/Sidebar";
import { Navbar } from "../components/layout/Navbar";
import { BottomNav } from "../components/layout/BottomNav";
import { CommandPalette } from "../components/layout/CommandPalette";
import { FeatureInitializer } from "../features/auth/providers/FeatureInitializer";
import { TenantInitializer } from "../features/auth/providers/TenantInitializer";
import { SUPERADMIN_NAVIGATION, OWNER_NAVIGATION, TRAINER_NAVIGATION } from "../constants/navigation";

interface DashboardLayoutProps {
  role: "superadmin" | "owner" | "staff" | "trainer";
}

export function DashboardLayout({ role }: DashboardLayoutProps) {
  const groups =
    role === "superadmin" ? SUPERADMIN_NAVIGATION :
    role === "trainer" ? TRAINER_NAVIGATION :
    OWNER_NAVIGATION;

  return (
    <div className="flex h-screen w-full bg-canvas overflow-hidden">
      <Sidebar groups={groups} role={role} />
      
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
      
      <BottomNav groups={groups} />
      <CommandPalette />
    </div>
  );
}
