import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sessionSchema } from "@/lib/validations/session";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const sessions = await prisma.swapSession.findMany({
    where: {
      OR: [{ proposerId: userId }, { receiverId: userId }],
    },
    include: {
      proposer: { select: { id: true, name: true, image: true } },
      receiver: { select: { id: true, name: true, image: true } },
      match: true,
    },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json(sessions);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = sessionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { matchId, title, description, scheduledAt, durationMin, meetingLink } = parsed.data;
  const proposerId = session.user.id;

  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      OR: [{ senderId: proposerId }, { receiverId: proposerId }],
      status: "ACCEPTED",
    },
  });

  if (!match) return NextResponse.json({ error: "Match not found or not accepted" }, { status: 403 });

  const receiverId = match.senderId === proposerId ? match.receiverId : match.senderId;

  const swapSession = await prisma.swapSession.create({
    data: {
      matchId,
      proposerId,
      receiverId,
      title,
      description,
      scheduledAt: new Date(scheduledAt),
      durationMin,
      meetingLink: meetingLink || null,
    },
    include: {
      proposer: { select: { id: true, name: true, image: true } },
      receiver: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json(swapSession, { status: 201 });
}
