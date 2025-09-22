import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import PastAuction from '@/utils/schemas/pastAuction';
import { connectToDB } from '@/utils/db';
import { contractAdds } from '@/utils/contract/contractAdds';
import { auctionAbi } from '@/utils/contract/abis/auctionAbi';

// This is a migration script to fetch auction data from the contract
// and store it in the database for faster access
export async function GET() {
  try {
    await connectToDB();
    
    // Get contract instance
    const provider = new ethers.providers.JsonRpcProvider(
      "https://base-mainnet.g.alchemy.com/v2/CA4eh0FjTxMenSW3QxTpJ7D-vWMSHVjq"
    );
    
    const contract = new ethers.Contract(contractAdds.auction, auctionAbi, provider);
    
    // Get current auction ID
    const currentAuctionId = Number(await contract.auctionId());
    const processedAuctions = [];
    
    // Process each auction
    for (let i = 1; i <= currentAuctionId; i++) {
      // Check if this auction is already in the database
      const existingAuction = await PastAuction.findOne({ auctionName: `Auction #${i}` });
      
      if (existingAuction) {
        console.log(`Auction #${i} already exists in the database, skipping...`);
        continue;
      }
      
      console.log(`Processing Auction #${i}`);
      
      // Get auction metadata
      let currency;
      let deadline;
      
      try {
        // First try with getAuctionMetaById if it exists
        const auctionMeta = await contract.getAuctionMetaById(i);
        currency = auctionMeta.tokenName;
        deadline = Number(auctionMeta.deadline) * 1000; // Convert to milliseconds
      } catch (error) {
        // Fall back to individual calls
        currency = await contract.currencyUsed(i);
        const deadlineSeconds = await contract.auctionDeadline(i);
        deadline = Number(deadlineSeconds) * 1000; // Convert to milliseconds
      }
      
      // Get bidders
      const bids = await contract.getBidders(i);
      
      if (bids && Array.isArray(bids) && bids.length > 0) {
        // Filter out non-numeric fids (which are likely wallet addresses)
        const validFids = bids
          .map((bid) => Number(bid.fid))
          .filter((fid) => !isNaN(fid) && fid > 0);
        
        // Get wallet addresses (any non-numeric or zero fid)
        const walletAddresses = bids
          .filter((bid) => isNaN(Number(bid.fid)) || Number(bid.fid) === 0)
          .map((bid) => bid.fid);
        
        console.log("Valid FIDs for Neynar:", validFids);
        console.log("Wallet addresses:", walletAddresses);
        
        // Only query Neynar API if we have valid FIDs
        let users = [];
        if (validFids.length > 0) {
          // Get bidder usernames for valid FIDs
          const res = await fetch(
            `https://api.neynar.com/v2/farcaster/user/bulk?fids=${String(validFids)}`,
            {
              headers: {
                "x-api-key": "F3FC9EA3-AD1C-4136-9494-EBBF5AFEE152",
              },
            }
          );
          
          if (res.ok) {
            const jsonRes = await res.json();
            users = jsonRes.users || [];
          } else {
            console.error(`Error fetching user data for Auction #${i}`);
          }
        }
        
        // Format decimals based on currency
        const formatDecimals = currency === "USDC" ? 6 : 18;
        
        // Process bidders
        const processedBidders = bids.map((bid, index) => {
          // Check if bid.fid is a wallet address (non-numeric or zero)
          const isWalletAddress = isNaN(Number(bid.fid)) || Number(bid.fid) === 0;
          const bidAmount = Number(ethers.utils.formatUnits(String(bid.bidAmount), formatDecimals));
          
          if (isWalletAddress) {
            // For wallet addresses, use address as name
            const address = bid.fid.toString();
            const shortenedAddress = address.length > 8 
              ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
              : address;
              
            return {
              position: index + 1,
              name: shortenedAddress,
              entryAmount: bidAmount,
              USDCValue: currency === "USDC" ? bidAmount : bidAmount * 1800 // Simple conversion
            };
          } else {
            // For regular FIDs, find the user data
            const user = users.find((u: any) => u.fid === Number(bid.fid));
            
            return {
              position: index + 1,
              name: user?.username || `FID: ${bid.fid}`,
              entryAmount: bidAmount,
              USDCValue: currency === "USDC" ? bidAmount : bidAmount * 1800 // Simple conversion
            };
          }
        });
        
        // Filter out zero bids and sort by amount
        const filteredBidders = processedBidders
          .filter(bidder => bidder.entryAmount > 0)
          .sort((a, b) => b.entryAmount - a.entryAmount);
        
        // Create auction document
        const auctionDoc = {
          auctionName: `Auction #${i}`,
          endDate: new Date(deadline),
          currency,
          auctionData: filteredBidders
        };
        
        // Save to database
        await PastAuction.create(auctionDoc);
        processedAuctions.push(i);
      } else {
        // Create empty auction
        const auctionDoc = {
          auctionName: `Auction #${i}`,
          endDate: new Date(deadline),
          currency,
          auctionData: []
        };
        
        // Save to database
        await PastAuction.create(auctionDoc);
        processedAuctions.push(i);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Migration completed successfully',
      processed: processedAuctions
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}