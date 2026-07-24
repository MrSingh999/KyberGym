import { StatusBadge } from "../common/StatusBadge";
import { CardSkeleton } from "../common/Skeletons";
import { QrCode } from "lucide-react";

interface EntryQrCardViewProps {
  enabled: boolean;
  isLoading: boolean;
}

export function EntryQrCardView({ enabled, isLoading }: EntryQrCardViewProps) {
  if (isLoading) {
    return <CardSkeleton />;
  }

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-border-default bg-background-paper mb-4 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-background-default border border-border-default/60">
          <QrCode className="w-5 h-5 text-text-primary" />
        </div>
        <div>
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Entry Pass
          </h2>
          <p className="text-sm font-bold text-text-primary mt-0.5">
            {enabled ? "QR Entry Available" : "QR Entry Disabled"}
          </p>
        </div>
      </div>

      <StatusBadge status={enabled ? "enabled" : "disabled"} />
    </div>
  );
}
