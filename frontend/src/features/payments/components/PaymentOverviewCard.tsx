import { DollarSign, Hash, Calendar, Tag } from 'lucide-react';
import { Payment } from '../types';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { PaymentMethodIcon } from './PaymentMethodIcon';

interface PaymentOverviewCardProps {
  payment: Payment;
}

export function PaymentOverviewCard({ payment }: PaymentOverviewCardProps) {
  const formattedDate = new Date(payment.paymentDate).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="bg-surface border border-default rounded-2xl overflow-hidden shadow-sm">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-heading font-bold text-2xl text-primary">${payment.finalAmount}</h2>
            <p className="text-sm text-muted mt-1">{formattedDate}</p>
          </div>
          <PaymentStatusBadge status={payment.paymentStatus} />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-semibold text-muted tracking-wider">Member</span>
            <p className="text-sm font-medium text-primary">{payment.memberName}</p>
            <p className="text-xs text-muted">{payment.memberCode}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-semibold text-muted tracking-wider">Plan</span>
            <p className="text-sm font-medium text-primary">{payment.planName}</p>
            <p className="text-xs text-muted">
              {new Date(payment.membershipStartDate).toLocaleDateString()} – {new Date(payment.membershipEndDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="pt-5 border-t border-subtle space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Transaction Breakdown</h3>
          <div className="flex justify-between text-sm">
            <span className="text-muted flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> Amount</span>
            <span className="font-medium text-primary">${payment.amount}</span>
          </div>
          {payment.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted flex items-center gap-1.5"><Tag className="w-4 h-4" /> Discount</span>
              <span className="font-medium text-destructive">-${payment.discount}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted flex items-center gap-1.5"><Hash className="w-4 h-4" /> Method</span>
            <PaymentMethodIcon method={payment.paymentMethod} />
          </div>
          {payment.transactionReference && (
            <div className="flex justify-between text-sm">
              <span className="text-muted flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Reference</span>
              <span className="font-medium text-primary">{payment.transactionReference}</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {payment.notes && (
          <div className="pt-4 border-t border-subtle">
            <span className="text-[10px] uppercase font-semibold text-muted tracking-wider mb-1 block">Notes</span>
            <p className="text-sm text-secondary bg-surface-hover p-3 rounded-xl border border-subtle">{payment.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
