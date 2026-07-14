import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, KeyRound } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/forms/Form";
import { Input } from "../../../components/ui/input";
import { PasswordInput } from "../../../components/ui/password-input";
import { LoadingButton } from "../../../components/ui/button";
import { resetPasswordSchema, type ResetPasswordFormData } from "../schemas/auth.schema";
import { authApi } from "../api/auth.api";

export function ResetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledEmail = searchParams.get("email") || "";
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: prefilledEmail,
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      await authApi.resetPassword(data.email, data.otp, data.newPassword);
      setIsSuccess(true);
      toast.success("Password reset successful!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to reset password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen w-full bg-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-in fade-in duration-300">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-surface py-8 px-4 shadow-card sm:rounded-2xl sm:px-10 border border-default text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <KeyRound className="h-6 w-6 text-success" />
            </div>
            <h3 className="mt-4 text-lg font-heading font-medium text-primary">
              Password reset successful
            </h3>
            <p className="mt-2 text-sm text-secondary">
              Your password has been updated. Use your new password to sign in.
            </p>
            <LoadingButton
              onClick={() => navigate("/login")}
              className="mt-6 w-full"
            >
              Back to sign in
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
          Enter the OTP sent to your email and choose a new password
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
                        readOnly={!!prefilledEmail}
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

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="Min. 8 characters, 1 uppercase, 1 number"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm new password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="Re-enter your new password"
                        autoComplete="new-password"
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
                loadingText="Resetting password..."
              >
                Reset password
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
