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

export function RecentMembers() {
  const navigate = useNavigate();
  const { data: members, isLoading, isError, error, refetch } = useRecentMembers();

  return (
    <WidgetContainer>
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
      <WidgetBody isLoading={isLoading} isEmpty={false}>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
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
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border-default hover:border-border-hover hover:bg-surface-hover/30 transition-all cursor-pointer group"
                onClick={() => navigate(`/admin/members/${member.id}`)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback>
                      {member.fullName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                      {member.fullName}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-text-muted font-mono">
                      <span>{member.memberCode}</span>
                      {member.phone && (
                        <>
                          <span className="text-border-default">|</span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-2.5 w-2.5" />
                            {member.phone}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={statusVariant[member.status] || "secondary"} className="text-[9px] px-2 py-0.5">
                    {member.status}
                  </Badge>
                  <span className="flex items-center gap-1 text-[9px] text-text-muted font-mono">
                    <Calendar className="h-2.5 w-2.5" />
                    {new Date(member.joinDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </WidgetBody>
    </WidgetContainer>
  );
}
