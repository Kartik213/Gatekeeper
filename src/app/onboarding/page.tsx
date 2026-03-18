"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Building2, Loader2 } from "lucide-react";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: orgs, isPending } = authClient.useListOrganizations();
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // If user already has organizations, redirect them away from onboarding
  useEffect(() => {
    if (!isPending && orgs?.length) {
      router.replace("/org");
    }
  }, [isPending, orgs, router]);

  const handleCreate = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    setCreating(true);

    const normalizedSlug = orgSlug || slugify(orgName);
    const result = await authClient.organization.create({
      name: orgName,
      slug: normalizedSlug,
    });

    if (result.error) {
      setError(result.error.message ?? "Failed to create organization");
      setCreating(false);
      return;
    }

    const createdOrganization = result.data;

    if (createdOrganization) {
      localStorage.setItem("lastOrg", createdOrganization.slug ?? normalizedSlug);
      router.push(`/org/${createdOrganization.slug}`);
      return;
    }

    router.push("/org");
  };

  // Show loader while checking orgs
  if (isPending) {
    return (
      <div className="text-muted-foreground flex items-center gap-2">
        <Loader2 className="size-4 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  // Don't render form if user already has orgs (will redirect)
  if (orgs?.length) return null;

  return (
    <div className="w-full max-w-lg">
      <div className="mb-8 text-center">
        <div className="bg-primary/10 mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl">
          <Building2 className="text-primary size-6" />
        </div>
        <h1 className="mb-2 text-3xl font-semibold tracking-tight">
          Create your first organization
        </h1>
        <p className="text-muted-foreground mx-auto max-w-md text-sm">
          Organizations are workspaces for your team. Start by creating one, then add projects and
          manage feature flags.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organization details</CardTitle>
          <CardDescription>You can always change these later.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="org-name">Organization name</Label>
              <Input
                id="org-name"
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                placeholder="Acme Labs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="org-slug">Slug</Label>
              <Input
                id="org-slug"
                type="text"
                value={orgSlug}
                onChange={(e) => setOrgSlug(e.target.value)}
                placeholder={orgName ? slugify(orgName) : "acme-labs"}
              />
              <p className="text-muted-foreground text-xs">
                Used in URLs. Auto-generated if left empty.
              </p>
            </div>
            <Button
              type="submit"
              disabled={creating}
              className="h-11 w-full text-sm font-semibold"
              size="lg"
            >
              {creating ? "Creating..." : "Create Organization"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="border-border/70 bg-card/50 mt-6 rounded-2xl border p-4">
        <div className="text-muted-foreground mb-3 text-xs font-semibold tracking-[0.18em] uppercase">
          What happens next
        </div>
        <ol className="text-muted-foreground space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="bg-muted text-muted-foreground mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
              1
            </span>
            Create an organization
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-muted text-muted-foreground mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-medium">
              2
            </span>
            Add a project inside that organization
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-muted text-muted-foreground mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-medium">
              3
            </span>
            Create flags and rollout strategies
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-muted text-muted-foreground mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-medium">
              4
            </span>
            Integrate the API or SDK in your app
          </li>
        </ol>
      </div>
    </div>
  );
}
