import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Edit3, Copy, Archive, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { usePlan, useDuplicatePlan, useArchivePlan, useSetPlanStatus } from '../hooks/usePlans';
import { PlanOverviewCard } from '../components/PlanOverviewCard';
import { Skeleton } from '@/components/feedback/Skeleton';

export function PlanDetailPage() {
  const { planId = '' } = useParams<{ planId: string }>();
  const navigate = useNavigate();

  const { data: plan, isLoading } = usePlan(planId);
  const { mutate: duplicate, isPending: duplicating } = useDuplicatePlan();
  const { mutate: archive, isPending: archiving } = useArchivePlan(planId);
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
      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-surface/90 border-b border-default backdrop-blur-md">
        <button
          onClick={() => navigate('/admin/plans')}
          className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Plans</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              duplicate(planId, { onSuccess: (copy) => { toast.success('Plan duplicated'); navigate(`/admin/plans/${copy.id}`); } });
            }}
            disabled={duplicating}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted border border-default rounded-xl hover:border-hover hover:text-primary transition-colors"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Duplicate</span>
          </button>

          <button
            onClick={() => setStatus({ planId, status: isActive ? 'inactive' : 'active' }, { onSuccess: () => toast.success(`Plan ${isActive ? 'deactivated' : 'activated'}`) })}
            disabled={togglingStatus}
            className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-xl transition-colors ${
              isActive
                ? 'border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                : 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
            }`}
          >
            {isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            <span className="hidden sm:inline">{isActive ? 'Deactivate' : 'Activate'}</span>
          </button>

          <button
            onClick={() => navigate(`/admin/plans/${planId}/edit`)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PlanOverviewCard plan={plan} />

          {/* Stats / metadata panel */}
          <div className="space-y-4">
            <div className="bg-surface border border-default rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Details</h3>
              {[
                { label: 'Plan ID', value: plan.id },
                { label: 'Created', value: new Date(plan.createdAt).toLocaleDateString() },
                { label: 'Last Updated', value: new Date(plan.updatedAt).toLocaleDateString() },
                { label: 'Members Enrolled', value: String(plan.memberCount ?? 0) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted">{label}</span>
                  <span className="font-medium text-primary">{value}</span>
                </div>
              ))}
            </div>

            {plan.status !== 'archived' && (
              <button
                onClick={() => archive(undefined, { onSuccess: () => { toast.success('Plan archived'); navigate('/admin/plans'); } })}
                disabled={archiving}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-destructive border border-destructive/30 rounded-xl hover:bg-destructive/5 transition-colors"
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
