"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useNavigateWithLoader } from "@/utils/useNavigateWithLoader";
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import Image from "next/image";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const navigateWithLoader = useNavigateWithLoader();
  const [activeSection, setActiveSection] = useState('');

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

  // Navigation links
  const navLinks = [
    { name: "Auctions", path: "/" },
    { name: "How it works", path: "/help" },
    { name: "Hall of Fame", path: "/leaderboard" },
    { name: "Start Your Auction", path: "/public-auctions" },
  ];

  return (
    <>
      {/* Header component with logo and hamburger menu */}
      <header className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-bill-pink/50 py-3 px-4 md:py-4 md:px-6">
        <div className="container mx-auto flex justify-between items-center py-2">
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
                        className="rounded-full absolute z-30 w-12 aspect-square"
                      />
          </a>

          {/* Hamburger Button */}
          <button
            className="z-50 block lg:hidden focus:outline-none relative"
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

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {navLinks.map((link) => (
              <a
                href={link.path}
                key={link.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation(link.path);
                }}
                className={`text-sm font-medium transition-colors hover:text-bill-pink ${
                  pathname === link.path ? "text-bill-pink" : "text-gray-300"
                }`}
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Mobile Navigation Overlay */}
          <div
            className={`fixed top-0 left-0 w-full border-b-4 border-bill-pink rounded-b-2xl bg-black/95 flex flex-col items-center justify-center transition-all duration-300 ease-in-out lg:hidden ${
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