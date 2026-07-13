import React from "react";
import { ColumnDef, PaginationState, SortingState, RowSelectionState } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
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
          <Avatar className="h-8 w-8">
            <AvatarImage src={member.profilePhoto} />
            <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-primary text-sm">{member.name}</span>
            <span className="text-xs text-secondary">{member.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "memberCode",
    header: "Code",
    cell: ({ row }) => <span className="text-sm font-medium text-secondary">{row.getValue("memberCode")}</span>,
  },
  {
    accessorKey: "planName",
    header: "Plan",
    cell: ({ row }) => <span className="text-sm text-primary">{row.getValue("planName") || "-"}</span>,
  },
  {
    accessorKey: "membershipStatus",
    header: "Status",
    cell: ({ row }) => <MemberStatusBadge status={row.getValue("membershipStatus")} />,
  },
  {
    accessorKey: "joiningDate",
    header: "Joined",
    cell: ({ row }) => {
      const date = new Date(row.getValue("joiningDate"));
      return <span className="text-sm text-secondary">{date.toLocaleDateString()}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4 text-muted" />
        </Button>
      );
    },
  },
];

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
