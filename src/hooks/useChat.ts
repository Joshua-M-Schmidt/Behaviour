"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import OpenAI from "openai";
import { db } from "@/lib/db";
import type { Message } from "@/types";

export function useChat(sessionId: string) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const messages = useLiveQuery(
    () =>
      db.messages
        .where("sessionId")
        .equals(sessionId)
        .sortBy("createdAt"),
    [sessionId]
  );

  const session = useLiveQuery(
    () => db.chatSessions.get(sessionId),
    [sessionId]
  );

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, [sessionId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (isStreaming || !content.trim()) return;

      setError(null);
      setStreamingContent("");

      await db.messages.add({
        sessionId,
        role: "user",
        content: content.trim(),
        createdAt: Date.now(),
      });

      const config = await db.apiConfig.get("default");
      if (!config?.isConfigured) {
        setError("API key not configured. Go to Settings to set it up.");
        return;
      }

      let apiKey: string;
      try {
        const { getApiKey } = await import("@/lib/crypto");
        apiKey = await getApiKey();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to get API key.");
        return;
      }

      const client = new OpenAI({
        apiKey,
        baseURL: config.baseUrl,
        dangerouslyAllowBrowser: true,
      });

      const allMessages = await db.messages
        .where("sessionId")
        .equals(sessionId)
        .sortBy("createdAt");

      const chatMessages = allMessages.map((m) => ({
        role: m.role as "system" | "user" | "assistant",
        content: m.content,
      }));

      setIsStreaming(true);
      const controller = new AbortController();
      abortRef.current = controller;

      let fullContent = "";

      try {
        const stream = await client.chat.completions.create(
          {
            model: config.model,
            messages: chatMessages,
            stream: true,
          },
          { signal: controller.signal }
        );

        for await (const chunk of stream) {
          if (controller.signal.aborted) break;
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            fullContent += delta;
            setStreamingContent(fullContent);
          }
        }

        if (!controller.signal.aborted && fullContent) {
          await db.messages.add({
            sessionId,
            role: "assistant",
            content: fullContent,
            createdAt: Date.now(),
          });

          const currentSession = await db.chatSessions.get(sessionId);
          if (currentSession) {
            await db.chatSessions.update(sessionId, {
              messageCount: (currentSession.messageCount ?? 0) + 2,
            });
          }
        }
      } catch (e) {
        if (controller.signal.aborted) return;
        const msg =
          e instanceof Error ? e.message : "An error occurred";
        if (msg.includes("401")) {
          setError("Invalid API key. Check your settings.");
        } else if (msg.includes("429")) {
          setError("Rate limited. Please wait a moment and try again.");
        } else if (msg.includes("fetch")) {
          setError("Network error. Check your connection.");
        } else {
          setError(msg);
        }
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
        abortRef.current = null;
      }
    },
    [sessionId, isStreaming]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const updateSystemPrompt = useCallback(
    async (newPrompt: string, saveToTemplate: boolean) => {
      await db.chatSessions.update(sessionId, {
        systemPromptSnapshot: newPrompt,
      });

      const systemMsg = await db.messages
        .where("sessionId")
        .equals(sessionId)
        .filter((m) => m.role === "system")
        .first();

      if (systemMsg?.id) {
        await db.messages.update(systemMsg.id, { content: newPrompt });
      }

      if (saveToTemplate && session?.templateId) {
        await db.sessionTemplates.update(session.templateId, {
          systemPrompt: newPrompt,
        });
      }
    },
    [sessionId, session?.templateId]
  );

  const retry = useCallback(async () => {
    if (!messages?.length) return;
    const lastUserMsg = [...(messages || [])]
      .reverse()
      .find((m) => m.role === "user");
    if (!lastUserMsg) return;

    const lastAssistant = [...(messages || [])]
      .reverse()
      .find((m) => m.role === "assistant");
    if (lastAssistant?.id) {
      await db.messages.delete(lastAssistant.id);
    }

    await sendMessage(lastUserMsg.content);
  }, [messages, sendMessage]);

  const displayMessages: Message[] = messages?.filter((m) => m.role !== "system") ?? [];

  if (isStreaming && streamingContent) {
    displayMessages.push({
      sessionId,
      role: "assistant",
      content: streamingContent,
      createdAt: Date.now(),
    });
  }

  return {
    messages: displayMessages,
    allMessages: messages ?? [],
    session,
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
    updateSystemPrompt,
    retry,
  };
}
