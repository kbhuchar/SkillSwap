import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.text();
  const params = new URLSearchParams(body);
  const socketId = params.get("socket_id")!;
  const channelName = params.get("channel_name")!;

  // Ensure user is a participant of the match
  const matchId = channelName.replace("private-match-", "");
  const userId = session.user.id;

  const authResponse = pusherServer.authorizeChannel(socketId, channelName, {
    user_id: userId,
    user_info: { name: session.user.name },
  });

  return NextResponse.json(authResponse);
}
