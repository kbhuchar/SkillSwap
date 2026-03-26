import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MessageSquare, ArrowRight } from "lucide-react";
import { getInitials, formatRelativeTime, truncate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages — SkillSwap",
};

export default async function MessagesPage() {
  const session = await auth();
  const userId = session!.user.id;

  const matches = await prisma.match.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
      status: "ACCEPTED",
    },
    include: {
      sender: { select: { id: true, name: true, image: true } },
      receiver: { select: { id: true, name: true, image: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { id: true } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#e5e5e5]">Messages</h1>
        <p className="text-xs text-[#555] mt-0.5">Your skill swap conversations</p>
      </div>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-[#181818] flex items-center justify-center mb-4">
            <MessageSquare className="w-6 h-6 text-[#444]" />
          </div>
          <p className="text-sm font-semibold text-[#e5e5e5] mb-1">No conversations yet</p>
          <p className="text-xs text-[#555] mb-5">Connect with someone to start messaging</p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors"
          >
            Browse Skills
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-px">
          {matches.map((match) => {
            const partner = match.senderId === userId ? match.receiver : match.sender;
            const lastMessage = match.messages[0];
            const initials = getInitials(partner.name);
            const isOwnLastMessage = lastMessage?.sender.id === userId;

            return (
              <Link
                key={match.id}
                href={`/messages/${match.id}`}
                className="flex items-center gap-3.5 px-3 py-3.5 rounded-2xl hover:bg-[#141414] transition-colors"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {partner.image ? (
                    <img
                      src={partner.image}
                      alt={partner.name ?? ""}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#1a1a1a] text-cyan-400 flex items-center justify-center text-sm font-bold">
                      {initials}
                    </div>
                  )}
                  <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#0d0d0d]" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-[#e5e5e5] truncate">
                      {partner.name ?? "Anonymous"}
                    </p>
                    {lastMessage && (
                      <span className="text-[11px] text-[#555] flex-shrink-0">
                        {formatRelativeTime(lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#666] truncate">
                    {lastMessage ? (
                      <>
                        {isOwnLastMessage && <span className="text-[#444]">You: </span>}
                        {truncate(lastMessage.content, 55)}
                      </>
                    ) : (
                      <span className="italic text-[#444]">No messages yet — say hi!</span>
                    )}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
