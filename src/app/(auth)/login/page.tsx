"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FeatureHighlights } from "@/components/FeatureHighlights";
import { AlertCircle } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await authClient.signIn.email({ email, password });

    if (error) {
      setError(error.message ?? "Login failed");
      setLoading(false);
      return;
    }

    router.push("/");
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="ring-border bg-card flex overflow-hidden rounded-2xl shadow-sm ring-1">
        {/* Left: Form */}
        <div className="flex-1 p-10">
          <h1 className="mb-1 text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mb-8 text-sm">
            Sign in to manage your feature flags.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Your password"
                className="h-10 pr-10"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full text-sm font-semibold"
              size="lg"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>

        {/* Right: Feature highlights */}
        <FeatureHighlights />
      </div>

      {/* Bottom: Sign up link */}
      <p className="text-muted-foreground mt-8 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary font-medium hover:underline">
          Sign up for free
        </Link>
      </p>
    </div>
  );
}
