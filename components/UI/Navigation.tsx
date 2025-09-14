"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { MdHome } from "react-icons/md";
import { RiAuctionFill } from "react-icons/ri";
import { BiSolidVideos } from "react-icons/bi";
import { MdMessage } from "react-icons/md";
import { useEffect, useState } from "react";
import { useNavigateWithLoader } from "@/utils/useNavigateWithLoader";
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('');
  const navigateWithLoader = useNavigateWithLoader();

  // Use effect to initialize activeSection based on URL hash on mount
  useEffect(() => {
    if (window.location.hash) {
      const hash = window.location.hash.substring(1); // Remove the # symbol
      setActiveSection(hash);
    } else if (pathname === '/') {
      // Set to home when no hash is present on homepage
      setActiveSection('home');
    }
  }, [pathname]);

  const handleHashClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    NProgress.start();
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 60, // Adjust offset as needed
        behavior: 'smooth'
      });
      // Update URL without full page reload
      window.history.pushState({}, '', sectionId === 'home' ? '/' : `/#${sectionId}`);
      setActiveSection(sectionId);
      setTimeout(() => {
        NProgress.done();
      }, 500); // Give some time for the scroll to complete
    }
  };

  // Check if we're on homepage to enable hash navigation
  const isHomePage = pathname === '/';

  // Function to handle navigation with progress indicator
  const handleNavigation = (url: string) => {
    NProgress.start();
    router.push(url);
    
    // For client-side navigation in Next.js, we need to manually complete
    // the progress bar after a short delay
    setTimeout(() => {
      NProgress.done();
    }, 500); // Adjust timing as needed
  };

  return (
    <div className="fixed bottom-0 pb-5 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-t border-red-500/50 py-2 px-4">
      <div className="flex justify-around items-center">
        {isHomePage ? (
          <a 
            href="/#home"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
              window.history.pushState({}, '', '/');
              setActiveSection('home');
            }}
            className={`flex flex-col items-center ${
              activeSection === 'home' || (pathname === '/') ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            <MdHome size={24} className="mb-1" />
            <span className="text-xs">Home</span>
          </a>
        ) : (
          <a 
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('home');
              handleNavigation('/');
            }}
            className="flex flex-col items-center text-gray-400"
          >
            <MdHome size={24} className="mb-1" />
            <span className="text-xs">Home</span>
          </a>
        )}
        <a 
          href="/auctions"
          onClick={(e) => {
            e.preventDefault();
            handleNavigation('/auctions');
          }}
          className={`flex flex-col items-center ${pathname === '/auctions' ? 'text-red-500' : 'text-gray-400'}`}
        >
          <RiAuctionFill size={24} className="mb-1" />
          <span className="text-xs">Auction</span>
        </a>
        
          <a 
            href="/#past-streams"
            onClick={(e) => {
              e.preventDefault();
              handleNavigation('/#past-streams');
            }}
            className="flex flex-col items-center text-gray-400"
          >
            <BiSolidVideos size={24} className="mb-1" />
            <span className="text-xs">Past Streams</span>
          </a>
        
          <a 
            href="/#sponsor-message"
            onClick={(e) => {
              e.preventDefault();
              handleNavigation('/#sponsor-message');
            }}
            className="flex flex-col items-center text-gray-400"
          >
            <MdMessage size={24} className="mb-1" />
            <span className="text-xs">Sponsor</span>
          </a>

      </div>
    </div>
  );
}
