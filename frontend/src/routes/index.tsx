import { createBrowserRouter } from "react-router";
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

export const router = createBrowserRouter([
  {
    path: "/",
    children: [
      {
        path: "admin",
        element: <DashboardLayout role="superadmin" />,
        children: [
          { index: true, element: <DummyComponent title="Super Admin Dashboard" /> },
          { path: "gyms", element: <DummyComponent title="Manage Gyms" /> },
        ],
      },
      {
        path: "dashboard",
        element: <DashboardLayout role="owner" />,
        children: [
          { index: true, element: <DummyComponent title="Gym Dashboard" /> },
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
          { path: "reports", element: <DummyComponent title="Reports" /> },
        ],
      },
      {
        path: "portal",
        element: <MemberLayout />,
        children: [
          { index: true, element: <DummyComponent title="Member Dashboard" /> },
          { path: "workout-plan", element: <DummyComponent title="My Workout Plan" /> },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "login", element: <DummyComponent title="Login" /> },
      { path: "register", element: <DummyComponent title="Register" /> },
    ],
  },
]);

