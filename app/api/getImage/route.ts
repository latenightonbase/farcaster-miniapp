import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { connectToDB } from '@/utils/db';
import SponsorFields from '@/utils/schemas/sponsorFields';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    revalidatePath('/', 'layout');
    await connectToDB();
    
    // Find the most recent sponsor field that hasn't expired
    const sponsorField = await SponsorFields.find({ /* Add conditions if needed */ })
      .sort({ createdAt: -1 }) // Sort by most recent
      .limit(1); // Fetch only the latest document

    console.log("Sponsor field fetched:", sponsorField);
    
    if (!sponsorField || sponsorField.length === 0) {
      return NextResponse.json({ imageUrl: null }, { status: 200 });
    }
    
    return NextResponse.json({ 
      imageUrl: sponsorField[0].image,
      name: sponsorField[0].name,
      url: sponsorField[0].url || "#", // Default to "#" if no URL
      sponsorFieldId: sponsorField[0]._id,
      createdAt: sponsorField[0].createdAt
    });
  } catch (error) {
    console.error('Error fetching sponsor image:', error);
    return NextResponse.json({ error: 'Failed to fetch sponsor image' }, { status: 500 });
  }
}