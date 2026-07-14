import React from "react";
import { ColumnDef, PaginationState, SortingState, RowSelectionState } from "@tanstack/react-table";
import { History, Edit, Trash2, Phone, Calendar } from "lucide-react";
import { useNavigate } from "react-router";
import { DataTable } from "@/components/data-display/DataTable";
import { MemberDirectoryItem } from "../types";
import { MemberStatusBadge } from "./MemberStatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/data-display/Avatar";
import { Button } from "@/components/ui/button";

interface MembersTableProps {
  data: MemberDirectoryItem[];
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: React.Dispatch<React.SetStateAction<PaginationState>>;
  sorting: SortingState;
  onSortingChange: React.Dispatch<React.SetStateAction<SortingState>>;
  rowSelection: RowSelectionState;
  onRowSelectionChange: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  isLoading: boolean;
}

const formatDate = (dateStr: string | undefined | null) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const columns: ColumnDef<MemberDirectoryItem>[] = [
  {
    accessorKey: "name",
    header: "Member",
    cell: ({ row }) => {
      const member = row.original;
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8 rounded-full border border-border-default shrink-0">
            <AvatarImage src={member.profilePhoto} />
            <AvatarFallback className="bg-surface text-text-secondary text-[10px] font-black uppercase shrink-0">
              {member.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-semibold text-text-primary text-[13px] truncate">{member.name}</div>
            <div className="flex items-center text-xs text-text-muted space-x-1.5 mt-0.5 font-mono">
              <Phone className="h-3 w-3 shrink-0" />
              <span className="truncate">{member.phone}</span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => (
      <div className="text-text-secondary capitalize text-[13px]">
        {row.original.gender || "—"}
      </div>
    ),
  },
  {
    accessorKey: "planName",
    header: "Plan",
    cell: ({ row }) => (
      <span className="text-text-secondary font-medium capitalize text-[13px] font-mono">
        {row.getValue("planName") || "—"}
      </span>
    ),
  },
  {
    id: "timeline",
    header: "Timeline",
    cell: ({ row }) => {
      const member = row.original;
      return (
        <div className="flex items-center text-xs text-text-secondary space-x-1 font-mono">
          <Calendar className="h-3 w-3 text-text-muted shrink-0" />
          <span className="tabular-nums">
            {formatDate(member.joiningDate)} → {formatDate(member.membershipEndDate)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "membershipStatus",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <MemberStatusBadge status={row.getValue("membershipStatus")} />
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const member = row.original;
      return <ActionButtons member={member} />;
    },
  },
];

interface ActionButtonsProps {
  member: MemberDirectoryItem;
}

function ActionButtons({ member }: ActionButtonsProps) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-end space-x-1.5">
      <Button
        onClick={() => navigate(`/admin/payments/collect?memberId=${member.id}`)}
        className="bg-primary hover:opacity-90 text-primary-foreground px-3 py-1.5 rounded-[4px] text-[10px] font-bold transition-all duration-200 cursor-pointer border border-border-hover h-auto min-h-0"
      >
        Renew
      </Button>
      <button
        onClick={() => navigate(`/admin/members/${member.id}`)}
        title="Payment History"
        className="p-1.5 border border-border-default rounded-[4px] text-text-secondary hover:text-text-primary hover:bg-elevated hover:border-border-hover transition-all duration-200 cursor-pointer"
      >
        <History className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => navigate(`/admin/members/${member.id}`)}
        title="Edit Details"
        className="p-1.5 border border-border-default rounded-[4px] text-text-secondary hover:text-text-primary hover:bg-elevated hover:border-border-hover transition-all duration-200 cursor-pointer"
      >
        <Edit className="h-3.5 w-3.5" />
      </button>
      <button
        title="Delete Member"
        className="p-1.5 border border-border-default rounded-[4px] text-text-secondary hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-200 cursor-pointer"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function MembersTable({
  data,
  pageCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  rowSelection,
  onRowSelectionChange,
  isLoading,
}: MembersTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      sorting={sorting}
      onSortingChange={onSortingChange}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      isLoading={isLoading}
    />
  );
}
