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
    <div className="min-h-full bg-canvas">
      <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-border-default bg-surface">
        <button
          onClick={() => navigate(`/admin/plans/${planId}`)}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <span className="text-text-muted/40">/</span>
        <span className="text-sm font-semibold text-text-primary">Edit Plan</span>
      </div>

      <div className="p-4 sm:p-8 max-w-2xl mx-auto">
        {isLoading ? (
          <div className="space-y-5">
            <Skeleton className="h-7 w-40" />
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-11 rounded-lg" />)}
          </div>
        ) : plan ? (
          <div className="bg-surface border border-border-default rounded-2xl p-6 sm:p-8 shadow-sm">
            <h1 className="font-bold text-xl text-text-primary mb-8 tracking-tight">Edit — {plan.name}</h1>
            <EditPlanForm plan={plan} onSubmit={handleSubmit} isSubmitting={isPending} />
          </div>
        ) : (
          <p className="text-muted text-center py-20">Plan not found.</p>
        )}
      </div>
    </div>
  );
}
