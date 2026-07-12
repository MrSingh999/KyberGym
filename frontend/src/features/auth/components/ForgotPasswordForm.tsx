import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "../../../components/forms/Form";
import { Input } from "../../../components/ui/Input";
import { LoadingButton } from "../../../components/ui/Button";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "../schemas/auth.schema";
import { apiClient } from "../../../lib/apiClient";
import { useNavigate } from "react-router";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const navigate = useNavigate();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await apiClient.post("/auth/forgot-password", { email: data.email });
      setIsSubmitted(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
          <svg className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-heading font-medium text-primary">Check your email</h3>
          <p className="mt-2 text-sm text-secondary">
            We sent a password reset link to <span className="font-medium text-primary">{form.getValues().email}</span>
          </p>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="text-sm font-medium text-primary hover:underline"
        >
          Return to sign in
        </button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input placeholder="admin@kybergym.com" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <LoadingButton 
          type="submit" 
          className="w-full" 
          isLoading={isLoading} 
          loadingText="Sending instructions..."
        >
          Send reset instructions
        </LoadingButton>

        <div className="text-center">
          <a href="/login" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </a>
        </div>
      </form>
    </Form>
  );
}
