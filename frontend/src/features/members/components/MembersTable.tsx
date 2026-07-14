import React from "react";
import { ColumnDef, PaginationState, SortingState, RowSelectionState } from "@tanstack/react-table";
import { MoreHorizontal, Eye } from "lucide-react";
import { useNavigate } from "react-router";
import { DataTable } from "@/components/data-display/DataTable";
import { MemberDirectoryItem } from "../types";
import { MemberStatusBadge } from "./MemberStatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/data-display/Avatar";
import { Checkbox } from "@/components/ui/checkbox";
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

const columns: ColumnDef<MemberDirectoryItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Member",
    cell: ({ row }) => {
      const member = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border border-border-default">
            <AvatarImage src={member.profilePhoto} />
            <AvatarFallback className="bg-surface text-text-secondary text-[10px] font-bold font-sans">
              {member.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-semibold text-text-primary text-[13px] truncate">{member.name}</div>
            <div className="flex items-center text-xs text-text-muted space-x-1.5 mt-0.5 font-mono">
              <span className="truncate">{member.email}</span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "memberCode",
    header: "Code",
    cell: ({ row }) => (
      <span className="text-xs font-semibold text-text-secondary font-mono">
        {row.getValue("memberCode")}
      </span>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="text-xs text-text-secondary font-mono">
        {row.getValue("phone") || "—"}
      </span>
    ),
  },
  {
    accessorKey: "planName",
    header: "Plan",
    cell: ({ row }) => (
      <span className="text-xs text-text-secondary font-mono capitalize">
        {row.getValue("planName") || "—"}
      </span>
    ),
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
    accessorKey: "joiningDate",
    header: "Joined",
    cell: ({ row }) => {
      const date = new Date(row.getValue("joiningDate"));
      return (
        <span className="text-xs text-text-muted font-mono">
          {isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const member = row.original;
      return <ActionButtons memberId={member.id} />;
    },
  },
];

interface ActionButtonsProps {
  memberId: string;
}

function ActionButtons({ memberId }: ActionButtonsProps) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-1.5 justify-end">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => navigate(`/admin/members/${memberId}`)}
        title="View Profile"
        className="text-text-secondary hover:text-text-primary border border-border-default h-7 w-7 rounded-[4px] cursor-pointer"
      >
        <Eye className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="default"
        size="xs"
        onClick={() => navigate(`/admin/payments/collect?memberId=${memberId}`)}
        className="text-[10px] font-bold h-7 rounded-[4px] cursor-pointer"
      >
        Collect
      </Button>
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
