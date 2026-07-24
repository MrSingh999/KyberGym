import { Outlet } from "react-router";
import { BottomNavigation } from "../features/member-portal/components/BottomNavigation";

export function MemberLayout() {
  return (
    <div className="min-h-screen bg-background-default flex flex-col text-text-primary pb-16 md:pb-0">
      <main className="flex-1 w-full max-w-7xl mx-auto">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
}
