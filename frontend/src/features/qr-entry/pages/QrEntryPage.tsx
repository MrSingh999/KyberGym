import { useState } from "react";
import { toast } from "sonner";
import { Search, QrCode, Download, RotateCcw, User } from "lucide-react";
import { useMemberQr, useGenerateQr, useRegenerateQr } from "../hooks/useMemberQr";
import { useMembers } from "@/features/members/hooks/useMembers";
import { Button, LoadingButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/feedback/Skeleton";

export function QrEntryPage() {
  const [search, setSearch] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const { data: membersData } = useMembers({ pageIndex: 0, pageSize: 10 }, []);
  const { data: qr, isLoading: qrLoading, isError: qrError } = useMemberQr(selectedMemberId ?? "");
  const { mutate: generateQr, isPending: isGenerating } = useGenerateQr(selectedMemberId ?? "");
  const { mutate: regenerateQr, isPending: isRegenerating } = useRegenerateQr(selectedMemberId ?? "");

  const members = membersData?.data ?? [];
  const filteredMembers = search
    ? members.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.phone.includes(search),
      )
    : [];

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  const handleSelectMember = (memberId: string) => {
    setSelectedMemberId(memberId);
    setSearch("");
    setShowResults(false);
  };

  const handleGenerate = () => {
    if (!selectedMemberId) return;
    generateQr(undefined, {
      onSuccess: () => toast.success("QR code generated"),
      onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to generate QR"),
    });
  };

  const handleRegenerate = () => {
    if (!selectedMemberId) return;
    regenerateQr(undefined, {
      onSuccess: () => toast.success("QR code regenerated"),
      onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to regenerate QR"),
    });
  };

  const handleDownload = () => {
    if (!qr?.base64Image) return;
    const link = document.createElement("a");
    link.download = `qr-${selectedMemberId}.png`;
    link.href = qr.base64Image;
    link.click();
  };

  return (
    <div className="flex flex-col min-h-full bg-canvas">
      <div className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-h2 font-heading font-bold text-primary">QR Entry</h1>
          <p className="text-sm text-muted mt-1">Generate and manage QR codes for member access.</p>
        </div>

        {/* Member Search */}
        <div className="rounded-xl border border-default bg-surface p-6 mb-6">
          <label className="text-sm font-medium text-primary mb-2 block">
            Select Member
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input
              placeholder="Search by name, code, or phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              className="pl-9"
            />
            {showResults && search && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-surface border border-default rounded-xl shadow-lg z-10 max-h-56 overflow-y-auto">
                {filteredMembers.length === 0 ? (
                  <p className="p-3 text-sm text-muted text-center">No members found</p>
                ) : (
                  filteredMembers.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleSelectMember(m.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-hover transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center">
                        <User className="w-4 h-4 text-muted" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary">{m.name}</p>
                        <p className="text-xs text-muted">{m.phone}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* QR Code Display */}
        {selectedMember && (
          <div className="rounded-xl border border-default bg-surface p-6">
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-default">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-primary">{selectedMember.name}</h3>
                <p className="text-sm text-muted">{selectedMember.id}</p>
              </div>
            </div>

            {qrLoading ? (
              <div className="flex flex-col items-center py-8">
                <Skeleton className="w-48 h-48 rounded-xl mb-4" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : qrError || !qr ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="w-20 h-20 rounded-2xl bg-surface-hover border border-default flex items-center justify-center mb-4">
                  <QrCode className="w-8 h-8 text-muted" />
                </div>
                <h3 className="font-semibold text-primary mb-1">No QR Code</h3>
                <p className="text-sm text-muted mb-4 max-w-xs">
                  This member doesn't have a QR code yet. Generate one to enable QR-based entry.
                </p>
                <LoadingButton onClick={handleGenerate} loading={isGenerating}>
                  Generate QR Code
                </LoadingButton>
              </div>
            ) : (
              <div className="flex flex-col items-center py-4">
                {qr.base64Image && (
                  <div className="mb-4 p-4 bg-white rounded-xl shadow-sm">
                    <img
                      src={qr.base64Image}
                      alt="Member QR Code"
                      className="w-48 h-48"
                    />
                  </div>
                )}
                <p className="text-xs text-muted mb-1">
                  Generated: {qr.generatedAt ? new Date(qr.generatedAt).toLocaleDateString() : "N/A"}
                </p>
                <p className="text-xs text-muted mb-4">
                  Status: {qr.active ? "Active" : "Inactive"}
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-1.5" />
                    Download
                  </Button>
                  <LoadingButton
                    variant="outline"
                    onClick={handleRegenerate}
                    loading={isRegenerating}
                  >
                    <RotateCcw className="w-4 h-4 mr-1.5" />
                    Regenerate
                  </LoadingButton>
                </div>
              </div>
            )}
          </div>
        )}

        {/* No member selected */}
        {!selectedMember && (
          <div className="rounded-xl border border-dashed border-default p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-hover border border-default flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-7 h-7 text-muted" />
            </div>
            <h3 className="font-heading font-semibold text-lg text-primary mb-2">
              Select a Member
            </h3>
            <p className="text-sm text-muted max-w-xs mx-auto">
              Search for a member above to view or generate their QR entry code.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
