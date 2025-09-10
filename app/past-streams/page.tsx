"use client";
import YTHandler from "@/components/YTHandler";

export default function PastStreamsPage() {
  return (
    <div className="min-h-screen pb-20 bg-black font-[var(--font-geist-mono)]">
      <main className="relative h-full">
        <div className="relative z-1 min-h-screen pt-4">
          <h2 className="text-white text-2xl font-bold pt-4 mb-4 px-3 flex justify-start items-center gap-2">
            Past Streams
          </h2>
          <YTHandler />
        </div>
      </main>
    </div>
  );
}
