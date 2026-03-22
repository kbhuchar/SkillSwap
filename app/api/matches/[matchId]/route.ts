import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { matchId } = await params;
  const body = await req.json();
  const { status } = body;

  if (!["ACCEPTED", "DECLINED", "BLOCKED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const match = await prisma.match.findUnique({ where: { id: matchId } });

  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

  const userId = session.user.id;

  // Only the receiver can accept/decline; both parties can block
  if (status === "ACCEPTED" || status === "DECLINED") {
    if (match.receiverId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else if (match.senderId !== userId && match.receiverId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.match.update({
    where: { id: matchId },
    data: { status },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { matchId } = await params;

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userId = session.user.id;
  if (match.senderId !== userId && match.receiverId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.match.delete({ where: { id: matchId } });
  return NextResponse.json({ success: true });
}
