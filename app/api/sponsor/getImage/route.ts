import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { connectToDB } from '@/utils/db';
import SponsorFields from '@/utils/schemas/sponsorFields';

export async function GET() {
  try {
    await connectToDB();
    
    // Find the most recent sponsor field that hasn't expired
    const sponsorField = await SponsorFields.findOne().sort({ createdAt: -1 });

    console.log("Sponsor field fetched:", sponsorField);
    
    if (!sponsorField) {
      return NextResponse.json({ imageUrl: null }, { status: 200 });
    }
    
    return NextResponse.json({ 
      imageUrl: sponsorField.image,
      sponsorFieldId: sponsorField._id,
      createdAt: sponsorField.createdAt
    });
  } catch (error) {
    console.error('Error fetching sponsor image:', error);
    return NextResponse.json({ error: 'Failed to fetch sponsor image' }, { status: 500 });
  }
}