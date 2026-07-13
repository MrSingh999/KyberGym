import { Banknote, Smartphone, CreditCard, Building2 } from 'lucide-react';
import { PaymentMethod, PAYMENT_METHOD_LABELS } from '../types';
import { cn } from '@/lib/utils';

interface PaymentMethodIconProps {
  method: PaymentMethod;
  showLabel?: boolean;
  className?: string;
}

const METHOD_CONFIG: Record<
  PaymentMethod,
  { icon: React.ElementType; color: string }
> = {
  cash: { icon: Banknote, color: 'text-emerald-600 dark:text-emerald-400' },
  upi: { icon: Smartphone, color: 'text-violet-600 dark:text-violet-400' },
  card: { icon: CreditCard, color: 'text-blue-600 dark:text-blue-400' },
  bank_transfer: { icon: Building2, color: 'text-amber-600 dark:text-amber-400' },
};

export function PaymentMethodIcon({
  method,
  showLabel = true,
  className,
}: PaymentMethodIconProps) {
  const { icon: Icon, color } = METHOD_CONFIG[method];

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <Icon className={cn('w-3.5 h-3.5 flex-shrink-0', color)} />
      {showLabel && (
        <span className="text-xs font-medium text-secondary">
          {PAYMENT_METHOD_LABELS[method]}
        </span>
      )}
    </span>
  );
}
