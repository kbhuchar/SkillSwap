"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { Loader2 } from "lucide-react";
import type { MessageWithSender } from "@/types";

interface MessageThreadProps {
  matchId: string;
  initialMessages: MessageWithSender[];
}

export default function MessageThread({ matchId, initialMessages }: MessageThreadProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<MessageWithSender[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages/${matchId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages ?? data);
      }
    } catch {
      // ignore polling errors
    }
  }, [matchId]);

  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, []);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    isAtBottomRef.current =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;
  };

  useEffect(() => {
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleMessageSent = async () => {
    isAtBottomRef.current = true;
    await fetchMessages();
  };

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-500" />
      </div>
    );
  }

  const currentUserId = session.user.id;

  return (
    <div className="flex flex-col h-full">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-[#e5e5e5]">Say hello</p>
            <p className="text-xs text-[#555] mt-1">Start the conversation</p>
          </div>
        ) : (
          messages.map((message, i) => {
            const prev = messages[i - 1];
            const next = messages[i + 1];
            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUserId}
                hasSameAbove={!!prev && prev.senderId === message.senderId}
                hasSameBelow={!!next && next.senderId === message.senderId}
              />
            );
          })
        )}
        <div ref={bottomRef} className="h-2" />
      </div>

      <MessageInput matchId={matchId} onMessageSent={handleMessageSent} />
    </div>
  );
}
