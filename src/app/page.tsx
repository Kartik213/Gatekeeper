"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { logout } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Code2, Flag, Layers3, ShieldCheck, LogOut } from "lucide-react";

const steps = [
  {
    title: "Create an organization",
    description: "Set up a workspace for your product, startup, or client team.",
  },
  {
    title: "Add a project",
    description: "Each project gets its own flags, API keys, and rollout rules.",
  },
  {
    title: "Ship safely",
    description: "Evaluate flags through the API or SDK and control releases without redeploys.",
  },
];

const features = [
  "Organization and project based isolation",
  "Targeted rules and percentage rollouts",
  "API keys for production evaluation",
  "Lightweight SDK integration for apps",
];

export default function LandingPage() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="border-border/70 border-b">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-2xl">
              <Flag className="size-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">FeatureFlagHub</div>
              <div className="text-muted-foreground text-xs">
                Lightweight release control for product teams
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {session ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  <LogOut className="size-4" />
                  <span>Logout</span>
                </Button>
                <Button asChild>
                  <Link href="/org">Open dashboard</Link>
                </Button>
              </div>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_30%)]" />
          <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-20 md:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                Built for feature releases, experiments, and kill switches
              </Badge>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
                  Explain the product fast. Show the value in one flow.
                </h1>
                <p className="text-muted-foreground max-w-2xl text-base leading-7 md:text-lg">
                  FeatureFlagHub helps teams create organizations, add projects, define rollout
                  rules, and evaluate flags from real applications.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {session ? (
                  <Button asChild size="lg">
                    <Link href="/org">
                      Open dashboard
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild size="lg">
                      <Link href="/signup">
                        Create account
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link href="/login">Sign in</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="border-border bg-card/90 rounded-[2rem] border p-6 shadow-sm backdrop-blur">
              <div className="grid gap-4">
                <div className="border-border/70 bg-background rounded-2xl border p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <Layers3 className="text-primary size-4" />
                    Setup sequence
                  </div>
                  <div className="space-y-3">
                    {steps.map((step, index) => (
                      <div key={step.title} className="flex gap-3">
                        <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{step.title}</div>
                          <div className="text-muted-foreground text-sm">{step.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="border-border/70 bg-background rounded-2xl border p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <ShieldCheck className="text-primary size-4" />
                      Safe rollouts
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Gate risky changes behind flags and ramp exposure gradually.
                    </p>
                  </div>
                  <div className="border-border/70 bg-background rounded-2xl border p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <Code2 className="text-primary size-4" />
                      SDK and API
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Connect production apps without forcing a full dashboard session.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-3">
              <div className="text-muted-foreground text-sm font-semibold tracking-[0.18em] uppercase">
                How it works
              </div>
              <h2 className="text-3xl font-semibold tracking-tight">
                The first-run experience is simple.
              </h2>
              <p className="text-muted-foreground text-sm leading-6">
                Sign up, create an organization, open that organization, create your first project,
                then start managing flags. The dashboard is organized around those exact steps.
              </p>
            </div>
            <div className="grid gap-3">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="border-border bg-card flex items-center gap-3 rounded-2xl border p-4"
                >
                  <CheckCircle2 className="text-primary size-4" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-border/70 border-t">
        <div className="text-muted-foreground mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm md:flex-row md:items-center md:justify-between md:px-8">
          <div>FeatureFlagHub helps product teams release with less risk.</div>
          <div className="flex items-center gap-4">
            <Link href={session ? "/org" : "/signup"} className="hover:text-foreground">
              {isPending ? "Loading..." : session ? "Dashboard" : "Get started"}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
