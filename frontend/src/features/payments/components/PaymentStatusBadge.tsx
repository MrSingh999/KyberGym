import { Badge } from '../../../../components/ui/Badge';
import { PaymentStatus, PAYMENT_STATUS_LABELS } from '../types';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

const STATUS_VARIANT: Record<
  PaymentStatus,
  'success' | 'warning' | 'destructive' | 'default'
> = {
  paid: 'success',
  pending: 'warning',
  failed: 'destructive',
  refunded: 'default',
  partially_paid: 'default',
};

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className={className}>
      {PAYMENT_STATUS_LABELS[status]}
    </Badge>
  );
}
