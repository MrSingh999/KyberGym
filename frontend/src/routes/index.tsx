import { createBrowserRouter, Navigate } from "react-router";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { MemberLayout } from "../layouts/MemberLayout";

// Feature pages
import { PlansPage } from "../features/plans/pages/PlansPage";
import { PlanDetailPage } from "../features/plans/pages/PlanDetailPage";
import { CreatePlanPage } from "../features/plans/pages/CreatePlanPage";
import { EditPlanPage } from "../features/plans/pages/EditPlanPage";

import { PaymentsPage } from "../features/payments/pages/PaymentsPage";
import { PaymentDetailPage } from "../features/payments/pages/PaymentDetailPage";
import { CollectPaymentPage } from "../features/payments/pages/CollectPaymentPage";

// Temporary dummy components for routing
import { EmptyState } from "../components/feedback/ErrorState";

// Guards & Store
import { ProtectedRoute, PublicRoute } from "../features/auth/guards/ProtectedRoute";
import { Login } from "../features/auth/components/Login";
import { RoleGuard } from "../features/auth/guards/RoleGuard";
import { Unauthorized } from "../features/auth/components/Unauthorized";
import { useAuthStore } from "../store/auth.store";

const DummyComponent = ({ title }: { title: string }) => (
  <div className="flex h-full flex-col animate-fade-slide-up">
    <h1 className="text-h2 font-heading font-bold text-primary mb-6">{title}</h1>
    <EmptyState
      title={`No ${title.split(' ').pop()} Found`}
      description="This module is currently under development. Press Cmd+K to search across the platform."
      className="flex-1 mt-4"
    />
  </div>
);

// Dynamic redirect component based on authentication state and role
function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "superadmin") {
    return <Navigate to="/super-admin/dashboard" replace />;
  }
  if (user.role === "owner") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/member/dashboard" replace />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    children: [
      { index: true, element: <RootRedirect /> },
      {
        path: "super-admin",
        element: (
          <ProtectedRoute>
            <RoleGuard allowedRoles={["superadmin"]}>
              <DashboardLayout role="superadmin" />
            </RoleGuard>
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <DummyComponent title="Super Admin Dashboard" /> },
          { path: "dashboard", element: <DummyComponent title="Super Admin Dashboard" /> },
          { path: "gyms", element: <DummyComponent title="Manage Gyms" /> },
          { path: "subscriptions", element: <DummyComponent title="Subscriptions" /> },
          { path: "plans", element: <DummyComponent title="Subscription Plans" /> },
          { path: "settings", element: <DummyComponent title="Settings" /> },
          { path: "revenue", element: <DummyComponent title="Revenue" /> },
          { path: "broadcast", element: <DummyComponent title="Broadcast" /> },
          { path: "support", element: <DummyComponent title="Support" /> },
        ],
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute>
            <RoleGuard allowedRoles={["owner"]}>
              <DashboardLayout role="owner" />
            </RoleGuard>
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <DummyComponent title="Gym Dashboard" /> },
          { path: "dashboard", element: <DummyComponent title="Gym Dashboard" /> },
          { path: "members", element: <DummyComponent title="Manage Members" /> },
          { path: "members/:memberId", element: <DummyComponent title="Member Profile" /> },
          // ── Plans ─────────────────────────────────────────────────────────────
          { path: "plans", element: <PlansPage /> },
          { path: "plans/new", element: <CreatePlanPage /> },
          { path: "plans/:planId", element: <PlanDetailPage /> },
          { path: "plans/:planId/edit", element: <EditPlanPage /> },
          // ── Payments ──────────────────────────────────────────────────────────
          { path: "payments", element: <PaymentsPage /> },
          { path: "payments/collect", element: <CollectPaymentPage /> },
          { path: "payments/:paymentId", element: <PaymentDetailPage /> },
          // ─────────────────────────────────────────────────────────────────────
          { path: "workouts", element: <DummyComponent title="Manage Workouts" /> },
          { path: "exercises", element: <DummyComponent title="Manage Exercises" /> },
          { path: "qr", element: <DummyComponent title="QR Entry" /> },
          { path: "reports", element: <DummyComponent title="Reports" /> },
          { path: "branding", element: <DummyComponent title="Branding" /> },
          { path: "staff", element: <DummyComponent title="Staff" /> },
          { path: "settings", element: <DummyComponent title="Settings" /> },
        ],
      },
      {
        path: "member",
        element: (
          <ProtectedRoute>
            <RoleGuard allowedRoles={["member"]}>
              <MemberLayout />
            </RoleGuard>
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <DummyComponent title="Member Dashboard" /> },
          { path: "dashboard", element: <DummyComponent title="Member Dashboard" /> },
          { path: "profile", element: <DummyComponent title="Member Profile" /> },
          { path: "membership", element: <DummyComponent title="My Membership" /> },
          { path: "workout-plan", element: <DummyComponent title="My Workout Plan" /> },
          { path: "workouts", element: <DummyComponent title="My Workout Plan" /> },
          { path: "qr", element: <DummyComponent title="QR Pass" /> },
          { path: "payments", element: <DummyComponent title="Payment History" /> },
          { path: "attendance", element: <DummyComponent title="Attendance" /> },
          { path: "settings", element: <DummyComponent title="Settings" /> },
        ],
      },
    ],
  },
  {
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <DummyComponent title="Register" /> },
    ],
  },
  {
    path: "unauthorized",
    element: <Unauthorized />,
  },
]);
