import Image from "next/image";
import Link from "next/link";
import { LINKS } from "../utils/constants";
import { FaGlobe } from "react-icons/fa";
import { SiFarcaster } from "react-icons/si";
import { FaSquareXTwitter } from "react-icons/fa6";



export function ProfileSection() {
  return (
    <div className="flex flex-col items-center shadow-md overflow-hidden">
      {/* Banner */}
      <div className="w-full h-24 bg-gray-700 relative">
        <Image src="/banner.png" alt="Banner" layout="fill" objectFit="cover" />
      </div>

      {/* Profile Image */}
      <div className="-mt-12 w-24 h-24 rounded-full border-4 border-gray-800 bg-gray-600 overflow-hidden relative">
        <Image src="/pfp.png" alt="Profile" layout="fill" objectFit="cover" />
      </div>

      {/* Name */}
      <div className="mt-4 text-center mb-5">
        <h1 className="text-lg font-bold text-white">John Doe</h1>
        <p className="text-sm text-gray-400">I am a developer who makes shit.</p>
      </div>

      {/* Social Links */}
      <div className="mt-4 flex space-x-4">
        <Link
          href={LINKS.farcaster}
          target="_blank"
          className="text-sm font-bold duration-200 hover:text-blue-400 active:text-blue-500"
        >
          <SiFarcaster size={20} />
        </Link>
        <Link
          href={LINKS.twitter}
          target="_blank"
          className="text-sm font-bold duration-200 hover:text-blue-400 active:text-blue-500"
        >
          <FaSquareXTwitter size={20} />
        </Link>
        <Link
          href={LINKS.website}
          target="_blank"
          className="text-sm font-bold duration-200 hover:text-blue-400 active:text-blue-500"
        >
          <FaGlobe size={20} />
        </Link>
      </div>
    </div>
  );
}
