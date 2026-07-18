import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsTabs } from "@/components/settings/settings-tabs";

export const metadata: Metadata = { title: "Organization Settings" };

export default async function SettingsPage() {
  const session = await requireAuth();

  const organization = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
    select: {
      id: true,
      name: true,
      website: true,
      industry: true,
      size: true,
    },
  });

  if (!organization) {
    notFound();
  }

  const members = await prisma.user.findMany({
    where: { organizationId: session.user.organizationId, deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Settings" description="Manage your organization profile, team permissions, and workspace preferences." />
      <SettingsTabs
        organization={organization}
        members={members}
        currentUserId={session.user.id}
        currentUserRole={session.user.role}
      />
    </div>
  );
}
