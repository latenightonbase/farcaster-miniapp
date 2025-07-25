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
import Tipping from "@/components/Tipping";

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
    <div className="min-h-screen bg-black animate-rise font-[var(--font-geist-mono)] ">
      <main className="relative h-full">

        <div className="relative z-1 min-h-screen">
          <ProfileSection />

          <DailyUpdate selected={activeTab} />
          {/* Conditional Rendering */}
          <div className="mt-6">
            {activeTab === "youtube" && <YouTubeLivestreamFetcher />}
            {activeTab === "twitch" && <TwitchStreamFetcher />}
          </div>


        </div>
        {/* <div className="flex mx-auto pb-4 justify-center space-x-4 fixed w-[80%] min-w-[300px] z-1 bottom-4 -translate-1/2 left-1/2 animate-rise-2">
          <div className="bg-white/20 backdrop-blur-sm grid grid-cols-2 gap-2 p-2 rounded-sm w-full">
            <button
              className={`px-5 flex items-center justify-center py-3 rounded-sm duration-200 transition-colors ${activeTab === "youtube" ? "border-white border-2 text-white bg-red-500 shadow-md shadow-red-500/40 " : "border-white/30 border-2 text-white/30 "
                }`}
              onClick={() => setActiveTab("youtube")}
            >
              <FaYoutube size={24} className="" />
            </button>
            <button
              className={`px-5 flex items-center justify-center py-3 rounded-sm duration-200 transition-colors ${activeTab === "twitch" ? "border-white border-2 text-white bg-purple-500 shadow-md shadow-purple-500/40" : "border-white/30 border-2 text-white/30"
                }`}
              onClick={() => setActiveTab("twitch")}
            >
              <SiTwitch size={24} className="" />
            </button>

          </div>
        </div> */}
        <Background selected={activeTab} />
        <div className="relative h-full z-1">
          <Tipping />
        </div>
      </main>
      <footer className="text-center bg-black -translate-y-2 py-4  rounded-t-lg border-t-[2px] border-red-500/50 text-white/50 h-36 text-sm">
        An Onchain Media Production
      </footer>
    </div>
  );
}
