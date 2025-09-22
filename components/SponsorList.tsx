import { useState, useEffect } from "react";
import { FaBullhorn } from "react-icons/fa";
import { X } from "lucide-react";
import axios from "axios";
import { BigNumber, ethers } from "ethers";

import { HiSpeakerphone } from "react-icons/hi";
import { useSignTypedData } from "wagmi";
import { splitSignature } from "ethers/lib/utils";
import { useAccount, useSendTransaction } from "wagmi";
import { withPaymentInterceptor } from "x402-axios";
import { RiAuctionFill, RiLoader5Fill, RiTimerLine } from "react-icons/ri";
import { PiCursorClickFill } from "react-icons/pi";
import { encodeFunctionData, numberToHex } from "viem";
import { config } from "@/utils/rainbow";
import { writeContract } from "@wagmi/core";
import { usdcAbi } from "@/utils/contract/abis/usdcabi";
import { contractAdds } from "@/utils/contract/contractAdds";
import { auctionAbi } from "@/utils/contract/abis/auctionAbi";
import { useGlobalContext } from "@/utils/globalContext";
import Image from "next/image";
import { erc20Abi } from "@/utils/contract/abis/erc20abi";
import {
  createBaseAccountSDK,
  getCryptoKeyAccount,
  base,
} from "@base-org/account";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { CustomConnect } from "./UI/connectButton";

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

  const { context, isFrameReady } = useMiniKit();

  const localerc20Abi = [
    {
      name: "approve",
      type: "function",
      stateMutability: "nonpayable",
      inputs: [
        { name: "spender", type: "address" },
        { name: "amount", type: "uint256" },
      ],
      outputs: [{ name: "", type: "bool" }],
    },
  ];

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

      // Fetch token price after getting the contract address
      if (auctionMeta.caInUse) {
        fetchTokenPrice(auctionMeta.caInUse);
      }
    } catch (error) {
      console.error("Error getting auction ID:", error);
      setIsAuctionActive(false);
    }
  }

  // Function to fetch token price using Alchemy's Token Prices API
  const fetchTokenPrice = async (contractAddress: string) => {
    try {
      setTokenPriceLoading(true);

      // Using Alchemy Token Prices API
      // https://www.alchemy.com/docs/data/prices-api/prices-api-endpoints/prices-api-endpoints/get-token-prices-by-address

      const apiUrl = `https://api.dexscreener.com/tokens/v1/base/${contractAddress}`;

      const response = await fetch(apiUrl);

      const usableResponse = await response.json();
      console.log(Number(usableResponse[0].priceUsd));
      setTokenPrice(Number(usableResponse[0].priceUsd));
    } catch (error) {
      console.error("Error fetching token price:", error);
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
            fid: user?.fid || 0,
            bidAmount:
              currency == "USDC"
                ? ethers.utils.formatUnits(String(bid.bidAmount), 6)
                : ethers.utils.formatUnits(String(bid.bidAmount), 18),
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
      // Initial validation
      if (!caInUse) {
        return;
      }
      if (usdcAmount <= 0) {
        return;
      }

      setIsLoading(true);

      const provider = createBaseAccountSDK({
        appName: "Bill test app",
        appLogoUrl: "https://farcaster-miniapp-chi.vercel.app/pfp.jpg",
        appChainIds: [base.constants.CHAIN_IDS.base],
      }).getProvider();

      // Check if USDC address to determine decimals
      const isUSDC =
        caInUse.toLowerCase() ===
        "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913".toLowerCase();
      const decimals = isUSDC ? 6 : 18;

      try {
        // Check if we're using a specific client FID
        if (context?.client.clientFid !== 309857) {
          // Standard wallet flow with permit
          let token, nonce, domain;

          try {
            // Get token contract and domain data - different handling for USDC vs other ERC20
            if (currency === "USDC") {
              token = await getContract(caInUse, usdcAbi);
              const tokenName = await token?.name();
              const tokenVersion = (await token?.version()) || "1";
              nonce = Number(await token?.nonces(address));

              domain = {
                name: tokenName,
                version: tokenVersion,
                chainId: 8453,
                verifyingContract: caInUse,
              } as const;
            } else {
              token = await getContract(caInUse, erc20Abi);
              nonce = Number(await token?.nonces(address));
              const fromContract = await token?.eip712Domain();

              domain = {
                name: fromContract.name,
                version: fromContract.version,
                chainId: 8453,
                verifyingContract: fromContract.verifyingContract,
              } as const;
            }
          } catch (err) {
            console.error("Error getting token contract information:", err);
            setIsLoading(false);
            return;
          }

          // Prepare permit data
          const types = {
            Permit: [
              { name: "owner", type: "address" },
              { name: "spender", type: "address" },
              { name: "value", type: "uint256" },
              { name: "nonce", type: "uint256" },
              { name: "deadline", type: "uint256" },
            ],
          } as const;

          // Calculate amount with proper decimals
          const sendingAmount = BigInt(Math.round(usdcAmount * 10 ** decimals));

          console.log(
            "Sending Amount:",
            sendingAmount.toString(),
            "to contract:",
            contractAdds.auction
          );

          // Check if bid is high enough
          const auctionContract = await getContract(
            contractAdds.auction,
            auctionAbi
          );
          const currentHighestBid = await auctionContract?.highestBid();
          console.log(
            "Current highest bid from contract:",
            currentHighestBid.toString()
          );

          if (sendingAmount <= currentHighestBid) {
            const formattedHighestBid =
              Number(currentHighestBid) / 10 ** decimals;
            setError(
              `Bid must be higher than current highest bid (${formattedHighestBid} ${currency})`
            );
            setIsLoading(false);
            return;
          }

          // Set permit deadline to 1 hour from now
          const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

          // Prepare the permit message
          const message = {
            owner: address as `0x${string}`,
            spender: contractAdds.auction as `0x${string}`,
            value: sendingAmount,
            nonce: BigInt(nonce),
            deadline,
          };

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

          // Prepare arguments for the contract call
          const bidPermitArgs = [sendingAmount, user?.fid, deadline, v, r, s];

          // Small delay to help wallets process the signature
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Call contract with signed data
          const tx = await writeContract(config, {
            abi: auctionAbi,
            address: contractAdds.auction as `0x${string}`,
            functionName: "bidWithPermit",
            args: bidPermitArgs,
            gas: BigInt(500000), // Explicit gas limit
          });

          console.log("Transaction submitted:", tx);

          // Wait for transaction confirmation
          await new Promise((resolve) => setTimeout(resolve, 5000));
        } else {
          // Special client flow with multi-call transaction
          // Calculate amount with proper decimals using ethers library
          const sendingAmount = ethers.utils.parseUnits(
            Math.round(usdcAmount).toString(),
            decimals
          );

          // Prepare multicall data
          const calls = [
            {
              to: caInUse,
              value: "0x0",
              data: encodeFunctionData({
                abi: localerc20Abi,
                functionName: "approve",
                args: [contractAdds.auction, sendingAmount],
              }),
            },
            {
              to: contractAdds.auction,
              value: "0x0",
              data: encodeFunctionData({
                abi: auctionAbi,
                functionName: "placeBid",
                args: [sendingAmount, user?.fid],
              }),
            },
          ];

          const cryptoAccount = await getCryptoKeyAccount();
          const fromAddress = cryptoAccount?.account?.address;

          const result = await provider.request({
            method: "wallet_sendCalls",
            params: [
              {
                version: "2.0.0",
                from: fromAddress,
                chainId: numberToHex(base.constants.CHAIN_IDS.base),
                atomicRequired: true,
                calls: calls,
              },
            ],
          });

          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        try {
          await fetch("/api/notification", {
            method: "POST",
            body: JSON.stringify({
              fid: highestBidder.fid, // Replace with actual fid if available
              notification: {
                title: "You just got outbid!",
                body: `Your bid of ${highestBidder.bidAmount} ${currency} has been surpassed by ${user?.username}. Place a higher bid to reclaim your position!`,
              },
            }),
          });
        } catch (err) {
          console.log("Error sending outbid notification:", err);
        }

        // Refresh auction bids and reload the page
        await getAuctionBids();
        window.location.reload();
      } catch (err: any) {
        console.error("Error in signing or sending transaction:", err);

        // Map common error messages to user-friendly messages
        const errorMessages: Record<string, string> = {
          "user rejected": "Transaction was rejected in your wallet",
          deadline: "Transaction deadline has passed",
          "Bid not high enough": "Your bid is not high enough",
          "Auction has ended": "This auction has already ended",
          "insufficient funds":
            "You don't have enough funds for this transaction",
          gas: "Gas estimation failed. Try a higher amount or check your wallet settings",
          signature: "Error with signature. Please try again.",
          "EIP-1271": "Smart wallet signature verification failed",
        };

        // Find matching error or use generic message
        const errorKey = Object.keys(errorMessages).find(
          (key) => err.message && err.message.includes(key)
        );

        setIsLoading(false);
        return; // Stop execution here to prevent the finally block from closing the modal
      }
    } catch (error: any) {
      console.error("Error sending transaction:", error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  function encodeSafeTx(to: string, value: number | string, data: string) {
    const valueHex = ethers.utils.hexZeroPad(ethers.utils.hexlify(value), 32);
    const dataLength = ethers.utils.hexZeroPad(
      ethers.utils.hexlify(ethers.utils.arrayify(data).length),
      32
    );
    return ethers.utils.hexConcat([to, valueHex, dataLength, data]);
  }

    return (
      <>
      <div
          className={`fixed left-0 top-0 w-screen inset-0 bg-black/80 flex items-center justify-center z-[1000000] transition-opacity duration-300 ${
            isModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="bg-black mx-2 border-y-2 border-bill-pink p-6 rounded-lg w-96 text-white relative">
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

              {highestBidder && (
                <div>
                  <label className="flex items-center text-md gap-1 font-bold ">
                    <RiAuctionFill className=" text-white text-xl" />
                    Current Highest Bid:
                  </label>
                  <div className=" my-4 px-2 py-4 bg-white/10 rounded-sm flex gap-2">
                    <span className="flex gap-3 w-[60%] items-center truncate text-xs">
                      <Image
                        alt={highestBidder.username}
                        src={highestBidder.pfp_url}
                        width={24}
                        height={24}
                        className="rounded-full w-6 aspect-square"
                      />
                      {highestBidder.username}
                    </span>
                    <h4 className="font-bold w-[40%] my-auto text-right text-xs">
                      {Math.round(highestBidder.bidAmount).toLocaleString()}{" "}
                      {currency}
                    </h4>
                  </div>
                </div>
              )}

              {inputVisible ? (
                <div className="mt-2">
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
                    {tokenPrice && (
                      <span className="text-xs text-gray-400 mb-2">
                        ≈ {(usdcAmount * tokenPrice).toFixed(8)} USD
                      </span>
                    )}
                    
                  </div>
                  {error && (
                    <p className="text-bill-blue text-sm mt-2">{error}</p>
                  )}

                  <button
                    type="button"
                    className="bg-bill-pink text-white px-4 py-2 rounded-lg w-full mt-2 flex items-center justify-center"
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
                  className="bg-bill-pink text-white px-4 py-2 rounded-lg w-full flex items-center justify-center"
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
        <div className=" text-white relative px-3">
        {/* SponsorBanner component is now being used in page.tsx directly */}

        <div className="mt-6 text-white">
          <div className="flex items-center">
            <h3 className="text-xl font-bold w-[70%]">
              {isAuctionActive
                ? `Auction ${auctionId && `#${auctionId}`} - ${currency}`
                : "No Active Auction"}
              {/* {tokenPrice !== null && isAuctionActive && (
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
              )} */}
            </h3>
            <div className="w-[30%] flex justify-end">
              {isAuctionActive && (
                <>{
                  address ? 
                  <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-bill-pink w-full h-10  font-bold text-white py-1 rounded-md flex gap-2 justify-center items-center text-xl"
                  disabled={!isAuctionActive}
                >
                  <RiAuctionFill className="text-white text-xl" /> Bid
                </button>
                  : <CustomConnect/>
                }
                
                </>
                
              )}
            </div>
          </div>
          
          {/* Highest Bidder Display */}
          {isAuctionActive && highestBidder && !isFetchingBidders && (
            <div className="mt-4 bg-white/10 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <RiAuctionFill className="text-bill-pink text-xl" />
                <span className="font-medium">Current Highest Bid:</span>
              </div>
              <div className="flex flex-col items-center justify-between bg-black/30 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <Image
                    alt={highestBidder.username}
                    src={highestBidder.pfp_url}
                    width={32}
                    height={32}
                    className="rounded-full w-8 h-8"
                  />
                  <span className="font-medium">{highestBidder.username}</span>
                </div>
                <div className="font-bold text-lg text-bill-pink">
                  {Math.round(highestBidder.bidAmount).toLocaleString()} {currency}
                </div>
              </div>
            </div>
          )}
          
          {/* Countdown Timer for Mobile View */}
          {isAuctionActive && auctionDeadline && !isFetchingBidders && (
            <div className="mt-4  rounded-lg">
              <div className="flex items-center gap-1 text-sm font-medium mb-2">
                <RiTimerLine className="text-bill-pink" />
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
                  <div className="text-xl font-bold text-bill-pink">
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
                <tr className="border-b border-white/30 text-bill-pink">
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
      </>
      
    );
}
