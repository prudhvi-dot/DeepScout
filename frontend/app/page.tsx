
"use client";

import { useRouter } from "next/navigation";
import {
  PlusIcon,
  ArrowUpRightIcon,
  SparklesIcon,
  GlobeIcon,
  FileTextIcon,
} from "lucide-react";

const Home = () => {
  const router = useRouter();

  function handleNewResearch() {
    router.push(`/research/${crypto.randomUUID()}`);
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      {/* Ambient background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-180px] h-[420px] w-[650px] -translate-x-1/2 rounded-full bg-blue-500/[0.09] blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-indigo-500/[0.06] blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(oklch(0.7_0.04_250_/_0.12)_1px,transparent_1px)] [background-size:28px_28px] opacity-40" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-5 py-16">
        <div className="w-full max-w-3xl text-center">
          {/* Brand icon */}
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/25 bg-blue-500/10 shadow-[0_0_45px_rgba(59,130,246,0.12)]">
            <SparklesIcon className="h-8 w-8 text-blue-400" />
          </div>

          {/* Eyebrow */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/[0.07] px-3.5 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-300">
              AI-powered research
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Research beyond
            <span className="mt-2 block bg-gradient-to-r from-blue-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              the obvious.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            Turn complex questions into clear, comprehensive reports.
            Let intelligent research agents explore the web, analyze
            sources, and connect the dots for you.
          </p>

          {/* Primary action */}
          <button
            type="button"
            onClick={handleNewResearch}
            className="group mx-auto mt-9 inline-flex items-center justify-center gap-3 rounded-xl border border-blue-400/30 bg-blue-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-200 hover:border-blue-300/50 hover:bg-blue-400 hover:shadow-[0_0_40px_rgba(59,130,246,0.25)] active:scale-[0.98]"
          >
            <PlusIcon className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
            Start new research
            <ArrowUpRightIcon className="h-4 w-4 text-blue-100 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>

          {/* Feature cards */}
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="group rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 text-left transition-colors hover:border-blue-400/20 hover:bg-blue-500/[0.04]">
              <GlobeIcon className="mb-3 h-5 w-5 text-blue-400 transition-transform group-hover:scale-110" />
              <h2 className="text-sm font-medium text-slate-200">
                Web intelligence
              </h2>
              <p className="mt-1.5 text-xs leading-5 text-slate-500">
                Discover relevant information from across the web.
              </p>
            </div>

            <div className="group rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 text-left transition-colors hover:border-blue-400/20 hover:bg-blue-500/[0.04]">
              <SparklesIcon className="mb-3 h-5 w-5 text-indigo-400 transition-transform group-hover:scale-110" />
              <h2 className="text-sm font-medium text-slate-200">
                Multi-agent analysis
              </h2>
              <p className="mt-1.5 text-xs leading-5 text-slate-500">
                Research agents investigate and refine findings.
              </p>
            </div>

            <div className="group rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 text-left transition-colors hover:border-blue-400/20 hover:bg-blue-500/[0.04]">
              <FileTextIcon className="mb-3 h-5 w-5 text-sky-400 transition-transform group-hover:scale-110" />
              <h2 className="text-sm font-medium text-slate-200">
                Detailed reports
              </h2>
              <p className="mt-1.5 text-xs leading-5 text-slate-500">
                Turn collected evidence into structured reports.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] px-4 py-4">
        <p className="text-center text-[11px] text-slate-500">
          AI-generated research can contain errors. Verify important findings
          against the original sources.
        </p>
      </footer>
    </main>
  );
};

export default Home;
