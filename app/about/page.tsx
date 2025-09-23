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
              <h2 className="text-2xl font-bold text-bill-pink mb-3">Our Mission</h2>
              <p className="text-gray-200 mb-4">
                Late Night on Base is a revolutionary platform connecting content creators with their audience through 
                blockchain-powered auctions and engagement tools.
              </p>
              <p className="text-gray-200">
                We're building the future of creator monetization on Base, empowering both creators and fans to participate 
                in a transparent, fun, and rewarding ecosystem.
              </p>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-bill-pink mb-4">What We Do</h2>
            <ul className="space-y-4 text-gray-200">
              <li className="flex items-start">
                <span className="text-bill-pink mr-2">•</span>
                <p>Host live auctions that allow fans to bid for exclusive perks and experiences with their favorite creators</p>
              </li>
              <li className="flex items-start">
                <span className="text-bill-pink mr-2">•</span>
                <p>Facilitate live streams where creators can engage directly with their community</p>
              </li>
              <li className="flex items-start">
                <span className="text-bill-pink mr-2">•</span>
                <p>Create a Winners Circle that recognizes and rewards the most active participants</p>
              </li>
              <li className="flex items-start">
                <span className="text-bill-pink mr-2">•</span>
                <p>Build tools that make blockchain technology accessible to everyone</p>
              </li>
            </ul>
          </div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-bill-pink mb-4">Our Story</h2>
            <p className="text-gray-200 mb-4">
              Late Night on Base started as a grassroots movement to bring more engagement to the Base ecosystem. 
              What began as experimental auctions quickly evolved into a full-fledged platform for creators and fans.
            </p>
            <p className="text-gray-200">
              Today, we're proud to be one of the most active communities on Base, with a growing ecosystem of creators, 
              bidders, and supporters who share our vision for the future of content creation.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-bill-pink mb-4">Join the Community</h2>
            <p className="text-gray-200 mb-6">
              Whether you're a creator looking to monetize your content or a fan wanting to support your favorites, 
              there's a place for you in the Late Night on Base community.
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