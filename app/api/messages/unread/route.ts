import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ count: 0 });

  const userId = session.user.id;

  const count = await prisma.message.count({
    where: {
      match: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        status: "ACCEPTED",
      },
      senderId: { not: userId },
      readAt: null,
    },
  });

  return NextResponse.json({ count });
}
