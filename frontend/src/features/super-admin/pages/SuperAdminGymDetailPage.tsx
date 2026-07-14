import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Building2, Shield, CreditCard, Check, X } from "lucide-react";
import { useSAGym, useSAUpdateFeatures, useSAUpdateSubscription, useSARenewSubscription } from "../hooks/useSuperAdmin";
import { FEATURE_FLAGS } from "../types";
import { Button, LoadingButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Switch } from "@/components/ui/switch";

export function SuperAdminGymDetailPage() {
  const { gymId } = useParams();
  const navigate = useNavigate();
  const { data: gym, isLoading, isError } = useSAGym(gymId!);
  const { mutate: updateFeatures, isPending: isUpdatingFeatures } = useSAUpdateFeatures(gymId!);
  const { mutate: updateSubscription, isPending: isUpdatingSub } = useSAUpdateSubscription(gymId!);
  const { mutate: renewSubscription, isPending: isRenewing } = useSARenewSubscription(gymId!);

  const [subStatus, setSubStatus] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [renewDuration, setRenewDuration] = useState("30");

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError || !gym) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <ErrorState title="Gym not found" message="The gym you're looking for doesn't exist." onRetry={() => navigate("/super-admin/gyms")} />
      </div>
    );
  }

  const handleToggleFeature = (key: string, value: boolean) => {
    updateFeatures({ [key]: value }, {
      onSuccess: () => toast.success(`${key} feature ${value ? "enabled" : "disabled"}`),
      onError: () => toast.error("Failed to update feature"),
    });
  };

  const handleUpdateSubscription = () => {
    updateSubscription({
      status: subStatus || undefined,
      expiresAt: expiresAt || undefined,
    }, {
      onSuccess: () => { toast.success("Subscription updated"); setSubStatus(""); setExpiresAt(""); },
      onError: () => toast.error("Failed to update subscription"),
    });
  };

  const handleRenew = () => {
    renewSubscription({ duration: parseInt(renewDuration) }, {
      onSuccess: () => toast.success(`Subscription renewed for ${renewDuration} days`),
      onError: () => toast.error("Failed to renew subscription"),
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-5xl mx-auto">
      <button onClick={() => navigate("/super-admin/gyms")}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Gyms
      </button>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Building2 className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-h2 font-heading font-bold text-primary">{gym.name}</h1>
          <p className="text-sm text-muted">{gym.subdomain && `${gym.subdomain}.`} Created {new Date(gym.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="ml-auto">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
            gym.isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" : "bg-red-500/10 text-red-600 border-red-200"
          }`}>
            {gym.isActive ? "Active" : "Suspended"}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-default bg-surface p-5">
          <h3 className="font-semibold text-sm text-primary mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Gym Info
          </h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Name</dt><dd className="text-primary">{gym.name}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Subdomain</dt><dd className="text-primary">{gym.subdomain || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Timezone</dt><dd className="text-primary">{gym.timezone}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Currency</dt><dd className="text-primary">{gym.currency}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Language</dt><dd className="text-primary">{gym.language}</dd></div>
          </dl>
        </div>

        <div className="rounded-xl border border-default bg-surface p-5">
          <h3 className="font-semibold text-sm text-primary mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Subscription
          </h3>
          <dl className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <dt className="text-muted">Status</dt>
              <dd className={`font-medium ${
                gym.subscription?.status === "active" ? "text-emerald-600" :
                gym.subscription?.status === "trial" ? "text-amber-600" : "text-red-600"
              }`}>{gym.subscription?.status}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Expires</dt>
              <dd className="text-primary">{gym.subscription?.expiresAt ? new Date(gym.subscription.expiresAt).toLocaleDateString() : "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Trial Ends</dt>
              <dd className="text-primary">{gym.subscription?.trialEndsAt ? new Date(gym.subscription.trialEndsAt).toLocaleDateString() : "-"}</dd>
            </div>
          </dl>

          {/* Renew */}
          <div className="flex gap-2 items-center">
            <select value={renewDuration} onChange={(e) => setRenewDuration(e.target.value)}
              className="h-9 rounded-lg border border-default bg-surface px-2 text-sm text-primary">
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
              <option value="365">365 days</option>
            </select>
            <LoadingButton size="sm" onClick={handleRenew} loading={isRenewing}>Renew</LoadingButton>
          </div>

          {/* Manual update */}
          <div className="mt-4 pt-4 border-t border-default space-y-3">
            <div className="flex gap-2">
              <select value={subStatus} onChange={(e) => setSubStatus(e.target.value)}
                className="h-9 rounded-lg border border-default bg-surface px-2 text-sm text-primary flex-1">
                <option value="">Select status</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="expired">Expired</option>
                <option value="suspended">Suspended</option>
              </select>
              <LoadingButton size="sm" variant="outline" onClick={handleUpdateSubscription} loading={isUpdatingSub}>Update</LoadingButton>
            </div>
            <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="text-sm" placeholder="Expiry date" />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="rounded-xl border border-default bg-surface p-5">
        <h3 className="font-semibold text-sm text-primary mb-4">Feature Flags</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {FEATURE_FLAGS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-lg border border-default bg-surface-hover/50">
              <span className="text-sm text-primary">{label}</span>
              <Switch
                checked={!!gym.features[key]}
                onCheckedChange={(v) => handleToggleFeature(key, v)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
