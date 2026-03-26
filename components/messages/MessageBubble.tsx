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
        "flex items-end gap-1.5",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar (only for others) */}
      {!isOwn && (
        <div className="flex-shrink-0 mb-0.5">
          {message.sender.image ? (
            <img
              src={message.sender.image}
              alt={message.sender.name ?? ""}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-cyan-900/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold">
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
          <span className="text-[11px] text-gray-500 mb-0.5 ml-1">
            {message.sender.name ?? "Unknown"}
          </span>
        )}
        <div
          className={cn(
            "px-3 py-2 rounded-xl text-sm leading-snug",
            isOwn
              ? "bg-cyan-600 text-white rounded-br-sm"
              : "bg-[#242424] border border-[#313131] text-gray-100 rounded-bl-sm"
          )}
        >
          {message.content}
        </div>
        <span className="text-[10px] mt-0.5 px-1 text-gray-500">
          {formatRelativeTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}
