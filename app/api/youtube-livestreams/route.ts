import { NextResponse } from 'next/server';
import YoutubeLivestream from '@/utils/schemas/youtubeLivestream';
import { connectToDB } from '@/utils/db';

export async function GET() {
  try {
    await connectToDB();
    const livestreams = await YoutubeLivestream.find({});
    return NextResponse.json({ success: true, data: livestreams });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
