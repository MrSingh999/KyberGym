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

import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { MembersPage } from "../features/members/pages/MembersPage";
import { MemberProfilePage } from "../features/members/pages/MemberProfilePage";

import { WorkoutsPage } from "../features/workouts/pages/WorkoutsPage";
import { WorkoutDetailPage } from "../features/workouts/pages/WorkoutDetailPage";
import { CreateWorkoutPage } from "../features/workouts/pages/CreateWorkoutPage";
import { EditWorkoutPage } from "../features/workouts/pages/EditWorkoutPage";

import { NotificationsPage } from "../features/notifications/pages/NotificationsPage";
import { QrEntryPage } from "../features/qr-entry/pages/QrEntryPage";
import { BrandingPage } from "../features/branding/pages/BrandingPage";
import { AttendancePage } from "../features/attendance/pages/AttendancePage";
import { AttendanceDashboardPage } from "../features/attendance/pages/AttendanceDashboardPage";
import { MemberAttendancePage } from "../features/attendance/pages/MemberAttendancePage";
import { MyAttendancePage } from "../features/attendance/pages/MyAttendancePage";
import { MemberDashboardPage } from "../features/members/pages/MemberDashboardPage";
import { MemberWorkoutPlanPage } from "../features/workouts/pages/MemberWorkoutPlanPage";
import { SuperAdminDashboardPage } from "../features/super-admin/pages/SuperAdminDashboardPage";
import { SuperAdminGymsPage } from "../features/super-admin/pages/SuperAdminGymsPage";
import { SuperAdminGymDetailPage } from "../features/super-admin/pages/SuperAdminGymDetailPage";

import { EmptyState } from "../components/feedback/ErrorState";

import { ProtectedRoute, PublicRoute } from "../features/auth/guards/ProtectedRoute";
import { Login } from "../features/auth/components/Login";
import { ForgotPasswordForm } from "../features/auth/components/ForgotPasswordForm";
import { ResetPasswordForm } from "../features/auth/components/ResetPasswordForm";
import { VerifyEmailForm } from "../features/auth/components/VerifyEmailForm";
import { ProfilePage } from "../features/auth/components/ProfilePage";
import { RoleGuard } from "../features/auth/guards/RoleGuard";
import { Unauthorized } from "../features/auth/components/Unauthorized";
import { useAuthStore } from "../store/auth.store";

const DummyComponent = ({ title }: { title: string }) => (
  <div className="flex h-full flex-col animate-fade-slide-up">
    <h1 className="font-bold text-xl sm:text-2xl text-text-primary tracking-tight mb-6">{title}</h1>
    <EmptyState
      title={`No ${title.split(' ').pop()} Found`}
      description="This module is currently under development. Press Cmd+K to search across the platform."
      className="flex-1 mt-4"
    />
  </div>
);

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
          { index: true, element: <SuperAdminDashboardPage /> },
          { path: "dashboard", element: <SuperAdminDashboardPage /> },
          { path: "gyms", element: <SuperAdminGymsPage /> },
          { path: "gyms/:gymId", element: <SuperAdminGymDetailPage /> },
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
          { index: true, element: <DashboardPage /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "members", element: <MembersPage /> },
          { path: "members/:memberId", element: <MemberProfilePage /> },
          { path: "plans", element: <PlansPage /> },
          { path: "plans/new", element: <CreatePlanPage /> },
          { path: "plans/:planId", element: <PlanDetailPage /> },
          { path: "plans/:planId/edit", element: <EditPlanPage /> },
          { path: "payments", element: <PaymentsPage /> },
          { path: "payments/collect", element: <CollectPaymentPage /> },
          { path: "payments/:paymentId", element: <PaymentDetailPage /> },
          { path: "workouts", element: <WorkoutsPage /> },
          { path: "workouts/new", element: <CreateWorkoutPage /> },
          { path: "workouts/:workoutId", element: <WorkoutDetailPage /> },
          { path: "workouts/:workoutId/edit", element: <EditWorkoutPage /> },
          { path: "notifications", element: <NotificationsPage /> },
          { path: "attendance", element: <AttendancePage /> },
          { path: "attendance/dashboard", element: <AttendanceDashboardPage /> },
          { path: "attendance/members/:memberId", element: <MemberAttendancePage /> },
          { path: "exercises", element: <DummyComponent title="Manage Exercises" /> },
          { path: "qr", element: <QrEntryPage /> },
          { path: "reports", element: <DummyComponent title="Reports" /> },
          { path: "branding", element: <BrandingPage /> },
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
          { index: true, element: <MemberDashboardPage /> },
          { path: "dashboard", element: <MemberDashboardPage /> },
          { path: "profile", element: <ProfilePage /> },
          { path: "membership", element: <DummyComponent title="My Membership" /> },
          { path: "workout-plan", element: <MemberWorkoutPlanPage /> },
          { path: "workouts", element: <MemberWorkoutPlanPage /> },
          { path: "qr", element: <DummyComponent title="QR Pass" /> },
          { path: "payments", element: <DummyComponent title="Payment History" /> },
          { path: "attendance", element: <MyAttendancePage /> },
          { path: "notifications", element: <NotificationsPage /> },
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
      { path: "forgot-password", element: <ForgotPasswordForm /> },
      { path: "reset-password", element: <ResetPasswordForm /> },
      { path: "verify-email", element: <VerifyEmailForm /> },
    ],
  },
  {
    path: "unauthorized",
    element: <Unauthorized />,
  },
]);
