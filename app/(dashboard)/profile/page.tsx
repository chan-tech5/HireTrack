import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { ProfileTabs } from "@/components/profile/profile-tabs";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <PageHeader title="My Profile" description="Manage your personal account credentials, passwords, and notification avatar." />
      <ProfileTabs user={user} />
    </div>
  );
}
