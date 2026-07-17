import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { CreatePlanWizard } from '../components/CreatePlanWizard';

export function CreatePlanPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    navigate('/admin/plans');
  };

  return (
    <div className="min-h-full bg-canvas">
      {/* Full-page wrapper with back nav on desktop */}
      <div className="hidden sm:flex items-center gap-3 px-6 py-4 border-b border-border-default bg-surface">
        <button onClick={handleClose} className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to Plans
        </button>
        <span className="text-text-muted/40">/</span>
        <span className="text-sm font-semibold text-text-primary">New Plan</span>
      </div>

      <div className="p-4 sm:p-8 max-w-xl mx-auto">
        <div className="bg-surface border border-border-default rounded-2xl p-6 sm:p-8 shadow-sm">
          <h1 className="font-bold text-xl text-text-primary mb-6 tracking-tight">Create Membership Plan</h1>
          <CreatePlanWizard
            onSuccess={() => {
              navigate('/admin/plans');
            }}
            onCancel={handleClose}
          />
        </div>
      </div>
    </div>
  );
}
