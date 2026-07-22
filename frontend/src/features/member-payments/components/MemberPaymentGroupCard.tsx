import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import { ChevronDown, ChevronUp, CreditCard, Eye, Printer, User, Plus } from 'lucide-react';
import { PaymentListItem } from '../types';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { PaymentMethodIcon } from './PaymentMethodIcon';
import { Avatar, AvatarFallback } from '@/components/data-display/Avatar';
import { Button } from '@/components/ui/button';

export interface MemberPaymentGroup {
  memberId: string;
  memberName: string;
  planName: string;
  totalAmount: number;
  transactionCount: number;
  latestPaymentDate: string;
  latestStatus: string;
  latestMethod: string;
  payments: PaymentListItem[];
}

interface MemberPaymentGroupCardProps {
  group: MemberPaymentGroup;
  index?: number;
}

export function MemberPaymentGroupCard({ group, index = 0 }: MemberPaymentGroupCardProps) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const initials = group.memberName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const formattedLatestDate = group.latestPaymentDate
    ? new Date(group.latestPaymentDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.03 }}
      className="bg-surface/80 backdrop-blur-xs border border-border-default/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-border-hover/80 transition-all duration-300 flex flex-col justify-between gap-4"
    >
      {/* Header: Avatar, Member Info & Collect Payment Action */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="w-11 h-11 rounded-2xl border border-primary/20 bg-primary/10 text-primary font-bold font-sans shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-mono text-xs font-bold">
              {initials || <User className="w-4 h-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="font-extrabold text-sm sm:text-base text-text-primary truncate font-sans">
              {group.memberName}
            </h3>
            <div className="flex items-center gap-2 mt-0.5 font-mono text-xs text-text-muted">
              <span className="truncate">{group.planName}</span>
              <span className="text-border-default">•</span>
              <span className="shrink-0 font-bold">{group.transactionCount} payment{group.transactionCount > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        <PaymentStatusBadge status={group.latestStatus} />
      </div>

      {/* Highlights bar: Total paid sum & latest date */}
      <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-surface-hover/50 border border-border-default/60 font-mono">
        <div>
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
            Total Collections
          </span>
          <span className="text-base sm:text-lg font-extrabold text-text-primary tabular-nums">
            ₹{group.totalAmount.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
            Latest Payment
          </span>
          <span className="text-xs sm:text-sm font-bold text-text-primary">
            {formattedLatestDate}
          </span>
        </div>
      </div>

      {/* Expandable Transaction History Drawer */}
      <div className="space-y-2 pt-1 border-t border-border-default/60">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs font-mono font-bold text-text-secondary hover:text-text-primary transition-colors cursor-pointer py-1 touch-target"
          >
            {expanded ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-primary" />}
            <span>{expanded ? 'Hide Receipts History' : `View All Receipts (${group.payments.length})`}</span>
          </button>

          <Button
            size="xs"
            onClick={() => navigate(`/admin/member-payments/collect?memberId=${group.memberId}`)}
            className="text-xs font-mono font-bold h-9 px-3 rounded-xl cursor-pointer bg-primary text-primary-foreground hover:opacity-90 shadow-xs flex items-center gap-1.5 touch-target active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Collect</span>
          </Button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden space-y-2 pt-2"
            >
              {group.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border-default/60 bg-surface/90 hover:bg-surface-hover/80 transition-all font-mono text-xs gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <PaymentMethodIcon method={payment.paymentMethod} />
                    <div className="min-w-0">
                      <p className="font-bold text-text-primary tabular-nums">₹{payment.finalAmount.toLocaleString()}</p>
                      <p className="text-[10px] text-text-muted">{payment.paymentDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <PaymentStatusBadge status={payment.paymentStatus} />
                    <button
                      onClick={() => navigate(`/admin/member-payments/${payment.id}`)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors touch-target"
                      title="View Receipt"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
