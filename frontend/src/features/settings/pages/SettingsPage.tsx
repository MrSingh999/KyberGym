import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Building2, Globe, Clock, Wallet } from "lucide-react";
import { useGymSettings, useUpdateGymSettings } from "../hooks/useSettings";
import { Button, LoadingButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";

const TIMEZONES = [
  "Asia/Kolkata", "Asia/Dubai", "Asia/Singapore", "Asia/Tokyo",
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Madrid",
  "Australia/Sydney", "Pacific/Auckland", "UTC",
];

const CURRENCIES = [
  { value: "INR", label: "₹ INR" },
  { value: "USD", label: "$ USD" },
  { value: "EUR", label: "€ EUR" },
  { value: "GBP", label: "£ GBP" },
  { value: "AED", label: "د.إ AED" },
  { value: "SGD", label: "S$ SGD" },
  { value: "JPY", label: "¥ JPY" },
  { value: "AUD", label: "A$ AUD" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिन्दी" },
  { value: "ar", label: "العربية" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
];

export function SettingsPage() {
  const { data: gym, isLoading, isError, refetch } = useGymSettings();
  const { mutate: updateSettings, isPending } = useUpdateGymSettings();

  const [form, setForm] = useState({
    name: "",
    timezone: "Asia/Kolkata",
    currency: "INR",
    language: "en",
  });

  useEffect(() => {
    if (gym) {
      setForm({
        name: gym.name ?? "",
        timezone: gym.timezone ?? "Asia/Kolkata",
        currency: gym.currency ?? "INR",
        language: gym.language ?? "en",
      });
    }
  }, [gym]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Record<string, string> = {};
    if (form.name !== gym?.name) data.name = form.name;
    if (form.timezone !== gym?.timezone) data.timezone = form.timezone;
    if (form.currency !== gym?.currency) data.currency = form.currency;
    if (form.language !== gym?.language) data.language = form.language;

    if (Object.keys(data).length === 0) {
      toast.info("No changes to save");
      return;
    }

    updateSettings(data, {
      onSuccess: () => toast.success("Gym settings updated"),
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed to update settings");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-full bg-canvas p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col min-h-full bg-canvas p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        <ErrorState
          title="Failed to load gym settings"
          message="Could not fetch gym settings. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-canvas">
      <div className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">Settings</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage your gym's general settings and preferences.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-border-default bg-surface p-6 space-y-5">
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-text-primary flex items-center gap-2">
              <Building2 className="w-4 h-4 text-text-muted" />
              Gym Name
            </Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. KyberGym Fitness"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="timezone" className="text-sm font-medium text-text-primary flex items-center gap-2">
              <Clock className="w-4 h-4 text-text-muted" />
              Timezone
            </Label>
            <Select
              value={form.timezone}
              onValueChange={(value) => setForm((prev) => ({ ...prev, timezone: value }))}
            >
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="currency" className="text-sm font-medium text-text-primary flex items-center gap-2">
              <Wallet className="w-4 h-4 text-text-muted" />
              Currency
            </Label>
            <Select
              value={form.currency}
              onValueChange={(value) => setForm((prev) => ({ ...prev, currency: value }))}
            >
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="language" className="text-sm font-medium text-text-primary flex items-center gap-2">
              <Globe className="w-4 h-4 text-text-muted" />
              Language
            </Label>
            <Select
              value={form.language}
              onValueChange={(value) => setForm((prev) => ({ ...prev, language: value }))}
            >
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end pt-4 border-t border-border-default">
            <LoadingButton type="submit" loading={isPending}>
              Save Changes
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}
