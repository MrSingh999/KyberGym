import { useNavigate } from 'react-router';
import { AlertCircle, Clock, CalendarDays, ArrowRight } from 'lucide-react';
import { usePaymentDues } from '../hooks/usePayments';
import { DueCategory, DUE_CATEGORY_LABELS, DueEntry } from '../types';
import { Skeleton } from '@/components/feedback/Skeleton';
import { EmptyPaymentsState } from './EmptyPaymentsState';
import { cn } from '@/lib/utils';

const CATEGORY_CONFIG: Record<
  DueCategory,
  { icon: React.ElementType; color: string; bg: string; border: string }
> = {
  overdue: { icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' },
  today: { icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  in_3_days: { icon: CalendarDays, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  in_7_days: { icon: CalendarDays, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
};

export function DueWidget() {
  const navigate = useNavigate();
  const { data: dues, isLoading } = usePaymentDues();

  if (isLoading) {
    return (
      <div className="bg-surface border border-default rounded-2xl p-5 shadow-sm space-y-4">
        <Skeleton className="h-6 w-32" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    );
  }

  if (!dues || dues.length === 0) {
    return (
      <div className="bg-surface border border-default rounded-2xl shadow-sm overflow-hidden">
        <EmptyPaymentsState variant="no-dues" />
      </div>
    );
  }

  // Group by category to render sections
  const grouped = dues.reduce((acc, due) => {
    if (!acc[due.category]) acc[due.category] = [];
    acc[due.category].push(due);
    return acc;
  }, {} as Record<DueCategory, DueEntry[]>);

  const categoriesOrder: DueCategory[] = ['overdue', 'today', 'in_3_days', 'in_7_days'];

  return (
    <div className="bg-surface border border-default rounded-2xl p-5 shadow-sm">
      <h2 className="font-heading font-bold text-lg text-primary mb-4">Upcoming Dues</h2>
      
      <div className="space-y-6">
        {categoriesOrder.map((cat) => {
          const items = grouped[cat];
          if (!items || items.length === 0) return null;

          const config = CATEGORY_CONFIG[cat];
          const Icon = config.icon;

          return (
            <div key={cat} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={cn('p-1 rounded-md', config.bg, config.color)}>
                  <Icon className="w-4 h-4" />
                </span>
                <h3 className="font-semibold text-sm text-primary">{DUE_CATEGORY_LABELS[cat]}</h3>
                <span className="text-xs font-medium text-muted bg-surface-hover px-1.5 py-0.5 rounded-full">
                  {items.length}
                </span>
              </div>

              <div className="space-y-2">
                {items.map((due) => (
                  <div key={due.memberId} className={cn('flex items-center justify-between p-3 rounded-xl border', config.bg, config.border)}>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-primary truncate">{due.memberName}</p>
                      <p className="text-xs text-secondary truncate">
                        {due.planName} · {due.phone}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/admin/payments/collect')}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ml-3',
                        cat === 'overdue' ? 'bg-destructive text-destructive-foreground hover:opacity-90' : 'bg-surface border border-default text-primary hover:bg-surface-hover'
                      )}
                    >
                      Collect <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
