import React, { useState } from "react";
import { CustomConnect } from "./UI/connectButton";
import { ethers } from "ethers";
import { useAccount, useSendTransaction } from "wagmi";
import { MdDone } from "react-icons/md";
import { RiLoader5Fill, RiMoneyDollarCircleLine } from "react-icons/ri";
import { writeContract } from "@wagmi/core";
import { config } from "@/utils/rainbow";
import { resourceLimits } from "worker_threads";
import { useNotification } from "@coinbase/onchainkit/minikit";

const Tipping = () => {
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currency, setCurrency] = useState<"ETH" | "USDC">("ETH");

  const { address } = useAccount();
  const { sendTransaction, data: hash } = useSendTransaction();

    const sendNotification = useNotification();
  
  // Usage
  const handleSendNotification = async () => {
    await sendNotification({
      title: 'Thank you for the tip!',
      body: 'Appreciate your support!',
    });

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

  const handleSend = async () => {
    try {
      setIsLoading(true);
      setIsSuccess(false);

      let cryptoAmount;
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

        setIsSuccess(true)
      } else {
        await writeContract(config, {
          abi: ERC20_ABI,
          address: USDC_CONTRACT_ADDRESS,
          functionName: "transfer",
          args: [
            "0xC07f465Cb788De0088E33C03814E2c550dBe33db",
            ethers.utils.parseUnits(cryptoAmount.toFixed(6), 6), // USDC has 6 decimals
          ],
        });
      }

      setIsSuccess(true);

      setTimeout(() => {
        setIsDropdownOpen(false);
        setIsLoading(false);
        setAmount(0);
        setCustomAmount(null);
        setIsSuccess(false);
        handleSendNotification()
      }, 2000);
    } catch (error) {
      console.error("Error sending transaction:", error);
      setIsDropdownOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 bg-gradient-to-b from-transparent via-black/80 to-black p-4 pt-20 w-full flex justify-between`}
    >
      <div className="flex items-center gap-2 text-white w-full">
        
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="bg-orange-600 text-center w-full mb-2 py-2 px-4 rounded-full text-lg text-nowrap font-bold text-white flex items-center justify-center gap-1 hover:bg-orange-700"
        >
          <RiMoneyDollarCircleLine
            color="white"
            size={20}
            className="inline-block"
          />{" "}
          Tip the Degen
        </button>
      </div>

      <div
        className={`h-screen w-screen fixed animate-rise top-0 left-0 duration-200 transition-all ${
          isDropdownOpen ? " translate-y-0 bg-black/50 " : " translate-y-full bg-transparent"
        } `}
      >
        <div
          className={`absolute bottom-0 border-t-2 border-orange-700 min-h-60 bg-gradient-to-b from-orange-950 to-black w-screen rounded-t-lg  items-start shadow-xl bg-opacity-50 flex justify-center transition-all duration-500  z-50 ${
            isDropdownOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className=" p-6 rounded-lg w-11/12 max-w-md shadow-2xl transform transition-transform scale-100 animate-fade-in relative">
            <button
              onClick={() => setIsDropdownOpen(false)}
              className="absolute top-3 right-3 text-white text-2xl font-bold hover:text-orange-500 transition-colors"
            >
              &times;
            </button>

            <div className="mt-5 flex flex-col items-center">
              {!address ? (
                <CustomConnect />
              ) : (
                <div className="w-full">
                  <h2 className="text-white text-2xl font-semibold mb-4 text-center">
                    Thank you!
                  </h2>
                  <p className="text-gray-300 text-sm mb-6 text-center">
                    Choose an amount to tip:
                  </p>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[3, 5, 8, 10, 12].map((value) => (
                      <button
                        key={value}
                        onClick={() => {
                          console.log(`Selected amount: ${value}`);
                          setAmount(value);
                          setCustomAmount(null);
                        }}
                        className={` text-white py-2 px-4 rounded-lg font-bold transition ${
                          amount == value ? "bg-orange-500" : "bg-orange-950/50"
                        } hover:bg-orange-600`}
                      >
                        ${value}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setAmount(0);
                        setCustomAmount(0);
                      }}
                      className="bg-orange-950/50 text-white py-2 px-4 rounded-lg font-bold hover:bg-orange-600 transition"
                    >
                      ...
                    </button>
                  </div>
                  {customAmount !== null && (
                    <div className="flex items-center gap-1">
                      <span className="h-full text-orange-500 mb-4 text-xl">
                        $
                      </span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => {
                          setAmount(Number(e.target.value));
                        }}
                        onKeyDown={(e) => {
                          if (
                            amount === 0 &&
                            ((e.key >= "0" && e.key <= "9") || e.key === ".")
                          ) {
                            setAmount(e.key === "." ? 0 : Number(e.key));
                            e.preventDefault();
                          }
                        }}
                        placeholder="Enter custom amount"
                        className=" bg-orange-950/50 text-white p-3 rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                      />
                    </div>
                  )}
                  <span className="text-sm text-gray-300">
                    Choose Currency:
                  </span>
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
                    onClick={handleSend}
                    disabled={isLoading}
                    className={` ${
                      isSuccess ? "bg-green-600" : "bg-orange-500"
                    } text-center px-4 py-2 rounded text-lg font-bold text-white w-full hover:opacity-90 transition-opacity ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? (
                      <RiLoader5Fill className="animate-spin text-2xl mx-auto" />
                    ) : isSuccess ? (
                      <MdDone className="text-2xl mx-auto" />
                    ) : (
                      "Confirm Tip"
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tipping;
