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
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
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
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

  const hasContent = content.trim().length > 0;

  return (
    <div className="bg-[#0d0d0d] border-t border-[#1e1e1e] px-3 py-3 safe-area-bottom">
      <div className="flex items-end gap-2.5 max-w-3xl mx-auto">
        <div
          className={`flex-1 flex items-end bg-[#1a1a1a] rounded-3xl border transition-all duration-200 ${
            hasContent ? "border-cyan-500/40" : "border-[#2a2a2a]"
          }`}
        >
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Message…"
            rows={1}
            // font-size must be ≥16px on mobile to prevent iOS/Android zoom
            className="flex-1 px-4 py-3 bg-transparent text-white placeholder:text-[#555] focus:outline-none resize-none leading-snug"
            style={{ minHeight: "44px", maxHeight: "120px", fontSize: "16px" }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!hasContent || isSending}
          className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
            hasContent && !isSending
              ? "bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-900/30"
              : "bg-[#1a1a1a] text-[#444]"
          }`}
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4 translate-x-px" />
          )}
        </button>
      </div>
    </div>
  );
}
