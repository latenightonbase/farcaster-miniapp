import { NextResponse } from 'next/server';
import YoutubeLivestream from '@/utils/schemas/youtubeLivestream';
import { connectToDB } from '@/utils/db';

export async function POST(request: Request) {
  try {
    const livestreams = await request.json();
    await connectToDB();
    await YoutubeLivestream.insertMany(livestreams, { ordered: false }).catch(() => {});
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
