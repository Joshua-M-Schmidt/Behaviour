"use client";

import { useState, useRef, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@/hooks/useChat";
import { useDarkMode } from "@/hooks/useDarkMode";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { SystemPromptSheet } from "@/components/chat/SystemPromptSheet";
import { OutcomeDialog } from "@/components/chat/OutcomeDialog";
import { useSessions } from "@/hooks/useSessions";
import type { SessionOutcome } from "@/types";

export default function ChatPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const router = useRouter();
  const {
    messages,
    session,
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
    updateSystemPrompt,
    retry,
  } = useChat(sessionId);
  const { endSession } = useSessions();
  const { setDark } = useDarkMode();

  const [showPromptSheet, setShowPromptSheet] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session?.templateId === "sleep-default") {
      setDark(true);
    }
  }, [session?.templateId, setDark]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isStreaming, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isNearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollBtn(!isNearBottom);
  }, []);

  const handleEndSession = async (outcome: SessionOutcome) => {
    await endSession(sessionId, outcome);
    setShowOutcome(false);
    router.push("/");
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="flex items-center gap-2 h-14 px-4 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] z-40">
        <button
          onClick={() => router.push("/")}
          className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate">
            {session?.title ?? "Chat"}
          </div>
          {isStreaming && (
            <div className="text-[10px] text-[var(--text-muted)]">
              Typing...
            </div>
          )}
        </div>
        <button
          onClick={() => setShowPromptSheet(true)}
          className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)]"
          title="View/edit system prompt"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
        </button>
        {!session?.endedAt && (
          <button
            onClick={() => setShowOutcome(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:opacity-80 transition-all"
          >
            End
          </button>
        )}
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
        {messages.length === 0 && !isStreaming && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-[var(--text-muted)] text-center px-8">
              What&apos;s on your mind? Start typing to begin your session.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id ?? `streaming-${i}`}
            message={msg}
            isStreaming={
              isStreaming && i === messages.length - 1 && msg.role === "assistant"
            }
          />
        ))}

        {error && (
          <div className="flex justify-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--error)]/10 border border-[var(--error)]/20 text-sm">
              <span className="text-[var(--error)]">{error}</span>
              <button
                onClick={retry}
                className="text-xs font-semibold text-[var(--accent)] hover:underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom FAB */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-4 w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-card flex items-center justify-center transition-all hover:shadow-elevated z-30"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}

      {/* Input */}
      {!session?.endedAt && (
        <ChatInput
          onSend={sendMessage}
          onStop={stopStreaming}
          isStreaming={isStreaming}
        />
      )}

      {session?.endedAt && (
        <div className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            Session ended &middot;{" "}
            {session.outcome === "curbed"
              ? "✅ Curbed"
              : session.outcome === "gave_in"
              ? "🔴 Gave in"
              : "Completed"}
          </p>
        </div>
      )}

      {/* Sheets */}
      <SystemPromptSheet
        open={showPromptSheet}
        onClose={() => setShowPromptSheet(false)}
        currentPrompt={session?.systemPromptSnapshot ?? ""}
        onSave={updateSystemPrompt}
      />

      <OutcomeDialog
        open={showOutcome}
        onClose={() => setShowOutcome(false)}
        onSelect={handleEndSession}
      />
    </div>
  );
}
