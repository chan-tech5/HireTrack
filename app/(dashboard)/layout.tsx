import { requireAuth } from "@/lib/auth/session";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar user={session.user} />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Topbar user={session.user} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
