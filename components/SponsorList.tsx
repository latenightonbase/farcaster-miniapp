import { useState, useEffect } from "react";
import { FaBullhorn } from "react-icons/fa";
import { X } from "lucide-react";
import axios from "axios";
import { ethers } from "ethers";

import { HiSpeakerphone } from "react-icons/hi";

import { useAccount, useSendTransaction } from "wagmi";
import { withPaymentInterceptor } from "x402-axios";
import { RiLoader5Fill } from "react-icons/ri";

import { createWalletClient, viemConnector } from "@farcaster/auth-client";
import { config } from "@/utils/rainbow";
import { writeContract } from "@wagmi/core";
import { sponsorPrice } from "@/utils/constants";

export default function AddBanner() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [metaValue, setMetaValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(true); // Added loading state
  const [currency, setCurrency] = useState<"ETH" | "USDC">("USDC"); // Added state for currency
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [amount, setAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { sendTransaction, data: hash } = useSendTransaction();

  const { address } = useAccount();

  const USDC_CONTRACT_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Mainnet USDC address
  const ERC20_ABI = [
    {
      inputs: [
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "transfer",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  useEffect(() => {
    const fetchSponsorImage = async () => {
      try {
        const response = await axios.get("/api/getImage");

        if (response.status === 200 && response.data.imageUrl) {
          setUploadedImage(response.data.imageUrl);
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

    const fetchMetaValue = async () => {
      try {
        console.log("Fetching meta value...");
        const response = await axios.get("/api/getPrice");

        console.log(response);

        if (response.status === 200 && response.data.meta) {
          setMetaValue(response.data.meta.meta_value);
        } else {
          setMetaValue(null);
        }
      } catch (error) {
        console.error("Error fetching meta value:", error);
        setMetaValue(null);
      }
    };

    fetchSponsorImage();
    fetchMetaValue();
  }, []);

  const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedImage(file);
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setPreviewImage(null);
    }
  };

  const getEthPrice = async () => {
    try {
      const url =
        "https://api.g.alchemy.com/prices/v1/CA4eh0FjTxMenSW3QxTpJ7D-vWMSHVjq/tokens/by-symbol?symbols=ETH";
      const headers = {
        Accept: "application/json",
      };

      const priceFetch = await fetch(url, {
        method: "GET",
        headers: headers,
      });

      const priceBody = await priceFetch.json();
      console.log(priceBody.data[0]);
      console.log(priceBody.data[0].prices[0]);
      console.log(priceBody.data[0].prices[0].value);

      return priceBody.data[0].prices[0].value;
    } catch (error) {
      console.error("Error", error);
      throw error;
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    setSelectedImage(file);
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSendNotification = () => {
    console.log("Notification sent");
  };

  const handleSend = async () => {
    try {
      setIsLoading(true);
      setIsSuccess(false);

      let cryptoAmount = metaValue;
      if (currency === "ETH") {
        const ethPrice = await getEthPrice();
        cryptoAmount = Number(amount.toFixed(2)) / ethPrice;
      } else {
        const usdcPrice = 1;
        cryptoAmount = Number(amount.toFixed(2)) / usdcPrice;
      }

      if (currency === "ETH") {
        console.log(
          `Sending ${cryptoAmount} ${currency} to 0xC07f465Cb788De0088E33C03814E2c550dBe33db`
        );

        const transactionConfig = {
          to: "0xC07f465Cb788De0088E33C03814E2c550dBe33db" as `0x${string}`,
          value: BigInt(
            ethers.utils.parseEther(cryptoAmount.toFixed(6)).toString()
          ),
        };

        sendTransaction(transactionConfig);
        setIsSuccess(true);
      } else {
        const result = await writeContract(config, {
          abi: ERC20_ABI,
          address: USDC_CONTRACT_ADDRESS,
          functionName: "transfer",
          args: [
            "0xC07f465Cb788De0088E33C03814E2c550dBe33db",
            ethers.utils.parseUnits(cryptoAmount.toFixed(6), 6), // USDC has 6 decimals
          ],
        });
        
        setIsSuccess(true);
      }
    } catch (error) {
      console.error("Error sending transaction:", error);
      setIsDropdownOpen(false);
      throw error;
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  if (address)
    return (
      <div>
        {loading ? null : uploadedImage ? (
          <img
            src={uploadedImage}
            alt="Sponsor Banner"
            className="w-[300px] h-[100px] mx-auto mt-4 object-cover overflow-hidden rounded-lg"
          />
        ) : (
          <div
            className="flex items-center justify-start border border-white/30 rounded-lg bg-gradient-to-br from-emerald-600 to-green-500 p-3 mx-3 cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <HiSpeakerphone className="text-white mr-2 -rotate-12" size={24} />
            <div>
              <h2 className="text-white text-xl font-bold">SPONSORED SLOT</h2>
              <h3 className="text-sm text-white">Sponsor this spot</h3>
            </div>
          </div>
        )}

        <div
          className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 transition-opacity duration-300 ${
            isModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="bg-gradient-to-b from-black to-orange-950 border-y-2 border-orange-500 p-6 rounded-lg w-96 text-white relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-400"
            >
              <X size={24} />
            </button>
            <h2 className="text-lg font-bold mb-4">Upload Banner</h2>
       
           
            {!uploadedImage && (
              <>
                <ul className="text-gray-400 text-sm list-disc ml-5 mb-5">
                  <li>
                    DM the image to <a className="text-orange-500 underline" href="https://farcaster.xyz/latenightonbase" >Bill the Bull</a>
                  </li>
                  <li>Once set, the image will be visible on the miniapp for 24 hours</li>
                  <li>Image must be 1500x500 dimensions for best visibility</li>
                  <li>
                    This action will cost ${metaValue}
                  </li>
                </ul>

                <div className="flex mt-2 gap-2 mb-4 text-sm">
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
                </div>

                <button
                  type="button"
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg w-full flex items-center justify-center"
                  onClick={handleSend}
                  disabled={isLoading}
                >
                  {!isLoading ? (
                    "Proceed to Payment"
                  ) : (
                    <>
                      <RiLoader5Fill className="animate-spin mr-2" />
                      Loading...
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
}
