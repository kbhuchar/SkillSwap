import { cn, formatRelativeTime, getInitials } from "@/lib/utils";
import type { MessageWithSender } from "@/types";

interface MessageBubbleProps {
  message: MessageWithSender;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const initials = getInitials(message.sender.name);

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar (only for others) */}
      {!isOwn && (
        <div className="flex-shrink-0 mb-1">
          {message.sender.image ? (
            <img
              src={message.sender.image}
              alt={message.sender.name ?? ""}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
          )}
        </div>
      )}

      <div
        className={cn(
          "flex flex-col max-w-xs sm:max-w-sm lg:max-w-md",
          isOwn ? "items-end" : "items-start"
        )}
      >
        {!isOwn && (
          <span className="text-xs text-slate-500 mb-1 ml-1">
            {message.sender.name ?? "Unknown"}
          </span>
        )}
        <div
          className={cn(
            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
            isOwn
              ? "bg-indigo-600 text-white rounded-br-sm"
              : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm"
          )}
        >
          {message.content}
        </div>
        <span
          className={cn(
            "text-[11px] mt-1 px-1",
            isOwn ? "text-slate-400" : "text-slate-400"
          )}
        >
          {formatRelativeTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}
