"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MdHome } from "react-icons/md";
import { RiAuctionFill } from "react-icons/ri";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-t border-red-500/50 py-2 px-4">
      <div className="flex justify-around items-center">
        <Link href="/" prefetch={true} className={`flex flex-col items-center ${pathname === '/' ? 'text-red-500' : 'text-gray-400'}`}>
          <MdHome size={24} className="mb-1" />
          <span className="text-xs">Home</span>
        </Link>
        <Link href="/auctions" prefetch={true} className={`flex flex-col items-center ${pathname === '/auctions' ? 'text-red-500' : 'text-gray-400'}`}>
          <RiAuctionFill size={24} className="mb-1" />
          <span className="text-xs">Auction</span>
        </Link>
      </div>
    </div>
  );
}
