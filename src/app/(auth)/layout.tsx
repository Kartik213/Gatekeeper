import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex w-full items-center justify-between px-8 py-6">
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
        <ThemeToggle />
      </header>

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center px-4 pb-16">{children}</main>
    </div>
  );
}
