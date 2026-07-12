import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { CollectPaymentWizard } from '../components/CollectPaymentWizard';

export function CollectPaymentPage() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/dashboard/payments');
  };

  const handleSuccess = (id: string) => {
    navigate(`/dashboard/payments/${id}`);
  };

  return (
    <div className="min-h-full bg-canvas">
      <div className="hidden sm:flex items-center gap-3 px-6 py-4 border-b border-default bg-surface">
        <button onClick={handleClose} className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Payments
        </button>
        <span className="text-muted/40">/</span>
        <span className="text-sm font-medium text-primary">Collect Payment</span>
      </div>

      <div className="p-4 sm:p-8 max-w-xl mx-auto">
        <div className="bg-surface border border-default rounded-2xl p-6 sm:p-8 shadow-sm">
          <h1 className="font-heading font-bold text-xl text-primary mb-6">Collect Payment</h1>
          <CollectPaymentWizard onSuccess={handleSuccess} onCancel={handleClose} />
        </div>
      </div>
    </div>
  );
}
