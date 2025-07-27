import type { FrameNotificationDetails } from "@farcaster/frame-sdk";
import { connectToDB } from "./db";
import NotificationDetails from "./schemas/notificationDetails";

const notificationServiceKey =
  process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME ?? "minikit";

function getUserNotificationDetailsKey(fid: number): string {
  return `${notificationServiceKey}:user:${fid}`;
}

export async function getUserNotificationDetails(
  fid: number,
): Promise<FrameNotificationDetails | null> {
  await connectToDB();

  const key = getUserNotificationDetailsKey(fid);
  const notificationDetails = await NotificationDetails.findOne({ token: key });

  if (!notificationDetails) {
    return null;
  }

  return JSON.parse(notificationDetails.url) as FrameNotificationDetails;
}

export async function setUserNotificationDetails(
  fid: number,
  notificationDetails: FrameNotificationDetails,
): Promise<void> {
  await connectToDB();

  const key = getUserNotificationDetailsKey(fid);
  const url = JSON.stringify(notificationDetails);

  const existingEntry = await NotificationDetails.findOne({ token: key });

  if (existingEntry) {
    await NotificationDetails.findOneAndUpdate(
      { token: key },
      { url },
      { new: true },
    );
  } else {
    await NotificationDetails.create({ token: key, url });
  }
}

export async function deleteUserNotificationDetails(
  fid: number,
): Promise<void> {
  await connectToDB();

  const key = getUserNotificationDetailsKey(fid);

  await NotificationDetails.findOneAndDelete({ token: key });
}
