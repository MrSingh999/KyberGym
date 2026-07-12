import { Check, X } from 'lucide-react';
import { PlanFeature } from '../types';
import { cn } from '../../../../lib/utils';

interface PlanFeaturesListProps {
  features: PlanFeature[];
  compact?: boolean;
  className?: string;
}

export function PlanFeaturesList({ features, compact = false, className }: PlanFeaturesListProps) {
  return (
    <ul className={cn('space-y-2', className)}>
      {features.map((feature) => (
        <li key={feature.id} className={cn('flex items-center gap-2.5 text-sm', compact && 'text-xs')}>
          <span
            className={cn(
              'flex-shrink-0 flex items-center justify-center rounded-full',
              compact ? 'w-4 h-4' : 'w-5 h-5',
              feature.included
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-surface-hover text-muted',
            )}
          >
            {feature.included ? (
              <Check className={compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} strokeWidth={2.5} />
            ) : (
              <X className={compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} strokeWidth={2.5} />
            )}
          </span>
          <span className={feature.included ? 'text-primary' : 'text-muted line-through'}>
            {feature.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
