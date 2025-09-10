"use client";
import { useState, useEffect } from "react";
import SponsorList from "@/components/SponsorList";
import { useAccount } from "wagmi";
import { useGlobalContext } from "@/utils/globalContext";
import { IoMdTrophy } from "react-icons/io";
import { useRouter } from "next/navigation";

export default function AuctionsPage() {
  const { address } = useAccount();
  const globalContext = useGlobalContext();
  const user = globalContext?.user;

  const router = useRouter();
  
  return (
    <div className="min-h-screen pb-20 bg-black font-[var(--font-geist-mono)] px-3 pt-6">
      <main className="relative h-full">
         <button onClick={() => router.push("/leaderboard")} className="flex w-full gap-2 text-white text-2xl items-center justify-center bg-white/30 rounded-lg py-2 " >
          <IoMdTrophy className="text-yellow-500"/> View Past Auctions
        </button>
        <div className="relative z-1 min-h-screen">
          {/* <h2 className="text-white text-2xl font-bold pt-8 my-4 px-3 flex justify-start items-center gap-2">
            Auctions {user ? <span className="text-red-400">{user?.username}</span> : <span className="w-32 h-10 bg-white/20 animate-pulse rounded-lg"></span>}
          </h2> */}
          <SponsorList />
        </div>
      </main>
    </div>
  );
}
