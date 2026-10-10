
"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Loader2Icon,
  BotIcon,
  SendIcon,
  AlertCircleIcon,
  SparklesIcon,
  FileTextIcon,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRouter } from "next/navigation";

type ResearchProps = {
  docId: string;
  report: string;
  userName: string;
  topic: string;
};

type StreamEvent =
  | {
      type: "status";
      message: string;
    }
  | {
      type: "final";
      report: string;
    }
  | {
      type: "error";
      message: string;
    };

export default function Research({
  docId,
  report,
  userName,
  topic,
}: ResearchProps) {
  const [currentTopic, setCurrentTopic] = useState(topic?.trim() ?? "");
  const [question, setQuestion] = useState("");
  const [currentReport, setCurrentReport] = useState(report ?? "");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setCurrentTopic(topic?.trim() ?? "");
  }, [topic]);

  useEffect(() => {
    setCurrentReport(report ?? "");
  }, [report]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const submittedTopic = question.trim();

    if (!submittedTopic || isPending) return;

    setErrorMessage("");
    setStatusMessage("Starting research...");
    setCurrentReport("");
    setIsPending(true);

    if (!currentTopic) {
      setCurrentTopic(submittedTopic);
    }

    setQuestion("");

    try {
      const formData = new FormData();
      formData.append("topic", submittedTopic);

      const response = await fetch(
        `/api/backend/researches/${docId}/research`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        console.error("Research API error:", {
          status: response.status,
          body: errorText,
        });

        throw new Error(`Research failed (${response.status}): ${errorText}`);
      }

      if (!response.body) {
        throw new Error("The server did not return a readable stream.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";
      let finalReport = "";

      const processLine = (line: string) => {
        if (!line.trim()) return;

        const event = JSON.parse(line) as StreamEvent;

        switch (event.type) {
          case "status":
            setStatusMessage(event.message);
            break;

          case "final":
            finalReport = event.report;
            setCurrentReport(event.report);
            setCurrentTopic(submittedTopic);
            setStatusMessage("");
            break;

          case "error":
            throw new Error(event.message);
        }
      };

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          processLine(line);
        }
      }

      buffer += decoder.decode();

      if (buffer.trim()) {
        processLine(buffer);
      }

      if (!finalReport) {
        throw new Error("The stream ended without a final research report.");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while researching."
      );
    } finally {
      setStatusMessage("");
      setIsPending(false);
      router.refresh();
    }
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#0D1428] text-slate-100">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-blue-500/[0.045] blur-[120px]" />
      </div>

      {/* Topic header */}
      <header className="relative z-10 shrink-0 border-b border-white/[0.07] bg-[#0D1428]/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-4 px-4 py-4 sm:px-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/[0.09]">
            <FileTextIcon className="h-5 w-5 text-blue-400" />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="break-words text-base font-semibold tracking-tight text-white sm:text-lg">
              {currentTopic || "New research"}
            </h1>

            <p className="mt-1 truncate text-xs text-slate-500">
              {userName
                ? `Research workspace · ${userName}`
                : "AI Research Workspace"}
            </p>
          </div>

          {isPending && (
            <div className="hidden shrink-0 items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/[0.07] px-3 py-1.5 sm:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-blue-300">
                Working
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Research report */}
      <main className="relative z-10 min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
          {currentReport ? (
            <article className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111B30]/90 shadow-[0_12px_50px_rgba(0,0,0,0.12)]">
              {/* Report title bar */}
              <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4 sm:px-7">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-500/[0.09]">
                  <BotIcon className="h-5 w-5 text-blue-400" />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold text-white">
                    Research Report
                  </h2>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    AI-generated findings and analysis
                  </p>
                </div>

                <SparklesIcon className="h-4 w-4 shrink-0 text-blue-400/70" />
              </div>

              {/* Markdown content */}
              <div className="px-5 py-6 sm:px-7 sm:py-8">
                <div className="prose prose-sm max-w-none break-words text-slate-300 prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-white prose-p:leading-7 prose-p:text-slate-300 prose-strong:text-slate-100 prose-li:text-slate-300 prose-ul:marker:text-blue-400 prose-ol:marker:text-blue-400 prose-a:text-blue-400 prose-a:decoration-blue-400/30 hover:prose-a:text-blue-300 prose-blockquote:border-blue-400/60 prose-blockquote:text-slate-400 prose-hr:border-white/10 prose-th:text-slate-200 prose-td:text-slate-300 prose-table:text-sm prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:border prose-pre:border-white/[0.08] prose-pre:bg-[#0B1120] prose-code:text-blue-200 prose-code:before:content-none prose-code:after:content-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {currentReport}
                  </ReactMarkdown>
                </div>
              </div>
            </article>
          ) : (
            <div className="flex min-h-[40vh] flex-col items-center justify-center px-4 text-center">
              {isPending ? (
                <>
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/[0.08] shadow-[0_0_40px_rgba(59,130,246,0.08)]">
                    <Loader2Icon className="h-7 w-7 animate-spin text-blue-400" />
                  </div>

                  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Research in progress
                  </h2>

                  <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
                    {statusMessage || "Getting your research ready..."}
                  </p>

                  <div className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-400" />
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/[0.08] shadow-[0_0_40px_rgba(59,130,246,0.06)]">
                    <SparklesIcon className="h-8 w-8 text-blue-400" />
                  </div>

                  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    What should we research?
                  </h2>

                  <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
                    Enter a topic below. Your research agents will investigate
                    the web, analyze relevant information, and compile a
                    detailed report.
                  </p>

                  <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500">
                    <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5">
                      Web research
                    </span>
                    <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5">
                      Multi-agent analysis
                    </span>
                    <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5">
                      Structured reports
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Ongoing research status */}
          {isPending && currentReport && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-blue-400/15 bg-blue-500/[0.05] px-4 py-3">
              <Loader2Icon className="h-4 w-4 shrink-0 animate-spin text-blue-400" />
              <span className="text-xs leading-5 text-blue-200/80">
                {statusMessage || "Researching your topic..."}
              </span>
            </div>
          )}

          {/* Error */}
          {errorMessage && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-500/[0.07] p-4 text-sm text-red-200"
            >
              <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />

              <div className="min-w-0 flex-1">
                <p className="font-medium">Research failed</p>
                <p className="mt-1 break-words leading-5 text-red-200/70">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Topic input */}
      <footer className="relative z-10 shrink-0 border-t border-white/[0.07] bg-[#0D1428]/95 backdrop-blur-xl">
        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-4xl px-4 py-4 sm:px-6 sm:py-5"
        >
          <div className="flex items-end gap-3 rounded-2xl border border-white/[0.11] bg-[#111B30] p-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-200 focus-within:border-blue-400/40 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.07)]">
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder="Describe the topic you want to research..."
              rows={1}
              disabled={isPending}
              className="max-h-40 min-h-10 flex-1 resize-y bg-transparent px-3 py-2.5 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={isPending || !question.trim()}
              aria-label="Start research"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.12)] transition-all duration-200 hover:bg-blue-400 hover:shadow-[0_0_25px_rgba(59,130,246,0.2)] active:scale-95 disabled:cursor-not-allowed disabled:border-white/[0.05] disabled:bg-white/[0.06] disabled:text-slate-600 disabled:shadow-none"
            >
              {isPending ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <SendIcon className="h-4 w-4" />
              )}
            </button>
          </div>

          <p className="mt-3 text-center text-[10px] tracking-wide text-slate-500">
            <span className="text-slate-400">Enter</span> to research
            <span className="mx-2 text-slate-700">·</span>
            <span className="text-slate-400">Shift + Enter</span> for a new line
          </p>
        </form>
      </footer>
    </div>
  );
}
