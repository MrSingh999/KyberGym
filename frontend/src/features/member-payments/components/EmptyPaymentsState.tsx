import { motion } from 'framer-motion';
import { ReceiptText, Search, Filter } from 'lucide-react';

type EmptyPaymentsVariant = 'no-payments' | 'no-search' | 'no-filter' | 'no-dues';

const CONFIG: Record<EmptyPaymentsVariant, { icon: React.ElementType; title: string; description: string }> = {
  'no-payments': {
    icon: ReceiptText,
    title: 'No payments recorded yet',
    description: 'Collect your first payment to get started.',
  },
  'no-search': {
    icon: Search,
    title: 'No payments match your search',
    description: 'Try searching by member name, phone, or transaction ID.',
  },
  'no-filter': {
    icon: Filter,
    title: 'No payments match your filters',
    description: 'Try adjusting your date range, status, or method filters.',
  },
  'no-dues': {
    icon: ReceiptText,
    title: 'No upcoming dues',
    description: 'All memberships are up to date.',
  },
};

interface EmptyPaymentsStateProps {
  variant?: EmptyPaymentsVariant;
  onAction?: () => void;
  actionLabel?: string;
}

export function EmptyPaymentsState({
  variant = 'no-payments',
  onAction,
  actionLabel,
}: EmptyPaymentsStateProps) {
  const { icon: Icon, title, description } = CONFIG[variant];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-center justify-center py-16 sm:py-20 px-4 sm:px-6 text-center"
    >
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-surface-hover border border-border-default flex items-center justify-center mb-4 shadow-sm">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-text-muted" />
      </div>
      <h3 className="font-heading font-semibold text-sm sm:text-base text-text-primary mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-text-muted max-w-xs mb-5">{description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
        >
          {actionLabel ?? 'Collect Payment'}
        </button>
      )}
    </motion.div>
  );
}
