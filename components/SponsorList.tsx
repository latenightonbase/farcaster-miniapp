import { useState, useEffect } from "react";
import { FaBullhorn } from "react-icons/fa";
import { X } from "lucide-react";
import axios from "axios";
import { ethers } from "ethers";

import { HiSpeakerphone } from "react-icons/hi";
import { useSignTypedData } from "wagmi";
import { splitSignature } from "ethers/lib/utils";
import { useAccount, useSendTransaction } from "wagmi";
import { withPaymentInterceptor } from "x402-axios";
import { RiAuctionFill, RiLoader5Fill, RiTimerLine } from "react-icons/ri";
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
import AuctionDisplay from "./AuctionDisplay";
import { erc20abi } from "@/utils/contract/abis/erc20abi";

export default function AddBanner() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  // const [metaValue, setMetaValue] = useState<number>(0);
  const [loading, setLoading] = useState(true); // Added loading state
  const [isLoading, setIsLoading] = useState(false);

  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { signTypedDataAsync } = useSignTypedData();

  const [usdcAmount, setUsdcAmount] = useState<number>(0);
  const [tokenPrice, setTokenPrice] = useState<number | null>(null);
  const [tokenPriceLoading, setTokenPriceLoading] = useState<boolean>(false);

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
  const [caInUse, setCaInUse] = useState<string | null>(null);

  // New state variables
  const [auctionDeadline, setAuctionDeadline] = useState<number | null>(null); // State to store auction deadline
  const [currency, setCurrency] = useState<string>("USDC"); // State to store currency
  const [isAuctionActive, setIsAuctionActive] = useState<boolean>(false); // State to track if auction is active
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  }); // State to store countdown time

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

    fetchSponsorImage();
  }, []);

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

  async function getAuctionId() {
    try {
      const contract = await getContract(contractAdds.auction, auctionAbi);
      const auctionMeta = await contract?.getCurrentAuctionMeta();

      console.log("Auction Meta:", auctionMeta);

      // Check if auction name exists
      if (!auctionMeta || !auctionMeta.tokenName) {
        console.log("No active auction found");
        setIsAuctionActive(false);
        return;
      }

      setCaInUse(auctionMeta.caInUse);
      setAuctionId(auctionMeta.auctionId);
      setCurrency(auctionMeta.tokenName || "USDC");
      setAuctionDeadline(Number(auctionMeta.deadline));
      setIsAuctionActive(true);

      console.log("Auction meta:", auctionMeta);
      
      // Fetch token price after getting the contract address
      if (auctionMeta.caInUse) {
        fetchTokenPrice(auctionMeta.caInUse);
      }
    } catch (error) {
      console.error("Error getting auction ID:", error);
      setIsAuctionActive(false);
    }
  }
  
  // Function to fetch token price from CoinGecko
  const fetchTokenPrice = async (contractAddress: string) => {
    try {
      setTokenPriceLoading(true);
      
      // Handle known token addresses (fallback in case CoinGecko doesn't recognize the address)
      let tokenId = '';
      let fallbackPrice = 0;
      
      // Always use the Base chain endpoint for contract address
      const apiUrl = `https://api.coingecko.com/api/v3/coins/base/contract/${contractAddress}`;
      
      const response = await axios.get(apiUrl);
      
      if (response.data && response.data.market_data && response.data.market_data.current_price) {
        setTokenPrice(response.data.market_data.current_price.usd);
        console.log(`${currency} price:`, response.data.market_data.current_price.usd);
      } else {
        console.log("Price data not available from API, using fallback price");
        // Use fallback price if API doesn't return price data
        if (fallbackPrice > 0) {
          setTokenPrice(fallbackPrice);
        } else {
          setTokenPrice(null);
        }
      }
    } catch (error) {
      console.error("Error fetching token price:", error);
      
      // Use fallback prices for known tokens if API call fails
      if (currency === "USDC") {
        setTokenPrice(1.0);
      } else if (currency === "WETH" || currency === "ETH") {
        setTokenPrice(3500); // Approximate ETH price
      } else {
        setTokenPrice(null);
      }
    } finally {
      setTokenPriceLoading(false);
    }
  };
  async function getAuctionBids() {
    try {
      setIsFetchingBidders(true); // Start loader
      const contract = await getContract(contractAdds.auction, auctionAbi);
      const bids = await contract?.getBidders(auctionId);

      if (bids && Array.isArray(bids)) {
        const fids = bids.map((bid: any) => Number(bid.fid)); // Extract fids from bids

        const res = await fetch(
          `https://api.neynar.com/v2/farcaster/user/bulk?fids=${String(fids)}`,
          {
            headers: {
              "x-api-key": process.env.NEXT_PUBLIC_NEYNAR_API_KEY as string,
            },
          }
        );

        console.log("Neynar API Response Status:", res);

        if (!res.ok) {
          console.error("Error fetching user data from Neynar API");
          return;
        }

        const jsonRes = await res.json();

        const users = jsonRes.users || [];

        console.log("All Users:", users);

        const enrichedBidders = bids.map((bid: any) => {
          console.log("Bid:", bid);
          const user = users.find((u: any) => u.fid === Number(bid.fid));

          console.log("User found for bid:", user);

          return {
            username: user?.username || "Unknown",
            pfp_url: user?.pfp_url || "",
            bidAmount: currency == "USDC" ? ethers.utils.formatUnits(String(bid.bidAmount), 6) : ethers.utils.formatUnits(String(bid.bidAmount), 18),
          };
        });

        // Filter out bidders with bidAmount = 0
        const filteredBidders = enrichedBidders.filter(
          (bidder) => Number(bidder.bidAmount) > 0
        );

        // Sort the enriched bidders by bidAmount in descending order
        const sortedBidders = filteredBidders.sort(
          (a: any, b: any) => b.bidAmount - a.bidAmount
        );

        console.log("Sorted Bidders:", sortedBidders);

        // Update the state with sorted enriched bidders
        setBidders(sortedBidders);
        setHighestBidder(sortedBidders[0]); // First element is the highest bidder
      }
      return bids;
    } catch (error) {
      console.error("Error getting bids:", error);
    } finally {
      setIsFetchingBidders(false); // Stop loader
    }
  }

  useEffect(() => {
    getAuctionId();
  }, []);

  // Refresh token price when modal is opened
  useEffect(() => {
    if (isModalOpen && caInUse) {
      fetchTokenPrice(caInUse);
    }
  }, [isModalOpen, caInUse]);

  // Countdown timer effect
  useEffect(() => {
    if (!auctionDeadline) return;

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const remainingSeconds = auctionDeadline - now;

      if (remainingSeconds <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsAuctionActive(false); // Auction has ended
        return;
      }

      // Calculate days, hours, minutes, seconds
      const days = Math.floor(remainingSeconds / (24 * 60 * 60));
      const hours = Math.floor((remainingSeconds % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((remainingSeconds % (60 * 60)) / 60);
      const seconds = remainingSeconds % 60;

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    // Clean up on unmount
    return () => clearInterval(interval);
  }, [auctionDeadline]);

  useEffect(() => {
    if (address && auctionId !== null) {
      getAuctionBids();
      // getHistoricalBids();
    }
  }, [address, auctionId]);

  const handleSend = async () => {
    try {
      console.log("Sending transaction...", caInUse, usdcAmount);
      if (!caInUse) {
        setError("Token address not available");
        return;
      }
      if (usdcAmount <= 0) {
        setError("Amount must be greater than 0");
        return;
      }

      setIsLoading(true);
      
      // Get contract and prepare domain data
      let nonce: bigint;
      let domain: any = {};

      try {
        // First check if the user has enough tokens
        let tokenContract;
        if (currency === "USDC") {
          tokenContract = await getContract(caInUse, [...usdcAbi, "function balanceOf(address) view returns (uint256)"]);
        } else {
          tokenContract = await getContract(caInUse, erc20abi);
        }
        
        // Check balance
        const balance = await tokenContract?.balanceOf(address);
        const formattedBalance = currency === "USDC" 
          ? Number(balance) / 1e6 
          : Number(balance) / 1e18;
        
        console.log(`User ${currency} balance:`, formattedBalance);
        
        if (Number(balance) < Number(usdcAmount * (currency === "USDC" ? 1e6 : 1e18))) {
          setError(`Insufficient ${currency} balance. You have ${formattedBalance} ${currency}`);
          setIsLoading(false);
          return;
        }
        
        // Get token information for permit signature
        if (currency === "USDC") {
          const token = await getContract(caInUse, usdcAbi);
          const tokenName = await token?.name();
          const tokenVersion = (await token?.version()) || '1';
          nonce = BigInt(await token?.nonces(address));

          domain = {
            name: tokenName,
            version: tokenVersion,
            chainId: 8453,
            verifyingContract: caInUse,
          } as const;
          
          console.log("USDC Token details:", { tokenName, tokenVersion, nonce: nonce.toString() });
        } else {
          const token = await getContract(caInUse, erc20abi);
          nonce = BigInt(await token?.nonces(address));
          const fromContract = await token?.eip712Domain();
          
          domain = {
            name: fromContract.name,
            version: fromContract.version,
            chainId: 8453,
            verifyingContract: fromContract.verifyingContract,
          } as const;
          
          console.log("ERC20 Token details:", { 
            name: fromContract.name, 
            version: fromContract.version, 
            nonce: nonce.toString(),
            verifyingContract: fromContract.verifyingContract
          });
        }
      } catch (err) {
        console.error("Error getting token contract information:", err);
        setError("Failed to get token information. Please try again.");
        setIsLoading(false);
        return;
      }

      console.log("Generated domain:", domain);

      // Define EIP-2612 types
      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      } as const;

      // Calculate amount based on token decimals
      let sendingAmount: bigint;
      if (
        caInUse.toLowerCase() ===
        "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913".toLowerCase()
      ) {
        // USDC on Base has 6 decimals
        sendingAmount = BigInt(Math.round(usdcAmount * 1e6)); 
      } else {
        // Default to 18 decimals for other tokens
        sendingAmount = BigInt(Math.round(usdcAmount * 1e18)); 
      }

      console.log("Sending Amount:", sendingAmount.toString(), "to contract:", contractAdds.auction);

      // Set permit deadline to 1 hour from now
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

      // Prepare the permit message
      const message = {
        owner: address as `0x${string}`,
        spender: contractAdds.auction as `0x${string}`,
        value: sendingAmount,
        nonce,
        deadline,
      };

      console.log("Preparing to sign message:", message);

      // Sign the message with the wallet
      try {
        // First let's try to get the current highest bid to make sure our bid is higher
        const auctionContract = await getContract(contractAdds.auction, auctionAbi);
        const currentHighestBid = await auctionContract?.highestBid();
        console.log("Current highest bid from contract:", currentHighestBid.toString());
        
        if (sendingAmount <= currentHighestBid) {
          const formattedHighestBid = currency === "USDC" 
            ? Number(currentHighestBid) / 1e6 
            : Number(currentHighestBid) / 1e18;
          setError(`Bid must be higher than current highest bid (${formattedHighestBid} ${currency})`);
          setIsLoading(false);
          return;
        }

        // Sign the typed data for the permit function
        console.log("Requesting signature from wallet...");
        const signature = await signTypedDataAsync({
          domain,
          primaryType: "Permit",
          types,
          message,
        });
        
        const { v, r, s } = splitSignature(signature);
        console.log("Signature received successfully!");
        
        // Debug information - truncate the hex strings for readability
        console.log("Signature details:", { 
          v, 
          r: `${r.substring(0, 10)}...${r.substring(r.length - 8)}`, 
          s: `${s.substring(0, 10)}...${s.substring(s.length - 8)}`
        });

        // Prepare arguments for the contract call
        const bidPermitArgs = [sendingAmount, user?.fid, deadline, v, r, s];
        console.log("Preparing transaction with args:", [
          `Amount: ${sendingAmount.toString()}`, 
          `FID: ${user || 1129842}`, 
          `Deadline: ${deadline.toString()}`,
          `v: ${v}`, 
          `r: ${r.substring(0, 10)}...`, 
          `s: ${s.substring(0, 10)}...`
        ]);

        // Add a small delay before sending the transaction
        // This can help with some wallets that need time to process the signature
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log("Submitting transaction to contract:", contractAdds.auction);
        
        // Call contract with signed data - with explicit gas settings
        const tx = await writeContract(config, {
          abi: auctionAbi,
          address: contractAdds.auction as `0x${string}`,
          functionName: "bidWithPermit",
          args: bidPermitArgs,
          // Add gas settings to avoid transaction hanging
          gas: BigInt(500000), // Explicit gas limit
        });
        
        console.log("Transaction submitted:", tx);
        
        // Wait for transaction confirmation
        console.log("Waiting for transaction confirmation...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
        
        // Refresh auction bids
        await getAuctionBids();
        window.location.reload();
      } catch (err: any) {
        console.error("Error in signing or sending transaction:", err);
        
        // Provide more specific error messages based on the error
        if (err.message && err.message.includes("user rejected")) {
          setError("Transaction was rejected in your wallet");
        } else if (err.message && err.message.includes("deadline")) {
          setError("Transaction deadline has passed");
        } else if (err.message && err.message.includes("Bid not high enough")) {
          setError("Your bid is not high enough");
        } else if (err.message && err.message.includes("Auction has ended")) {
          setError("This auction has already ended");
        } else if (err.message && err.message.includes("insufficient funds")) {
          setError("You don't have enough funds for this transaction");
        } else if (err.message && err.message.includes("gas")) {
          setError("Gas estimation failed. Try a higher amount or check your wallet settings");
        } else {
          setError("Failed to sign or send transaction. Please try again.");
        }
        
        setIsLoading(false);
        return; // Stop execution here to prevent the finally block from closing the modal
      }
    } catch (error) {
      console.error("Error sending transaction:", error);
      setError("Transaction failed. Please try again.");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  if (address)
    return (
      <div className="mx-3 text-white">
        {loading
          ? null
          : uploadedImage && (
              <a href={url || "#"} target="_blank" rel="noopener noreferrer">
                <div className="relative">
                  <img
                    src={`${uploadedImage}?v=${Date.now()}`}
                    alt="Sponsor Banner"
                    className="mx-auto mt-4 h-[200px] w-full object-cover overflow-hidden rounded-lg shadow-xl shadow-red-600/20 active:scale-95  hover:scale-95 duration-200"
                  />
                  {url !== "#" && (
                    <span className="bg-black/50 text-sm absolute rounded-full text-white px-2 bottom-1 right-1 flex items-center justify-center gap-1">
                      <PiCursorClickFill /> Click for more info
                    </span>
                  )}
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
          className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 transition-opacity duration-300 ${
            isModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
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
                <li>Highest bidder will be contacted via Farcaster.</li>
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

              {highestBidder && (
                <div>
                  <label className="flex items-center text-md gap-1 font-bold ">
                    <RiAuctionFill className=" text-white text-xl" />
                    Current Highest Bid:
                  </label>
                  <div className=" my-4 px-2 py-4 bg-white/10 rounded-sm flex gap-2">
                    <span className="flex gap-1 w-[70%] truncate text-sm">
                      <Image
                        alt={highestBidder.username}
                        src={highestBidder.pfp_url}
                        width={24}
                        height={24}
                        className="rounded-full w-4 aspect-square"
                      />
                      {highestBidder.username}
                    </span>
                    <h4 className="font-bold w-[30%] text-right text-xs">
                      {Math.round(highestBidder.bidAmount).toLocaleString()} {currency}
                    </h4>
                  </div>
                  {/* {auctionDeadline && (
                  <div className="mt-2 bg-white/10 p-3 rounded-sm">
                    <div className="flex items-center gap-1 text-sm font-medium mb-1">
                      <RiTimerLine className="text-orange-400" />
                      <span>Auction ends in:</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-center">
                      <div className="bg-black/30 p-1 rounded">
                        <div className="text-lg font-bold">{timeRemaining.days}</div>
                        <div className="text-xs text-gray-400">Days</div>
                      </div>
                      <div className="bg-black/30 p-1 rounded">
                        <div className="text-lg font-bold">{timeRemaining.hours}</div>
                        <div className="text-xs text-gray-400">Hours</div>
                      </div>
                      <div className="bg-black/30 p-1 rounded">
                        <div className="text-lg font-bold">{timeRemaining.minutes}</div>
                        <div className="text-xs text-gray-400">Mins</div>
                      </div>
                      <div className="bg-black/30 p-1 rounded">
                        <div className="text-lg font-bold">{timeRemaining.seconds}</div>
                        <div className="text-xs text-gray-400">Secs</div>
                      </div>
                    </div>
                  </div>
                )} */}

                </div>
              )}

              {inputVisible ? (
                <div className="mt-4">
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder={`Enter ${currency} Amount`}
                      value={usdcAmount === 0 ? "" : usdcAmount} // Ensure initial 0 is not displayed
                      onChange={(e) => {
                        const value = Math.floor(Number(e.target.value)); // Ensure whole number
                        setUsdcAmount(value);
                        setError("");
                      }}
                    />
                    {tokenPrice !== null && (
                      <div className="absolute right-3 top-2 text-xs bg-black/70 px-2 py-1 rounded text-white/80">
                        {tokenPriceLoading ? (
                          <span className="flex items-center">
                            <RiLoader5Fill className="animate-spin mr-1" />
                            Loading...
                          </span>
                        ) : (
                          <div>
                            <span className="flex items-center">
                              1 {currency} ≈ ${tokenPrice.toFixed(2)} USD
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (caInUse) fetchTokenPrice(caInUse);
                                }}
                                className="ml-1 text-blue-400 hover:text-blue-300"
                              >
                                ↻
                              </button>
                            </span>
                            {usdcAmount > 0 && (
                              <span className="block text-green-400">
                                ≈ ${(usdcAmount * tokenPrice).toFixed(2)} USD
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                  )}
                  <button
                    type="button"
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg w-full mt-2 flex items-center justify-center"
                    onClick={() => {
                      if (usdcAmount <= (highestBidder?.bidAmount || 0)) {
                        setError(
                          `Bid amount must be higher than the current highest bid.`
                        );
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
              ) : (
                <button
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
                </button>
              )}
            </>
          </div>
        </div>

        <div className="mt-6 text-white">
          <div className="flex items-center">
            <h3 className="text-xl font-bold w-[70%]">
              {isAuctionActive
                ? `Auction ${auctionId && `#${auctionId}`} - ${currency}`
                : "No Active Auction"}
              {tokenPrice !== null && isAuctionActive && (
                <div className="text-xs font-normal text-gray-400 mt-1">
                  {tokenPriceLoading ? (
                    <span className="flex items-center">
                      <RiLoader5Fill className="animate-spin mr-1" />
                      Loading price...
                    </span>
                  ) : (
                    <span>Current rate: 1 {currency} ≈ ${tokenPrice.toFixed(2)} USD</span>
                  )}
                </div>
              )}
            </h3>
            <div className="w-[30%] flex justify-end">
              {isAuctionActive && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gradient-to-br w-full h-10 from-emerald-700 via-green-600 to-emerald-700 font-bold text-white py-1 rounded-md flex gap-2 justify-center items-center text-xl"
                  disabled={!isAuctionActive}
                >
                  <RiAuctionFill className="text-white text-xl" /> Bid
                </button>
              )}
            </div>
          </div>

          {/* Countdown Timer for Mobile View */}
          {isAuctionActive && auctionDeadline && !isFetchingBidders && (
            <div className="mt-4 bg-black/30 rounded-lg">
              <div className="flex items-center gap-1 text-sm font-medium mb-2">
                <RiTimerLine className="text-orange-400" />
                <span>Auction ends in:</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-black/50 p-2 rounded">
                  <div className="text-xl font-bold">{timeRemaining.days}</div>
                  <div className="text-xs text-gray-400">Days</div>
                </div>
                <div className="bg-black/50 p-2 rounded">
                  <div className="text-xl font-bold">{timeRemaining.hours}</div>
                  <div className="text-xs text-gray-400">Hours</div>
                </div> 
                <div className="bg-black/50 p-2 rounded">
                  <div className="text-xl font-bold">
                    {timeRemaining.minutes}
                  </div>
                  <div className="text-xs text-gray-400">Mins</div>
                </div>
                <div className="bg-black/50 p-2 rounded">
                  <div className="text-xl font-bold">
                    {timeRemaining.seconds}
                  </div>
                  <div className="text-xs text-gray-400">Secs</div>
                </div>
              </div>
            </div>
          )}

          {!isAuctionActive ? (
            <div className="mt-4 bg-white/10 rounded-lg flex items-center justify-center h-20">
              <p className="text-white/70">Auction not started yet.</p>
            </div>
          ) : isFetchingBidders ? (
            <div className="flex justify-center items-center h-20">
              <RiLoader5Fill className="animate-spin text-white text-3xl" />
            </div>
          ) : bidders.length > 0 ? (
            <table className="w-full text-left border-collapse mt-4">
              <thead>
                <tr className="border-b border-white/30 text-red-300">
                  <th className="py-2 ">Profile</th>
                  <th className="py-2 text-right ">Bid Amount</th>
                </tr>
              </thead>
              <tbody>
                {bidders.map((bidder, index) => (
                  <tr key={index} className="border-b border-white/10">
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
                    <td className="py-2 text-right font-bold text-sm">
                      {Math.round(bidder.bidAmount).toLocaleString()} {currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="mt-4 bg-white/10 rounded-lg flex items-center justify-center h-20">
              <p className="text-white/70">No bids placed yet.</p>
            </div>
          )}
        </div>
      </div>
    );
}
