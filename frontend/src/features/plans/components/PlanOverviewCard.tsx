import { DollarSign, Clock, Users, Star } from 'lucide-react';
import { MembershipPlan, DURATION_TYPE_LABELS } from '../types';
import { PlanStatusBadge } from './PlanStatusBadge';
import { PlanFeaturesList } from './PlanFeaturesList';

interface PlanOverviewCardProps {
  plan: MembershipPlan;
}

export function PlanOverviewCard({ plan }: PlanOverviewCardProps) {
  return (
    <div className="bg-surface border border-default rounded-2xl overflow-hidden shadow-sm">
      {plan.color && <div className="h-1.5" style={{ backgroundColor: plan.color }} />}

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-xl text-primary">{plan.name}</h2>
            <PlanStatusBadge status={plan.status} />
          </div>
          {plan.description && <p className="text-sm text-secondary">{plan.description}</p>}
          <div className="flex gap-2 flex-wrap">
            {plan.isPopular && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                <Star className="w-3 h-3 fill-current" /> Popular
              </span>
            )}
            {plan.isDefault && (
              <span className="text-xs font-semibold text-muted bg-surface-hover px-2 py-0.5 rounded-full border border-default">
                Default Plan
              </span>
            )}
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: DollarSign, label: 'Price', value: `$${plan.price}` },
            { icon: Clock, label: 'Duration', value: `${plan.duration} ${DURATION_TYPE_LABELS[plan.durationType]}` },
            { icon: Users, label: 'Members', value: String(plan.memberCount ?? 0) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center p-3 rounded-xl bg-surface-hover border border-subtle text-center">
              <Icon className="w-4 h-4 text-muted mb-1.5" />
              <span className="text-base font-bold text-primary">{value}</span>
              <span className="text-[10px] text-muted mt-0.5">{label}</span>
            </div>
          ))}
        </div>

        {plan.joiningFee && plan.joiningFee > 0 && (
          <p className="text-xs text-muted">
            + ${plan.joiningFee} one-time joining fee
          </p>
        )}

        {/* Features */}
        {plan.features.length > 0 && (
          <div className="pt-4 border-t border-subtle">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">What's included</p>
            <PlanFeaturesList features={plan.features} />
          </div>
        )}
      </div>
    </div>
  );
}
