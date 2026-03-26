"use client";

import { useState, useRef } from "react";
import { Send, Loader2 } from "lucide-react";

interface MessageInputProps {
  matchId: string;
  onMessageSent?: () => void;
}

export default function MessageInput({ matchId, onMessageSent }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/messages/${matchId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });

      if (res.ok) {
        setContent("");
        onMessageSent?.();
        textareaRef.current?.focus();
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    // Auto-resize
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

  return (
    <div className="bg-[#181818] border-t border-[#252525] px-3 py-3">
      <div className="flex items-end gap-2">
        <div className="flex-1 bg-[#242424] rounded-xl border border-[#252525] focus-within:border-violet-500/60 transition-all">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send)"
            rows={1}
            className="w-full px-3 py-2.5 bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none resize-none"
            style={{ minHeight: "40px", maxHeight: "120px" }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!content.trim() || isSending}
          className="flex-shrink-0 w-9 h-9 bg-violet-600 hover:bg-violet-700 disabled:bg-[#252525] disabled:text-gray-600 text-white rounded-lg flex items-center justify-center transition-colors"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
