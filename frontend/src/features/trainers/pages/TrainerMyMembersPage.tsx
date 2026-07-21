import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Users, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router";
import { useMyMembers } from "../hooks/useTrainers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/feedback/Skeleton";
import { EmptyState } from "@/components/feedback/EmptyState";

export function TrainerMyMembersPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useMyMembers({ page, limit: 20 });

  const assignments = data?.data ?? [];
  const meta = data as any;

  const filtered = search
    ? assignments.filter((a: any) =>
        a.memberId?.fullName?.toLowerCase().includes(search.toLowerCase())
      )
    : assignments;

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <h1 className="font-bold text-xl sm:text-2xl text-text-primary tracking-tight">My Members</h1>
        <p className="text-text-secondary mt-1 text-xs font-mono">Members assigned to you.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface border border-border-default rounded-[6px] pl-9 pr-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-hover font-mono"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border-default rounded-[12px] p-4 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No members assigned" description="Members assigned to you by the gym owner will appear here." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((a: any, i: number) => (
              <motion.div
                key={a._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-surface border border-border-default rounded-[12px] p-4 space-y-2 hover:border-border-hover transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary font-mono">{a.memberId?.fullName}</p>
                    <p className="text-xs text-text-muted font-mono mt-0.5">{a.memberId?.email}</p>
                  </div>
                  <Badge variant={a.memberId?.status === "active" ? "success" : "secondary"} className="text-[9px]">
                    {a.memberId?.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted font-mono">
                  {a.memberId?.memberCode && <span>#{a.memberId.memberCode}</span>}
                  {a.memberId?.phone && <span>· {a.memberId.phone}</span>}
                </div>
                <p className="text-[10px] text-text-muted font-mono">
                  Assigned {new Date(a.assignedAt).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <span className="text-xs font-mono text-text-secondary px-2">Page {meta.page} of {meta.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
