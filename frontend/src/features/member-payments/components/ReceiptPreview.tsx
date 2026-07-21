import { Payment, PAYMENT_METHOD_LABELS } from '../types';

interface ReceiptPreviewProps {
  payment: Payment;
  gymName?: string;
}

export function ReceiptPreview({ payment, gymName = 'KyberGym' }: ReceiptPreviewProps) {
  const receiptNo = `REC-${payment.id.split('-')[1] || Date.now().toString().slice(-6)}`;
  const dateStr = new Date(payment.paymentDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const startStr = new Date(payment.membershipStartDate).toLocaleDateString();
  const endStr = new Date(payment.membershipEndDate).toLocaleDateString();

  return (
    <div className="bg-surface text-text-primary p-6 sm:p-8 rounded-xl shadow-sm border border-border-default max-w-lg mx-auto print:shadow-none print:border-none print:p-0 print:bg-white print:text-black">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-border-default pb-6 mb-6">
        <div>
          <h2 className="text-2xl font-bold font-heading text-text-primary">{gymName}</h2>
          <p className="text-sm text-text-muted mt-1">Payment Receipt</p>
        </div>
        <div className="text-right text-sm text-text-muted">
          <p className="font-semibold text-text-primary">Receipt No: {receiptNo}</p>
          <p>Date: {dateStr}</p>
        </div>
      </div>

      {/* Member Info */}
      <div className="mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Billed To</h3>
        <p className="text-base font-semibold text-text-primary">{payment.memberName}</p>
        <p className="text-sm text-text-secondary">ID: {payment.id}</p>
        {payment.memberPhone && <p className="text-sm text-text-secondary">Phone: {payment.memberPhone}</p>}
      </div>

      {/* Items Table */}
      <table className="w-full text-sm text-left mb-8">
        <thead>
          <tr className="border-b border-border-default text-text-muted">
            <th className="pb-3 font-semibold uppercase tracking-wider text-xs">Description</th>
            <th className="pb-3 font-semibold uppercase tracking-wider text-xs text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="text-text-secondary">
          <tr className="border-b border-border-default">
            <td className="py-4">
              <p className="font-semibold text-text-primary">{payment.planName}</p>
              <p className="text-xs text-text-muted mt-1">Valid: {startStr} to {endStr}</p>
            </td>
            <td className="py-4 text-right">₹{payment.amount.toFixed(2)}</td>
          </tr>
          {payment.discount > 0 && (
            <tr className="border-b border-border-default">
              <td className="py-3 text-text-muted">Discount Applied</td>
              <td className="py-3 text-right text-error">-₹{payment.discount.toFixed(2)}</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td className="pt-4 font-bold text-text-primary text-right pr-4">Total Paid</td>
            <td className="pt-4 font-bold text-lg text-text-primary text-right">₹{payment.finalAmount.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      {/* Payment Details */}
      <div className="bg-surface-hover rounded-lg p-4 text-sm text-text-secondary">
        <div className="flex justify-between mb-1">
          <span>Payment Method:</span>
          <span className="font-semibold text-text-primary">{PAYMENT_METHOD_LABELS[payment.paymentMethod]}</span>
        </div>
        {payment.transactionReference && (
          <div className="flex justify-between">
            <span>Transaction Ref:</span>
            <span className="font-semibold text-text-primary">{payment.transactionReference}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-border-default text-center text-xs text-text-muted">
        <p>Thank you for your payment.</p>
        <p>This is a computer-generated receipt.</p>
      </div>

      {/* Print Styles injection */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
          .print\\:p-0 { padding: 0 !important; }
          .bg-surface.text-text-primary, .bg-surface.text-text-primary * {
            visibility: visible;
          }
          .bg-surface.text-text-primary {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
