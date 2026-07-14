import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Building2, Shield, CreditCard, Calendar, Globe, Clock, Users, Activity } from "lucide-react";
import { useSAGym, useSAUpdateFeatures, useSAUpdateSubscription, useSARenewSubscription, useSAActivateGym, useSASuspendGym } from "../hooks/useSuperAdmin";
import { FEATURE_FLAGS } from "../types";
import { LoadingButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";

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
  const { mutate: updateFeatures, isPending: isUpdatingFeatures } = useSAUpdateFeatures(gymId!);
  const { mutate: updateSubscription } = useSAUpdateSubscription(gymId!);
  const { mutate: renewSubscription, isPending: isRenewing } = useSARenewSubscription(gymId!);
  const { mutate: activateGym, isPending: isActivating } = useSAActivateGym();
  const { mutate: suspendGym, isPending: isSuspending } = useSASuspendGym();

  const [renewDuration, setRenewDuration] = useState("30");

  const handleToggleFeature = (key: string, value: boolean) => {
    updateFeatures({ [key]: value }, {
      onSuccess: () => toast.success(`Feature ${value ? "enabled" : "disabled"}`),
      onError: () => toast.error("Failed to update feature"),
    });
  };

  const handleRenew = () => {
    renewSubscription({ duration: parseInt(renewDuration) }, {
      onSuccess: () => toast.success(`Subscription renewed for ${renewDuration} days`),
      onError: () => toast.error("Failed to renew subscription"),
    });
  };

  const handleStatusChange = (status: string) => {
    updateSubscription({ status }, {
      onSuccess: () => toast.success(`Status changed to ${status}`),
      onError: () => toast.error("Failed to update status"),
    });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    if (!date) return;
    updateSubscription({ expiresAt: new Date(date).toISOString() }, {
      onSuccess: () => toast.success("Expiry date updated"),
      onError: () => toast.error("Failed to update expiry"),
    });
  };

  const handleTrialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    if (!date) return;
    updateSubscription({ trialEndsAt: new Date(date).toISOString() }, {
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
    <div className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-5xl mx-auto animate-fade-slide-up">

      {/* Back Button */}
      <button
        onClick={() => navigate("/super-admin/gyms")}
        className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors mb-6 font-mono cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Gyms
      </button>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <Building2 className="w-7 h-7 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-bold text-xl sm:text-2xl text-text-primary tracking-tight truncate">
              {gym.name}
            </h1>
            <Badge variant={gym.isActive ? "success" : "secondary"} className="text-[10px]">
              {gym.isActive ? "Active" : "Suspended"}
            </Badge>
            <Badge variant={subscriptionBadge[gym.subscription?.status] || "secondary"} className="text-[10px]">
              {gym.subscription?.status}
            </Badge>
          </div>
          <p className="text-text-muted text-xs font-mono mt-1">
            {gym.subdomain && `${gym.subdomain}.`} Created {format(parseISO(gym.createdAt), "MMMM d, yyyy")}
          </p>
        </div>
        <LoadingButton
          variant={gym.isActive ? "destructive" : "outline"}
          size="sm"
          onClick={handleToggleActive}
          isLoading={isActivating || isSuspending}
          className="text-xs cursor-pointer shrink-0"
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
            <InfoRow label="Subdomain" value={gym.subdomain || "-"} />
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
              <div className="flex gap-2 mt-1.5">
                <div className="flex-1">
                  <Select value={renewDuration} onValueChange={setRenewDuration}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">365 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <LoadingButton size="sm" onClick={handleRenew} isLoading={isRenewing} className="text-xs cursor-pointer">
                  Renew
                </LoadingButton>
              </div>
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
            <div>
              <Label className="text-[10px] font-bold text-text-muted uppercase tracking-wider font-mono">Set Expiry Date</Label>
              <Input
                type="date"
                onChange={handleExpiryChange}
                className="text-xs mt-1.5 h-9"
              />
            </div>

            {/* Set Trial End */}
            <div>
              <Label className="text-[10px] font-bold text-text-muted uppercase tracking-wider font-mono">Set Trial End Date</Label>
              <Input
                type="date"
                onChange={handleTrialChange}
                className="text-xs mt-1.5 h-9"
              />
            </div>
          </div>
        </div>
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
    <div className="flex items-center justify-between py-2">
      <span className="text-xs text-text-muted font-mono flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      {badge ? (
        <Badge variant={badge} className="text-[10px] px-2 py-0.5">{value}</Badge>
      ) : (
        <span className="text-xs font-semibold text-text-primary font-mono tabular-nums">{value}</span>
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
