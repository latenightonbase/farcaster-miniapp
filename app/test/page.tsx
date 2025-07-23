'use client';
import TwitchStreamFetcher from "@/components/TwitchHandler";
import TwitterFetcher from "@/components/TwitterHandler";
import YouTubeLivestreamFetcher from "@/components/YTHandler";

export default function Home() {


  return (
    <div className="min-h-screen bg-black">
      <YouTubeLivestreamFetcher/>
    </div>
  );
}