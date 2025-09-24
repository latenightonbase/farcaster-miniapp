"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { FaQrcode, FaCoins, FaTrophy, FaUserFriends } from "react-icons/fa";

export default function ScanToEarnPage() {
  const [isQrVisible, setIsQrVisible] = useState(false);

  const toggleQrCode = () => {
    setIsQrVisible(!isQrVisible);
  };

  return (
    <div className="container mx-auto px-4 pt-24 lg:pt-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Scan to Earn Rewards</h1>
        
        <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 lg:p-8 shadow-lg border border-bill-pink/30 mb-10">
          {/* Hero Section */}
          <div className="flex flex-col items-center mb-10 text-center">
            {/* <div className="relative w-40 h-40 mb-6">
              <Image 
                src="/spike.svg" 
                alt="Scan to Earn" 
                fill
                className="object-contain"
              />
            </div> */}
            <h2 className="text-2xl font-bold text-bill-pink mb-3">Earn Rewards by Scanning QR Codes</h2>
            {/* <p className="text-gray-200 max-w-xl">
              Participate in our Scan to Earn program and collect rewards, unlock exclusive content, and climb the leaderboard!
            </p> */}
          </div>
          
          {/* How It Works */}
          <div className="mb-6">
            {/* <h2 className="text-2xl font-bold text-bill-pink mb-6 text-center">How It Works</h2> */}
            
            <div className="">
              <div className="flex flex-col items-center text-center">
                <FaQrcode className="text-bill-pink text-4xl mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Scan QR Codes</h3>
                <p className="text-gray-300">Participate in our scan to earn program and collect LNOB rewards and climb the leaderboard for engaging with the winning brand</p>
              </div>

              <div className="flex flex-col items-center text-center justify-center animate-pulse mt-10 h-20 rounded-lg bg-black/40">
                
                <h3 className="text-xl font-semibold text-white mb-2 opacity-40">Coming Soon!</h3>
              </div>
              
              {/* <div className="bg-black/40 p-6 rounded-lg border border-white/10 flex flex-col items-center text-center">
                <FaCoins className="text-bill-pink text-4xl mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">2. Engage</h3>
                <p className="text-gray-300">Each scan earns you points that accumulate in your profile</p>
              </div>
               */}
              {/* <div className="bg-black/40 p-6 rounded-lg border border-white/10 flex flex-col items-center text-center">
                <FaTrophy className="text-bill-pink text-4xl mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">3. Climb the Leaderboard</h3>
                <p className="text-gray-300">Compete with others and rise through the ranks</p>
              </div>
              
              <div className="bg-black/40 p-6 rounded-lg border border-white/10 flex flex-col items-center text-center">
                <FaUserFriends className="text-bill-pink text-4xl mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">4. Unlock Rewards</h3>
                <p className="text-gray-300">Redeem your points for exclusive perks, content, or auction bonuses</p>
              </div> */}
            </div>
          </div>
          
          {/* Scan Now Section */}
          <div className="flex flex-col items-center">
            
            
            {/* <p className="text-gray-300 text-center max-w-md">
              Keep an eye on our social media and attend our events to find more QR codes and earn additional rewards!
            </p> */}
          </div>
        </div>
      </div>
    </div>
  );
}