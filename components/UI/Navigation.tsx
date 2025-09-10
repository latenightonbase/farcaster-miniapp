"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { MdHome } from "react-icons/md";
import { RiAuctionFill } from "react-icons/ri";
import { BiSolidVideos } from "react-icons/bi";
import { MdMessage } from "react-icons/md";
import { useEffect, useState } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('');

  const handleHashClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 60, // Adjust offset as needed
        behavior: 'smooth'
      });
      // Update URL without full page reload
      window.history.pushState({}, '', `/#${sectionId}`);
      setActiveSection(sectionId);
    }
  };

  // Check if we're on homepage to enable hash navigation
  const isHomePage = pathname === '/';

  return (
    <div className="fixed bottom-0 pb-5 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-t border-red-500/50 py-2 px-4">
      <div className="flex justify-around items-center">
        <Link 
          href="/" 
          prefetch={true} 
          className={`flex flex-col items-center ${
            pathname === '/' && !activeSection ? 'text-red-500' : 'text-gray-400'
          }`}
        >
          <MdHome size={24} className="mb-1" />
          <span className="text-xs">Home</span>
        </Link>
        <Link 
          href="/auctions" 
          prefetch={true} 
          className={`flex flex-col items-center ${pathname === '/auctions' ? 'text-red-500' : 'text-gray-400'}`}
        >
          <RiAuctionFill size={24} className="mb-1" />
          <span className="text-xs">Auction</span>
        </Link>
        {isHomePage ? (
          <a 
            href="/#past-streams" 
            onClick={(e) => handleHashClick(e, 'past-streams')}
            className={`flex flex-col items-center ${
              activeSection === 'past-streams' ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            <BiSolidVideos size={24} className="mb-1" />
            <span className="text-xs">Past Streams</span>
          </a>
        ) : (
          <Link 
            href="/#past-streams" 
            prefetch={true} 
            className="flex flex-col items-center text-gray-400"
          >
            <BiSolidVideos size={24} className="mb-1" />
            <span className="text-xs">Past Streams</span>
          </Link>
        )}
        {isHomePage ? (
          <a 
            href="/#sponsor-message" 
            onClick={(e) => handleHashClick(e, 'sponsor-message')}
            className={`flex flex-col items-center ${
              activeSection === 'sponsor-message' ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            <MdMessage size={24} className="mb-1" />
            <span className="text-xs">Sponsor</span>
          </a>
        ) : (
          <Link 
            href="/#sponsor-message" 
            prefetch={true} 
            className="flex flex-col items-center text-gray-400"
          >
            <MdMessage size={24} className="mb-1" />
            <span className="text-xs">Sponsor</span>
          </Link>
        )}
      </div>
    </div>
  );
}
