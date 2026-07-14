import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Palette, Image, Globe, Eye, EyeOff } from "lucide-react";
import { useBranding, useUpdateBranding } from "../hooks/useBranding";
import { useAuthStore } from "@/store/auth.store";
import { Button, LoadingButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";

export function BrandingPage() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === "superadmin";
  const { data: branding, isLoading, isError, refetch } = useBranding();
  const { mutate: updateBranding, isPending } = useUpdateBranding();

  const [form, setForm] = useState({
    appName: "",
    logo: "",
    favicon: "",
    primaryColor: "#3B82F6",
    secondaryColor: "#8B5CF6",
    loginBanner: "",
  });
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (branding) {
      setForm({
        appName: branding.appName ?? "",
        logo: branding.logo ?? "",
        favicon: branding.favicon ?? "",
        primaryColor: branding.primaryColor ?? "#3B82F6",
        secondaryColor: branding.secondaryColor ?? "#8B5CF6",
        loginBanner: branding.loginBanner ?? "",
      });
    }
  }, [branding]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Record<string, string> = {};
    if (form.appName !== branding?.appName) data.appName = form.appName;
    if (form.logo !== branding?.logo) data.logo = form.logo;
    if (form.favicon !== branding?.favicon) data.favicon = form.favicon;
    if (form.primaryColor !== branding?.primaryColor) data.primaryColor = form.primaryColor;
    if (form.secondaryColor !== branding?.secondaryColor) data.secondaryColor = form.secondaryColor;
    if (form.loginBanner !== branding?.loginBanner) data.loginBanner = form.loginBanner;

    if (Object.keys(data).length === 0) {
      toast.info("No changes to save");
      return;
    }

    updateBranding(data, {
      onSuccess: () => toast.success("Branding updated"),
      onError: (err: any) => {
        if (err?.response?.status === 403) {
          toast.error("Only Super Admin can update branding settings");
        } else {
          toast.error(err?.response?.data?.message || "Failed to update branding");
        }
      },
    });
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        <ErrorState
          title="Failed to load branding"
          message="Could not fetch branding settings."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-canvas">
      <div className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-h2 font-heading font-bold text-primary">Branding</h1>
          <p className="text-sm text-muted mt-1">
            Customize your gym's appearance across the platform.
            {!isSuperAdmin && (
              <span className="block mt-1 text-amber-600 dark:text-amber-400">
                Only Super Admin can save branding changes.
              </span>
            )}
          </p>
        </div>

        {/* Preview toggle */}
        <button
          onClick={() => setPreview(!preview)}
          className="flex items-center gap-1.5 text-sm text-primary hover:underline mb-4"
        >
          {preview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {preview ? "Hide Preview" : "Show Preview"}
        </button>

        {preview && (
          <div className="rounded-xl border border-default bg-surface p-6 mb-6 overflow-hidden">
            <div
              className="rounded-lg p-6 text-white"
              style={{ backgroundColor: form.primaryColor || "#3B82F6" }}
            >
              <h2 className="text-xl font-bold">{form.appName || "Your Gym Name"}</h2>
              <p className="text-sm opacity-80 mt-1">Welcome to your gym management portal</p>
              <button
                className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold"
                style={{
                  backgroundColor: form.secondaryColor || "#8B5CF6",
                  color: "#fff",
                }}
              >
                Get Started
              </button>
            </div>
            {form.loginBanner && (
              <div className="mt-4 rounded-lg overflow-hidden">
                <img
                  src={form.loginBanner}
                  alt="Login banner preview"
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-xl border border-default bg-surface p-6 space-y-5">
          {/* App Name */}
          <div>
            <Label htmlFor="appName" className="text-sm font-medium text-primary flex items-center gap-2">
              <Palette className="w-4 h-4 text-muted" />
              App Name
            </Label>
            <Input
              id="appName"
              value={form.appName}
              onChange={(e) => updateField("appName", e.target.value)}
              placeholder="e.g. KyberGym"
              className="mt-1.5"
            />
          </div>

          {/* Logo URL */}
          <div>
            <Label htmlFor="logo" className="text-sm font-medium text-primary flex items-center gap-2">
              <Image className="w-4 h-4 text-muted" />
              Logo URL
            </Label>
            <Input
              id="logo"
              value={form.logo}
              onChange={(e) => updateField("logo", e.target.value)}
              placeholder="https://example.com/logo.png"
              className="mt-1.5"
            />
            {form.logo && (
              <img
                src={form.logo}
                alt="Logo preview"
                className="mt-2 h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
          </div>

          {/* Favicon URL */}
          <div>
            <Label htmlFor="favicon" className="text-sm font-medium text-primary flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted" />
              Favicon URL
            </Label>
            <Input
              id="favicon"
              value={form.favicon}
              onChange={(e) => updateField("favicon", e.target.value)}
              placeholder="https://example.com/favicon.ico"
              className="mt-1.5"
            />
          </div>

          {/* Primary Color */}
          <div>
            <Label htmlFor="primaryColor" className="text-sm font-medium text-primary">
              Primary Color
            </Label>
            <div className="flex gap-3 mt-1.5">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => updateField("primaryColor", e.target.value)}
                className="w-10 h-10 rounded-lg border border-default cursor-pointer bg-transparent"
              />
              <Input
                value={form.primaryColor}
                onChange={(e) => updateField("primaryColor", e.target.value)}
                placeholder="#3B82F6"
                className="font-mono"
              />
            </div>
          </div>

          {/* Secondary Color */}
          <div>
            <Label htmlFor="secondaryColor" className="text-sm font-medium text-primary">
              Secondary Color
            </Label>
            <div className="flex gap-3 mt-1.5">
              <input
                type="color"
                value={form.secondaryColor}
                onChange={(e) => updateField("secondaryColor", e.target.value)}
                className="w-10 h-10 rounded-lg border border-default cursor-pointer bg-transparent"
              />
              <Input
                value={form.secondaryColor}
                onChange={(e) => updateField("secondaryColor", e.target.value)}
                placeholder="#8B5CF6"
                className="font-mono"
              />
            </div>
          </div>

          {/* Login Banner URL */}
          <div>
            <Label htmlFor="loginBanner" className="text-sm font-medium text-primary flex items-center gap-2">
              <Image className="w-4 h-4 text-muted" />
              Login Banner URL
            </Label>
            <Input
              id="loginBanner"
              value={form.loginBanner}
              onChange={(e) => updateField("loginBanner", e.target.value)}
              placeholder="https://example.com/banner.jpg"
              className="mt-1.5"
            />
            {form.loginBanner && (
              <img
                src={form.loginBanner}
                alt="Banner preview"
                className="mt-2 h-20 w-full object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4 border-t border-default">
            <LoadingButton type="submit" loading={isPending} disabled={!isSuperAdmin}>
              {isSuperAdmin ? "Save Changes" : "Read Only"}
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}
