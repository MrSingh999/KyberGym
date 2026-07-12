import React from "react";
import { Clock } from "lucide-react";
import { EmptyState } from "../../../components/feedback/EmptyState";
import { useNavigate } from "react-router";

export function SessionExpired() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas p-4">
      <div className="max-w-md w-full">
        <EmptyState
          icon={<Clock className="h-8 w-8 text-warning" />}
          title="Session Expired"
          description="For your security, your session has expired due to inactivity. Please sign in again to continue."
          actionLabel="Go to Sign In"
          onAction={() => navigate("/login", { replace: true })}
          className="bg-surface shadow-sm border-default"
        />
      </div>
    </div>
  );
}
