import { useMyQr } from "../hooks/useMyQr";
import { QrCode, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";

export function MemberQrPage() {
  const { data: qr, isLoading, isError, refetch } = useMyQr();

  const handleDownload = () => {
    if (!qr?.base64Image) return;
    const link = document.createElement("a");
    link.download = "my-qr-code.png";
    link.href = qr.base64Image;
    link.click();
  };

  return (
    <div className="flex flex-col min-h-full bg-canvas">
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-text-primary tracking-tight">My QR Pass</h1>
          <p className="text-sm text-text-secondary mt-1">
            Show this code at the gym entrance to check in.
          </p>
        </div>

        {/* QR Code Display */}
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="w-64 h-64 rounded-2xl" />
            <Skeleton className="h-4 w-40" />
          </div>
        ) : isError ? (
          <ErrorState
            title="Could not load QR code"
            message="Make sure your gym has the QR Entry feature enabled."
            onRetry={() => refetch()}
          />
        ) : qr?.base64Image ? (
          <>
            <div className="mb-6 p-4 bg-white rounded-2xl shadow-elevated border border-border-default">
              <img
                src={qr.base64Image}
                alt="Your QR Code"
                className="w-64 h-64 object-contain"
              />
            </div>
            {qr.generatedAt && (
              <p className="text-xs text-text-muted mb-6">
                Generated {new Date(qr.generatedAt).toLocaleDateString()}
              </p>
            )}
            <Button variant="outline" onClick={handleDownload} className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Download QR
            </Button>
          </>
        ) : (
          /* Empty state - no QR and no error */
          <div className="flex flex-col items-center py-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-surface-hover border border-border-default flex items-center justify-center mb-4">
              <QrCode className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="font-semibold text-text-primary mb-1">No QR Code Available</h3>
            <p className="text-sm text-text-secondary max-w-xs">
              Ask your gym admin to enable QR Entry and generate a code for you.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
