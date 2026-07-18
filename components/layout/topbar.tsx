import Link from "next/link";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { formatInitials } from "@/lib/utils/format";
import { prisma } from "@/lib/db/prisma";
import type { Role } from "@prisma/client";

interface TopbarProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role: Role;
  };
}

export async function Topbar({ user }: TopbarProps) {
  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, isRead: false },
  });

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40 flex items-center gap-4 px-4 sm:px-6">
      {/* Mobile menu placeholder */}
      <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* Notification bell */}
        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="relative" aria-label={`${unreadCount} unread notifications`}>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
            )}
          </Button>
        </Link>

        {/* Avatar */}
        <Link href="/profile">
          <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-primary/30 transition-all">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {formatInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
