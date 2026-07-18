"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Upload, User, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfile, changePassword } from "@/lib/actions/profile.actions";
import { changePasswordSchema } from "@/lib/validations/auth.schema";
import { formatInitials } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface ProfileTabsProps {
  user: {
    name: string;
    email: string;
    image: string | null;
  };
}

export function ProfileTabs({ user }: ProfileTabsProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.image);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const profileForm = useForm({
    defaultValues: {
      name: user.name,
      image: user.image ?? "",
    },
  });

  const pwdForm = useForm<any>({
    resolver: zodResolver(changePasswordSchema) as any,
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Avatar image size cannot exceed 2MB.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setAvatarUrl(data.url);
      profileForm.setValue("image", data.url);
      toast.success("Avatar image uploaded.");
    } catch (err) {
      toast.error("Failed to upload avatar.");
    } finally {
      setUploading(false);
    }
  }

  async function onProfileSubmit(data: any) {
    const res = await updateProfile(data);

    if (res?.error) {
      toast.error(res.error);
      return;
    }

    toast.success("Profile details updated.");
    router.refresh();
  }

  async function onPwdSubmit(data: any) {
    const res = await changePassword(data);

    if (res?.error) {
      toast.error(res.error);
      return;
    }

    toast.success("Password changed successfully.");
    pwdForm.reset();
    router.refresh();
  }

  return (
    <Tabs defaultValue="personal" className="w-full">
      <TabsList className="grid w-full grid-cols-2 max-w-sm mb-6">
        <TabsTrigger value="personal">Personal Info</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>

      {/* Personal Info Tab */}
      <TabsContent value="personal">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Personal Profile</CardTitle>
            <CardDescription>Update your avatar photo, display name and contact preferences.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6 max-w-xl">
              {/* Avatar Upload */}
              <div className="flex items-center gap-6 p-4 rounded-xl border border-border/80 bg-muted/10">
                <Avatar className="h-16 w-16 ring-4 ring-muted shrink-0">
                  <AvatarImage src={avatarUrl ?? undefined} alt={user.name} />
                  <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">
                    {formatInitials(user.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-2">
                  <Label htmlFor="avatar-file-input" className="flex items-center gap-2 cursor-pointer border border-border bg-card hover:bg-muted rounded-lg px-3 py-1.5 text-xs font-semibold shadow-xs transition-colors">
                    {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    Upload Image
                  </Label>
                  <input
                    type="file"
                    id="avatar-file-input"
                    className="hidden"
                    accept="image/png, image/jpeg"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                  <p className="text-[10px] text-muted-foreground">PNG, JPG up to 2MB</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Display Name *</Label>
                <Input id="fullName" placeholder="Jane Doe" {...profileForm.register("name", { required: true })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-input">Email Address</Label>
                <Input id="email-input" value={user.email} disabled className="bg-muted/50 cursor-not-allowed" />
                <p className="text-[11px] text-muted-foreground">Contact your workspace administrator to change email.</p>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                  {profileForm.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Security Tab */}
      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Password Security</CardTitle>
            <CardDescription>Update your workspace account password. Ensure it has digits and uppercase.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={pwdForm.handleSubmit(onPwdSubmit)} className="space-y-4 max-w-xl">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="curr-password">Current Password</Label>
                <div className="relative">
                  <Input id="curr-password" type={showCurrent ? "text" : "password"} {...pwdForm.register("currentPassword")} />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {pwdForm.formState.errors.currentPassword && (
                  <p className="text-xs text-destructive">{pwdForm.formState.errors.currentPassword.message as string}</p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input id="new-password" type={showNew ? "text" : "password"} {...pwdForm.register("newPassword")} />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {pwdForm.formState.errors.newPassword && (
                  <p className="text-xs text-destructive">{pwdForm.formState.errors.newPassword.message as string}</p>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                <div className="relative">
                  <Input id="confirm-new-password" type={showConfirm ? "text" : "password"} {...pwdForm.register("confirmNewPassword")} />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {pwdForm.formState.errors.confirmNewPassword && (
                  <p className="text-xs text-destructive">{pwdForm.formState.errors.confirmNewPassword.message as string}</p>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" disabled={pwdForm.formState.isSubmitting}>
                  {pwdForm.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Changing Password...</> : "Change Password"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
