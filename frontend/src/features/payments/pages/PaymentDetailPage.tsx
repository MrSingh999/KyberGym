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
      <div className="p-6 space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-1.5 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-[500px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted">Payment not found.</p>
        <button onClick={() => navigate('/admin/payments')} className="text-sm text-primary underline">
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
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-surface/90 border-b border-default backdrop-blur-md print:hidden">
        <button
          onClick={() => navigate('/admin/payments')}
          className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Payments</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted border border-default rounded-xl hover:border-hover hover:text-primary transition-colors"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Copy Link</span>
          </button>
          
          <button
            onClick={() => toast.success('Downloading PDF...')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted border border-default rounded-xl hover:border-hover hover:text-primary transition-colors"
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
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-5 space-y-6 print:hidden">
            <h1 className="font-heading font-bold text-xl text-primary">Transaction Details</h1>
            <PaymentOverviewCard payment={payment} />
          </div>

          {/* Right Column: Receipt Layout */}
          <div className="lg:col-span-7">
            <div className="print:hidden mb-6">
              <h2 className="font-heading font-bold text-xl text-primary">Official Receipt</h2>
              <p className="text-sm text-muted">This preview matches exactly what will be printed.</p>
            </div>
            
            {/* The actual receipt preview that becomes the sole content on print */}
            <div className="bg-surface lg:bg-transparent rounded-xl lg:rounded-none overflow-hidden lg:overflow-visible">
              <ReceiptPreview payment={payment} />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
