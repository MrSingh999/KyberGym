import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Trash2, Archive, X } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  onActivate: () => void;
  onDeactivate: () => void;
  onArchive: () => void;
  onClearSelection: () => void;
}

export function BulkActionBar({
  selectedCount,
  onActivate,
  onDeactivate,
  onArchive,
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
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-surface border border-border-default rounded-2xl shadow-xl px-4 py-3 backdrop-blur-md"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary pr-3 border-r border-border-default">
            <CheckSquare className="w-4 h-4 text-text-primary" />
            {selectedCount} selected
          </div>

          <button
            onClick={onActivate}
            className="px-3 py-1.5 text-xs font-semibold text-success bg-success/10 hover:bg-success/20 rounded-lg transition-colors cursor-pointer"
          >
            Activate
          </button>
          <button
            onClick={onDeactivate}
            className="px-3 py-1.5 text-xs font-semibold text-warning bg-warning/10 hover:bg-warning/20 rounded-lg transition-colors cursor-pointer"
          >
            Deactivate
          </button>
          <button
            onClick={onArchive}
            className="px-3 py-1.5 text-xs font-semibold text-error bg-error/10 hover:bg-error/20 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Archive className="w-3.5 h-3.5" />
            Archive
          </button>

          <button
            onClick={onClearSelection}
            className="ml-1 p-1.5 rounded-full hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
