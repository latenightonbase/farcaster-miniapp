"use client";
import { ProfileSection } from "@/components/ProfileSection";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaYoutube } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { SiTwitch } from "react-icons/si";
import YouTubeLivestreamFetcher from "@/components/YTHandler";
import TwitchStreamFetcher from "@/components/TwitchHandler";
import TwitterFetcher from "@/components/TwitterHandler";
import Background from "@/components/UI/Background";
import DailyUpdate from "@/components/DailyUpdate";

export default function Home() {
  const [activeTab, setActiveTab] = useState("youtube");

  async function initSdk() {
    const { sdk } = await import("@farcaster/miniapp-sdk");
    await sdk.actions.ready();
  }

  useEffect(() => {
    initSdk();
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <main>
        <Background selected={activeTab} />
        <div className="relative z-1 min-h-screen">
        <ProfileSection />

        <DailyUpdate/>
        {/* Conditional Rendering */}
        <div className="mt-6">
          {activeTab === "youtube" && <YouTubeLivestreamFetcher />}
          {activeTab === "twitch" && <TwitchStreamFetcher />}
        </div>

        
        </div>
        <div className="flex w-screen mx-auto justify-center space-x-4 mt-6 fixed z-50 bottom-10">
          <div className="bg-white/20 flex gap-2 p-2 rounded-sm">
            <button
              className={`px-5 py-1 rounded-sm duration-200 transition-colors ${
                activeTab === "youtube" ? "border-white border-2 text-white bg-red-500 shadow-md shadow-red-500/40 " : "border-white/30 border-2 text-white/30 "
              }`}
              onClick={() => setActiveTab("youtube")}
            >
              <FaYoutube size={24} className="" />
            </button>
            <button
              className={`px-5 py-1 rounded-sm duration-200 transition-colors ${
                activeTab === "twitch" ? "border-white border-2 text-white bg-purple-500 shadow-md shadow-purple-500/40" : "border-white/30 border-2 text-white/30"
              }`}
              onClick={() => setActiveTab("twitch")}
            >
              <SiTwitch size={24} className="" />
            </button>
            
          </div>
        </div>
      </main>
    </div>
  );
}
