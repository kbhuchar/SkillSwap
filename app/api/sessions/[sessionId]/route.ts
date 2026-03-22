import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId } = await params;
  const body = await req.json();
  const { status } = body;

  if (!["ACCEPTED", "DECLINED", "CANCELLED", "COMPLETED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const swapSession = await prisma.swapSession.findUnique({ where: { id: sessionId } });

  if (!swapSession) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userId = session.user.id;

  if (swapSession.proposerId !== userId && swapSession.receiverId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Only the receiver can accept/decline; proposer can cancel
  if (status === "ACCEPTED" || status === "DECLINED") {
    if (swapSession.receiverId !== userId) {
      return NextResponse.json({ error: "Only the receiver can accept or decline" }, { status: 403 });
    }
  }

  if (status === "CANCELLED" && swapSession.proposerId !== userId) {
    return NextResponse.json({ error: "Only the proposer can cancel" }, { status: 403 });
  }

  const updated = await prisma.swapSession.update({
    where: { id: sessionId },
    data: { status },
    include: {
      proposer: { select: { id: true, name: true, image: true } },
      receiver: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json(updated);
}
