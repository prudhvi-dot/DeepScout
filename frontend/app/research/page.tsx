
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2Icon,
  SparklesIcon,
  OrbitIcon,
} from "lucide-react";

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    const researchId = crypto.randomUUID();
    router.replace(`/research/${researchId}`);
  }, [router]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0D1428] px-4 text-slate-100">
      {/* Ambient cyberpunk glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/[0.10] blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/[0.10] blur-[90px]" />

        <div className="absolute inset-0 bg-[radial-gradient(oklch(0.7_0.04_250_/_0.12)_1px,transparent_1px)] [background-size:28px_28px] opacity-30" />

        <div className="absolute left-0 top-1/2 h-px w-full bg-gradient-to-r from-transparent via-blue-400/[0.12] to-transparent" />
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-blue-400/[0.08] to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated emblem */}
        <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border border-blue-400/20 border-t-blue-400/80 [animation-duration:3s]" />

          <div className="absolute inset-2 rounded-full border border-indigo-400/20 border-b-indigo-400/70" />

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/25 bg-[#111B30] shadow-[0_0_35px_rgba(59,130,246,0.18)]">
            <SparklesIcon className="h-7 w-7 text-blue-400" />
          </div>

          <OrbitIcon className="absolute -right-1 -top-1 h-5 w-5 animate-pulse text-indigo-300" />
        </div>

        {/* Branding */}
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-blue-400/80">
          DeepScout <span className="text-slate-600">/</span> Research Engine
        </p>

        <h1 className="text-center text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Initializing workspace
        </h1>

        <p className="mt-2 max-w-sm text-center text-sm leading-6 text-slate-400">
          Preparing your research environment and getting things ready.
        </p>

        {/* Loading indicator */}
        <div className="mt-8 flex items-center gap-3 rounded-full border border-blue-400/15 bg-[#111B30]/80 px-4 py-2.5">
          <Loader2Icon className="h-4 w-4 animate-spin text-blue-400" />

          <span className="text-xs font-medium tracking-wide text-slate-300">
            Creating your research...
          </span>

          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
        </div>

        {/* Progress decoration */}
        <div className="mt-6 h-[2px] w-40 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-blue-500/20 via-blue-400 to-indigo-400" />
        </div>

        <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-slate-600">
          Please wait
        </p>
      </div>
    </main>
  );
};

export default Page;
