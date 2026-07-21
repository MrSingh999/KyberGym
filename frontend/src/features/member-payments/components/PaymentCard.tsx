import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { Eye, Printer, MoreVertical } from 'lucide-react';
import { PaymentListItem } from '../types';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { PaymentMethodIcon } from './PaymentMethodIcon';

interface PaymentCardProps {
  payment: PaymentListItem;
  index?: number;
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
}

export function PaymentCard({ payment, index = 0 }: PaymentCardProps) {
  const navigate = useNavigate();

  const formattedDate = new Date(payment.paymentDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.035 }}
      onClick={() => navigate(`/admin/member-payments/${payment.id}`)}
      className="bg-surface border border-border-default rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-border-hover transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
          {getInitials(payment.memberName)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-xs sm:text-sm text-text-primary truncate">{payment.memberName}</p>
              <p className="text-[11px] sm:text-xs text-text-muted truncate">{payment.planName}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-base sm:text-lg font-bold font-heading text-text-primary tabular-nums">
                ₹{payment.finalAmount}
              </p>
              <PaymentStatusBadge status={payment.paymentStatus} />
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border-default">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <PaymentMethodIcon method={payment.paymentMethod} />
              <span className="text-[11px] sm:text-xs text-text-muted truncate">{formattedDate}</span>
            </div>

            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => navigate(`/admin/member-payments/${payment.id}`)}
                className="p-1 sm:p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
                title="View Details"
              >
                <Eye className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              </button>
              <button
                onClick={() => window.print()}
                className="p-1 sm:p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
                title="Print Receipt"
              >
                <Printer className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
