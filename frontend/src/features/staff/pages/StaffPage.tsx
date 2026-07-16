import { useState } from "react";
import { toast } from "sonner";
import { Search, UserPlus, Pencil, Trash2, Shield, Loader2 } from "lucide-react";
import { useStaffUsers, useUpdateUser, useDeleteUser } from "../hooks/useStaff";
import type { StaffUser, UpdateUserData } from "../types";
import { Button, LoadingButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
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
import { useQueryClient } from "@tanstack/react-query";

const ROLE_OPTIONS = [
  { value: "staff", label: "Staff" },
  { value: "trainer", label: "Trainer" },
  { value: "member", label: "Member" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

const ROLE_BADGE_VARIANTS: Record<string, "default" | "secondary" | "outline" | "success" | "warning"> = {
  gym_admin: "default",
  staff: "secondary",
  trainer: "success",
  member: "outline",
};

const STATUS_BADGE_VARIANTS: Record<string, "default" | "secondary" | "outline" | "success" | "warning"> = {
  active: "success",
  inactive: "secondary",
  suspended: "warning",
};

export function StaffPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useStaffUsers({ page, limit: 20, search, role: roleFilter || undefined });
  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();
  const { mutateAsync: deleteUser, isPending: isDeleting } = useDeleteUser();

  // Edit modal state
  const [editTarget, setEditTarget] = useState<StaffUser | null>(null);
  const [editForm, setEditForm] = useState<UpdateUserData>({});

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const openEditModal = (user: StaffUser) => {
    setEditTarget(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    });
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    const changed: UpdateUserData = {};
    if (editForm.name !== editTarget.name) changed.name = editForm.name;
    if (editForm.email !== editTarget.email) changed.email = editForm.email;
    if (editForm.phone !== editTarget.phone) changed.phone = editForm.phone;
    if (editForm.role !== editTarget.role) changed.role = editForm.role;
    if (editForm.status !== editTarget.status) changed.status = editForm.status;

    if (Object.keys(changed).length === 0) {
      toast.info("No changes made");
      setEditTarget(null);
      return;
    }

    try {
      await updateUser({ userId: editTarget._id, data: changed });
      toast.success("User updated");
      setEditTarget(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to update user");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.id);
      toast.success(`${deleteTarget.name} has been deleted.`);
      setDeleteTarget(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to delete user");
    }
  };

  if (isError) {
    return (
      <ErrorState
        title="Failed to load users"
        message="Please check your connection and try again."
        onRetry={() => refetch()}
        className="min-h-[50vh]"
      />
    );
  }

  const users = data?.users || [];
  const meta = data?.meta;

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto animate-fade-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-bold text-xl sm:text-2xl text-text-primary tracking-tight">Staff & Users</h1>
          <p className="text-text-secondary mt-1 text-xs">Manage gym staff, trainers, and members.</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="search"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-border-default bg-surface text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="w-full sm:w-44">
          <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">All Roles</SelectItem>
              {ROLE_OPTIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border-default bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-default bg-surface-hover/50">
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3">Email</th>
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Phone</th>
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border-default last:border-0">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12">
                    <EmptyState
                      title="No users found"
                      description="Try adjusting your search or filter criteria."
                    />
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="border-b border-border-default last:border-0 hover:bg-surface-hover/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{user.name}</p>
                          <p className="text-xs text-text-muted sm:hidden">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary hidden sm:table-cell">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary hidden sm:table-cell">{user.phone || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={ROLE_BADGE_VARIANTS[user.role] || "outline"} className="capitalize">
                        {user.role === "gym_admin" ? "Admin" : user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_BADGE_VARIANTS[user.status] || "outline"} className="capitalize">
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                          title="Edit user"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {user.role !== "gym_admin" && (
                          <button
                            onClick={() => setDeleteTarget({ id: user._id, name: user.name })}
                            className="p-2 rounded-lg text-text-muted hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-default">
            <p className="text-sm text-text-muted">
              Page {meta.page} of {meta.totalPages} ({meta.total} total)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      <ResponsiveModal
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
        title="Edit User"
        description={editTarget ? `Update details for ${editTarget.name}` : ""}
      >
        {editTarget && (
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name || ""}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email || ""}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={editForm.phone || ""}
                onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={editForm.role || ""}
                onValueChange={(v) => setEditForm((f) => ({ ...f, role: v }))}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editForm.status || ""}
                onValueChange={(v) => setEditForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border-default">
              <Button variant="outline" onClick={() => setEditTarget(null)} disabled={isUpdating}>
                Cancel
              </Button>
              <LoadingButton onClick={handleEditSave} loading={isUpdating}>
                Save Changes
              </LoadingButton>
            </div>
          </div>
        )}
      </ResponsiveModal>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteTarget?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/80 cursor-pointer"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
