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
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-surface border border-default rounded-2xl shadow-xl px-4 py-3 backdrop-blur-md"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-primary pr-3 border-r border-subtle">
            <CheckSquare className="w-4 h-4 text-primary" />
            {selectedCount} selected
          </div>

          <button
            onClick={onActivate}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors"
          >
            Activate
          </button>
          <button
            onClick={onDeactivate}
            className="px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors"
          >
            Deactivate
          </button>
          <button
            onClick={onArchive}
            className="px-3 py-1.5 text-xs font-semibold text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Archive className="w-3.5 h-3.5" />
            Archive
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
