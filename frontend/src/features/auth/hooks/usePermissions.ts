import { useMemo } from "react";
import { useAuthStore } from "../../../store/auth.store";

export type Permission = string;

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  superadmin: [
    "gyms:read",
    "gyms:write",
    "gyms:delete",
    "gyms:manage",
    "subscriptions:read",
    "subscriptions:write",
    "users:read",
    "users:write",
    "settings:read",
    "settings:write",
  ],
  owner: [
    "members:read",
    "members:write",
    "members:delete",
    "payments:read",
    "payments:write",
    "payments:refund",
    "plans:read",
    "plans:write",
    "plans:delete",
    "workouts:read",
    "workouts:write",
    "workouts:delete",
    "attendance:read",
    "attendance:write",
    "notifications:read",
    "notifications:write",
    "branding:read",
    "branding:write",
    "staff:read",
    "staff:write",
    "reports:read",
    "settings:read",
    "settings:write",
  ],
  staff: [
    "members:read",
    "members:write",
    "payments:read",
    "payments:write",
    "plans:read",
    "workouts:read",
    "attendance:read",
    "attendance:write",
    "notifications:read",
    "notifications:write",
  ],
  member: [
    "profile:read",
    "profile:write",
    "membership:read",
    "workouts:read",
    "attendance:read",
    "payments:read",
    "notifications:read",
  ],
};

export function usePermissions() {
  const { user } = useAuthStore();

  const permissions = useMemo(() => {
    if (!user) return [] as Permission[];
    return ROLE_PERMISSIONS[user.role] ?? [];
  }, [user]);

  return { data: permissions, isLoading: false, isError: false, error: null };
}

export function useHasPermission(permission: Permission) {
  const { data: permissions = [] } = usePermissions();
  return permissions.includes(permission);
}
