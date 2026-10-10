
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SparklesIcon,
  UserRoundIcon,
  MailIcon,
  LockKeyholeIcon,
  ArrowRightIcon,
  Loader2Icon,
  ShieldCheckIcon,
  AlertCircleIcon,
} from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const res = await fetch("/api/backend/users", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(
          data?.detail ?? "Could not create account. Please try again."
        );
        setIsSubmitting(false);
        return;
      }

      router.push("/signin");
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0D1428] px-4 py-10 text-slate-100">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-230px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-500/[0.10] blur-[140px]" />
        <div className="absolute bottom-[-200px] right-[-100px] h-[400px] w-[400px] rounded-full bg-indigo-500/[0.08] blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(oklch(0.7_0.04_250_/_0.12)_1px,transparent_1px)] [background-size:28px_28px] opacity-30" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand */}
        <Link
          href="/"
          className="mx-auto mb-7 flex w-fit items-center gap-3 rounded-xl px-3 py-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/25 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.12)]">
            <SparklesIcon className="h-6 w-6 text-blue-400" />
          </div>

          <div>
            <p className="text-lg font-semibold tracking-tight text-white">
              DeepScout
            </p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
              AI Research Workspace
            </p>
          </div>
        </Link>

        {/* Sign-up card */}
        <Card className="gap-0 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#111B30]/95 py-0 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <CardHeader className="px-6 pb-5 pt-7 sm:px-8 sm:pt-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/[0.08]">
              <UserRoundIcon className="h-5 w-5 text-blue-400" />
            </div>

            <CardTitle className="text-2xl font-semibold tracking-tight text-white">
              Create your account
            </CardTitle>

            <CardDescription className="mt-2 text-sm leading-6 text-slate-400">
              Join DeepScout and turn complex topics into well-researched reports.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-7 sm:px-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-xs font-medium text-slate-300"
                >
                  Username
                </Label>

                <div className="relative">
                  <UserRoundIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="jane_doe"
                    autoComplete="username"
                    required
                    className="h-11 rounded-xl border-white/[0.10] bg-[#0B1120] pl-10 text-sm text-white placeholder:text-slate-600 focus-visible:border-blue-400/50 focus-visible:ring-blue-400/15"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs font-medium text-slate-300"
                >
                  Email address
                </Label>

                <div className="relative">
                  <MailIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="h-11 rounded-xl border-white/[0.10] bg-[#0B1120] pl-10 text-sm text-white placeholder:text-slate-600 focus-visible:border-blue-400/50 focus-visible:ring-blue-400/15"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-xs font-medium text-slate-300"
                >
                  Password
                </Label>

                <div className="relative">
                  <LockKeyholeIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="h-11 rounded-xl border-white/[0.10] bg-[#0B1120] pl-10 text-sm text-white placeholder:text-slate-600 focus-visible:border-blue-400/50 focus-visible:ring-blue-400/15"
                  />
                </div>

                <p className="pl-1 text-[11px] text-slate-500">
                  Use at least 8 characters.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-red-400/20 bg-red-500/[0.07] px-3.5 py-3 text-sm text-red-200"
                >
                  <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  <p className="leading-5">{error}</p>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="group mt-1 h-11 w-full rounded-xl border border-blue-400/20 bg-blue-500 font-medium text-white shadow-[0_0_25px_rgba(59,130,246,0.10)] transition-all hover:bg-blue-400 hover:shadow-[0_0_30px_rgba(59,130,246,0.20)]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>

            {/* Sign-in link */}
            <div className="mt-6 border-t border-white/[0.07] pt-5">
              <p className="text-center text-sm text-slate-400">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="font-medium text-blue-400 underline-offset-4 transition-colors hover:text-blue-300 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheckIcon className="h-3.5 w-3.5 text-blue-400/70" />
          <span>Create your account to access your research workspace.</span>
        </div>
      </div>
    </main>
  );
}
