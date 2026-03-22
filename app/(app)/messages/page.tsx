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
        include: {
          sender: { select: { id: true, name: true, image: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Messages</h1>
        <p className="text-gray-400 mt-1">
          Conversations with your skill swap connections
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="bg-[#242424] rounded-2xl border border-[#333333] p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-900/20 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-7 h-7 text-indigo-400" />
          </div>
          <h3 className="font-semibold text-white mb-2">No conversations yet</h3>
          <p className="text-gray-500 text-sm mb-4">
            Connect with someone to start messaging
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            Browse Skills
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="bg-[#242424] rounded-2xl border border-[#333333] shadow-sm divide-y divide-[#2e2e2e]">
          {matches.map((match) => {
            const partner =
              match.senderId === userId ? match.receiver : match.sender;
            const lastMessage = match.messages[0];
            const initials = getInitials(partner.name);
            const isOwnLastMessage = lastMessage?.senderId === userId;

            return (
              <Link
                key={match.id}
                href={`/messages/${match.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-[#2e2e2e] transition-colors first:rounded-t-2xl last:rounded-b-2xl"
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
                    <div className="w-12 h-12 rounded-full bg-indigo-900/20 text-indigo-400 flex items-center justify-center text-sm font-bold">
                      {initials}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full ring-2 ring-[#242424]" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-semibold text-white truncate">
                      {partner.name ?? "Anonymous"}
                    </p>
                    {lastMessage && (
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatRelativeTime(lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {lastMessage ? (
                      <>
                        {isOwnLastMessage && (
                          <span className="text-gray-600">You: </span>
                        )}
                        {truncate(lastMessage.content, 60)}
                      </>
                    ) : (
                      <span className="italic text-gray-600">
                        No messages yet
                      </span>
                    )}
                  </p>
                </div>

                <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
