import React, { useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import {
  useMemberProfile,
  useMemberActivities,
  useMemberNotes,
  useMemberPaymentSummary,
  useMemberWorkoutSummary,
} from "../hooks/useMemberProfile";
import { ProfileHeader } from "../components/ProfileHeader";
import { MemberOverviewCard } from "../components/MemberOverviewCard";
import { MembershipCard } from "../components/MembershipCard";
import { PaymentsSummaryCard } from "../components/PaymentsSummaryCard";
import { NotesSection } from "../components/NotesSection";
import { ActivityTimeline } from "../components/ActivityTimeline";
import { RenewMembershipForm } from "../components/RenewMembershipForm";
import { SuspendMemberForm, ActivateMemberForm } from "../components/SuspendActivateForms";
import { Skeleton } from "@/components/feedback/Skeleton";

// Simple inline dialog primitives to avoid shadcn raw import
function SimpleSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      {/* Panel – slides up on mobile, side panel on desktop */}
      <div className="w-full max-w-md bg-surface shadow-xl flex flex-col sm:border-l border-default animate-in slide-in-from-right-full sm:duration-300">
        <div className="flex items-center justify-between px-6 py-5 border-b border-default">
          <h2 className="font-heading font-semibold text-lg text-primary">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-primary transition-colors touch-target rounded-full hover:bg-surface-hover">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

type ActiveSheet = "renew" | "suspend" | "activate" | null;

export function MemberProfilePage() {
  const { memberId = "" } = useParams<{ memberId: string }>();
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);

  const { data: member, isLoading: profileLoading } = useMemberProfile(memberId);
  const { data: activities, isLoading: activitiesLoading } = useMemberActivities(memberId);
  const { data: notes, isLoading: notesLoading } = useMemberNotes(memberId);
  const { data: payments, isLoading: paymentsLoading } = useMemberPaymentSummary(memberId);

  const closeSheet = () => setActiveSheet(null);
  const handleSuccess = (msg: string) => {
    closeSheet();
    toast.success(msg);
  };

  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      {/* Sticky Profile Header */}
      {profileLoading ? (
        <div className="px-4 py-6 border-b border-default space-y-4 bg-surface">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      ) : member ? (
        <ProfileHeader
          member={member}
          onRenew={() => setActiveSheet("renew")}
          onSuspend={() => setActiveSheet("suspend")}
          onActivate={() => setActiveSheet("activate")}
        />
      ) : null}

      {/* Page Content – responsive grid */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column: Personal + Membership */}
          <div className="lg:col-span-1 space-y-6">
            <MemberOverviewCard member={member} isLoading={profileLoading} />
            <MembershipCard member={member} isLoading={profileLoading} />
            <PaymentsSummaryCard payments={payments} isLoading={paymentsLoading} />
          </div>

          {/* Right column: Timeline + Notes */}
          <div className="lg:col-span-2 space-y-6">
            <NotesSection notes={notes} isLoading={notesLoading} />
            <ActivityTimeline activities={activities} isLoading={activitiesLoading} />
          </div>

        </div>
      </div>

      {/* Action Sheets */}
      <SimpleSheet open={activeSheet === "renew"} onClose={closeSheet} title="Renew Membership">
        {member && (
          <RenewMembershipForm
            memberId={memberId}
            memberName={member.name}
            onSuccess={() => handleSuccess(`Membership renewed for ${member.name}`)}
          />
        )}
      </SimpleSheet>

      <SimpleSheet open={activeSheet === "suspend"} onClose={closeSheet} title="Suspend Member">
        {member && (
          <SuspendMemberForm
            memberId={memberId}
            memberName={member.name}
            onSuccess={closeSheet}
            onCancel={closeSheet}
          />
        )}
      </SimpleSheet>

      <SimpleSheet open={activeSheet === "activate"} onClose={closeSheet} title="Activate Member">
        {member && (
          <ActivateMemberForm
            memberId={memberId}
            memberName={member.name}
            onSuccess={closeSheet}
            onCancel={closeSheet}
          />
        )}
      </SimpleSheet>
    </div>
  );
}
