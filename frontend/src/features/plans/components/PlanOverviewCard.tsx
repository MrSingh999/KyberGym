import { IndianRupee, Clock, Users, Star } from 'lucide-react';
import { MembershipPlan, DURATION_TYPE_LABELS } from '../types';
import { PlanStatusBadge } from './PlanStatusBadge';
import { PlanFeaturesList } from './PlanFeaturesList';

interface PlanOverviewCardProps {
  plan: MembershipPlan;
}

export function PlanOverviewCard({ plan }: PlanOverviewCardProps) {
  return (
    <div className="bg-surface/80 backdrop-blur-xs border border-border-default/80 rounded-2xl overflow-hidden shadow-xs">
      {plan.color && <div className="h-1.5" style={{ backgroundColor: plan.color }} />}

      <div className="p-5 sm:p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold text-xl sm:text-2xl text-text-primary tracking-tight">{plan.name}</h2>
            <PlanStatusBadge status={plan.status} />
          </div>
          {plan.description && <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{plan.description}</p>}
          <div className="flex gap-2 flex-wrap pt-1">
            {plan.isPopular && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                <Star className="w-3 h-3 fill-current" /> Popular
              </span>
            )}
            {plan.isDefault && (
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-text-muted bg-surface-hover px-2 py-0.5 rounded-full border border-border-default">
                Default Plan
              </span>
            )}
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: IndianRupee, label: 'Price', value: `₹${plan.price.toLocaleString()}` },
            { icon: Clock, label: 'Duration', value: `${plan.duration} ${DURATION_TYPE_LABELS[plan.durationType]}` },
            { icon: Users, label: 'Members', value: String(plan.memberCount ?? 0) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center p-3 rounded-xl bg-surface-hover/50 border border-border-default/60 text-center">
              <Icon className="w-4 h-4 text-primary mb-1" />
              <span className="text-sm sm:text-base font-extrabold font-mono text-text-primary">{value}</span>
              <span className="text-[10px] text-text-muted uppercase font-mono mt-0.5 font-bold">{label}</span>
            </div>
          ))}
        </div>

        {plan.joiningFee && plan.joiningFee > 0 ? (
          <p className="text-xs text-text-muted font-mono">
            + ₹{plan.joiningFee.toLocaleString()} one-time joining fee
          </p>
        ) : (
          <p className="text-xs text-text-muted font-mono">
            Zero joining fee
          </p>
        )}

        {/* Features */}
        {plan.features.length > 0 && (
          <div className="pt-4 border-t border-border-default/60">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider font-mono mb-3">What's included</p>
            <PlanFeaturesList features={plan.features} />
          </div>
        )}
      </div>
    </div>
  );
}
