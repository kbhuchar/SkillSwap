import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar } from "lucide-react";
import MessageThread from "@/components/messages/MessageThread";
import { getInitials, formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import type { MessageWithSender } from "@/types";

interface ConversationPageProps {
  params: Promise<{ matchId: string }>;
}

export async function generateMetadata({
  params,
}: ConversationPageProps): Promise<Metadata> {
  const { matchId } = await params;
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      sender: { select: { name: true } },
      receiver: { select: { name: true } },
    },
  });

  return {
    title: match
      ? `Chat with ${match.sender.name ?? "User"} — SkillSwap`
      : "Messages — SkillSwap",
  };
}

export default async function ConversationPage({
  params,
}: ConversationPageProps) {
  const { matchId } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          image: true,
          location: true,
          createdAt: true,
        },
      },
      receiver: {
        select: {
          id: true,
          name: true,
          image: true,
          location: true,
          createdAt: true,
        },
      },
      messages: {
        include: {
          sender: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (
    !match ||
    (match.senderId !== userId && match.receiverId !== userId) ||
    match.status !== "ACCEPTED"
  ) {
    notFound();
  }

  const partner =
    match.senderId === userId ? match.receiver : match.sender;
  const initials = getInitials(partner.name);

  const initialMessages: MessageWithSender[] = match.messages.map((m) => ({
    ...m,
    sender: m.sender,
  }));

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-7rem)] lg:h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="bg-[#242424] rounded-t-2xl border border-b-0 border-[#333333] shadow-sm px-5 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/messages"
            className="p-2 hover:bg-[#2a2a2a] rounded-xl transition-colors text-gray-500"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <Link href={`/profile/${partner.id}`} className="flex items-center gap-3 group">
            {partner.image ? (
              <img
                src={partner.image}
                alt={partner.name ?? ""}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-800/40"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-900/20 text-indigo-400 flex items-center justify-center text-sm font-bold">
                {initials}
              </div>
            )}
            <div>
              <p className="font-semibold text-white group-hover:text-indigo-400 transition-colors text-sm">
                {partner.name ?? "Anonymous"}
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {partner.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {partner.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Joined {formatDate(partner.createdAt)}
                </div>
              </div>
            </div>
          </Link>

          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-gray-500">Connected</span>
          </div>
        </div>
      </div>

      {/* Thread */}
      <div className="flex-1 bg-[#1a1a1a] border border-[#333333] rounded-b-2xl overflow-hidden shadow-sm">
        <MessageThread matchId={matchId} initialMessages={initialMessages} />
      </div>
    </div>
  );
}
