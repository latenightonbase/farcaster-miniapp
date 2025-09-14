'use client'

import { Suspense } from 'react'
import DailyUpdate from "@/components/DailyUpdate";

// This component will contain all the client-side logic
function SponsorMessageClient() {
  return (
    <div className="min-h-screen pb-20 bg-black font-[var(--font-geist-mono)]">
      <main className="relative h-full">
        <div className="relative z-1 min-h-screen">
          <h2 className="text-white text-2xl font-bold mb-4 px-3 flex justify-start items-center gap-2">
            Message From Sponsor
          </h2>
          <DailyUpdate selected="" />
        </div>
      </main>
    </div>
  );
}

// This is a wrapper that provides Suspense boundary
export default function SponsorMessageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black"></div>}>
      <SponsorMessageClient />
    </Suspense>
  )
}
