import type { Metadata } from "next";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Bell, Check, Eye } from "lucide-react";
import { markAsRead, markAllAsRead } from "@/lib/actions/notification.actions";
import { formatTimeAgo } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const session = await requireAuth();

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

  // Form action bindings
  async function handleMarkAllRead() {
    "use server";
    await markAllAsRead();
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <PageHeader title="Notifications" description={`You have ${unread.length} unread notification${unread.length !== 1 ? "s" : ""}`}>
        {unread.length > 0 && (
          <form action={handleMarkAllRead}>
            <Button variant="outline" size="sm" type="submit">
              <Check className="mr-2 h-4 w-4" />Mark all as read
            </Button>
          </form>
        )}
      </PageHeader>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All caught up!"
          description="You don't have any notifications at the moment."
        />
      ) : (
        <div className="space-y-6">
          {/* Unread Section */}
          {unread.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase">Unread</h3>
              <div className="space-y-2">
                {unread.map((notification) => {
                  async function handleMarkRead() {
                    "use server";
                    await markAsRead(notification.id);
                  }
                  return (
                    <Card key={notification.id} className="border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                      <CardContent className="p-4 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-sm text-foreground">{notification.title}</h4>
                          <p className="text-sm text-foreground/80">{notification.message}</p>
                          <p className="text-xs text-muted-foreground pt-1">{formatTimeAgo(notification.createdAt)}</p>
                        </div>
                        <form action={handleMarkRead}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" type="submit" title="Mark as read">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Read Section */}
          {read.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">Read</h3>
              <div className="space-y-2">
                {read.map((notification) => (
                  <Card key={notification.id} className="bg-muted/30 border-border/80">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-sm text-foreground/80">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
                      <p className="text-xs text-muted-foreground/60 mt-2">{formatTimeAgo(notification.createdAt)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
