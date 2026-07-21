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
      className="group relative bg-surface/80 backdrop-blur-xs border border-border-default/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-border-hover/80 transition-all duration-300 cursor-pointer flex flex-col justify-between"
      onClick={() => navigate(`/admin/plans/${plan.id}`)}
    >
      {/* Top accent bar */}
      <div 
        className="h-1.5 w-full transition-opacity group-hover:opacity-100" 
        style={{ backgroundColor: plan.color || "var(--primary)" }} 
      />

      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
              <h3 className="font-bold text-base sm:text-lg text-text-primary truncate group-hover:text-primary transition-colors">
                {plan.name}
              </h3>
              {plan.isPopular && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  Popular
                </span>
              )}
              {plan.isDefault && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted bg-surface-hover px-2 py-0.5 rounded-full border border-border-default font-mono">
                  Default
                </span>
              )}
            </div>
            <PlanStatusBadge status={plan.status} />
          </div>

          {/* Action menu with >=44px touch trigger */}
          <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
            <details className="group/menu">
              <summary className="list-none w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-hover text-text-muted hover:text-text-primary cursor-pointer transition-colors touch-target">
                <MoreVertical className="w-4 h-4" />
              </summary>
              <div className="absolute right-0 top-11 z-20 bg-surface/95 backdrop-blur-md border border-border-default/80 rounded-xl shadow-lg py-1.5 w-44 text-xs font-mono">
                <button
                  onClick={() => navigate(`/admin/plans/${plan.id}/edit`)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-surface-hover text-text-primary transition-colors cursor-pointer min-h-[44px] sm:min-h-0"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Plan
                </button>
                <button
                  onClick={() => onDuplicate(plan.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-surface-hover text-text-primary transition-colors cursor-pointer min-h-[44px] sm:min-h-0"
                >
                  <Copy className="w-3.5 h-3.5" /> Duplicate
                </button>
                {plan.status !== 'archived' && (
                  <button
                    onClick={() => onArchive(plan.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-surface-hover text-error transition-colors cursor-pointer min-h-[44px] sm:min-h-0"
                  >
                    <Archive className="w-3.5 h-3.5" /> Archive Plan
                  </button>
                )}
              </div>
            </details>
          </div>
        </div>

        {/* Price & Duration display */}
        <div className="py-2 px-3 rounded-xl bg-surface-hover/40 border border-border-default/50">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-text-primary tracking-tight">
              ₹{plan.price.toLocaleString()}
            </span>
            <span className="text-xs text-text-muted font-mono">
              / {plan.duration} {DURATION_TYPE_LABELS[plan.durationType]}
            </span>
          </div>
          {plan.joiningFee && plan.joiningFee > 0 ? (
            <p className="text-[11px] text-text-muted mt-1 font-mono">
              + ₹{plan.joiningFee.toLocaleString()} joining fee
            </p>
          ) : (
            <p className="text-[11px] text-text-muted mt-1 font-mono">
              Zero joining fee
            </p>
          )}
        </div>

        {/* Footer Stats row */}
        <div className="flex items-center justify-between pt-3 border-t border-border-default/60 text-xs font-mono text-text-muted">
          <span className="flex items-center gap-1.5 font-bold">
            <Users className="w-3.5 h-3.5 text-primary" />
            {plan.memberCount ?? 0} member{plan.memberCount !== 1 ? 's' : ''}
          </span>
          <span
            className={cn(
              'font-bold px-2 py-0.5 rounded-full text-[10px]',
              plan.featureCount > 0 
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                : 'bg-surface-hover text-text-muted border border-border-default',
            )}
          >
            {plan.featureCount} feature{plan.featureCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
