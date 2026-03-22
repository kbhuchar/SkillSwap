import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { matchId } = await params;
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = 30;

  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
      status: "ACCEPTED",
    },
  });

  if (!match) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const messages = await prisma.message.findMany({
    where: { matchId },
    include: { sender: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = messages.length > limit;
  if (hasMore) messages.pop();

  return NextResponse.json({
    messages: messages.reverse(),
    hasMore,
    nextCursor: hasMore ? messages[0]?.id : null,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { matchId } = await params;
  const body = await req.json();
  const { content } = body;

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
      status: "ACCEPTED",
    },
  });

  if (!match) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const message = await prisma.message.create({
    data: { matchId, senderId: session.user.id, content: content.trim() },
    include: { sender: { select: { id: true, name: true, image: true } } },
  });

  // Trigger Pusher event (fire-and-forget)
  if (process.env.PUSHER_APP_ID) {
    pusherServer
      .trigger(`private-match-${matchId}`, "new-message", message)
      .catch(console.error);
  }

  return NextResponse.json(message, { status: 201 });
}
