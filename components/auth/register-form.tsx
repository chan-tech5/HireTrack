"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { registerSchema, type RegisterInput } from "@/lib/validations/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Separator } from "@/components/ui/separator";
import { register } from "@/lib/actions/auth.actions";

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      organizationName: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: RegisterInput) {
    const result = await register(data);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Account created! Welcome to HireTrack.");
    router.push("/dashboard");
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" id="register-form">
      <OAuthButtons label="Sign up" />

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><Separator /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or sign up with email</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="org-name">Organization Name</Label>
        <Input id="org-name" placeholder="Acme Inc." {...form.register("organizationName")} />
        {form.formState.errors.organizationName && (
          <p className="text-xs text-destructive">{form.formState.errors.organizationName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-name">Full Name</Label>
        <Input id="reg-name" placeholder="Jane Smith" autoComplete="name" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-email">Work Email</Label>
        <Input id="reg-email" type="email" placeholder="jane@acme.com" autoComplete="email" {...form.register("email")} />
        {form.formState.errors.email && (
          <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-password">Password</Label>
        <div className="relative">
          <Input
            id="reg-password"
            type={showPassword ? "text" : "password"}
            placeholder="Min. 8 characters"
            className="pr-10"
            autoComplete="new-password"
            {...form.register("password")}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          {...form.register("confirmPassword")}
        />
        {form.formState.errors.confirmPassword && (
          <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting} id="register-submit-btn">
        {isSubmitting ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</>
        ) : (
          "Create account"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </p>

      <p className="text-center text-xs text-muted-foreground">
        By creating an account, you agree to our{" "}
        <span className="underline cursor-pointer">Terms of Service</span>
        {" "}and{" "}
        <span className="underline cursor-pointer">Privacy Policy</span>.
      </p>
    </form>
  );
}
