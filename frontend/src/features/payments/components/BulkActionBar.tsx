import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Download, Printer, X } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  onExport: () => void;
  onPrint: () => void;
  onClearSelection: () => void;
}

export function BulkActionBar({
  selectedCount,
  onExport,
  onPrint,
  onClearSelection,
}: BulkActionBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          key="bulk-bar"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 260 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-surface border border-default rounded-2xl shadow-xl px-4 py-3 backdrop-blur-md"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-primary pr-3 border-r border-subtle">
            <CheckSquare className="w-4 h-4 text-primary" />
            {selectedCount} selected
          </div>

          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-surface hover:bg-surface-hover border border-default rounded-lg transition-colors text-primary"
          >
            <Download className="w-3.5 h-3.5 text-muted" /> Export
          </button>
          
          <button
            onClick={onPrint}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-surface hover:bg-surface-hover border border-default rounded-lg transition-colors text-primary"
          >
            <Printer className="w-3.5 h-3.5 text-muted" /> Print Receipts
          </button>

          <button
            onClick={onClearSelection}
            className="ml-1 p-1.5 rounded-full hover:bg-surface-hover text-muted hover:text-primary transition-colors"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
