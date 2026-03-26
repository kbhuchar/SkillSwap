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

export default function MessageThread({
  matchId,
  initialMessages,
}: MessageThreadProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<MessageWithSender[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
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
      // Ignore polling errors
    }
  }, [matchId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Initial scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, []);

  // Track scroll position
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const threshold = 100;
    isAtBottomRef.current =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold;
  };

  // Poll every 3 seconds
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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
      </div>
    );
  }

  const currentUserId = session.user.id;

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <div className="w-10 h-10 rounded-full bg-cyan-900/20 flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-300">No messages yet</p>
            <p className="text-xs text-gray-500 mt-1">Start the conversation below</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUserId}
            />
          ))
        )}
        {isLoading && (
          <div className="flex justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Message input */}
      <MessageInput matchId={matchId} onMessageSent={handleMessageSent} />
    </div>
  );
}
