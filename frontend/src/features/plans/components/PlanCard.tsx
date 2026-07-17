import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { MoreVertical, Edit3, Copy, Archive, Star, Users } from 'lucide-react';
import { PlanListItem, DURATION_TYPE_LABELS } from '../types';
import { PlanStatusBadge } from './PlanStatusBadge';
import { cn } from '@/lib/utils';

interface PlanCardProps {
  plan: PlanListItem;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
  index?: number;
}

export function PlanCard({ plan, onDuplicate, onArchive, index = 0 }: PlanCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.04 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="group relative bg-surface border border-border-default rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-border-hover transition-all cursor-pointer"
      onClick={() => navigate(`/admin/plans/${plan.id}`)}
    >
      {/* Accent stripe */}
      {plan.color && (
        <div className="h-1 w-full" style={{ backgroundColor: plan.color }} />
      )}

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-base text-text-primary truncate">
                {plan.name}
              </h3>
              {plan.isPopular && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-warning bg-warning/10 px-1.5 py-0.5 rounded-full">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  Popular
                </span>
              )}
              {plan.isDefault && (
                <span className="text-[10px] font-bold uppercase tracking-wide text-text-muted bg-surface-hover px-1.5 py-0.5 rounded-full border border-border-default">
                  Default
                </span>
              )}
            </div>
            <PlanStatusBadge status={plan.status} />
          </div>

          {/* Action menu */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <details className="group/menu">
              <summary className="list-none p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary cursor-pointer transition-colors">
                <MoreVertical className="w-4 h-4" />
              </summary>
              <div className="absolute right-0 top-8 z-20 bg-surface border border-border-default rounded-xl shadow-lg py-1.5 w-40 text-sm">
                <button
                  onClick={() => navigate(`/admin/plans/${plan.id}/edit`)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-surface-hover text-text-primary transition-colors cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => onDuplicate(plan.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-surface-hover text-text-primary transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4" /> Duplicate
                </button>
                {plan.status !== 'archived' && (
                  <button
                    onClick={() => onArchive(plan.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-surface-hover text-error transition-colors cursor-pointer"
                  >
                    <Archive className="w-4 h-4" /> Archive
                  </button>
                )}
              </div>
            </details>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-heading text-text-primary tabular-nums">
              ₹{plan.price}
            </span>
            <span className="text-sm text-text-muted">
              / {plan.duration} {DURATION_TYPE_LABELS[plan.durationType]}
            </span>
          </div>
          {plan.joiningFee && plan.joiningFee > 0 && (
            <p className="text-xs text-text-muted mt-0.5">+ ₹{plan.joiningFee} joining fee</p>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between pt-3 border-t border-border-default text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {plan.memberCount ?? 0} member{plan.memberCount !== 1 ? 's' : ''}
          </span>
          <span
            className={cn(
              'font-medium',
              plan.featureCount > 0 ? 'text-success' : 'text-text-muted',
            )}
          >
            {plan.featureCount} feature{plan.featureCount !== 1 ? 's' : ''} included
          </span>
        </div>
      </div>
    </motion.div>
  );
}
