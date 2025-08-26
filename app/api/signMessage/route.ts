import { NextApiRequest, NextApiResponse } from 'next';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const client = createPublicClient({ 
  chain: base, 
  transport: http() 
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { typedData, signature, address } = req.body;

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
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Additional validation logic here
    // e.g., check expiry, nonce, permissions, etc.
    const now = Math.floor(Date.now() / 1000);
    if (typedData.message.expiry < now) {
      return res.status(401).json({ error: 'Signature expired' });
    }

    // Process the verified typed data
    res.json({ 
      valid: true, 
      message: 'Signature verified successfully',
      data: typedData.message 
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
}