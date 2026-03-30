"use client";

import Link from "next/link";
import { GatekeeperLogo } from "@/components/GateKeeperLogo";
import { cn } from "@/lib/utils";

interface HeaderProps {
  children?: React.ReactNode;
  className?: string;
  showBorder?: boolean;
  isSticky?: boolean;
}

export function Header({ children, className, showBorder = true, isSticky = false }: HeaderProps) {
  return (
    <header
      className={cn(
        "flex w-full items-center justify-between px-4 py-3 md:px-8 md:py-6",
        showBorder && "border-b border-border/70",
        isSticky && "sticky top-0 z-10 bg-background/80 backdrop-blur-md",
        className
      )}
    >
      <Link href="/" className="group inline-flex items-center gap-2">
        <GatekeeperLogo />
        <span className="tracking-tight text-lg font-bold">Gatekeeper</span>
      </Link>
      <div className="flex items-center gap-2">{children}</div>
    </header>
  );
}
