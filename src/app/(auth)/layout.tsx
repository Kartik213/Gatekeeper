import { ThemeToggle } from "@/components/theme-toggle";
import { Header } from "@/components/layout/Header";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Header showBorder={false}>
        <ThemeToggle />
      </Header>

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center px-4 pb-16">{children}</main>
    </div>
  );
}
