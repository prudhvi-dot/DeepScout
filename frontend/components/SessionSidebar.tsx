"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { PlusIcon, Loader2Icon, Trash2 } from "lucide-react";
import { Button } from "./ui/button";

type Session = {
  id: string;
  title: string;
};

export function SessionSidebar({ sessions }: { sessions: Session[] }) {
  const pathname = usePathname();
  const router = useRouter();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleNewChat() {
    const chatId = crypto.randomUUID();
    router.push(`/chat/${chatId}`);
  }

  async function handleDeleteChat(sessionId: string) {
    setDeletingId(sessionId);
    setError(null);

    try {
      const res = await fetch(`/api/backend/chats/${sessionId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (!res.ok) {
        setError("Failed to delete chat");
        return;
      }

      router.push("/chat");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <aside className="w-64 shrink-0 border-r flex flex-col h-full">
      <div className="p-3">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          New chat
        </Button>
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto px-2 space-y-1">
        {error && (
          <p className="px-2 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground px-2 py-4">
            No chats yet.
          </p>
        ) : (
          sessions.map((session) => {
            const isActive = pathname === `/chat/${session.id}`;
            const isDeleting = deletingId === session.id;

            return (
              <div
                key={session.id}
                className={`group flex items-center rounded-md ${
                  isActive
                    ? "bg-muted font-medium"
                    : "hover:bg-muted/50"
                }`}
              >
                <Link
                  href={`/chat/${session.id}`}
                  className="min-w-0 flex-1 px-3 py-2 text-sm truncate"
                >
                  {session.title}
                </Link>

                <button
                  type="button"
                  disabled={deletingId !== null}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteChat(session.id);
                  }}
                  className="mr-2 rounded p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-50"
                  aria-label={`Delete ${session.title}`}
                >
                  {isDeleting ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            );
          })
        )}
      </nav>
    </aside>
  );
}