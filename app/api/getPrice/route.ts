import { connectToDB } from '@/utils/db';
import Meta from '@/utils/schemas/metaschema';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDB();
    // Fetch the MetaSchema document where meta_key is 'sponsor_charge'
    const meta = await Meta.findOne({ meta_key: 'sponsor_charge' });

    console.log("Fetched meta:", meta);

    if (!meta) {
      return NextResponse.json({ error: 'Meta not found' }, { status: 404 });
    }

    return NextResponse.json({ meta });
  } catch (error) {
    console.error('Error fetching meta:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}