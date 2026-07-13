import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "../../../components/forms/Form";
import { Input } from "../../../components/ui/input";
import { PasswordInput } from "../../../components/ui/password-input";
import { Checkbox } from "../../../components/ui/checkbox";
import { LoadingButton } from "../../../components/ui/button";
import { loginSchema, type LoginFormData } from "../schemas/auth.schema";
import { useAuthStore } from "../../../store/auth.store";
import { useNavigate } from "react-router";
import { apiClient } from "../../../lib/apiClient";

export function LoginForm() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // Backend handles setting HttpOnly refresh token cookie automatically
      const response = await apiClient.post("/auth/login", {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      const user = response.data.data.user;
      const token = response.data.data.accessToken;

      // login action maps backend role automatically
      login(user, token);
      
      toast.success("Welcome back!");

      // Resolve mapped role to navigate correctly
      const mappedRole = 
        user.role === "super_admin" || user.role === "superadmin" ? "superadmin" : 
        user.role === "gym_admin" || user.role === "owner" ? "owner" : 
        "member";

      if (mappedRole === "superadmin") {
        navigate("/super-admin/dashboard", { replace: true });
      } else if (mappedRole === "owner") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/member/dashboard", { replace: true });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <a href="/forgot-password" className="text-sm font-medium text-primary hover:underline" tabIndex={-1}>
                  Forgot password?
                </a>
              </div>
              <FormControl>
                <PasswordInput placeholder="••••••••" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="font-normal cursor-pointer text-muted">
                  Remember me for 30 days
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        <LoadingButton 
          type="submit" 
          className="w-full" 
          isLoading={isLoading} 
          loadingText="Signing in..."
        >
          Sign in
        </LoadingButton>
      </form>
    </Form>
  );
}
