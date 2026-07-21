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
  { icon: React.ElementType }
> = {
  cash: { icon: Banknote },
  upi: { icon: Smartphone },
  card: { icon: CreditCard },
  bank_transfer: { icon: Building2 },
};

export function PaymentMethodIcon({
  method,
  showLabel = true,
  className,
}: PaymentMethodIconProps) {
  const { icon: Icon } = METHOD_CONFIG[method];

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0 text-text-muted" />
      {showLabel && (
        <span className="text-xs font-medium text-text-muted">
          {PAYMENT_METHOD_LABELS[method]}
        </span>
      )}
    </span>
  );
}
