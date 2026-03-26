import { cn, formatRelativeTime, getInitials } from "@/lib/utils";
import type { MessageWithSender } from "@/types";

interface MessageBubbleProps {
  message: MessageWithSender;
  isOwn: boolean;
  hasSameAbove: boolean; // previous message is from same sender
  hasSameBelow: boolean; // next message is from same sender
}

export default function MessageBubble({ message, isOwn, hasSameAbove, hasSameBelow }: MessageBubbleProps) {
  const initials = getInitials(message.sender.name);
  const isGroupEnd = !hasSameBelow;

  // Corner radius: reduce the corner on the "chat side" for grouped messages
  // Own messages sit on the right → reduce right-side corners when grouped
  // Other messages sit on the left → reduce left-side corners when grouped
  const bubbleRadius = cn(
    "rounded-3xl",
    isOwn ? [
      hasSameAbove && "rounded-tr-lg",
      hasSameBelow && "rounded-br-lg",
    ] : [
      hasSameAbove && "rounded-tl-lg",
      hasSameBelow && "rounded-bl-lg",
    ]
  );

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        isOwn ? "flex-row-reverse" : "flex-row",
        hasSameAbove ? "mt-0.5" : "mt-3"
      )}
    >
      {/* Avatar — only shown at the end of a received group */}
      {!isOwn && (
        <div className="flex-shrink-0 w-7 self-end mb-0.5">
          {isGroupEnd ? (
            message.sender.image ? (
              <img
                src={message.sender.image}
                alt={message.sender.name ?? ""}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#2a2a2a] text-cyan-400 flex items-center justify-center text-[10px] font-bold">
                {initials}
              </div>
            )
          ) : (
            // Spacer so bubbles align regardless of avatar visibility
            <div className="w-7" />
          )}
        </div>
      )}

      <div className={cn("flex flex-col max-w-[72%] sm:max-w-sm", isOwn ? "items-end" : "items-start")}>
        <div
          className={cn(
            "px-4 py-2.5 text-[15px] leading-relaxed break-words",
            bubbleRadius,
            isOwn
              ? "bg-cyan-500 text-white"
              : "bg-[#222] text-[#e5e5e5]"
          )}
        >
          {message.content}
        </div>

        {/* Timestamp — only after the last bubble in a group */}
        {isGroupEnd && (
          <span className="text-[11px] mt-1 px-1 text-[#555]">
            {formatRelativeTime(message.createdAt)}
          </span>
        )}
      </div>
    </div>
  );
}
