import { NextResponse } from "next/server";
import NotificationDetails from "../../../utils/schemas/notificationDetails";
import { connectToDB } from "../../../utils/db";

export async function GET(req: Request) {
  await connectToDB();

  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
  }

  try {
    const notification = await NotificationDetails.findOne({ wallet });
    if (notification) {
      return NextResponse.json({ exists: true });
    } else {
      return NextResponse.json({ exists: false });
    }
  } catch (error) {
    console.error("Error fetching notification details:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await connectToDB();

  const body = await req.json();
  const { wallet, url, token } = body;

  if (!wallet || !url || !token) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    await NotificationDetails.create(
      { wallet, url, token },
    );
    return NextResponse.json({ message: "Notification details saved successfully" });
  } catch (error) {
    console.error("Error saving notification details:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
