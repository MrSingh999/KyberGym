import { format, parseISO } from "date-fns";
import { Users, Phone, Calendar, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import { useRecentMembers } from "../hooks/useRecentMembers";
import { WidgetContainer, WidgetHeader, WidgetBody } from "../widgets/WidgetContainer";
import { WidgetEmptyState } from "../widgets/WidgetEmptyState";
import { Avatar, AvatarFallback } from "@/components/data-display/Avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";

const statusVariant: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  active: "success",
  inactive: "secondary",
  suspended: "secondary",
  expired: "destructive",
};

export function RecentMembers({ className }: { className?: string }) {
  const navigate = useNavigate();
  const { data: members, isLoading, isError, error, refetch } = useRecentMembers();

  return (
    <WidgetContainer className={className}>
      <WidgetHeader
        title="Recent Members"
        description="Latest member registrations"
        action={
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs font-semibold cursor-pointer"
            onClick={() => navigate("/admin/members")}
          >
            View All
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        }
      />
      <WidgetBody isLoading={isLoading} isEmpty={false} scrollable className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            title="Failed to load"
            message={error?.message || "Could not load recent members"}
            onRetry={() => refetch()}
          />
        ) : !members || members.length === 0 ? (
          <WidgetEmptyState
            icon={<Users className="h-8 w-8" />}
            title="No members yet"
            description="Register your first member to get started."
            actionLabel="Add Member"
            onAction={() => navigate("/admin/members")}
          />
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-start gap-3 p-4 rounded-xl border border-border-default/50 hover:border-border-hover hover:bg-surface-hover/40 transition-all duration-300 hover:shadow-sm hover:translate-y-[-1px] cursor-pointer group"
                onClick={() => navigate(`/admin/members/${member.id}`)}
              >
                <Avatar className="h-10 w-10 shrink-0 mt-0.5">
                  <AvatarFallback className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold font-sans transition-all duration-300 group-hover:scale-105">
                    {member.fullName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 flex-1 gap-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-text-primary truncate group-hover:text-primary transition-colors min-w-0">
                      {member.fullName}
                    </span>
                    <Badge variant={statusVariant[member.status] || "secondary"} className="text-[10px] px-2.5 py-0.5 shrink-0 mt-0.5">
                      {member.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-text-muted font-mono min-w-0">
                      <span>{member.id}</span>
                      {member.phone && (
                        <>
                          <span className="text-border-default shrink-0">|</span>
                          <span className="flex items-center gap-1 min-w-0 overflow-hidden">
                            <Phone className="h-3 w-3 shrink-0" />
                            <span className="truncate">{member.phone}</span>
                          </span>
                        </>
                      )}
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px] text-text-muted font-mono shrink-0">
                      <Calendar className="h-3 w-3" />
                      {format(parseISO(member.joinDate), "MMM d")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </WidgetBody>
    </WidgetContainer>
  );
}
