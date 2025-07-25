import Image from "next/image";
import Link from "next/link";
import { LINKS } from "../utils/constants";
import { FaGlobe } from "react-icons/fa";
import { SiFarcaster } from "react-icons/si";
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaYoutube } from "react-icons/fa";

export function ProfileSection() {
  return (
    <div className="flex flex-col items-center shadow-md overflow-hidden font-[var(--font-geist-mono)] ">
      {/* Banner */}
      <div className="w-full h-48 bg-gray-700 relative">
        <div className="h-full absolute z-10 w-full bg-gradient-to-b from-transparent to-black"></div>
        <Image src="/banner.png" alt="Banner" layout="fill" objectFit="cover" />
      </div>

      {/* Profile Image with Spikes */}
      <div className="-mt-20 relative w-full flex justify-center items-center z-20">
        {/* Left Spike (Flipped) */}
        <div className="flex-1 h-40 relative -mr-5">
          {/* Blurred background spike */}
          <Image
            src="/spike.svg"
            alt="Left Spike Glow"
            layout="fill"
            objectFit="contain"
            className="scale-x-[-1] blur-[8px] opacity-60"
          />
          {/* Main spike */}
          <Image
            src="/spike.svg"
            alt="Left Spike"
            layout="fill"
            objectFit="contain"
            className="scale-x-[-1] relative z-10"
          />
        </div>
        
        {/* Profile Image */}
        <div className="relative w-36 h-36 rounded-full border-2 animate-rise border-white bg-gray-600 mx-4">
          <Image
            src="/pfp.jpg"
            alt="Profile"
            layout="fill"
            objectFit="cover"
            className="rounded-full absolute z-30"
          />
          <div className="h-full w-full bg-white/60 blur-[20px] rounded-full"></div>
        </div>
        
        {/* Right Spike */}
        <div className="flex-1 h-40 relative -ml-5">
          {/* Blurred background spike */}
          <Image
            src="/spike.svg"
            alt="Right Spike Glow"
            layout="fill"
            objectFit="contain"
            className="blur-[8px] opacity-60"
          />
          {/* Main spike */}
          <Image
            src="/spike.svg"
            alt="Right Spike"
            layout="fill"
            objectFit="contain"
            className="relative z-10"
          />
        </div>
      </div>

      {/* Name */}
      <div className="mt-2 text-center mb-5 animate-rise-2 px-4">
        <h1 className="text-xl font-bold text-white mb-4 ">Late Night On Base</h1>
        <p className="text-sm text-gray-400 ">Daily Base ecosystem updates in 60 seconds, plus replays of top streams featuring the builders shaping the future. Hosted by Bill the Bull.</p>
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
        <Link
          href={LINKS.youtube}
          target="_blank"
          className="text-sm font-bold duration-200 hover:text-blue-400 active:text-blue-500"
        >
          <FaYoutube size={20} />
        </Link>
      </div>
    </div>
  );
}
