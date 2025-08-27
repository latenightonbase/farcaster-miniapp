'use client'
import AuctionDisplay from "@/components/AuctionDisplay";
import Background from "@/components/UI/Background";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

export default function LeaderboardPage() {
    const router = useRouter()
    return (
        <div className="min-h-screen overflow-x-hidden bg-black animate-rise font-[var(--font-geist-mono)] p-4">

            <main className="relative h-screen z-50">
                <button onClick={() => router.back()} className="flex items-center justify-center bg-white/10 rounded-full w-8 aspect-square" ><FaArrowLeft/></button>
<AuctionDisplay/>
            </main>
            
            <Background selected="youtube" />
        </div>
    )
}