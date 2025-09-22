"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useNavigateWithLoader } from "@/utils/useNavigateWithLoader";
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import Image from "next/image";
import { CustomConnect } from "./connectButton";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const navigateWithLoader = useNavigateWithLoader();
  const [activeSection, setActiveSection] = useState('');
  const [isMobile, setIsMobile] = useState(true);

  // Check if screen is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024); // 1024px is the lg breakpoint in Tailwind
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

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
  
  // Add click outside listener to close the mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if the click is outside the menu and the menu is open
      if (isMenuOpen && !target.closest('.mobile-menu-container') && !target.closest('button[aria-label="Toggle menu"]')) {
        setIsMenuOpen(false);
      }
    };

    // Add event listener when menu is open
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Check if we're on homepage to enable hash navigation
  const isHomePage = pathname === '/';

  // Function to handle navigation with progress indicator
  const handleNavigation = (url: string) => {
    // Start progress bar
    NProgress.start();
    
    // Add a small delay before actual navigation to show progress starting
    setTimeout(() => {
      router.push(url);
      
      // Let the NavigationProgress component handle the completion
      // This is important because it will detect the actual page change
      // rather than completing too early
    }, 100);
  };

  const navLinks = [
    { name: "Auctions", path: "/" },
    { name: "How it works", path: "/help" },
    { name: "Hall of Fame", path: "/leaderboard" },
    { name: "Start Your Auction", path: "/public-auctions" },
    { name: "Live Streams", path: "/past-streams" },
  ];

  return (
    <>
      {/* Desktop Sidebar (Twitter-like) */}
      <aside className="hidden lg:flex h-screen z-[100000] w-64 animate-rise backdrop-blur-md flex-col py-6">
        {/* Logo */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleNavigation('/');
          }}
          className="flex items-center px-6 mb-8"
        >
          <Image
            src="/pfp.jpg"
            alt="Profile"
            width={48}
            height={48}
            className="rounded-full z-30 w-12 aspect-square"
          />
          <span className="ml-3 text-xl font-bold text-white">LNOB</span>
        </a>

        {/* Desktop Navigation - Vertical Menu */}
        <nav className="flex flex-col px-4 w-full h-full">
          {navLinks.map((link) => (
            <a
              href={link.path}
              key={link.path}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation(link.path);
              }}
              className={`text-base font-medium transition-colors hover:text-bill-pink hover:bg-white/10 rounded-full px-4 py-3 mb-3 flex items-center ${
                pathname === link.path ? "text-bill-pink bg-white/5" : "text-gray-300"
              }`}
            >
              {/* Could add icons here */}
              <span>{link.name}</span>
            </a>
          ))}
          
          {/* Wallet Connect Button */}
          <div className="mt-auto px-4 py-3">
            <CustomConnect />
          </div>
        </nav>
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 w-full z-[10000]  bg-black/80 backdrop-blur-md border-b border-bill-pink/50 px-4 md:py-4 md:px-6 lg:hidden">
        <div className="container mx-auto flex justify-between items-center py-3">
          {/* Logo */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              closeMenu();
              handleNavigation('/');
            }}
            className="flex items-center"
          >
            <Image
              src="/pfp.jpg"
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full z-30 w-12 aspect-square"
            />
          </a>
          
          {/* Mobile Wallet in Header - Visible when menu is closed */}
          <div className={`z-40 transition-opacity duration-300 flex gap-4 ${isMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <CustomConnect />
             {/* Hamburger Button */}
          <button
            className="z-50 block focus:outline-none relative"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <div className="w-6 flex flex-col justify-between h-5 relative">
              <span
                className={`block h-0.5 w-full bg-white transform transition-all duration-300 ease-in-out ${
                  isMenuOpen ? "rotate-45 translate-y-[9px] absolute top-0" : ""
                }`}
              ></span>
              <span
                className={`block h-0.5 w-full bg-white transition-all duration-300 ease-in-out ${
                  isMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              ></span>
              <span
                className={`block h-0.5 w-full bg-white transform transition-all duration-300 ease-in-out ${
                  isMenuOpen ? "-rotate-45 -translate-y-[8px] absolute bottom-0" : ""
                }`}
              ></span>
            </div>
          </button>
          </div>

         

          {/* Mobile Navigation Overlay */}
          <div
            className={`mobile-menu-container fixed top-0 left-0 w-full border-b-4 border-bill-pink rounded-b-2xl bg-black/95 flex flex-col items-center justify-center transition-all duration-300 ease-in-out ${
              isMenuOpen
                ? "opacity-100 visible"
                : "opacity-0 invisible pointer-events-none"
            }`}
          >
            <nav className="flex flex-col items-center px-6 w-full max-w-md">
              {navLinks.map((link) => (
                <Link
                  href={link.path}
                  key={link.path}
                  onClick={(e) => {
                    e.preventDefault();
                    closeMenu();
                    handleNavigation(link.path);
                  }}
                  className={`text-xl font-medium transition-colors hover:text-bill-pink py-4 hover:scale-105 transform duration-200 ${
                    pathname === link.path ? "text-bill-pink" : "text-white"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
             
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}