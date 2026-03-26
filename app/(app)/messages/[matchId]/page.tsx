import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MessageThread from "@/components/messages/MessageThread";
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

  const initialMessages: MessageWithSender[] = match.messages.map((m) => ({
    ...m,
    sender: m.sender,
  }));

  return (
    // Break out of AppShell's p-4 padding and fill the viewport
    <div className="-mx-4 sm:-mx-5 -mt-4 sm:-mt-5 h-[calc(100dvh-5rem)] lg:h-[calc(100dvh-2rem)] flex flex-col">
      {/* Compact header */}
      <div className="flex items-center gap-2 px-2 pt-8 pb-1 flex-shrink-0">
        <Link href="/messages" className="p-2 rounded-xl hover:bg-[#1a1a1a] transition-colors text-[#888] flex-shrink-0">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <p className="text-sm font-semibold text-[#e5e5e5] truncate">{partner.name ?? "Anonymous"}</p>
      </div>

      {/* Thread */}
      <div className="flex-1 overflow-hidden bg-[#0d0d0d]">
        <MessageThread matchId={matchId} initialMessages={initialMessages} />
      </div>
    </div>
  );
}
