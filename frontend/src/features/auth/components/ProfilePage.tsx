import { User, Mail, Shield, Building2, BadgeCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { useAuthStore } from "../../../store/auth.store";
import { useCurrentUser } from "../hooks/useCurrentUser";

export function ProfilePage() {
  const { user } = useAuthStore();
  const { data: profile, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-default border-t-primary" />
      </div>
    );
  }

  const displayUser = profile || user;
  if (!displayUser) return null;

  const roleLabels: Record<string, string> = {
    superadmin: "Super Admin",
    owner: "Gym Admin",
    member: "Member",
  };

  const roleBadgeVariant: Record<string, "default" | "secondary" | "outline" | "success"> = {
    superadmin: "default",
    owner: "success",
    member: "secondary",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-slide-up">
      <div>
        <h1 className="text-h2 font-heading font-bold text-primary">Profile</h1>
        <p className="text-sm text-secondary mt-1">Your account information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-default">
            <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-sm">
              {(displayUser.name || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div>
              <h2 className="text-lg font-heading font-semibold text-primary">{displayUser.name}</h2>
              <p className="text-sm text-secondary">{displayUser.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-surface-hover flex items-center justify-center text-muted">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted">Name</p>
                <p className="text-sm font-medium text-primary">{displayUser.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-surface-hover flex items-center justify-center text-muted">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted">Email</p>
                <p className="text-sm font-medium text-primary">{displayUser.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-surface-hover flex items-center justify-center text-muted">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted">Role</p>
                <Badge variant={roleBadgeVariant[displayUser.role] || "secondary"} className="mt-0.5">
                  {roleLabels[displayUser.role] || displayUser.role}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-surface-hover flex items-center justify-center text-muted">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted">Email Verified</p>
                <p className="text-sm font-medium text-primary">
                  {"isEmailVerified" in displayUser && displayUser.isEmailVerified ? "Yes" : "No"}
                </p>
              </div>
            </div>

            {displayUser.gymId && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-surface-hover flex items-center justify-center text-muted">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted">Gym ID</p>
                  <p className="text-sm font-medium text-primary font-mono text-xs">
                    {displayUser.gymId}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
