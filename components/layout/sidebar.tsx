"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Briefcase, Users, Calendar,
  BarChart2, Bell, Settings, ChevronRight, LogOut
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils/cn";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatInitials } from "@/lib/utils/format";
import { ROLE_LABELS } from "@/lib/utils/constants";
import type { Role } from "@prisma/client";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "Candidates", href: "/candidates", icon: Users },
  { label: "Interviews", href: "/interviews", icon: Calendar },
  { label: "Reports", href: "/reports", icon: BarChart2 },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
    role: Role;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden lg:flex w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-sidebar-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M9 2L15 5.5V12.5L9 16L3 12.5V5.5L9 2Z" fill="white" fillOpacity="0.9"/>
            <path d="M9 6L12 7.5V11L9 12.5L6 11V7.5L9 6Z" fill="white"/>
          </svg>
        </div>
        <span className="text-base font-bold text-sidebar-foreground tracking-tight">HireTrack</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Main navigation">
        <ul className="space-y-0.5" role="list">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                  )}
                  <Icon
                    className={cn(
                      "h-4.5 w-4.5 shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
                    )}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <ChevronRight className="ml-auto h-3.5 w-3.5 text-primary/60" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors group">
          <Link href="/profile" className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {formatInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">{ROLE_LABELS[user.role]}</p>
            </div>
          </Link>
          <Tooltip>
            <TooltipTrigger
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1.5 rounded-md text-sidebar-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </TooltipTrigger>
            <TooltipContent side="right">Sign out</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}
