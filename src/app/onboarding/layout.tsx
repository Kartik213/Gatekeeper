"use client";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { logout } from "@/lib/auth-utils";
import { Loader2, LogOut } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="border-border/70 flex w-full items-center justify-between border-b px-8 py-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-primary-foreground"
            >
              <polyline points="20,6 9,17 4,12" />
            </svg>
          </div>
          <span className="text-lg font-bold">FeatureFlagHub</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-muted-foreground hover:text-foreground flex items-center gap-2"
          >
            <LogOut className="size-4" />
            <span>Logout</span>
          </Button>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">{children}</main>
    </div>
  );
}
