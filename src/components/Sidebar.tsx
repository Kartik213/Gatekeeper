"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings } from "lucide-react";
import { OrganizationSelector } from "@/components/OrgSelector";
import { ThemeToggle } from "@/components/theme-toggle";

export const navItems = [
  { href: "/org", label: "Projects", icon: Home },
  { href: "/organizations", label: "Organizations", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="bg-sidebar/70 flex h-full flex-col justify-between px-4 py-6 backdrop-blur-xl transition-all duration-300">
      <div className="space-y-6">
        <div className="px-1">
          <Link
            href="/"
            className="group/brand border-sidebar-border/50 mb-2 flex items-center gap-2.5 border-b px-2 pb-4"
          >
            <div className="bg-primary shadow-primary/20 flex h-7 w-7 items-center justify-center rounded-lg shadow-lg transition-transform group-hover/brand:scale-110">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                className="text-primary-foreground"
              >
                <polyline points="20,6 9,17 4,12" />
              </svg>
            </div>
            <span className="text-foreground/80 text-xs font-semibold tracking-tight tracking-wider uppercase">
              Feature Flag Hub
            </span>
          </Link>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.split("/").includes(item.href.split("/")[1]);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary shadow-primary/5 shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
                prefetch={false}
              >
                <div
                  className={`rounded-md p-1 transition-colors ${isActive ? "bg-white/20" : "group-hover:bg-primary/10 bg-transparent"}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-sidebar-border flex items-center justify-between gap-2 border-t pt-4">
        <div className="min-w-0 flex-1">
          <OrganizationSelector />
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}
