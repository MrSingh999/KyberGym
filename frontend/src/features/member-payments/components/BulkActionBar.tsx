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
          className="fixed bottom-4 sm:bottom-6 left-2 sm:left-1/2 right-2 sm:right-auto sm:-translate-x-1/2 z-50 flex items-center gap-2 sm:gap-3 bg-surface border border-border-default rounded-xl sm:rounded-2xl shadow-xl px-3 sm:px-4 py-2.5 sm:py-3 backdrop-blur-md overflow-x-auto"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary pr-2 sm:pr-3 border-r border-border-subtle shrink-0">
            <CheckSquare className="w-4 h-4 text-text-primary" />
            {selectedCount} selected
          </div>

          <button
            onClick={onExport}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 text-xs font-medium bg-surface hover:bg-surface-hover border border-border-default rounded-lg transition-colors text-text-primary shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-text-muted" /> Export
          </button>
          
          <button
            onClick={onPrint}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 text-xs font-medium bg-surface hover:bg-surface-hover border border-border-default rounded-lg transition-colors text-text-primary shrink-0"
          >
            <Printer className="w-3.5 h-3.5 text-text-muted" /> Print Receipts
          </button>

          <button
            onClick={onClearSelection}
            className="ml-auto sm:ml-1 p-1.5 rounded-full hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors shrink-0"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
