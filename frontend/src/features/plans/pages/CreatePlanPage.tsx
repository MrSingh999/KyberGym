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
    <div className="min-h-full bg-canvas animate-fade-slide-up">
      {/* Sticky Glass Navigation Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-surface/90 border-b border-border-default/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={handleClose} 
            className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold text-text-muted hover:text-text-primary transition-colors cursor-pointer min-h-[44px] sm:min-h-0 px-2 rounded-lg touch-target"
          >
            <ArrowLeft className="w-4 h-4" /> 
            <span>Back to Plans</span>
          </button>
          <span className="text-text-muted/40 font-mono">/</span>
          <span className="text-xs sm:text-sm font-mono font-bold text-text-primary">New Plan</span>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto w-full">
        <div className="bg-surface/80 backdrop-blur-xs border border-border-default/80 rounded-2xl p-5 sm:p-8 shadow-xs">
          <div className="mb-6 pb-4 border-b border-border-default/60">
            <h1 className="font-extrabold text-xl sm:text-2xl text-text-primary tracking-tight font-mono">
              Create Membership Plan
            </h1>
            <p className="text-xs text-text-secondary mt-1 font-sans">
              Set up plan parameters, pricing tiers, validity duration, and included perks.
            </p>
          </div>

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
