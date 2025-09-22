import { NextResponse } from 'next/server';
import PastAuction from '@/utils/schemas/pastAuction';
import { connectToDB } from '@/utils/db';

export async function GET() {
  try {
    await connectToDB();
    const pastAuctions = await PastAuction.find({}).sort({ endDate: -1 });
    
    console.log('Fetched past auctions:', pastAuctions);
   
    return NextResponse.json({ success: true, data: pastAuctions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}