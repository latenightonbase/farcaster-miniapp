import { useState, useEffect } from "react";
import { FaBullhorn } from "react-icons/fa";
import { X } from "lucide-react";
import axios from "axios";
import { ethers } from "ethers";

import { HiSpeakerphone } from "react-icons/hi";
import { useSignTypedData } from 'wagmi'
import { splitSignature } from "ethers/lib/utils";
import { useAccount, useSendTransaction } from "wagmi";
import { withPaymentInterceptor } from "x402-axios";
import { RiAuctionFill, RiLoader5Fill } from "react-icons/ri";
import { PiCursorClickFill } from "react-icons/pi";

import { createWalletClient, viemConnector } from "@farcaster/auth-client";
import { config } from "@/utils/rainbow";
import { writeContract } from "@wagmi/core";
import { sponsorPrice } from "@/utils/constants";
import { usdcAbi } from "@/utils/contract/abis/usdcabi";
import { contractAdds } from "@/utils/contract/contractAdds";
import { auctionAbi } from "@/utils/contract/abis/auctionAbi";
import { useGlobalContext } from "@/utils/globalContext";
import { parseUnits } from "viem";
import Image from "next/image";
import { IoIosArrowBack } from "react-icons/io";

export default function AddBanner() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  // const [metaValue, setMetaValue] = useState<number>(0);
  const [loading, setLoading] = useState(true); // Added loading state
  const [isLoading, setIsLoading] = useState(false);

  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { signTypedDataAsync } = useSignTypedData()

  const [usdcAmount, setUsdcAmount] = useState<number>(0);

  const { address } = useAccount();
  const globalContext = useGlobalContext();
  const user = globalContext?.user;

  const [bidders, setBidders] = useState<any[]>([]); // State to store sorted bidders
  const [history, setHistory] = useState<any[]>([]); // State to store sorted bidders

  const [highestBidder, setHighestBidder] = useState<any | null>(null); // State to store the highest bidder
  const [inputVisible, setInputVisible] = useState(false); // State to toggle input visibility
  const [error, setError] = useState(""); // State to store error message
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track submission
  const [auctionId, setAuctionId] = useState<number | null>(null); // State to store auction ID
  const [isFetchingBidders, setIsFetchingBidders] = useState(false); // State to track fetching bidders
  const [constAuctionId, setConstAuctionId] = useState<number | null>(null); // State to store constant auction ID
  useEffect(() => {
    const fetchSponsorImage = async () => {
      try {
        const response = await axios.get("/api/getImage");

        if (response.status === 200 && response.data.imageUrl) {
          setUploadedImage(response.data.imageUrl);
          setName(response.data.name || "");
          setUrl(response.data.url || "#"); // Default to "#" if no URL is provided
        } else {
          setUploadedImage(null);
        }
      } catch (error) {
        console.error("Error fetching sponsor image:", error);
        setUploadedImage(null);
      } finally {
        setLoading(false); // Set loading to false after API call
      }
    };

    // const fetchMetaValue = async () => {
    //   try {
    //     const response = await axios.get("/api/getPrice");

    //     if (response.status === 200 && response.data.meta) {
    //       setMetaValue(response.data.meta.meta_value);
    //     } else {
    //       setMetaValue(0);
    //     }
    //   } catch (error) {
    //     console.error("Error fetching meta value:", error);
    //     setMetaValue(0);
    //   }
    // };

    fetchSponsorImage();
    // fetchMetaValue();
    // getAuctionId();
  }, []);

  // useEffect(() => {
  //   getAuctionId();
  // }, []);

  const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base USDC address

  async function getContract(address: string, abi: any) {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        "https://base-mainnet.g.alchemy.com/v2/CA4eh0FjTxMenSW3QxTpJ7D-vWMSHVjq"
      );

      const contract = new ethers.Contract(address, abi, provider);
      return contract;
    }
    catch (error) {
      console.error("Error getting contract:", error);
    }
  }

  // async function getAuctionId() {
  //   try {
  //     const contract = await getContract(contractAdds.auction, auctionAbi);
  //     const auctionId = await contract?.auctionId();
  //     setAuctionId(auctionId);
  //   } catch (error) {
  //     console.error("Error getting auction ID:", error);
  //   }
  // }

  // async function getAuctionBids() {
  //   try {
  //     setIsFetchingBidders(true); // Start loader
  //     const contract = await getContract(contractAdds.auction, auctionAbi);
  //     const bids = await contract?.getBidders(auctionId);

  //     if (bids && Array.isArray(bids)) {
  //       const fids = bids.map((bid: any) => Number(bid.fid)); // Extract fids from bids

  //       const res = await fetch(
  //         `https://api.neynar.com/v2/farcaster/user/bulk?fids=${String(fids)}`,
  //         {
  //           headers: {
  //             "x-api-key": "F3FC9EA3-AD1C-4136-9494-EBBF5AFEE152" as string,
  //           },
  //         }
  //       );

  //       console.log("Neynar API Response Status:", res);

  //       if (!res.ok) {
  //         console.error("Error fetching user data from Neynar API");
  //         return;
  //       }

  //       const jsonRes = await res.json();

  //       const users = jsonRes.users || [];

  //       console.log("All Users:", users);

  //       const enrichedBidders = bids.map((bid: any) => {
  //         console.log("Bid:", bid);
  //         const user = users.find((u: any) => u.fid === Number(bid.fid));

  //         console.log("User found for bid:", user);

  //         return {
  //           username: user?.username || "Unknown",
  //           pfp_url: user?.pfp_url || "",
  //           bidAmount: ethers.utils.formatUnits(String(bid.bidAmount), 6),
  //         };
  //       });

  //       // Sort the enriched bidders by bidAmount in descending order
  //       const sortedBidders = enrichedBidders.sort((a: any, b: any) => b.bidAmount - a.bidAmount);

  //       console.log("Sorted Bidders:", sortedBidders);

  //       // Update the state with sorted enriched bidders
  //       setBidders(sortedBidders);
  //       setHighestBidder(sortedBidders[0]); // First element is the highest bidder
  //     }
  //     return bids;
  //   } catch (error) {
  //     console.error("Error getting bids:", error);
  //   } finally {
  //     setIsFetchingBidders(false); // Stop loader
  //   }
  // }

  useEffect(() => {
    if(address && auctionId !== null){
      // getAuctionBids();
      // getHistoricalBids();
    }
  }, [address, auctionId])

  // async function getHistoricalBids() {
  //   if (!auctionId) return;
  //   try {
  //     const contract = await getContract(contractAdds.auction, auctionAbi);

  //     for (let i = 0; i < auctionId; i++) {
  //       const bids = await contract?.getBidders(i);

  //       if (bids && Array.isArray(bids)) {
  //         const fids = bids.map((bid: any) => Number(bid.fid)); // Extract fids from bids

  //         const res = await fetch(
  //           `https://api.neynar.com/v2/farcaster/user/bulk?fids=${String(fids)}`,
  //           {
  //             headers: {
  //               "x-api-key": "F3FC9EA3-AD1C-4136-9494-EBBF5AFEE152" as string,
  //             },
  //           }
  //         );

  //         if (!res.ok) {
  //           console.error("Error fetching user data from Neynar API");
  //           continue;
  //         }

  //         const jsonRes = await res.json();

  //         const users = jsonRes.users || [];

  //         const enrichedBidders = bids.map((bid: any) => {
  //           const user = users.find((u: any) => u.fid === Number(bid.fid));

  //           return {
  //             username: user?.username || "Unknown",
  //             pfp_url: user?.pfp_url || "",
  //             bidAmount: ethers.utils.formatUnits(String(bid.bidAmount), 6),
  //           };
  //         });

  //         const sortedBidders = enrichedBidders.sort(
  //           (a: any, b: any) => b.bidAmount - a.bidAmount
  //         );

  //         setHistory((prev) => [
  //           ...prev,
  //           { isOpen: false, bidders: sortedBidders },
  //         ]);
  //       }
  //     }
  //   } catch (err) {
  //     console.error("Error fetching historical bids:", err);
  //   }
  // }

const handleSend = async () => {
  try {
    if (usdcAmount === 0) {
      return;
    }
    const usdc = await getContract(USDC_ADDRESS, usdcAbi);

    // Correct way
    const tokenName = "USD Coin";
    const tokenVersion = "2";
    const nonce = BigInt(await usdc?.nonces(address));

    const domain = {
      name: tokenName,
      version: tokenVersion,
      chainId: 8453,
      verifyingContract: USDC_ADDRESS,
      primaryType: "Permit",
    } as const;

    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    } as const;

    const usdcToSend = BigInt(Math.round(usdcAmount) * 1e6); // safe bigint
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

    const message = {
      owner: address as `0x${string}`,
      spender: contractAdds.auction as `0x${string}`,
      value: usdcToSend,
      nonce,
      deadline,
    };

    const signature = await signTypedDataAsync({
      domain,
      primaryType: "Permit",
      types,
      message,
    });

    const { v, r, s } = splitSignature(signature);


    const args = [usdcToSend, user|| 1129842, deadline, v, r, s];

    console.log("Args:", args);

    await writeContract(config, {
      abi: auctionAbi,
      address: contractAdds.auction as `0x${string}`,
      functionName: "bidWithPermit",
      args,
    });

    //add a 5 second delay here
    await new Promise(resolve => setTimeout(resolve, 5000));

    // getAuctionBids()
    window.location.reload();
  } catch (error) {
    console.error("Error sending transaction:", error);
    setError("Transaction failed. Please try again."); // Display error message in the frontend
    throw error;
  } finally {
    setIsLoading(false);
    setIsModalOpen(false);
  }
};


  const handleNavigation = (direction:string) => {

    if(!auctionId || !constAuctionId) return;

    if (direction === "left" && auctionId > 1) {
      setAuctionId((prev:any) => prev - 1);
    } else if (direction === "right" && auctionId < constAuctionId) {
      setAuctionId((prev:any) => prev + 1);
    }
  };

  // Modify the bid fetching logic
  useEffect(() => {
  
    const fetchAuctionData = async () => {
      try {
        const contract = await getContract(contractAdds.auction, auctionAbi);
        const currentAuctionId = Number(await contract?.auctionId());
        setAuctionId(currentAuctionId);
        setConstAuctionId(currentAuctionId);

        const fetchedBidders = [];

        for (let i = currentAuctionId; i >= 1; i--) { // Ensure we fetch all auctions from current to Auction #1
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
                pfp_url: user?.pfp_url || "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/2e7cd5a1-e72f-4709-1757-c49a71e56b00/original",
                bidAmount: ethers.utils.formatUnits(String(bid.bidAmount), 6),
              };
            });

            console.log(`Enriched Bidders ${i} :`, enrichedBidders);

            fetchedBidders.push({ auctionId: i, data: enrichedBidders });
          }
          else {
            console.log(`No Bidders Found for Auction ${i}`);
            fetchedBidders.push({ auctionId: i, data: [] });
          }
        }

        setBidders(fetchedBidders); // Reverse to show most recent first
        setHighestBidder(fetchedBidders[0]?.data[0]);
      } catch (error) {
        console.error("Error fetching auction data:", error);
      }
    };
if(bidders.length == 0){
    fetchAuctionData();  
    }
    
  }, []);

  if (address)
    return (
      <div className="mx-3 text-white">
        {loading ? null : uploadedImage && (
          <a href={url || "#"} target="_blank" rel="noopener noreferrer">
            <div className="relative">
              <img
                src={`${uploadedImage}?v=${Date.now()}`}
                alt="Sponsor Banner"
                className="mx-auto mt-4 h-[200px] w-full object-cover overflow-hidden rounded-lg shadow-xl shadow-red-600/20 active:scale-95  hover:scale-95 duration-200"
              />
              {url !== "#" && <span className="bg-black/50 text-sm absolute rounded-full text-white px-2 bottom-1 right-1 flex items-center justify-center gap-1">
                <PiCursorClickFill /> Click for more info
              </span>}
            </div>

            <div className="flex flex-col mt-2">
              <span className="text-white/80 text-sm">
                Today&apos;s Highlighted Project:
              </span>
              <span className="text-2xl font-bold bg-gradient-to-br from-yellow-500 via-yellow-300 to-yellow-700 text-transparent bg-clip-text">
                {name}
              </span>
            </div>
          </a>
        )}

        <div
          className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 transition-opacity duration-300 ${isModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
          <div className="bg-gradient-to-b mx-2 from-black to-orange-950 border-y-2 border-orange-500 p-6 rounded-lg w-96 text-white relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-400"
            >
              <X size={24} />
            </button>
            <h2 className="text-lg font-bold mb-4">Place your Bid</h2>


            <>
              <ul className="text-gray-400 text-sm space-y-2 list-disc ml-5 mb-5">
                  <li>
                    Get featured in the <b>"Word from Our Sponsor"</b> section.
                  </li>
                  <li>
                    Become the lead sponsor for the next <b>4 Live Streams</b>.
                  </li>
                  <li>
                    Highest bidder will be contacted via Farcaster.
                  </li>
                  <li>Non-winning bids will be refunded.</li>
              </ul>

              {/* <div className="flex mt-2 gap-2 mb-4 text-sm">
                  <button
                    onClick={() => setCurrency("ETH")}
                    className={`flex-1 py-2 rounded-full font-bold transition ${
                      currency === "ETH"
                        ? "bg-orange-500 text-white"
                        : "bg-orange-950/50 text-gray-300"
                    } hover:bg-orange-600`}
                  >
                    ETH
                  </button>
                  <button
                    onClick={() => setCurrency("USDC")}
                    className={`flex-1 py-2 rounded-full font-bold transition ${
                      currency === "USDC"
                        ? "bg-orange-500 text-white"
                        : "bg-orange-950/50 text-gray-300"
                    } hover:bg-orange-600`}
                  >
                    USDC
                  </button>
                </div> */}

              {highestBidder && <div>
                <label className="flex items-center text-md gap-1 font-bold ">
                  <RiAuctionFill className=" text-white text-xl" />
                  Current Highest Bid:
                </label>
                <div className=" my-4 px-2 py-4 bg-white/10 rounded-sm flex gap-2">
                  <span className="flex gap-1 w-[70%] truncate">
                    <Image alt={highestBidder.username} src={highestBidder.pfp_url} width={24} height={24} className="rounded-full w-6 aspect-square" />
                    {highestBidder.username}</span>
                  <h4 className="font-bold w-[30%] text-right">{highestBidder.bidAmount} USDC</h4>
                </div>
                <div>

                </div>
                <div>

                </div>

              </div>}


              {inputVisible ? (
                <div className="mt-4">
                  <input
                    type="number"
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Enter USDC Amount"
                    value={usdcAmount === 0 ? "" : usdcAmount} // Ensure initial 0 is not displayed
                    onChange={(e) => {
                      const value = Math.floor(Number(e.target.value)); // Ensure whole number
                      setUsdcAmount(value);
                      setError("");
                    }}
                  />
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                  <button
                    type="button"
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg w-full mt-2 flex items-center justify-center"
                    onClick={() => {
                      if (usdcAmount <= (highestBidder?.bidAmount || 0)) {
                        setError("Bid amount must be higher than the current highest bid.");
                        return;
                      }
                      setIsSubmitting(true); // Show loader
                      handleSend().finally(() => setIsSubmitting(false)); // Hide loader after submission
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <RiLoader5Fill className="animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              ) : (<button
                type="button"
                className="bg-orange-500 text-white px-4 py-2 rounded-lg w-full flex items-center justify-center"
                onClick={() => setInputVisible(true)}
                disabled={isLoading}
              >
                {!isLoading ? (
                  "Bid"
                ) : (
                  <>
                    <RiLoader5Fill className="animate-spin mr-2" />
                    Loading...
                  </>
                )}
              </button>)}
            </>

          </div>
        </div>

        
          <div className="mt-6 text-white">
            {auctionId && constAuctionId && <div className="flex items-center">
              <div className="w-[70%] flex gap-2">
                <h3 className="text-xl font-bold">Auction #{auctionId}</h3>
                { bidders.length > 0 &&
                  <>
                  <button className="flex bg-white/10 disabled:bg-transparent disabled:text-white/40 w-8 text-sm aspect-video rounded-full text-white items-center justify-center" onClick={() => handleNavigation("left")} disabled={auctionId <= 1}>
                  <IoIosArrowBack />
                </button>
                <button className="flex disabled:bg-transparent disabled:text-white/40 bg-white/10 w-8 text-sm aspect-video rotate-180 rounded-full text-white items-center justify-center" onClick={() => handleNavigation("right")} disabled={auctionId >= constAuctionId}>
                  <IoIosArrowBack />
                </button>
                  </>}

              </div>
              <div className="w-[30%] flex justify-end">
                <button onClick={() => setIsModalOpen(true)} className={`${constAuctionId === auctionId ? "block" : "hidden"} bg-gradient-to-br w-full h-10 from-emerald-700 via-green-600 to-emerald-700 font-bold text-white py-1 rounded-md flex gap-2 justify-center items-center text-xl`} ><RiAuctionFill className=" text-white text-xl"/> Bid</button>
              </div>
              
            </div>}
            {isFetchingBidders ? (
              <div className="flex justify-center items-center h-20">
                <RiLoader5Fill className="animate-spin text-white text-3xl" />
              </div>
            ) : bidders.length > 0 ? (
            <div className="mt-4">
              {bidders.length > 0 && (
                bidders.map((auction) => (
                  <div key={auction.auctionId} className={auction.auctionId === auctionId ? "block" : "hidden"}>
                  
                    { !auction.data || auction.data.length === 0 ? (
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
                              <td className={`py-2 text-right font-bold ${idx === 0 ? 'bg-gradient-to-br from-yellow-600 to-yellow-400 via-yellow-500 bg-clip-text text-transparent' : ''}`}>{bidder.bidAmount} USDC</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
          <div className="mt-4 bg-white/10 rounded-lg flex items-center justify-center h-20">
            <p className="text-white/70">No bids placed yet.</p>
          </div>
        )}
          </div>
          {/* History Section */}
          {/* <div className="mt-6 text-white">
            <h3 className="text-xl font-bold">Auction History</h3>
            {history.length > 0 ? (
              <div className="mt-4">
                {history.map((auctionHistory, index) => (
                  <div key={index} className="mt-2">
                    <button
                      onClick={() => {
                        setHistory((prev) =>
                          prev.map((item, i) =>
                            i === index
                              ? { ...item, isOpen: !item.isOpen }
                              : { ...item, isOpen: false }
                          )
                        );
                      }}
                      className="bg-gradient-to-br from-blue-600 to-blue-800 text-white px-4 py-2 rounded-lg w-full text-left"
                    >
                      Auction #{index + 1}
                    </button>
                    {auctionHistory.isOpen && (
                      <table className="w-full text-left border-collapse mt-2">
                        <thead>
                          <tr className="border-b border-white/30 text-red-300">
                            <th className="py-2">Profile</th>
                            <th className="py-2 text-right">Bid Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {auctionHistory.bidders.map((bidder: any, idx: number) => (
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
                              <td className="py-2 text-right font-bold">{bidder.bidAmount} USDC</td>
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
                <p className="text-white/70">No historical auctions available.</p>
              </div>
            )}
          </div> */}
        </div>
    );
}