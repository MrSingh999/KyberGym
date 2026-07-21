import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Edit3, Copy, Archive, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { usePlan, useDuplicatePlan, useArchivePlan, useSetPlanStatus } from '../hooks/usePlans';
import { PlanOverviewCard } from '../components/PlanOverviewCard';
import { Skeleton } from '@/components/feedback/Skeleton';

export function PlanDetailPage() {
  const { planId = '' } = useParams<{ planId: string }>();
  const navigate = useNavigate();

  const { data: plan, isLoading } = usePlan(planId);
  const { mutate: duplicate, isPending: duplicating } = useDuplicatePlan();
  const { mutate: archive, isPending: archiving } = useArchivePlan();
  const { mutate: setStatus, isPending: togglingStatus } = useSetPlanStatus();

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 max-w-2xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-1.5 w-full" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted">Plan not found.</p>
        <button onClick={() => navigate('/admin/plans')} className="text-sm text-primary underline">
          Back to Plans
        </button>
      </div>
    );
  }

  const isActive = plan.status === 'active';

  return (
      <div className="flex flex-col min-h-full bg-canvas">
        {/* Top sticky bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-surface/90 border-b border-border-default/80 backdrop-blur-md">
          <button
            onClick={() => navigate('/admin/plans')}
            className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold text-text-muted hover:text-text-primary transition-colors cursor-pointer min-h-[44px] sm:min-h-0 px-2 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Plans</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                duplicate(planId, { onSuccess: (copy) => { toast.success('Plan duplicated'); navigate(`/admin/plans/${copy.id}`); } });
              }}
              disabled={duplicating}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm font-mono font-bold text-text-muted border border-border-default rounded-xl hover:border-border-hover hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50 min-h-[44px] sm:min-h-0 touch-target"
            >
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">Duplicate</span>
            </button>

            <button
              onClick={() => setStatus({ planId, status: isActive ? 'inactive' : 'active' }, { onSuccess: () => toast.success(`Plan ${isActive ? 'deactivated' : 'activated'}`) })}
              disabled={togglingStatus}
              className={cn(
                "flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm font-mono font-bold border rounded-xl transition-colors cursor-pointer disabled:opacity-50 min-h-[44px] sm:min-h-0 touch-target",
                isActive
                  ? "border-error/30 text-error hover:bg-error/10"
                  : "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
              )}
            >
              {isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              <span className="hidden sm:inline">{isActive ? 'Deactivate' : 'Activate'}</span>
            </button>

            <button
              onClick={() => navigate(`/admin/plans/${planId}/edit`)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-mono font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity cursor-pointer min-h-[44px] sm:min-h-0 touch-target shadow-xs"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full animate-fade-slide-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PlanOverviewCard plan={plan} />

            {/* Stats / metadata panel */}
            <div className="space-y-4">
              <div className="bg-surface/80 backdrop-blur-xs border border-border-default/80 rounded-2xl p-5 shadow-xs space-y-3.5">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider font-mono">Plan Diagnostics</h3>
                {[
                  { label: 'Plan ID', value: plan.id },
                  { label: 'Created', value: new Date(plan.createdAt).toLocaleDateString() },
                  { label: 'Last Updated', value: new Date(plan.updatedAt).toLocaleDateString() },
                  { label: 'Active Members', value: String(plan.memberCount ?? 0) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center text-xs sm:text-sm font-mono py-1 border-b border-border-default/40 last:border-b-0">
                    <span className="text-text-muted">{label}</span>
                    <span className="font-bold text-text-primary">{value}</span>
                  </div>
                ))}
              </div>

              {plan.status !== 'archived' && (
                <button
                  onClick={() => archive(planId, { onSuccess: () => { toast.success('Plan archived'); navigate('/admin/plans'); } })}
                  disabled={archiving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-mono font-bold text-error border border-error/30 rounded-xl hover:bg-error/10 transition-colors cursor-pointer disabled:opacity-50 min-h-[44px] touch-target"
                >
                  <Archive className="w-4 h-4" />
                  Archive this plan
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
