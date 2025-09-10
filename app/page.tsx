"use client";
import { ProfileSection } from "@/components/ProfileSection";
import { useEffect, useState } from "react";
import YouTubeLivestreamFetcher from "@/components/YTHandler";
import TwitchStreamFetcher from "@/components/TwitchHandler";
import TwitterFetcher from "@/components/TwitterHandler";
import Background from "@/components/UI/Background";
import DailyUpdate from "@/components/DailyUpdate";
import Tipping from "@/components/Tipping";
import {
  useAddFrame,
  useMiniKit,
  useNotification,
} from "@coinbase/onchainkit/minikit";
import { useAccount } from "wagmi";
import axios from "axios";
import SponsorBanner from "@/components/SponsorBanner";
import { useRouter } from "next/navigation";
import { IoMdTrophy } from "react-icons/io";
import { useGlobalContext } from "@/utils/globalContext";

export default function Home() {
  const [activeTab, setActiveTab] = useState("youtube");
  const sendNotification = useNotification();

  const [error, setError] = useState<string | null>(null);

    const globalContext = useGlobalContext();
  const user = globalContext?.user;

  const {
    setFrameReady,
    isFrameReady,
    context,
    updateClientContext,
    notificationProxyUrl,
  } = useMiniKit();
  const addFrame = useAddFrame();

  const { address } = useAccount();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

  useEffect(() => {
    const checkNotificationDetails = async () => {
      if (address && address.trim() !== "") {
        try {
          const response = await axios.get(
            `/api/notification-details?wallet=${address}`
          );

          console.log("Notification Details Response:", response.data);
          if (!response.data.exists) {
            setIsPopupOpen(true);
          }
        } catch (error) {
          console.error("Error checking notification details:", error);
        }
      }
    };
    if (isFrameReady) {
      checkNotificationDetails();
    }
  }, [address]);

  const handleAddFrame = async () => {
    try {
      const result = await addFrame();
      console.error("Add Frame Result:", result);
      if (result) {
        console.log("Frame added:", result.url, result.token);
        await axios.post(`/api/notification-details`, {
          wallet: address,
          url: result.url,
          token: result.token,
        });

        await sendNotification({
          title: "Notification Enabled",
          body: "You chose the best channel to receive Base news!",
        });

        setTimeout(() => {
          setIsPopupOpen(false);
        }, 2000);

        window.location.reload();
      }
    } catch (error) {
      console.error("Error saving notification details:", error);
    }
    finally{
      await axios.post(`/api/notification-details`, {
          wallet: address,
          url: Date.now().toString(),
          token: Date.now().toString(),
        });

        setIsPopupOpen(false);
    }
    // }
  };

  const router = useRouter()

  return (
    <div className="min-h-screen overflow-x-hidden bg-black animate-rise font-[var(--font-geist-mono)] pb-20">
      <main className="relative h-full">

        <div className="relative z-50">
          <div
            className={`h-screen w-screen fixed top-0 left-0 duration-200 transition-all ${
              isPopupOpen
                ? " translate-y-0 bg-black/50 "
                : " translate-y-full bg-transparent"
            } `}
          >
            <div
              className={`absolute bottom-0 pb-5 border-t-2 border-orange-700 min-h-60 bg-gradient-to-b from-orange-950 to-black w-screen rounded-t-lg items-start shadow-xl bg-opacity-50 flex justify-center transition-all duration-500 z-50 ${
                isPopupOpen ? "translate-y-0" : "translate-y-full"
              }`}
            >
              <div className="p-6 rounded-lg w-11/12 max-w-md shadow-2xl transform transition-transform scale-100 animate-fade-in relative">
                <div className="mt-5 flex flex-col items-center">
                  {error && (
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                  )}
                  <h2 className="text-white text-2xl font-semibold mb-4 text-center">
                    Welcome to the App
                  </h2>
                  <p className="text-gray-300 text-sm mb-6 text-center">
                    Would you like to receive notifications?
                  </p>
                  <button
                    onClick={handleAddFrame}
                    className="bg-orange-500 text-center px-4 py-2 rounded text-lg font-bold text-white w-full hover:opacity-90 transition-opacity"
                  >
                    Allow
                  </button>
                  <button
                    onClick={() => setIsPopupOpen(false)}
                    className="mt-4 bg-gray-500 text-center px-4 py-2 rounded text-lg font-bold text-white w-full hover:opacity-90 transition-opacity"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-1 min-h-screen">
          <div id="home" className="scroll-mt-16">
            <ProfileSection />
            <h2 className="text-white text-2xl font-bold my-4 px-3 flex justify-start items-center gap-2">Welcome {user ? <span className="text-red-400">{user?.username.split(0,10)}{user?.username.length > 10 && "..."}</span> : <span className="w-32 h-10 bg-white/20 animate-pulse rounded-lg"></span>}</h2>
            <SponsorBanner />
          </div>
          
          {/* Sponsor Message Section */}
          <div id="sponsor-message" className="scroll-mt-16 pt-4">
            {/* <h2 className="text-white text-2xl font-bold my-4 px-3">Message From Sponsor</h2> */}
            <DailyUpdate selected={activeTab} />
          </div>

          {/* Past Streams Section */}
          <div id="past-streams" className="scroll-mt-16 pt-4">
            {/* <h2 className="text-white text-2xl font-bold my-4 px-3">Past Streams</h2> */}
            <YouTubeLivestreamFetcher />
          </div>
          
          {/* Conditional Rendering for other tabs */}
          <div className="mt-6">
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
              className={`px-5 flex items-center justify-center py-3 rounded-sm duration-200 transition-colors ${activeTab === "twitch" ? "border-white border-2 text-white bg-red-500 shadow-md shadow-red-500/40" : "border-white/30 border-2 text-white/30"
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
