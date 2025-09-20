"use client";
import AuctionDisplay from "@/components/AuctionDisplay";
import Background from "@/components/UI/Background";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

export default function LeaderboardPage() {
//   const router = useRouter();
  return (
    // <div className="h-screen overflow-y-scroll bg-black/50 pt-0 min-md:pt-20 overflow-x-hidden animate-rise font-[var(--font-geist-mono)] ">
      <main className="relative h-screen container pt-20 lg:pt-0">
        <div className="relative z-50 p-4">
          {/* <button
            onClick={() => router.back()}
            className="flex items-center justify-center bg-white/10 rounded-full w-8 aspect-square"
          >
            <FaArrowLeft />
          </button> */}
          <AuctionDisplay />
        </div>

        {/* <Background /> */}
      </main>
    // </div>
  );
}
