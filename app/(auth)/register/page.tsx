import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your HireTrack account",
};

export default function RegisterPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Create your account</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Start hiring smarter in minutes. No credit card required.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
