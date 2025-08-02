import { connectToDB } from '@/utils/db';
import Meta from '@/utils/schemas/metaschema';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log("Connecting to database...");
    await connectToDB();

    console.log("Fetching meta data for key: sponsor_charge");
    const meta = await Meta.findOne({ meta_key: 'sponsor_charge' });

    console.log("Fetched meta:", meta);

    if (!meta) {
      console.error("Meta not found for key: sponsor_charge");
      return NextResponse.json({ error: 'Meta not found' }, { status: 404 });
    }

    return NextResponse.json({ meta });
  } catch (error) {
    console.error('Error fetching meta:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}