import React, { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import {
  useMemberProfile,
  useMemberActivities,
  useMemberNotes,
  useMemberPaymentSummary,
  useUpdateMemberNotes,
  useFreezeSubscription,
  useResumeSubscription,
} from "../hooks/useMemberProfile";
import { useUpdateMember, useDeleteMember } from "../hooks/useMembers";
import { ProfileHeader } from "../components/ProfileHeader";
import { MemberOverviewCard } from "../components/MemberOverviewCard";
import { MembershipCard } from "../components/MembershipCard";
import { PaymentsSummaryCard } from "../components/PaymentsSummaryCard";
import { NotesSection } from "../components/NotesSection";
import { ActivityTimeline } from "../components/ActivityTimeline";
import { MembershipHistory } from "../components/MembershipHistory";
import { RenewMembershipForm } from "../components/RenewMembershipForm";
import { SuspendMemberForm, ActivateMemberForm } from "../components/SuspendActivateForms";
import { EditMemberForm } from "../components/EditMemberForm";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { ResponsiveModal } from "@/components/ui/responsive-modal";

function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

type ActiveSheet = "renew" | "suspend" | "activate" | "edit" | null;

export function MemberProfilePage() {
  const navigate = useNavigate();
  const { memberId = "" } = useParams<{ memberId: string }>();
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  const [noteText, setNoteText] = useState("");
  const [isEditingNote, setIsEditingNote] = useState(false);

  // Confirmation dialogs
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [freezeDialogOpen, setFreezeDialogOpen] = useState(false);
  const [freezeReason, setFreezeReason] = useState("");

  const { data: member, isLoading: profileLoading, isError: profileError, refetch: refetchProfile } = useMemberProfile(memberId);
  const { data: activities, isLoading: activitiesLoading, isError: activitiesError, refetch: refetchActivities } = useMemberActivities(memberId);
  const { data: notes, isLoading: notesLoading, isError: notesError, refetch: refetchNotes } = useMemberNotes(memberId);
  const { data: payments, isLoading: paymentsLoading, isError: paymentsError, refetch: refetchPayments } = useMemberPaymentSummary(memberId);

  const { mutateAsync: updateMember, isPending: isUpdating } = useUpdateMember(memberId);
  const { mutateAsync: deleteMember, isPending: isDeleting } = useDeleteMember();
  const { mutateAsync: updateNotes, isPending: isUpdatingNotes } = useUpdateMemberNotes(memberId);
  const { mutateAsync: freezeSub, isPending: isFreezing } = useFreezeSubscription(memberId, member?.activeSubId || "");
  const { mutateAsync: resumeSub } = useResumeSubscription(memberId, member?.activeSubId || "");

  const closeSheet = useCallback(() => setActiveSheet(null), []);
  const handleSuccess = useCallback((msg: string) => {
    closeSheet();
    toast.success(msg);
  }, [closeSheet]);

  const handleEditSubmit = async (data: any, file: File | null, removed: boolean) => {
    try {
      let profilePhotoBase64 = member?.profilePhoto;
      if (file) {
        profilePhotoBase64 = await convertToBase64(file);
      } else if (removed) {
        profilePhotoBase64 = "";
      }

      await updateMember({
        fullName: data.name,
        email: data.email || undefined,
        phone: data.phone,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth || undefined,
        address: data.address || undefined,
        profilePhoto: profilePhotoBase64,
      });
      handleSuccess("Member profile updated successfully.");
    } catch (e: any) {
      const errMsg = e.response?.data?.message || "Failed to update profile.";
      toast.error(errMsg);
    }
  };

  const handleDeleteMember = async () => {
    try {
      await deleteMember(memberId);
      setDeleteConfirmOpen(false);
      toast.success("Member profile deleted successfully.");
      navigate("/admin/members");
    } catch (e: any) {
      const errMsg = e.response?.data?.message || "Failed to delete member.";
      toast.error(errMsg);
    }
  };

  const handleFreezeSub = async () => {
    try {
      await freezeSub(freezeReason || undefined);
      setFreezeDialogOpen(false);
      setFreezeReason("");
      toast.success("Membership subscription frozen.");
    } catch {
      toast.error("Failed to freeze subscription.");
    }
  };

  const handleResumeSub = async () => {
    try {
      await resumeSub();
      toast.success("Membership subscription resumed.");
    } catch {
      toast.error("Failed to resume subscription.");
    }
  };

  const handleSaveNotes = async () => {
    try {
      await updateNotes(noteText);
      setIsEditingNote(false);
      toast.success("Notes saved.");
    } catch {
      toast.error("Failed to save notes.");
    }
  };

  const triggerRetry = () => {
    refetchProfile();
    refetchActivities();
    refetchNotes();
    refetchPayments();
  };

  if (profileError || activitiesError || notesError || paymentsError) {
    return (
      <ErrorState
        title="Failed to load member profile"
        message="Please check your connection and try again."
        onRetry={triggerRetry}
        className="min-h-[50vh]"
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      {/* Sticky Profile Header */}
      {profileLoading ? (
        <div className="px-4 sm:px-6 pt-4 pb-0 border-b border-default bg-surface animate-pulse">
          <Skeleton className="h-4 w-16 mb-4" />
          <div className="flex items-start gap-4 pb-5">
            <Skeleton className="h-16 w-16 rounded-full shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-40 rounded-lg" />
            </div>
          </div>
          <div className="flex gap-2 pb-4">
            <Skeleton className="h-11 w-20 rounded-lg" />
            <Skeleton className="h-11 w-24 rounded-lg" />
            <Skeleton className="h-11 w-24 rounded-lg" />
          </div>
        </div>
      ) : member ? (
        <ProfileHeader
          member={member}
          onRenew={() => setActiveSheet("renew")}
          onSuspend={() => setActiveSheet("suspend")}
          onActivate={() => setActiveSheet("activate")}
          onFreeze={() => setFreezeDialogOpen(true)}
          onResume={handleResumeSub}
          onEdit={() => setActiveSheet("edit")}
          onDelete={() => setDeleteConfirmOpen(true)}
        />
      ) : null}

      {/* Page Content – responsive grid */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-5xl mx-auto animate-fade-slide-up">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column: Personal + Membership */}
          <div className="lg:col-span-1 space-y-6">
            <MemberOverviewCard member={member} isLoading={profileLoading} />
            <MembershipCard member={member} isLoading={profileLoading} />
            <PaymentsSummaryCard payments={payments} isLoading={paymentsLoading} />
          </div>

          {/* Right column: History + Timeline + Notes */}
          <div className="lg:col-span-2 space-y-6">
            <MembershipHistory memberId={memberId} />
            <NotesSection 
              notes={notes} 
              isLoading={notesLoading} 
              onAddNote={() => {
                setNoteText(notes?.[0]?.content || "");
                setIsEditingNote(true);
              }}
            />
            <ActivityTimeline activities={activities} isLoading={activitiesLoading} />
          </div>

        </div>
      </div>

      {/* Action Sheets - responsive bottom sheets on mobile, dialogs on desktop */}
      {activeSheet === "renew" && member && (
        <ResponsiveModal
          open
          onOpenChange={(o) => !o && closeSheet()}
          title="Renew Membership"
          description={`Select a new plan and start date for ${member.name}.`}
        >
          <RenewMembershipForm
            memberId={memberId}
            memberName={member.name}
            onSuccess={() => handleSuccess(`Membership renewed for ${member.name}`)}
          />
        </ResponsiveModal>
      )}

      {activeSheet === "suspend" && member && (
        <ResponsiveModal
          open
          onOpenChange={(o) => !o && closeSheet()}
          title="Suspend Member"
          description={`This will immediately restrict ${member.name}'s gym access.`}
        >
          <SuspendMemberForm
            memberId={memberId}
            memberName={member.name}
            onSuccess={closeSheet}
            onCancel={closeSheet}
          />
        </ResponsiveModal>
      )}

      {activeSheet === "activate" && member && (
        <ResponsiveModal
          open
          onOpenChange={(o) => !o && closeSheet()}
          title="Activate Member"
          description={`Reactivate ${member.name}'s membership and restore gym access.`}
        >
          <ActivateMemberForm
            memberId={memberId}
            memberName={member.name}
            onSuccess={closeSheet}
            onCancel={closeSheet}
          />
        </ResponsiveModal>
      )}

      {activeSheet === "edit" && member && (
        <ResponsiveModal
          open
          onOpenChange={(o) => !o && closeSheet()}
          title="Edit Member Profile"
          description={`Update personal details for ${member.name}.`}
        >
          <EditMemberForm
            member={member}
            onSubmit={handleEditSubmit}
            isSubmitting={isUpdating}
          />
        </ResponsiveModal>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {member?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Freeze Reason Dialog */}
      <ResponsiveModal
        open={freezeDialogOpen}
        onOpenChange={setFreezeDialogOpen}
        title="Freeze Subscription"
        description={`Pause ${member?.name}'s current membership subscription.`}
      >
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="freeze-reason">Reason (optional)</Label>
            <Input
              id="freeze-reason"
              placeholder="e.g. Vacation, Medical..."
              value={freezeReason}
              onChange={(e) => setFreezeReason(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            className="flex-1 min-h-[44px]"
            onClick={() => setFreezeDialogOpen(false)}
            disabled={isFreezing}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 min-h-[44px] bg-warning text-warning-foreground hover:bg-warning/80"
            onClick={handleFreezeSub}
            disabled={isFreezing}
          >
            {isFreezing ? "Freezing..." : "Freeze Subscription"}
          </Button>
        </div>
      </ResponsiveModal>

      {/* Notes Editor Dialog - responsive */}
      {isEditingNote && (
        <ResponsiveModal
          open
          onOpenChange={setIsEditingNote}
          title="Edit Member Notes"
          description="Update notes about this member's preferences, injuries, or goals."
        >
          <textarea
            className="w-full h-32 bg-surface-hover border border-default rounded-xl p-3 text-sm text-primary focus:outline-none resize-none"
            placeholder="Has a knee injury – avoid lower body exercises..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1 min-h-[44px]"
              onClick={() => setIsEditingNote(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 min-h-[44px]"
              onClick={handleSaveNotes}
              disabled={isUpdatingNotes}
            >
              {isUpdatingNotes ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </ResponsiveModal>
      )}
    </div>
  );
}
