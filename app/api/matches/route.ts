import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const matches = await prisma.match.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    include: {
      sender: {
        select: {
          id: true, name: true, image: true, bio: true, location: true,
          skills: { include: { skill: true } },
        },
      },
      receiver: {
        select: {
          id: true, name: true, image: true, bio: true, location: true,
          skills: { include: { skill: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(matches);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { receiverId } = body;

  if (!receiverId) {
    return NextResponse.json({ error: "receiverId is required" }, { status: 400 });
  }

  const senderId = session.user.id;

  if (senderId === receiverId) {
    return NextResponse.json({ error: "Cannot connect with yourself" }, { status: 400 });
  }

  // Check if a match already exists in either direction
  const existing = await prisma.match.findFirst({
    where: {
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    },
  });

  if (existing) {
    return NextResponse.json({ error: "Match already exists", match: existing }, { status: 409 });
  }

  const match = await prisma.match.create({
    data: { senderId, receiverId },
    include: {
      sender: { select: { id: true, name: true, image: true } },
      receiver: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json(match, { status: 201 });
}
