import React from "react";
import { ShieldAlert } from "lucide-react";
import { EmptyState } from "../../../components/feedback/EmptyState";
import { useNavigate } from "react-router";

export function Unauthorized() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas p-4">
      <div className="max-w-md w-full">
        <EmptyState
          icon={<ShieldAlert className="h-8 w-8 text-error" />}
          title="Access Denied"
          description="You do not have the required permissions or role to view this page. If you believe this is a mistake, contact your Gym Owner."
          actionLabel="Return to Dashboard"
          onAction={() => navigate("/admin", { replace: true })}
          className="bg-surface shadow-sm border-default"
        />
      </div>
    </div>
  );
}
