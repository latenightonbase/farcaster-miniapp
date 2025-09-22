import { useState, useEffect } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { RiAuctionFill, RiLoader5Fill } from "react-icons/ri";
import Image from "next/image";
import { useAccount } from "wagmi";

// Define interfaces for type safety
interface Bidder {
  username: string;
  pfp_url: string;
  entryAmount: number;
  currency: string;
}

interface AuctionData {
  _id: string;
  auctionName: string;
  endDate: string;
  currency: string;
  auctionData: {
    position: number;
    name: string;
    fid: string;
    entryAmount: number;
    USDCValue: number;
  }[];
  createdAt: string;
}

export default function AuctionDisplay() {
  const [pastAuctions, setPastAuctions] = useState<AuctionData[]>([]);
  const [currentAuctionIndex, setCurrentAuctionIndex] = useState<number>(0);
  const [isFetchingAuctions, setIsFetchingAuctions] = useState(false);
  const [isChangingAuction, setIsChangingAuction] = useState(false);
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({});

  const { address } = useAccount();

  const handleNavigation = (direction: string) => {
    if (pastAuctions.length === 0) return;

    setIsChangingAuction(true);
    
    let newIndex;
    if (direction === "left" && currentAuctionIndex < pastAuctions.length - 1) {
      newIndex = currentAuctionIndex + 1; // Move to older auction
      setCurrentAuctionIndex(newIndex);
    } else if (direction === "right" && currentAuctionIndex > 0) {
      newIndex = currentAuctionIndex - 1; // Move to newer auction
      setCurrentAuctionIndex(newIndex);
    }
    
    setTimeout(() => {
      setIsChangingAuction(false);
    }, 100);
  };

  useEffect(() => {
    const fetchPastAuctions = async () => {
      try {
        setIsFetchingAuctions(true);
        
        const response = await fetch('/api/past-auctions');
        
        if (!response.ok) {
          throw new Error('Failed to fetch past auctions');
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          console.log('Received auction data:', JSON.stringify(data.data, null, 2));
          
          // Validate each auction has auctionData as an array
          const validatedAuctions = data.data.map((auction: any) => {
            console.log('Auction:', auction.auctionName);
            console.log('AuctionData type:', typeof auction.auctionData);
            console.log('AuctionData isArray:', Array.isArray(auction.auctionData));
            console.log('AuctionData:', auction.auctionData);
            
            if (!auction.auctionData || !Array.isArray(auction.auctionData)) {
              console.warn('Auction has invalid auctionData format:', auction);
              return {
                ...auction,
                auctionData: [] // Ensure auctionData is always an array
              };
            }
            return auction;
          });

          console.log('Validated Auctions:', JSON.stringify(validatedAuctions, null, 2));
          
          setPastAuctions(validatedAuctions);
          
          // Collect all FIDs for Neynar API call
          const allFids: string[] = [];
          validatedAuctions.forEach((auction: AuctionData) => {
            if (auction.auctionData && Array.isArray(auction.auctionData)) {
              auction.auctionData.forEach((bidder: {fid?: string}) => {
                // Only add FIDs that don't look like wallet addresses
                if (bidder.fid && !bidder.fid.includes('0x')) {
                  allFids.push(bidder.fid);
                }
              });
            }
          });
          
          // Fetch user profiles from Neynar API
          if (allFids.length > 0) {
            try {
              const res = await fetch(
                `https://api.neynar.com/v2/farcaster/user/bulk?fids=${String(allFids)}`,
                {
                  headers: {
                    "x-api-key": process.env.NEXT_PUBLIC_NEYNAR_API_KEY as string,
                  },
                }
              );
              
              console.log("Neynar API Response Status:", res);
              
              if (res.ok) {
                const jsonRes = await res.json();
                const users = jsonRes.users || [];
                
                // Create a map of FID to user profile data
                const userProfilesMap: Record<string, any> = {};
                users.forEach((user: any) => {
                  userProfilesMap[user.fid] = user;
                });
                
                setUserProfiles(userProfilesMap);
              } else {
                console.error("Error fetching user data from Neynar API");
              }
            } catch (error) {
              console.error("Error with Neynar API request:", error);
            }
          }
        } else {
          console.error('Invalid response format:', data);
        }
      } catch (error) {
        console.error('Error fetching past auctions:', error);
      } finally {
        setIsFetchingAuctions(false);
      }
    };

    fetchPastAuctions();
  }, []);

  return (
    <div className="text-white">
      {isFetchingAuctions ? (
        <div className="flex justify-center items-center h-20">
          <RiLoader5Fill className="animate-spin text-white text-3xl" />
        </div>
      ) : pastAuctions.length > 0 ? (
        <>
          <div className="flex items-center">
            <div className="w-[70%] flex gap-2">
              <h3 className="text-xl font-bold">Auction: {pastAuctions[currentAuctionIndex]?.auctionName}</h3>
              {pastAuctions.length > 1 && (
                <>
                  <button
                    className="flex bg-white/10 disabled:bg-transparent disabled:text-white/40 w-8 text-sm aspect-video rounded-full text-white items-center justify-center"
                    onClick={() => handleNavigation("left")}
                    disabled={currentAuctionIndex >= pastAuctions.length - 1}
                  >
                    <IoIosArrowBack />
                  </button>
                  <button
                    className="flex disabled:bg-transparent disabled:text-white/40 bg-white/10 w-8 text-sm aspect-video rotate-180 rounded-full text-white items-center justify-center"
                    onClick={() => handleNavigation("right")}
                    disabled={currentAuctionIndex <= 0}
                  >
                    <IoIosArrowBack />
                  </button>
                </>
              )}
            </div>
          </div>
          
          {!isChangingAuction && pastAuctions[currentAuctionIndex] && (
            <div className="mt-2 text-white/70 text-sm">
              <div className="flex items-center gap-2">
                <RiAuctionFill />
                <span>
                  Ended: {new Date(pastAuctions[currentAuctionIndex].endDate).toLocaleString()}
                </span>
              </div>
              <div className="mt-1">
                Currency: {pastAuctions[currentAuctionIndex].currency}
              </div>
            </div>
          )}
          
          <div className="mt-4">
            {pastAuctions[currentAuctionIndex] && (
              <div>
                {!pastAuctions[currentAuctionIndex].auctionData || 
                 !Array.isArray(pastAuctions[currentAuctionIndex].auctionData) || 
                 pastAuctions[currentAuctionIndex].auctionData.length === 0 ? (
                  <div className="mt-4 bg-white/10 rounded-lg flex items-center justify-center h-20">
                    <p className="text-white/70">No bids placed for this auction.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse mt-4">
                    <thead>
                      <tr className="border-b border-white/30 text-bill-pink">
                        <th className="py-2">Profile</th>
                        <th className="py-2 text-right">Bid Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(pastAuctions[currentAuctionIndex].auctionData) && 
                        pastAuctions[currentAuctionIndex].auctionData.map((bidder, idx) => (
                        <tr key={idx} className="border-b border-white/10">
                          <td className="py-2 flex items-center gap-2">
                            {bidder.fid && bidder.fid.includes('0x') ? (
                              // For wallet addresses, use Robohash
                              <img 
                                src={`https://robohash.org/${bidder.name}?set=set4&size=150x150`}
                                alt={bidder.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : bidder.fid && userProfiles[bidder.fid]?.pfp_url ? (
                              // For users with Farcaster IDs that we found profiles for
                              <img 
                                src={userProfiles[bidder.fid].pfp_url}
                                alt={bidder.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              // Fallback to Robohash for any other case
                              <img 
                                src={`https://robohash.org/${bidder.name}?set=set4&size=150x150`}
                                alt={bidder.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            )}
                            <span className="truncate">{bidder.name}</span>
                          </td>
                          <td
                            className={`py-2 text-right text-sm font-bold ${
                              idx === 0
                                ? "bg-gradient-to-br from-yellow-600 to-yellow-400 via-yellow-500 bg-clip-text text-transparent"
                                : ""
                            }`}
                          >
                            <span className="block">{Math.round(bidder.entryAmount).toLocaleString()} {pastAuctions[currentAuctionIndex].currency} </span>
                          <span className="text-xs text-gray-400 font-light">{pastAuctions[currentAuctionIndex].currency == "LNOB" &&`≈ ${(bidder.USDCValue).toLocaleString()} USDC`}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="mt-4 bg-white/10 rounded-lg flex items-center justify-center h-20">
          <p className="text-white/70">No auctions found.</p>
        </div>
      )}
    </div>
  );
}
