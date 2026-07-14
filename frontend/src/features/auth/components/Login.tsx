import React from "react";
import { Dumbbell } from "lucide-react";
import { LoginForm } from "./LoginForm";

export function Login() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-canvas">
      
      {/* Left Column: Form (Mobile First Single Column) */}
      <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-32">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-10">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Dumbbell className="size-5" />
            </div>
            <span className="text-xl font-bold text-text-primary tracking-tight">KyberGym</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-text-secondary mb-8">
            Manage your members, payments, and schedules all in one place.
          </p>

          <LoginForm />
          
          <p className="mt-8 text-center text-sm text-text-muted">
            Don't have a gym account?{" "}
            <a href="/register" className="font-medium text-text-primary hover:underline">
              Start your 14-day free trial
            </a>
          </p>
        </div>
      </div>

      {/* Right Column: Premium Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex relative bg-surface-hover flex-col justify-center items-center overflow-hidden border-l border-border-default">
        {/* Subtle background glow effect using tokens */}
        <div className="absolute top-1/4 left-1/4 size-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 size-96 bg-success/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-lg text-center px-8">
          <Dumbbell className="size-16 text-text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-text-primary mb-4 tracking-tight">
            The next-generation operating system for modern gyms.
          </h1>
          <p className="text-lg text-text-secondary">
            Join thousands of fitness businesses scaling faster and keeping members happier with KyberGym.
          </p>
        </div>
      </div>
      
    </div>
  );
}
