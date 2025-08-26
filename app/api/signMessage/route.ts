import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const client = createPublicClient({ 
  chain: base, 
  transport: http() 
});

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const { typedData, signature, address } = await req.json();

  try {
    // Verify the typed data signature
    const valid = await client.verifyTypedData({
      address,
      domain: typedData.domain,
      types: typedData.types,
      primaryType: typedData.primaryType,
      message: typedData.message,
      signature
    });

    if (!valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Additional validation logic here
    // e.g., check expiry, nonce, permissions, etc.
    const now = Math.floor(Date.now() / 1000);
    if (typedData.message.expiry < now) {
      return NextResponse.json({ error: 'Signature expired' }, { status: 401 });
    }

    // Process the verified typed data
    return NextResponse.json({ 
      valid: true, 
      message: 'Signature verified successfully',
      data: typedData.message 
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}