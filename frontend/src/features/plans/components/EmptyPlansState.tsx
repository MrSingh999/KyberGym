import { motion } from 'framer-motion';
import { LayoutGrid, Search, Filter } from 'lucide-react';

type EmptyPlansVariant = 'no-plans' | 'no-search' | 'no-filter';

const CONFIG: Record<EmptyPlansVariant, { icon: React.ElementType; title: string; description: string }> = {
  'no-plans': {
    icon: LayoutGrid,
    title: 'No membership plans yet',
    description: 'Create your first plan to start enrolling members.',
  },
  'no-search': {
    icon: Search,
    title: 'No plans match your search',
    description: 'Try a different name or description.',
  },
  'no-filter': {
    icon: Filter,
    title: 'No plans match your filters',
    description: 'Clear filters to see all plans.',
  },
};

interface EmptyPlansStateProps {
  variant?: EmptyPlansVariant;
  onAction?: () => void;
  actionLabel?: string;
}

export function EmptyPlansState({
  variant = 'no-plans',
  onAction,
  actionLabel,
}: EmptyPlansStateProps) {
  const { icon: Icon, title, description } = CONFIG[variant];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-center justify-center py-16 sm:py-20 px-6 text-center bg-surface/40 backdrop-blur-xs border border-border-default/60 rounded-2xl"
    >
      <div className="w-16 h-16 rounded-2xl bg-surface-hover/80 border border-border-default flex items-center justify-center mb-4 shadow-xs">
        <Icon className="w-7 h-7 text-text-muted" />
      </div>
      <h3 className="font-bold text-base sm:text-lg text-text-primary mb-1.5 font-mono">{title}</h3>
      <p className="text-xs text-text-muted max-w-xs mb-6 font-mono">{description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="px-5 h-11 bg-primary text-primary-foreground rounded-xl text-xs font-mono font-bold hover:opacity-90 transition-opacity shadow-xs cursor-pointer min-h-[44px] touch-target"
        >
          {actionLabel ?? 'Get Started'}
        </button>
      )}
    </motion.div>
  );
}
