import React, { useState, useCallback } from "react";
import { PaginationState, SortingState, RowSelectionState } from "@tanstack/react-table";
import { UserPlus } from "lucide-react";
import { MembersToolbar } from "../components/MembersToolbar";
import { MembersTable } from "../components/MembersTable";
import { DirectoryMemberCard } from "../components/DirectoryMemberCard";
import { useMembers, useDeleteMember } from "../hooks/useMembers";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { CreateMemberWizard } from "../components/CreateMemberWizard";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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

export function MembersPage() {
  const queryClient = useQueryClient();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // Table States
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([{ id: "joiningDate", desc: true }]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const { data, isLoading, isError, refetch } = useMembers(pagination, sorting);
  const { mutateAsync: deleteMember, isPending: isDeleting } = useDeleteMember();

  const handleDeleteMember = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteMember(deleteTarget.id);
      toast.success(`${deleteTarget.name} has been deleted.`);
      setDeleteTarget(null);
    } catch (e: any) {
      const errMsg = e.response?.data?.message || "Failed to delete member.";
      toast.error(errMsg);
    }
  }, [deleteTarget, deleteMember]);

  if (isError) {
    return (
      <ErrorState
        title="Failed to load members directory"
        message="Please check your connection and try again."
        onRetry={() => refetch()}
        className="min-h-[50vh]"
      />
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto animate-fade-slide-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 animate-fade-slide-up">
        <div>
          <h1 className="font-bold text-xl sm:text-2xl text-text-primary tracking-tight">
            Members <span className="text-text-secondary font-normal ml-0.5">Directory</span>
          </h1>
          <p className="text-text-secondary mt-1 text-xs font-mono">
            Registry list of active and inactive gym members.
          </p>
        </div>
        <Button
          onClick={() => setIsAddMemberOpen(true)}
          className="flex items-center gap-2 text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 px-4 py-2.5 sm:py-2 rounded-[6px] border border-border-hover min-h-[44px] sm:min-h-0 w-full sm:w-auto justify-center sm:justify-start active:scale-[0.98] cursor-pointer"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Register Member</span>
        </Button>
      </div>

      {/* 4-Column Filter Toolbar */}
      <MembersToolbar sorting={sorting} onSortingChange={setSorting} />

      {/* Responsive View Switcher */}
      <div className="w-full">
        {/* Desktop View: TanStack DataTable */}
        <div className="hidden lg:block">
          <MembersTable
            data={data?.data || []}
            pageCount={data?.meta.pageCount || -1}
            pagination={pagination}
            onPaginationChange={setPagination}
            sorting={sorting}
            onSortingChange={setSorting}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            isLoading={isLoading}
            onDeleteMember={(id, name) => setDeleteTarget({ id, name })}
          />
        </div>

        {/* Mobile/Tablet View: Card Grid */}
        <div className="block lg:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-slide-up">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 space-y-3 bg-surface border border-border-default rounded-[16px] animate-pulse">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full shrink-0" />
                  </div>
                  <Skeleton className="h-[4.5rem] w-full rounded-[8px]" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-11 w-28 rounded-[6px]" />
                  </div>
                </div>
              ))
            ) : data?.data.length ? (
              data.data.map((member) => (
                <DirectoryMemberCard
                  key={member.id}
                  member={member}
                  isSelected={!!rowSelection[member.id]}
                  onSelect={() => {
                    setRowSelection(prev => ({
                      ...prev,
                      [member.id]: !prev[member.id]
                    }));
                  }}
                  onDeleteMember={(id, name) => setDeleteTarget({ id, name })}
                />
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState
                  icon={<UserPlus className="h-8 w-8" />}
                  title="No members found"
                  description="Try adjusting your search or filter criteria."
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Register Member Modal */}
      <ResponsiveModal
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
        title="Register Gym Member"
      >
        <CreateMemberWizard
          onSuccess={() => {
            setIsAddMemberOpen(false);
            queryClient.invalidateQueries({ queryKey: ["members"] });
          }}
          onCancel={() => setIsAddMemberOpen(false)}
        />
      </ResponsiveModal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteTarget?.name}? This action cannot be undone.
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
    </div>
  );
}
