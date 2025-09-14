import { sendFrameNotification } from "@/utils/notification-client";
import NotificationDetails from "@/utils/schemas/notificationDetails";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fid, notification } = body;

    const notifications = await NotificationDetails.find({ fid:fid });

    const tokens = notifications.map(notification => notification.token);

    await fetch("https://api.farcaster.xyz/v1/frame-notifications", {
        method: "POST",
         headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      notificationId: crypto.randomUUID(),
      title: notification.title,
      body: notification.body,
      targetUrl: "https://farcaster-miniapp-liart.vercel.app/",
      tokens: tokens,
    }),
  });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}
