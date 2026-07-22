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

  const formattedDate = payment.paymentDate
    ? new Date(payment.paymentDate).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : '—';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.035 }}
      onClick={() => navigate(`/admin/member-payments/${payment.id}`)}
      className="bg-surface/80 backdrop-blur-xs border border-border-default/80 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-border-hover/80 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group flex flex-col justify-between gap-3 font-mono"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xs font-bold font-mono flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
            {getInitials(payment.memberName)}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-extrabold text-sm text-text-primary truncate group-hover:text-primary transition-colors font-sans">
              {payment.memberName}
            </h4>
            <p className="text-xs text-text-muted truncate mt-0.5">{payment.planName}</p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-base sm:text-lg font-extrabold text-text-primary tabular-nums">
            ₹{payment.finalAmount.toLocaleString()}
          </p>
          <PaymentStatusBadge status={payment.paymentStatus} />
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border-default/60 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <PaymentMethodIcon method={payment.paymentMethod} />
          <span className="text-text-muted text-[11px] truncate">{formattedDate}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/admin/member-payments/${payment.id}`)}
            className="w-9 h-9 rounded-xl hover:bg-surface-hover/80 text-text-muted hover:text-text-primary transition-colors flex items-center justify-center touch-target"
            title="View Receipt Details"
          >
            <Eye className="w-4 h-4 text-primary" />
          </button>
          <button
            onClick={() => window.print()}
            className="w-9 h-9 rounded-xl hover:bg-surface-hover/80 text-text-muted hover:text-text-primary transition-colors flex items-center justify-center touch-target"
            title="Print Receipt"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
