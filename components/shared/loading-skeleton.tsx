import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-6 space-y-3", className)}>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-48" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 py-3 px-4 border-b border-border">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" style={{ maxWidth: i === 0 ? "200px" : undefined }} />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <Skeleton className="h-5 w-32" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
