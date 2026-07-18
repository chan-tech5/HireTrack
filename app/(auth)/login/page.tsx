import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your HireTrack account",
};

export default function LoginPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Sign in to your HireTrack account
        </p>
      </div>
      <Suspense fallback={<div className="h-40 flex items-center justify-center text-sm text-muted-foreground">Loading form...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
