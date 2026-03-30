"use client";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { logout } from "@/lib/auth-utils";
import { Loader2, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";

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
      <Header>
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
      </Header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">{children}</main>
    </div>
  );
}
