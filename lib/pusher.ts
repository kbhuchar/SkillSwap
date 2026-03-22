import Pusher from "pusher";
import PusherClient from "pusher-js";

export function getPusherServer() {
  if (!process.env.PUSHER_APP_ID) return null;
  return new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true,
  });
}

export function getPusherClient() {
  if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return null;
  return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: "/api/pusher/auth",
  });
}
