import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

// ─── Date Formatters ──────────────────────────────────────────────────────────

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "—";
  return format(d, "MMM d, yyyy");
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "—";
  return format(d, "MMM d, yyyy 'at' h:mm a");
}

export function formatTimeAgo(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "—";
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "—";
  return format(d, "h:mm a");
}

// ─── Currency Formatters ──────────────────────────────────────────────────────

export function formatSalary(
  min?: number | null,
  max?: number | null,
  currency = "USD"
): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
  if (!min && !max) return "Not specified";
  if (min && max) return `${formatter.format(min)} – ${formatter.format(max)}`;
  if (min) return `From ${formatter.format(min)}`;
  return `Up to ${formatter.format(max!)}`;
}

// ─── String Formatters ────────────────────────────────────────────────────────

export function formatInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatFullName(
  firstName: string,
  lastName: string
): string {
  return `${firstName} ${lastName}`.trim();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

// ─── Number Formatters ────────────────────────────────────────────────────────

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatExperience(years?: number | null): string {
  if (!years) return "Not specified";
  if (years === 1) return "1 year";
  return `${years} years`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
