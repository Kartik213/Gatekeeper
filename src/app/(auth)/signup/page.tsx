"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check } from "lucide-react";
import { FeatureHighlights } from "@/components/FeatureHighlights";
import { PasswordInput } from "@/components/ui/password-input";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordRules = [
    { test: (p: string) => p.length >= 8, label: "At least 8 characters" },
    { test: (p: string) => /[A-Z]/.test(p), label: "One uppercase letter" },
    { test: (p: string) => /[0-9]/.test(p), label: "One number" },
    { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: "One special character" },
  ];

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");

    const failing = passwordRules.find((r) => !r.test(password));
    if (failing) {
      setError(`Password must have: ${failing.label.toLowerCase()}`);
      return;
    }

    setLoading(true);

    const { error } = await authClient.signUp.email({ name, email, password });

    if (error) {
      setError(error.message ?? "Signup failed");
      setLoading(false);
      return;
    }

    router.push("/onboarding");
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="ring-border bg-card flex overflow-hidden rounded-2xl shadow-sm ring-1">
        {/* Left: Form */}
        <div className="flex-1 p-10">
          <h1 className="mb-1 text-2xl font-bold">Start your free account</h1>
          <p className="text-muted-foreground mb-8 text-sm">
            Ship features safely with gradual rollouts.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Jane Doe"
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
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
              {password.length > 0 && (
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1.5">
                  {passwordRules.map((rule) => {
                    const passed = rule.test(password);
                    return (
                      <li
                        key={rule.label}
                        className={`flex items-center gap-1.5 text-xs ${passed ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}
                      >
                        <Check className={`size-3 ${passed ? "opacity-100" : "opacity-30"}`} />
                        {rule.label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full text-sm font-semibold"
              size="lg"
            >
              {loading ? "Creating account..." : "Create My Account"}
            </Button>

            <p className="text-muted-foreground pt-1 text-center text-xs">
              By signing up, you agree to our Terms and Privacy Policy.
            </p>
          </form>
        </div>

        {/* Right: Feature highlights */}
        <FeatureHighlights />
      </div>

      {/* Bottom: Sign in link */}
      <p className="text-muted-foreground mt-8 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
