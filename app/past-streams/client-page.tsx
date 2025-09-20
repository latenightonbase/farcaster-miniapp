'use client'

import { Suspense } from 'react'
import YTHandler from "@/components/YTHandler";

// This component will contain all the client-side logic
function PastStreamsClient() {
  return (
    <div className="min-h-screen pt-16 lg:pt-0 bg-black/10 font-[var(--font-geist-mono)]">
      <main className="relative h-full">
        <div className="relative z-1 min-h-screen pt-4">
          <h2 className="text-white text-2xl font-bold pt-4 mb-4 px-3 flex justify-start items-center gap-2">
            My Streams
          </h2>
          <YTHandler />
        </div>
      </main>
    </div>
  );
}

// This is a wrapper that provides Suspense boundary
export default function PastStreamsWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black"></div>}>
      <PastStreamsClient />
    </Suspense>
  )
}
