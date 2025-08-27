import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { IoIosArrowBack } from "react-icons/io";
import { RiAuctionFill, RiLoader5Fill } from "react-icons/ri";
import Image from "next/image";

import { contractAdds } from "@/utils/contract/contractAdds";
import { auctionAbi } from "@/utils/contract/abis/auctionAbi";
import { useAccount } from "wagmi";

export default function AuctionDisplay( ) {
  const [bidders, setBidders] = useState<any[]>([]);
  const [highestBidder, setHighestBidder] = useState<any | null>(null);
  const [auctionId, setAuctionId] = useState<number | null>(null);
  const [constAuctionId, setConstAuctionId] = useState<number | null>(null);
  const [isFetchingBidders, setIsFetchingBidders] = useState(false);

  const {address} = useAccount()

  async function getContract(address: string, abi: any) {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        "https://base-mainnet.g.alchemy.com/v2/CA4eh0FjTxMenSW3QxTpJ7D-vWMSHVjq"
      );

      const contract = new ethers.Contract(address, abi, provider);
      return contract;
    } catch (error) {
      console.error("Error getting contract:", error);
    }
  }

  const handleNavigation = (direction: string) => {
    if (!auctionId || !constAuctionId) return;

    if (direction === "left" && auctionId > 1) {
      setAuctionId((prev: any) => prev - 1);
    } else if (direction === "right" && auctionId < constAuctionId) {
      setAuctionId((prev: any) => prev + 1);
    }
  };

  useEffect(() => {
    const fetchAuctionData = async () => {
      try {
        setIsFetchingBidders(true); // Start loader
        const contract = await getContract(contractAdds.auction, auctionAbi);
        const currentAuctionId = Number(await contract?.auctionId());
        setAuctionId(currentAuctionId);
        setConstAuctionId(currentAuctionId);

        const fetchedBidders = [];

        let lastAuctionId = Math.max(1, currentAuctionId - 5);

        for (let i = currentAuctionId; i >= lastAuctionId; i--) {
          const bids = await contract?.getBidders(i);

          if (bids && Array.isArray(bids) && bids.length > 0) {
            const fids = bids.map((bid) => Number(bid.fid));

            const res = await fetch(
              `https://api.neynar.com/v2/farcaster/user/bulk?fids=${String(fids)}`,
              {
                headers: {
                  "x-api-key": "F3FC9EA3-AD1C-4136-9494-EBBF5AFEE152",
                },
              }
            );

            if (!res.ok) {
              console.error("Error fetching user data from Neynar API");
              continue;
            }

            const jsonRes = await res.json();
            const users = jsonRes.users || [];

            const enrichedBidders = bids.map((bid) => {
              const user = users.find((u: any) => u.fid === Number(bid.fid));

              return {
                username: user?.username || "Unknown",
                pfp_url:
                  user?.pfp_url ||
                  "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/2e7cd5a1-e72f-4709-1757-c49a71e56b00/original",
                bidAmount: ethers.utils.formatUnits(String(bid.bidAmount), 6),
              };
            });

            const sortedBidders = enrichedBidders.sort(
              (a: any, b: any) => b.bidAmount - a.bidAmount
            );

            fetchedBidders.push({ auctionId: i, data: sortedBidders });
          } else {
            fetchedBidders.push({ auctionId: i, data: [] });
          }
        }

        setBidders(fetchedBidders);
        setHighestBidder(fetchedBidders[0]?.data[0]);
      } catch (error) {
        console.error("Error fetching auction data:", error);
      } finally {
        setIsFetchingBidders(false); // Stop loader
      }
    };

    fetchAuctionData();
  }, []);

  return (
    <div className="mt-6 text-white">
      {auctionId && constAuctionId && (
        <div className="flex items-center">
          <div className="w-[70%] flex gap-2">
            <h3 className="text-xl font-bold">Auction #{auctionId}</h3>
            {bidders.length > 0 && (
              <>
                <button
                  className="flex bg-white/10 disabled:bg-transparent disabled:text-white/40 w-8 text-sm aspect-video rounded-full text-white items-center justify-center"
                  onClick={() => handleNavigation("left")}
                  disabled={auctionId <= 1}
                >
                  <IoIosArrowBack />
                </button>
                <button
                  className="flex disabled:bg-transparent disabled:text-white/40 bg-white/10 w-8 text-sm aspect-video rotate-180 rounded-full text-white items-center justify-center"
                  onClick={() => handleNavigation("right")}
                  disabled={auctionId >= constAuctionId}
                >
                  <IoIosArrowBack />
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {isFetchingBidders ? (
        <div className="flex justify-center items-center h-20">
          <RiLoader5Fill className="animate-spin text-white text-3xl" />
        </div>
      ) : bidders.length > 0 ? (
        <div className="mt-4">
          {bidders.map((auction) => (
            <div
              key={auction.auctionId}
              className={auction.auctionId === auctionId ? "block" : "hidden"}
            >
              {!auction.data || auction.data.length === 0 ? (
                <div className="mt-4 bg-white/10 rounded-lg flex items-center justify-center h-20">
                  <p className="text-white/70">No bids placed yet.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse mt-4">
                  <thead>
                    <tr className="border-b border-white/30 text-red-300">
                      <th className="py-2">Profile</th>
                      <th className="py-2 text-right">Bid Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auction.data.map((bidder: any, idx: number) => (
                      <tr key={idx} className="border-b border-white/10">
                        <td className="py-2 flex items-center gap-2">
                          {bidder.pfp_url ? (
                            <img
                              src={bidder.pfp_url}
                              alt={bidder.username}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-white/40"></div>
                          )}
                          <span className="truncate">{bidder.username}</span>
                        </td>
                        <td
                          className={`py-2 text-right font-bold ${
                            idx === 0
                              ? "bg-gradient-to-br from-yellow-600 to-yellow-400 via-yellow-500 bg-clip-text text-transparent"
                              : ""
                          }`}
                        >
                          {bidder.bidAmount} USDC
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 bg-white/10 rounded-lg flex items-center justify-center h-20">
          <p className="text-white/70">No bids placed yet.</p>
        </div>
      )}
    </div>
  );
}
