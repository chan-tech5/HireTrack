import type { Metadata } from "next";
import { APP_NAME } from "@/lib/utils/constants";

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: APP_NAME,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — Brand panel */}
      <div className="hidden lg:flex flex-col relative overflow-hidden bg-sidebar border-r border-border">
        {/* Gradient orb */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-chart-4/20 blur-3xl" />

        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L15 5.5V12.5L9 16L3 12.5V5.5L9 2Z" fill="white" fillOpacity="0.9"/>
                <path d="M9 6L12 7.5V11L9 12.5L6 11V7.5L9 6Z" fill="white"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">HireTrack</span>
          </div>

          {/* Headline */}
          <div className="mt-auto mb-8">
            <h1 className="text-4xl font-bold text-foreground leading-tight mb-4">
              Hire smarter,<br />
              <span className="gradient-text">faster, together.</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-sm">
              The modern applicant tracking system built for high-performance recruiting teams.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "10k+", label: "Jobs Posted" },
              { value: "95%", label: "Time Saved" },
              { value: "4.9", label: "User Rating" },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl bg-background/50 border border-border/50 backdrop-blur-sm">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L15 5.5V12.5L9 16L3 12.5V5.5L9 2Z" fill="white" fillOpacity="0.9"/>
                <path d="M9 6L12 7.5V11L9 12.5L6 11V7.5L9 6Z" fill="white"/>
              </svg>
            </div>
            <span className="text-lg font-bold">HireTrack</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
