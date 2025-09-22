import { NextResponse } from 'next/server';
import PastAuction from '@/utils/schemas/pastAuction';
import { connectToDB } from '@/utils/db';

export async function GET() {
  try {
    await connectToDB();
    const pastAuctions = await PastAuction.find({}).sort({ endDate: -1 });
    
    // Ensure auctionData is always an array
    const formattedAuctions = pastAuctions.map(auction => {
      const auctionObj = auction.toObject();
      
      // If auctionData is not an array, convert it to an empty array
      if (!auctionObj.auctionData || !Array.isArray(auctionObj.auctionData)) {
        auctionObj.auctionData = [];
      }
      
      return auctionObj;
    });
    
    return NextResponse.json({ success: true, data: formattedAuctions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}