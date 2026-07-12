import { Badge } from '../../../../components/ui/Badge';
import { PlanStatus } from '../types';

interface PlanStatusBadgeProps {
  status: PlanStatus;
  className?: string;
}

const STATUS_CONFIG: Record<PlanStatus, { variant: 'success' | 'warning' | 'default'; label: string }> = {
  active: { variant: 'success', label: 'Active' },
  inactive: { variant: 'warning', label: 'Inactive' },
  archived: { variant: 'default', label: 'Archived' },
};

export function PlanStatusBadge({ status, className }: PlanStatusBadgeProps) {
  const { variant, label } = STATUS_CONFIG[status];
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
