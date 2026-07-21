import { useParams, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { usePlan, useUpdatePlan } from '../hooks/usePlans';
import { EditPlanForm } from '../components/EditPlanForm';
import { EditPlanData } from '../schemas/plan.schema';
import { Skeleton } from '@/components/feedback/Skeleton';

export function EditPlanPage() {
  const { planId = '' } = useParams<{ planId: string }>();
  const navigate = useNavigate();

  const { data: plan, isLoading } = usePlan(planId);
  const { mutateAsync: updatePlan, isPending } = useUpdatePlan(planId);

  const handleSubmit = async (data: EditPlanData) => {
    await updatePlan(data);
    toast.success('Plan updated successfully');
    navigate(`/admin/plans/${planId}`);
  };

  return (
    <div className="min-h-full bg-canvas animate-fade-slide-up">
      {/* Sticky Glass Top Navigation */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-surface/90 border-b border-border-default/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate(`/admin/plans/${planId}`)}
            className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold text-text-muted hover:text-text-primary transition-colors cursor-pointer min-h-[44px] sm:min-h-0 px-2 rounded-lg touch-target"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <span className="text-text-muted/40 font-mono">/</span>
          <span className="text-xs sm:text-sm font-mono font-bold text-text-primary truncate">
            Edit Plan {plan ? `— ${plan.name}` : ''}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto w-full">
        {isLoading ? (
          <div className="space-y-5 bg-surface/80 border border-border-default/80 rounded-2xl p-6 sm:p-8">
            <Skeleton className="h-7 w-48 rounded-lg" />
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
          </div>
        ) : plan ? (
          <div className="bg-surface/80 backdrop-blur-xs border border-border-default/80 rounded-2xl p-5 sm:p-8 shadow-xs">
            <div className="mb-6 pb-4 border-b border-border-default/60">
              <h1 className="font-extrabold text-xl sm:text-2xl text-text-primary tracking-tight font-mono">
                Edit Membership Plan
              </h1>
              <p className="text-xs text-text-secondary mt-1 font-sans">
                Update plan pricing, billing cycle, feature inclusions, and display settings.
              </p>
            </div>
            <EditPlanForm plan={plan} onSubmit={handleSubmit} isSubmitting={isPending} />
          </div>
        ) : (
          <div className="text-center py-20 bg-surface/40 rounded-2xl border border-border-default/60">
            <p className="text-sm font-mono text-text-muted">Plan not found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
