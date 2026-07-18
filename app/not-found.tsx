import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6 animate-fade-in">
        <div className="text-8xl font-bold text-primary/20">404</div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
          <p className="text-muted-foreground mt-2">The page you're looking for doesn't exist.</p>
        </div>
        <Link href="/dashboard" className={buttonVariants({ variant: "default" })}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
