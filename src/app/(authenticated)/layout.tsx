"use client";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/layout/Header";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
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
    <div className="flex h-screen w-full">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:w-64 lg:shrink-0 lg:border-r lg:bg-gray-100 dark:lg:bg-gray-800">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Mobile header */}
        <Header className="lg:hidden" isSticky={true} showBorder={true}>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </Header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
