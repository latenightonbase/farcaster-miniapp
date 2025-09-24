"use client";
import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-bill-blue/50 py-3 px-4 lg:py-4 lg:px-6">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="font-bold text-xl text-bill-blue">Late Night on Base</span>
        </Link>
        {/* The actual navigation has been moved to Navbar.tsx */}
      </div>
    </header>
  );
}