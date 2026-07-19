import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Printer, Download, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { usePayment } from '../hooks/usePayments';
import { PaymentOverviewCard } from '../components/PaymentOverviewCard';
import { ReceiptPreview } from '../components/ReceiptPreview';
import { Skeleton } from '@/components/feedback/Skeleton';

export function PaymentDetailPage() {
  const { paymentId = '' } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();

  const { data: payment, isLoading } = usePayment(paymentId);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5"><Skeleton className="h-80 rounded-2xl" /></div>
          <div className="lg:col-span-7"><Skeleton className="h-[500px] rounded-2xl" /></div>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-text-muted">Payment not found.</p>
        <button onClick={() => navigate('/admin/payments')} className="text-sm text-text-primary underline">
          Back to Payments
        </button>
      </div>
    );
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  return (
    <div className="flex flex-col min-h-full bg-canvas">
      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3 bg-surface/90 border-b border-border-default backdrop-blur-md print:hidden">
        <button
          onClick={() => navigate('/admin/payments')}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Payments</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted border border-border-default rounded-xl hover:border-border-hover hover:text-text-primary transition-colors"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Copy Link</span>
          </button>
          
          <button
            onClick={() => toast.success('Downloading PDF...')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted border border-border-default rounded-xl hover:border-border-hover hover:text-text-primary transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-5 space-y-6 print:hidden">
            <h1 className="font-heading font-bold text-lg sm:text-xl text-text-primary">Transaction Details</h1>
            <PaymentOverviewCard payment={payment} />
          </div>

          {/* Right Column: Receipt Layout */}
          <div className="lg:col-span-7">
            <div className="print:hidden mb-4 sm:mb-6">
              <h2 className="font-heading font-bold text-lg sm:text-xl text-text-primary">Official Receipt</h2>
              <p className="text-sm text-text-muted">This preview matches exactly what will be printed.</p>
            </div>
            
            <div className="bg-surface lg:bg-transparent rounded-xl lg:rounded-none overflow-hidden lg:overflow-visible">
              <ReceiptPreview payment={payment} />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
