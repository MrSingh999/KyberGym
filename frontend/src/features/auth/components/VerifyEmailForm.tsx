import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { MailCheck, ArrowLeft } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/forms/Form";
import { Input } from "../../../components/ui/input";
import { LoadingButton } from "../../../components/ui/button";
import { verifyEmailSchema, type VerifyEmailFormData } from "../schemas/auth.schema";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../../../store/auth.store";

export function VerifyEmailForm() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const form = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: user?.email || "",
      otp: "",
    },
  });

  const onSubmit = async (data: VerifyEmailFormData) => {
    setIsLoading(true);
    try {
      await authApi.verifyEmail(data.email, data.otp);
      setIsVerified(true);
      toast.success("Email verified successfully!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Verification failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen w-full bg-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-in fade-in duration-300">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-surface py-8 px-4 shadow-card sm:rounded-2xl sm:px-10 border border-default text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <MailCheck className="h-6 w-6 text-success" />
            </div>
            <h3 className="mt-4 text-lg font-heading font-medium text-primary">
              Email verified!
            </h3>
            <p className="mt-2 text-sm text-secondary">
              Your email has been successfully verified.
            </p>
            <LoadingButton
              onClick={() => navigate("/")}
              className="mt-6 w-full"
            >
              Continue to dashboard
            </LoadingButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold font-heading text-primary">
          KyberGym
        </h2>
        <p className="mt-2 text-sm text-secondary">
          Enter the OTP sent to your email to verify your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-4 shadow-card sm:rounded-2xl sm:px-10 border border-default">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="admin@kybergym.com"
                        autoComplete="email"
                        readOnly={!!user?.email}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OTP Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter 6-digit code"
                        autoComplete="one-time-code"
                        maxLength={6}
                        inputMode="numeric"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <LoadingButton
                type="submit"
                className="w-full"
                isLoading={isLoading}
                loadingText="Verifying..."
              >
                Verify email
              </LoadingButton>

              <div className="text-center">
                <a
                  href="/login"
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to sign in
                </a>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
