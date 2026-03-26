import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MessageThread from "@/components/messages/MessageThread";
import { getInitials } from "@/lib/utils";
import type { Metadata } from "next";
import type { MessageWithSender } from "@/types";

interface ConversationPageProps {
  params: Promise<{ matchId: string }>;
}

export async function generateMetadata({ params }: ConversationPageProps): Promise<Metadata> {
  const { matchId } = await params;
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      sender: { select: { name: true } },
      receiver: { select: { name: true } },
    },
  });
  return {
    title: match ? `Chat with ${match.sender.name ?? "User"} — SkillSwap` : "Messages — SkillSwap",
  };
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { matchId } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      sender: { select: { id: true, name: true, image: true, location: true, createdAt: true } },
      receiver: { select: { id: true, name: true, image: true, location: true, createdAt: true } },
      messages: {
        include: { sender: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!match || (match.senderId !== userId && match.receiverId !== userId) || match.status !== "ACCEPTED") {
    notFound();
  }

  const partner = match.senderId === userId ? match.receiver : match.sender;
  const initials = getInitials(partner.name);

  const initialMessages: MessageWithSender[] = match.messages.map((m) => ({
    ...m,
    sender: m.sender,
  }));

  return (
    // Break out of AppShell's p-4 padding and fill the viewport
    <div className="-mx-4 sm:-mx-5 -mt-4 sm:-mt-5 h-[calc(100dvh-9rem)] lg:h-[calc(100dvh-6rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 sm:px-4 py-3 border-b border-[#1e1e1e] bg-[#0d0d0d] flex-shrink-0">
        <Link
          href="/messages"
          className="p-2 -ml-1 rounded-xl hover:bg-[#1a1a1a] transition-colors text-[#888]"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <Link href={`/profile/${partner.id}`} className="flex items-center gap-3 flex-1 min-w-0 group">
          <div className="relative flex-shrink-0">
            {partner.image ? (
              <img
                src={partner.image}
                alt={partner.name ?? ""}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#1a1a1a] text-cyan-400 flex items-center justify-center text-sm font-bold">
                {initials}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#0d0d0d]" />
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-[#e5e5e5] group-hover:text-cyan-400 transition-colors text-sm leading-tight truncate">
              {partner.name ?? "Anonymous"}
            </p>
            <p className="text-xs text-[#555] mt-0.5">Active now</p>
          </div>
        </Link>
      </div>

      {/* Thread */}
      <div className="flex-1 overflow-hidden bg-[#0d0d0d]">
        <MessageThread matchId={matchId} initialMessages={initialMessages} />
      </div>
    </div>
  );
}
