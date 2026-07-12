import React, { useState } from "react";
import { PaginationState, SortingState, RowSelectionState } from "@tanstack/react-table";
import { MembersToolbar } from "../components/MembersToolbar";
import { MembersTable } from "../components/MembersTable";
import { DirectoryMemberCard } from "../components/DirectoryMemberCard";
import { useMembers } from "../hooks/useMembers";
import { useMemberDirectoryStore } from "../store/useMemberDirectoryStore";
import { Skeleton } from "../../../../components/feedback/Skeleton";

export function MembersPage() {
  const { viewMode } = useMemberDirectoryStore();
  
  // Table States (passed to TanStack query for server-side processing)
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { data, isLoading } = useMembers(pagination, sorting);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-primary tracking-tight">Members</h1>
        <p className="text-secondary mt-1">Manage your gym members, plans, and statuses.</p>
      </div>

      <MembersToolbar />

      {/* Bulk Action Bar would conditionally render here based on Object.keys(rowSelection).length > 0 */}

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
              <div className="col-span-full py-12 text-center text-secondary">
                No members found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
