"use client";
import { useEffect } from "react";
import Image from "next/image";

export default function AboutPage() {
  useEffect(() => {
    // Any client-side initialization code can go here
  }, []);

  return (
    <div className="container mx-auto px-4 pt-24 lg:pt-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl lg:text-3xl font-bold text-white mb-8">About Late Night on Base</h1>
        
        <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 lg:p-8 shadow-lg border border-bill-pink/30 mb-10">
          <div className="flex flex-col lg:flex-row items-center mb-8">
            <Image 
              src="/pfp.jpg" 
              alt="Late Night on Base Logo" 
              width={150} 
              height={150} 
              className="rounded-full mb-6 lg:mb-0 lg:mr-8"
            />
            <div>
              <p className="text-gray-200 mb-4">
                Late Night on Base is the first onchain late-night show — a mix of livestreams, interviews, and media auctions 
                that bring the Base community together in real time.
              </p>
              <p className="text-gray-200">
                Hosted by Bill the Bull, LNOB has already produced 250+ live streams and 100+ podcasts, making it one of the 
                most consistent and recognizable voices in the Base ecosystem.
              </p>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-bill-pink mb-4">🚀 What Makes Us Different</h2>
            <ul className="space-y-4 text-gray-200">
              <li className="flex items-start">
                <span className="text-bill-pink mr-2">•</span>
                <p>Media Auctions → Brands and builders compete for the spotlight through onchain auctions, creating a transparent and fun way to sponsor content.</p>
              </li>
              <li className="flex items-start">
                <span className="text-bill-pink mr-2">•</span>
                <p>Livestreams + Podcasts → Covering the latest in Base culture, projects, and stories, streamed live Mon–Thurs 12PM PST.</p>
              </li>
              <li className="flex items-start">
                <span className="text-bill-pink mr-2">•</span>
                <p>Community First → Every episode amplifies Base-native builders, creators, and supporters.</p>
              </li>
            </ul>
          </div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-bill-pink mb-4">📖 Our Story</h2>
            <p className="text-gray-200">
              What started as one streamer testing auctions turned into a new media model on Base. Today, LNOB is a hub for creators, 
              brands, and fans — where sponsorships aren't sold in backroom deals but won in the open through competitive bidding.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-bill-pink mb-4">🤝 Join Us</h2>
            <p className="text-gray-200 mb-6">
              Whether you're a brand looking to advertise, a project ready for the spotlight, or a fan who just wants to be part 
              of the culture, there's a place for you in the LNOB ecosystem.
            </p>
            <p className="text-gray-200 italic mb-6">
              Late Night on Base: where culture meets the auction block.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="https://twitter.com/latenightonbase" target="_blank" rel="noopener noreferrer" 
                className="px-6 py-3 bg-bill-pink text-white font-medium rounded-full hover:bg-bill-pink/80 transition-colors">
                Follow on Twitter
              </a>
              <a href="/public-auctions" 
                className="px-6 py-3 bg-transparent border border-bill-pink text-bill-pink font-medium rounded-full hover:bg-bill-pink/10 transition-colors">
                Start Your Auction
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}