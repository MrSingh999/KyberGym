import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Building2, Shield, CreditCard, Calendar, Globe, Clock, Users, Activity } from "lucide-react";
import { useSAGym, useSAUpdateFeatures, useSAUpdateSubscription, useSARenewSubscription, useSAActivateGym, useSASuspendGym, useSASubscriptionPayments } from "../hooks/useSuperAdmin";
import { FEATURE_FLAGS } from "../types";
import { Button, LoadingButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { DatePicker } from "@/components/ui/date-picker";

const subscriptionBadge: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  active: "success",
  trial: "warning",
  expired: "destructive",
  suspended: "secondary",
};

export function SuperAdminGymDetailPage() {
  const { gymId } = useParams();
  const navigate = useNavigate();
  const { data: gym, isLoading, isError, error, refetch } = useSAGym(gymId!);
  const { data: payments = [], isLoading: isLoadingPayments } = useSASubscriptionPayments(gymId);
  const { mutate: updateFeatures, isPending: isUpdatingFeatures } = useSAUpdateFeatures(gymId!);
  const { mutate: updateSubscription } = useSAUpdateSubscription(gymId!);
  const { mutate: renewSubscription, isPending: isRenewing } = useSARenewSubscription(gymId!);
  const { mutate: activateGym, isPending: isActivating } = useSAActivateGym();
  const { mutate: suspendGym, isPending: isSuspending } = useSASuspendGym();

  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [renewDuration, setRenewDuration] = useState("30");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [customExpiryDate, setCustomExpiryDate] = useState<Date | undefined>(undefined);
  const [amountPaid, setAmountPaid] = useState("0");

  const defaultStartDate = useMemo(() => {
    if (!gym?.subscription?.expiresAt) return new Date();
    const expiresDate = new Date(gym.subscription.expiresAt);
    if (expiresDate > new Date()) {
      return expiresDate;
    }
    return new Date();
  }, [gym]);

  const openRenewModal = () => {
    setStartDate(defaultStartDate);
    setIsRenewModalOpen(true);
  };

  const calculatedExpiryDate = useMemo(() => {
    if (renewDuration === "custom") {
      return customExpiryDate;
    }
    const start = startDate || new Date();
    const days = parseInt(renewDuration, 10) || 30;
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    return end;
  }, [startDate, renewDuration, customExpiryDate]);

  const handleToggleFeature = (key: string, value: boolean) => {
    updateFeatures({ [key]: value }, {
      onSuccess: () => toast.success(`Feature ${value ? "enabled" : "disabled"}`),
      onError: () => toast.error("Failed to update feature"),
    });
  };

  const handleRenew = () => {
    if (!startDate) {
      toast.error("Please select a valid Start Date");
      return;
    }
    if (!calculatedExpiryDate) {
      toast.error("Please specify a valid Expiry Date");
      return;
    }
    const amountVal = parseFloat(amountPaid);
    if (isNaN(amountVal) || amountVal < 0) {
      toast.error("Amount paid must be a valid number of at least 0");
      return;
    }

    const payload = {
      startDate: startDate.toISOString(),
      expiresAt: calculatedExpiryDate.toISOString(),
      amountPaid: amountVal,
      duration: renewDuration === "custom" ? undefined : parseInt(renewDuration, 10),
    };

    renewSubscription(payload, {
      onSuccess: () => {
        toast.success("Subscription successfully renewed!");
        setIsRenewModalOpen(false);
        setAmountPaid("0");
        setCustomExpiryDate(undefined);
      },
      onError: (err: any) => {
        const errorMsg = err?.response?.data?.message || "Failed to renew subscription";
        toast.error(errorMsg);
      },
    });
  };

  const handleStatusChange = (status: string) => {
    updateSubscription({ status }, {
      onSuccess: () => toast.success(`Status changed to ${status}`),
      onError: () => toast.error("Failed to update status"),
    });
  };

  const handleExpiryChange = (date?: Date) => {
    if (!date) return;
    updateSubscription({ expiresAt: date.toISOString() }, {
      onSuccess: () => toast.success("Expiry date updated"),
      onError: () => toast.error("Failed to update expiry"),
    });
  };

  const handleTrialChange = (date?: Date) => {
    if (!date) return;
    updateSubscription({ trialEndsAt: date.toISOString() }, {
      onSuccess: () => toast.success("Trial end date updated"),
      onError: () => toast.error("Failed to update trial"),
    });
  };

  const handleToggleActive = () => {
    if (!gym) return;
    if (gym.isActive) {
      suspendGym(gymId!, {
        onSuccess: () => { toast.success("Gym suspended"); refetch(); },
        onError: () => toast.error("Failed to suspend gym"),
      });
    } else {
      activateGym(gymId!, {
        onSuccess: () => { toast.success("Gym activated"); refetch(); },
        onError: () => toast.error("Failed to activate gym"),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-5xl mx-auto space-y-6 animate-fade-slide-up">
        <Skeleton className="h-5 w-32" />
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError || !gym) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-5xl mx-auto">
        <ErrorState
          title="Gym not found"
          message={error?.message || "The gym you're looking for doesn't exist."}
          onRetry={() => navigate("/super-admin/gyms")}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-slide-up">

      {/* Back Button */}
      <button
        onClick={() => navigate("/super-admin/gyms")}
        className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors mb-6 font-mono cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Gyms
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-start gap-4 flex-1 min-w-0 w-full">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-bold text-xl sm:text-2xl text-text-primary tracking-tight truncate">
                {gym.name}
              </h1>
              <div className="flex items-center gap-1.5">
                <Badge variant={gym.isActive ? "success" : "secondary"} className="text-[10px] px-2 py-0.5 shrink-0">
                  {gym.isActive ? "Active" : "Suspended"}
                </Badge>
                <Badge variant={subscriptionBadge[gym.subscription?.status] || "secondary"} className="text-[10px] px-2 py-0.5 shrink-0">
                  {gym.subscription?.status}
                </Badge>
              </div>
            </div>
            <p className="text-text-muted text-xs font-mono mt-1">
              {gym.subdomain && `${gym.subdomain}.`} Created {format(parseISO(gym.createdAt), "MMMM d, yyyy")}
            </p>
          </div>
        </div>
        <LoadingButton
          variant={gym.isActive ? "destructive" : "outline"}
          size="sm"
          onClick={handleToggleActive}
          isLoading={isActivating || isSuspending}
          className="w-full sm:w-auto text-xs cursor-pointer shrink-0 mt-2 sm:mt-0"
        >
          {gym.isActive ? "Suspend" : "Activate"}
        </LoadingButton>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

        {/* Gym Info */}
        <div className="glass-panel rounded-[16px] p-5 space-y-4 card-hover">
          <h3 className="font-bold text-sm text-text-primary font-mono uppercase tracking-wide flex items-center gap-2">
            <Shield className="h-4 w-4 text-text-muted" />
            Gym Information
          </h3>
          <div className="divide-y divide-border-default/40">
            <InfoRow label="Name" value={gym.name} />
            <InfoRow label="Gym ID" value={gym.id} />
            <InfoRow label="Subdomain" value={gym.subdomain || "-"} />
            <InfoRow label="Owner Name" value={gym.owner?.name || "-"} />
            <InfoRow label="Owner Email" value={gym.owner?.email || "-"} />
            <InfoRow label="Owner Phone" value={gym.owner?.phone || "-"} />
            <InfoRow label="Timezone" value={gym.timezone} icon={<Globe className="h-3 w-3" />} />
            <InfoRow label="Currency" value={gym.currency} />
            <InfoRow label="Language" value={gym.language} />
          </div>
        </div>

        {/* Subscription */}
        <div className="glass-panel rounded-[16px] p-5 space-y-4 card-hover">
          <h3 className="font-bold text-sm text-text-primary font-mono uppercase tracking-wide flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-text-muted" />
            Subscription
          </h3>
          <div className="divide-y divide-border-default/40">
            <InfoRow
              label="Status"
              value={gym.subscription?.status || "N/A"}
              badge={subscriptionBadge[gym.subscription?.status] || "secondary"}
            />
            <InfoRow
              label="Expires"
              value={gym.subscription?.expiresAt
                ? format(parseISO(gym.subscription.expiresAt), "MMM d, yyyy")
                : "-"}
              icon={<Calendar className="h-3 w-3" />}
            />
            <InfoRow
              label="Trial Ends"
              value={gym.subscription?.trialEndsAt
                ? format(parseISO(gym.subscription.trialEndsAt), "MMM d, yyyy")
                : "-"}
              icon={<Clock className="h-3 w-3" />}
            />
          </div>

          <div className="border-t border-border-default pt-4 space-y-4">
            {/* Renew */}
            <div>
              <Label className="text-[10px] font-bold text-text-muted uppercase tracking-wider font-mono">Renew Subscription</Label>
              <Button
                onClick={openRenewModal}
                size="sm"
                className="w-full mt-1.5 text-xs font-semibold cursor-pointer"
              >
                Open Renewal Panel
              </Button>
            </div>

            {/* Change Status */}
            <div>
              <Label className="text-[10px] font-bold text-text-muted uppercase tracking-wider font-mono">Change Status</Label>
              <div className="flex gap-2 mt-1.5">
                <div className="flex-1">
                  <Select onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Set Expiry */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold text-text-muted uppercase tracking-wider font-mono">Set Expiry Date</Label>
              <DatePicker
                date={gym.subscription?.expiresAt ? parseISO(gym.subscription.expiresAt) : undefined}
                setDate={handleExpiryChange}
                placeholder="Pick expiry date"
              />
            </div>

            {/* Set Trial End */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold text-text-muted uppercase tracking-wider font-mono">Set Trial End Date</Label>
              <DatePicker
                date={gym.subscription?.trialEndsAt ? parseISO(gym.subscription.trialEndsAt) : undefined}
                setDate={handleTrialChange}
                placeholder="Pick trial end date"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Renewal History */}
      <div className="glass-panel rounded-[16px] p-5 mb-8 space-y-4 card-hover">
        <h3 className="font-bold text-sm text-text-primary font-mono uppercase tracking-wide flex items-center gap-2">
          <Calendar className="h-4 w-4 text-text-muted" />
          Subscription Renewal & Payment History
        </h3>
        {isLoadingPayments ? (
          <div className="py-6 text-center text-xs text-text-muted font-mono">
            Loading payment history...
          </div>
        ) : payments.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto font-sans">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-border-default/60 text-[10px] uppercase font-mono text-text-muted font-bold">
                    <th className="py-2.5 px-3">Payment Date</th>
                    <th className="py-2.5 px-3">Payment Method</th>
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3 text-right">Amount Paid</th>
                    <th className="py-2.5 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default/30 text-xs text-text-primary">
                  {payments.map((payment, idx) => (
                    <tr key={idx} className="hover:bg-surface-hover/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono">
                        {format(parseISO(payment.paymentDate), "MMM d, yyyy h:mm a")}
                      </td>
                      <td className="py-2.5 px-3 font-mono capitalize">
                        {payment.paymentMethod}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-text-muted">
                        {payment.paymentReference || "-"}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-right font-semibold text-primary">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: gym.currency || "INR",
                        }).format(payment.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-text-muted max-w-[200px] truncate">
                        {payment.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="block sm:hidden space-y-3 font-sans">
              {payments.map((payment, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-border-default bg-surface/30 space-y-2">
                  <div className="flex justify-between items-center text-xs text-text-muted font-mono">
                    <span>{format(parseISO(payment.paymentDate), "MMM d, yyyy h:mm a")}</span>
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 capitalize">
                      {payment.paymentMethod}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-text-primary">
                      {payment.notes || payment.paymentReference || "-"}
                    </span>
                    <span className="font-bold text-primary">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: gym.currency || "INR",
                      }).format(payment.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-6 text-center text-xs text-text-muted font-mono bg-surface-hover/30 rounded-lg border border-dashed border-border-default">
            No payment records found.
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="glass-panel rounded-[16px] p-5 mb-8 space-y-4 card-hover">
        <h3 className="font-bold text-sm text-text-primary font-mono uppercase tracking-wide flex items-center gap-2">
          <Activity className="h-4 w-4 text-text-muted" />
          Statistics
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatBox label="Total Members" value="—" icon={<Users className="h-4 w-4" />} />
          <StatBox label="Active Members" value="—" icon={<Users className="h-4 w-4" />} />
          <StatBox label="Revenue (MTD)" value="—" icon={<CreditCard className="h-4 w-4" />} />
          <StatBox label="Active Plans" value="—" icon={<Activity className="h-4 w-4" />} />
        </div>
        <p className="text-[10px] text-text-muted font-mono text-center">
          Detailed statistics require gym-level API access.
        </p>
      </div>

      {/* Feature Flags */}
      <div className="glass-panel rounded-[16px] p-5 space-y-4 card-hover">
        <h3 className="font-bold text-sm text-text-primary font-mono uppercase tracking-wide flex items-center gap-2">
          <Shield className="h-4 w-4 text-text-muted" />
          Feature Management
        </h3>
        <p className="text-xs text-text-secondary">
          Enable or disable features for this gym.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {FEATURE_FLAGS.map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between p-3 rounded-lg border border-border-default bg-surface-hover/30 hover:bg-surface-hover/60 hover:border-border-hover transition-all duration-150"
            >
              <span className="text-xs font-semibold text-text-primary font-mono">
                {label}
              </span>
              <Switch
                size="sm"
                checked={!!gym.features[key]}
                onCheckedChange={(v) => handleToggleFeature(key, v)}
                disabled={isUpdatingFeatures}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Renewal Modal */}
      <ResponsiveModal
        open={isRenewModalOpen}
        onOpenChange={setIsRenewModalOpen}
        title="Renew Gym Subscription"
        description="Configure start date, renewal terms, and record payment amount."
      >
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 flex flex-col">
              <Label className="text-xs font-semibold text-text-primary">Start Date</Label>
              <DatePicker
                date={startDate}
                setDate={setStartDate}
                placeholder="Select start date"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-text-primary">Select Terms (Duration)</Label>
              <Select value={renewDuration} onValueChange={setRenewDuration}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                  <SelectItem value="365">365 days</SelectItem>
                  <SelectItem value="custom">Custom Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {renewDuration === "custom" ? (
              <div className="space-y-1.5 flex flex-col">
                <Label className="text-xs font-semibold text-text-primary">Custom Expiry Date</Label>
                <DatePicker
                  date={customExpiryDate}
                  setDate={setCustomExpiryDate}
                  placeholder="Select expiry date"
                />
              </div>
            ) : (
              <div className="space-y-1.5 flex flex-col">
                <Label className="text-xs font-semibold text-text-primary">Calculated Expiry Date</Label>
                <DatePicker
                  date={calculatedExpiryDate}
                  setDate={() => {}}
                  disabled
                  placeholder="Select expiry date"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-text-primary">
                Amount Paid ({gym.currency || "INR"})
              </Label>
              <Input
                type="number"
                min="0"
                step="any"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="e.g. 5000"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border-default/40 justify-end w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRenewModalOpen(false)}
              className="w-full sm:w-auto text-xs h-9 cursor-pointer"
            >
              Cancel
            </Button>
            <LoadingButton
              type="button"
              onClick={handleRenew}
              isLoading={isRenewing}
              className="w-full sm:w-auto text-xs h-9 cursor-pointer"
            >
              Confirm Renewal
            </LoadingButton>
          </div>
        </div>
      </ResponsiveModal>
    </div>
  );
}

function InfoRow({ label, value, icon, badge }: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  badge?: "success" | "warning" | "destructive" | "secondary";
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 gap-1 sm:gap-2">
      <span className="text-xs text-text-muted font-mono flex items-center gap-1.5 shrink-0">
        {icon}
        {label}
      </span>
      {badge ? (
        <Badge variant={badge} className="text-[10px] px-2 py-0.5 w-fit shrink-0">{value}</Badge>
      ) : (
        <span className="text-xs font-semibold text-text-primary font-mono tabular-nums truncate max-w-full sm:max-w-[240px] text-left sm:text-right" title={value}>
          {value}
        </span>
      )}
    </div>
  );
}

function StatBox({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-lg border border-border-default bg-surface-hover/30 hover:bg-surface-hover/50 hover:border-border-hover transition-all duration-150 group">
      <div className="text-text-muted mb-2 transition-transform duration-150 group-hover:scale-110">{icon}</div>
      <span className="text-lg font-bold text-text-primary font-mono tabular-nums">{value}</span>
      <span className="text-[10px] text-text-muted font-mono uppercase mt-1 tracking-wider">{label}</span>
    </div>
  );
}
