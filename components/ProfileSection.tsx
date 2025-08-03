'use client'
import Image from "next/image";

import { useEffect, useState } from "react";


export function ProfileSection() {
  const [success, setSuccess] = useState<boolean>(false);
  

  return (
    <div className="flex flex-col items-center shadow-md pb-5 overflow-hidden font-[var(--font-geist-mono)] ">

      {/* Banner */}
      <div className="w-full h-48 bg-gray-700 relative">
        <div className="h-full absolute z-10 w-full bg-gradient-to-b from-transparent to-black"></div>
        <Image
          src="/banner.png"
          alt="Banner"
          layout="fill"
          objectFit="cover"
        />
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
      <div className="mt-2 text-center animate-rise-2 px-4">
        <h1 className="text-2xl font-bold text-white">
          Late Night On Base
        </h1>
       
      </div>
     
    </div>
  );
}
