
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  PlusIcon,
  Loader2Icon,
  Trash2,
  UserIcon,
  SparklesIcon,
  SearchIcon,
  PanelLeftIcon,
} from "lucide-react";
import { LogoutButton } from "./LogoutButton";

type Session = {
  id: string;
  title: string;
};

export function SessionSidebar({
  sessions,
  userName,
}: {
  sessions: Session[];
  userName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleNewresearch() {
    const researchId = crypto.randomUUID();
    router.push(`/research/${researchId}`);
    router.refresh();
  }

  function getInitials(name: string) {
    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  async function handleDeleteresearch(sessionId: string) {
    const isCurrentresearch = pathname === `/research/${sessionId}`;

    setDeletingId(sessionId);
    setError(null);

    try {
      const res = await fetch(`/api/backend/researches/${sessionId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (!res.ok) {
        setError("Failed to delete research. Please try again.");
        return;
      }

      if (isCurrentresearch) {
        router.push("/research");
      }

      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-white/[0.07] bg-[#0B1120] text-slate-100">
      {/* Brand */}
      <div className="px-4 pb-4 pt-5">
        <div className="mb-6 flex items-center gap-3 px-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 shadow-[0_0_24px_rgba(59,130,246,0.08)]">
            <SparklesIcon className="h-5 w-5 text-blue-400" />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-[15px] font-semibold tracking-tight text-white">
              DeepScout
            </h1>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
              AI Research Workspace
            </p>
          </div>

          {/* <PanelLeftIcon className="h-4 w-4 text-slate-600" /> */}
        </div>

        {/* New Research */}
        <button
          type="button"
          onClick={handleNewresearch}
          className="group flex w-full items-center gap-3 rounded-xl border border-blue-400/20 bg-blue-500/[0.09] px-3 py-3 text-sm font-medium text-blue-100 transition-all duration-200 hover:border-blue-400/40 hover:bg-blue-500/[0.15] hover:shadow-[0_0_24px_rgba(59,130,246,0.07)] active:scale-[0.99]"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500 text-white transition-transform duration-200 group-hover:rotate-90">
            <PlusIcon className="h-4 w-4" />
          </div>

          <span className="flex-1 text-left">New research</span>

          <span className="text-[10px] text-blue-300/60">NEW</span>
        </button>
      </div>

      {/* Research history heading */}
      <div className="px-4 pb-2 pt-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Your research
          </p>

          <span className="rounded-md border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[10px] tabular-nums text-slate-500">
            {sessions.length}
          </span>
        </div>
      </div>

      {/* Research history */}
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        {error && (
          <p className="mx-1 mb-2 rounded-lg border border-red-400/15 bg-red-500/[0.07] px-3 py-2 text-xs leading-5 text-red-300">
            {error}
          </p>
        )}

        {sessions.length === 0 ? (
          <div className="mx-1 mt-2 rounded-xl border border-dashed border-white/[0.09] px-3 py-6 text-center">
            <SearchIcon className="mx-auto mb-3 h-5 w-5 text-slate-600" />

            <p className="text-xs font-medium text-slate-300">
              No research yet
            </p>

            <p className="mt-1.5 text-[11px] leading-5 text-slate-500">
              Start exploring a topic to see your research history here.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => {
              const isActive = pathname === `/research/${session.id}`;
              const isDeleting = deletingId === session.id;

              return (
                <div
                  key={session.id}
                  className={`group relative flex min-w-0 items-center rounded-lg border transition-all duration-150 ${
                    isActive
                      ? "border-blue-400/15 bg-blue-500/[0.11] shadow-[inset_2px_0_0_0_#60A5FA]"
                      : "border-transparent hover:border-white/[0.04] hover:bg-white/[0.04]"
                  }`}
                >
                  <Link
                    href={`/research/${session.id}`}
                    aria-current={isActive ? "page" : undefined}
                    className="min-w-0 flex-1 truncate px-3 py-2.5 text-[12px] leading-5"
                  >
                    <span
                      className={`block truncate transition-colors ${
                        isActive
                          ? "font-medium text-blue-200"
                          : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    >
                      {session.title}
                    </span>
                  </Link>

                  <button
                    type="button"
                    disabled={deletingId !== null}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteresearch(session.id);
                    }}
                    className={`mr-1.5 shrink-0 rounded-md p-1.5 transition-all hover:bg-red-500/10 hover:text-red-300 disabled:pointer-events-none disabled:opacity-40 ${
                      isActive
                        ? "text-slate-500 opacity-100"
                        : "text-slate-600 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                    }`}
                    aria-label={`Delete ${session.title}`}
                    title="Delete research"
                  >
                    {isDeleting ? (
                      <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer / User profile */}
      <div className="border-t border-white/[0.07] p-3">
        <div className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-2.5 transition-colors hover:border-white/[0.05] hover:bg-white/[0.035]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 text-xs font-semibold text-blue-200">
            {userName ? (
              getInitials(userName)
            ) : (
              <UserIcon className="h-4 w-4" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-slate-200">
              {userName || "User"}
            </p>

            {/* <p className="mt-0.5 text-[10px] text-slate-500">
              Research workspace
            </p> */}
          </div>

          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
