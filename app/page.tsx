'use client'
import { ProfileSection } from "@/components/ProfileSection";
import Image from "next/image";
import { useEffect } from "react";

export default function Home() {

  async function initSdk() {
    const { sdk } = await import('@farcaster/miniapp-sdk');
    await sdk.actions.ready();
  }

  useEffect(()=>{
    initSdk();
  },[])

  return (
    <div className="min-h-screen">
      <main>
        <ProfileSection/>
      </main>
      <footer>

      </footer>
    </div>
  );
}
