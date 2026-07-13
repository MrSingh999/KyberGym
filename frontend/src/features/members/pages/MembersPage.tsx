import React, { useState } from "react";
import { PaginationState, SortingState, RowSelectionState } from "@tanstack/react-table";
import { UserPlus } from "lucide-react";
import { MembersToolbar } from "../components/MembersToolbar";
import { MembersTable } from "../components/MembersTable";
import { DirectoryMemberCard } from "../components/DirectoryMemberCard";
import { useMembers } from "../hooks/useMembers";
import { useMemberDirectoryStore } from "../store/useMemberDirectoryStore";
import { Skeleton } from "@/components/feedback/Skeleton";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { CreateMemberWizard } from "../components/CreateMemberWizard";
import { useQueryClient } from "@tanstack/react-query";

export function MembersPage() {
  const { viewMode } = useMemberDirectoryStore();
  const queryClient = useQueryClient();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // Table States (passed to TanStack query for server-side processing)
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([{ id: "joiningDate", desc: true }]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { data, isLoading } = useMembers(pagination, sorting);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto animate-fade-slide-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-bold text-xl sm:text-2xl text-text-primary tracking-tight">
            Member <span className="text-text-secondary font-normal">Directory</span>
          </h1>
          <p className="text-text-secondary mt-1 text-xs font-mono">
            Manage gym memberships, plans, and statuses.
          </p>
        </div>
        <Button
          onClick={() => setIsAddMemberOpen(true)}
          className="flex items-center gap-2 text-xs font-semibold"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Register Member</span>
        </Button>
      </div>

      {/* 4-Column Filter Toolbar */}
      <MembersToolbar sorting={sorting} onSortingChange={setSorting} />

      {/* Bulk Action Bar would conditionally render here */}

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
          />
        </div>

        {/* Mobile/Tablet View: Card Grid */}
        <div className="block lg:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-xl" />
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
                />
              ))
            ) : (
              <div className="col-span-full py-16 text-center">
                <p className="text-text-muted text-xs font-mono uppercase tracking-wider">
                  No members found.
                </p>
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
    </div>
  );
}
