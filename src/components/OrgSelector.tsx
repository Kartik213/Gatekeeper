"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { logout } from "@/lib/auth-utils";
import { useParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronsUpDown, PlusCircle, LogOut } from "lucide-react";

/**
 * Generate deterministic color for organization avatar
 */
function getOrgColor(orgId: string): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];

  // Hash org ID to pick color
  const hash = orgId.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  return colors[Math.abs(hash) % colors.length] ?? "bg-primary";
}

/**
 * Generate organization initials from name
 */
function getOrganizationInitials(name: string): string {
  // Guard against empty or whitespace-only names
  const trimmed = name?.trim();
  if (!trimmed) return "??";

  return (
    trimmed
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??"
  );
}

export function OrganizationSelector() {
  const router = useRouter();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const { data: userProfile, isPending } = authClient.useSession();

  const { data: organizations, isPending: organizationsPending } =
    authClient.useListOrganizations();

  const currentOrganization = organizations?.find((org) => org.slug === orgSlug);

  const isLoading = isPending || organizationsPending;

  // Generate avatar props
  const currentOrgAvatar = useMemo(() => {
    if (!currentOrganization) return null;

    return {
      initials: getOrganizationInitials(currentOrganization.name),
      color: getOrgColor(currentOrganization.id),
    };
  }, [currentOrganization]);

  const handleOrganizationSwitch = (slug: string) => {
    if (slug === currentOrganization?.slug) return;
    router.push(`/org/${slug}`);
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-sidebar-accent/50 rounded-lg p-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    );
  }

  // Generate user initials when no org
  const getUserInitials = (name: string | null | undefined): string => {
    if (!name?.trim()) return "??";
    return name
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!currentOrganization && userProfile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="group bg-sidebar-accent/30 border-sidebar-border/50 hover:border-primary/30 hover:bg-sidebar-accent/50 flex w-full items-center gap-2.5 rounded-lg border px-2 py-2 shadow-sm transition-all duration-200">
            {/* Avatar */}
            <Avatar className="border-border/50 h-8 w-8 rounded-md border">
              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                {getUserInitials(userProfile.user.name)}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="min-w-0 flex-1 text-left">
              <p className="group-hover:text-primary text-foreground/90 mb-1 truncate text-[13px] leading-none font-medium transition-colors">
                {userProfile.user.name ?? "User"}
              </p>
              <p className="text-muted-foreground/60 truncate text-[10px] leading-none font-medium">
                Personal Workspace
              </p>
            </div>

            <ChevronsUpDown className="text-muted-foreground/40 group-hover:text-primary h-3.5 w-3.5 shrink-0 transition-colors" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          side="top"
          sideOffset={12}
          className="border-border/40 w-[var(--radix-dropdown-menu-trigger-width)] rounded-xl p-1 shadow-xl backdrop-blur-md"
        >
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-destructive focus:text-destructive focus:bg-destructive/5 flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5"
          >
            <div className="bg-destructive/10 text-destructive flex size-6 items-center justify-center rounded-md">
              <LogOut className="h-3.5 w-3.5" />
            </div>
            <span className="text-[13px] font-medium">Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (currentOrganization) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="group bg-sidebar-accent/30 border-sidebar-border/50 hover:border-primary/30 hover:bg-sidebar-accent/50 flex w-full items-center gap-2.5 rounded-lg border px-2 py-2 shadow-sm transition-all duration-200">
            {/* Org Avatar */}
            <Avatar className="border-border/50 h-8 w-8 rounded-md border">
              <AvatarFallback
                className={`${currentOrgAvatar?.color} text-[9px] font-black tracking-tighter !text-white`}
              >
                {currentOrgAvatar?.initials}
              </AvatarFallback>
            </Avatar>

            {/* Org Info */}
            <div className="min-w-0 flex-1 text-left">
              <p className="group-hover:text-primary text-foreground/90 mb-1 truncate text-[13px] leading-none font-medium transition-colors">
                {currentOrganization.name}
              </p>
              <p className="text-muted-foreground/60 truncate text-[9px] leading-none font-bold tracking-wider uppercase">
                Active Organization
              </p>
            </div>

            <ChevronsUpDown className="text-muted-foreground/40 group-hover:text-primary h-3.5 w-3.5 shrink-0 transition-colors" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          side="top"
          sideOffset={12}
          className="border-border/40 w-[var(--radix-dropdown-menu-trigger-width)] rounded-xl p-1 shadow-xl backdrop-blur-md"
        >
          {organizations && organizations.length > 0 ? (
            <div className="space-y-0.5">
              <DropdownMenuLabel className="text-muted-foreground/40 px-2 py-1.5 text-[9px] font-bold tracking-widest uppercase">
                Organizations
              </DropdownMenuLabel>

              {organizations.map((org) => {
                const avatar = {
                  initials: getOrganizationInitials(org.name),
                  color: getOrgColor(org.id),
                };
                const isActive = org.id === currentOrganization.id;

                return (
                  <DropdownMenuItem
                    key={org.id}
                    onClick={() => handleOrganizationSwitch(org.slug)}
                    className={`group/item relative flex cursor-pointer items-center gap-2 rounded-lg p-1 transition-colors ${
                      isActive
                        ? "bg-primary/5 border-primary/10 border"
                        : "hover:bg-accent focus:bg-accent"
                    }`}
                  >
                    <Avatar className="border-border/50 h-6 w-6 rounded-md border">
                      <AvatarFallback
                        className={`${avatar.color} text-[8px] font-bold !text-white`}
                      >
                        {avatar.initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-[13px] font-medium ${isActive ? "text-primary" : "text-foreground/80"}`}
                      >
                        {org.name}
                      </p>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </div>
          ) : (
            <DropdownMenuLabel className="text-muted-foreground/50 px-2 py-3 text-center text-[11px] italic">
              No organizations available
            </DropdownMenuLabel>
          )}

          <DropdownMenuSeparator className="-mx-1 my-1" />

          <DropdownMenuItem
            asChild
            className="focus:bg-primary/5 flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5"
          >
            <a href="/organizations" className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary flex size-6 items-center justify-center rounded-md transition-transform group-hover:scale-110">
                <PlusCircle className="h-3.5 w-3.5" />
              </div>
              <span className="text-[13px] font-medium">Create Organization</span>
            </a>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="-mx-1 my-1" />

          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-destructive focus:text-destructive focus:bg-destructive/5 flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5"
          >
            <div className="bg-destructive/10 text-destructive flex size-6 items-center justify-center rounded-md">
              <LogOut className="h-3.5 w-3.5" />
            </div>
            <span className="text-[13px] font-medium">Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="bg-base-200 rounded-box mx-2 mt-0 p-3">
      <div className="flex items-center gap-2.5">
        <div className="skeleton h-8 w-8 rounded-lg" />
        <div className="flex-1 space-y-1">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-3 w-16" />
        </div>
      </div>
    </div>
  );
}
