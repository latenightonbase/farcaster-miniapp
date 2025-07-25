import React, { useState } from "react";
import { CustomConnect } from "./UI/connectButton";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { MdDone } from "react-icons/md";
import { RiLoader5Fill, RiMoneyDollarCircleLine } from "react-icons/ri";

const Tipping = () => {
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { address } = useAccount();

  const getTickerPrice = async () => {
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

  const handleSend = async () => {
    try {
      setIsLoading(true);
      setIsSuccess(false);

      const ethPrice = await getTickerPrice();
      const ethAmount = Number(amount.toFixed(2)) / ethPrice;

      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        console.log(
          `Sending ${ethAmount} ETH to 0xC07f465Cb788De0088E33C03814E2c550dBe33db`
        );

        const tx = await signer.sendTransaction({
          to: "0xC07f465Cb788De0088E33C03814E2c550dBe33db",
          value: ethers.utils.parseEther(ethAmount.toFixed(6)),
        });

        await tx.wait();
        console.log("Transaction sent:", tx);
        setIsSuccess(true);

        setTimeout(() => {
          setIsDropdownOpen(false);
          setIsLoading(false);
          setAmount(0);
          setCustomAmount(null);
          setIsSuccess(false);
        }, 2000);
      } else {
        console.error("Ethereum wallet not found");
        setIsDropdownOpen(false);
      }
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
      <div className="flex items-center gap-2 text-white">
        <h3 className="text-xs self-center mr-2 text-gray-400">
          This stream was free. My gambling problem isn&apos;t. Want to Tip me?
        </h3>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="bg-orange-600 text-center w-fit py-2 px-4 rounded-full text-sm text-nowrap font-bold text-white flex items-center justify-center gap-1 hover:bg-orange-700"
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
        className={`h-screen w-screen fixed animate-rise top-0 left-0 duration-200 transition-all bg-black/50 ${
          isDropdownOpen ? " translate-y-0 " : " translate-y-full"
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
                          amount == value ? "bg-orange-500" : "bg-gray-800"
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
                      className="bg-gray-800 text-white py-2 px-4 rounded-lg font-bold hover:bg-orange-600 transition"
                    >
                      ...
                    </button>
                  </div>
                  {customAmount !== null && (
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        setAmount(Number(e.target.value));
                      }}
                      onKeyDown={(e) => {
                        if (amount === 0 && ((e.key >= '0' && e.key <= '9') || e.key === '.')) {
                          setAmount(e.key === '.' ? 0 : Number(e.key));
                          e.preventDefault();
                        }
                      }}
                      placeholder="Enter custom amount"
                      className="border border-gray-600 bg-gray-800 text-white p-3 rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                    />
                  )}
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
