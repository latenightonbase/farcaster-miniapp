import { useAddFrame, useNotification } from '@coinbase/onchainkit/minikit';
import React, { useState, useEffect, useRef } from 'react';
import { IoMdInformationCircleOutline } from 'react-icons/io';
import Link from 'next/link';

export default function DailyUpdate({ selected }: { selected: string }) {
  const [videos, setVideos] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('https://billcaster.s3.ap-south-1.amazonaws.com/videos/billnews');
        if (!response.ok) {
          throw new Error('Failed to fetch video');
        }
        const videoUrl = response.url;
        setVideos(videoUrl);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  useEffect(() => {
    if (videos && videoRef.current) {
      const video = videoRef.current;
      
      // Setup play/pause sequence when video is ready
      const handleCanPlay = () => {
        video.play()
          .then(() => {
            // Pause after 200ms of playing
            setTimeout(() => {
              video.pause();
            }, 200);
          })
          .catch(err => {
            console.error("Failed to autoplay:", err);
            // Mobile browsers often block autoplay, so we just load the video
          });
      };
      
      // Add event listener
      video.addEventListener('canplay', handleCanPlay);
      
      // Load the video
      video.load();
      
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
      };
    }
  }, [videos]);

  // No need for modal handling anymore

  return (
    <div className=" mx-auto text-white animate-rise max-[700px]:w-screen w-[700px]">

      {error && (
        <div className="mt-4 px-3 bg-red-800 border border-red-600 rounded-lg">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {!loading && videos.length > 0 && (
        <div className="mt-8 -mx-4 px-4">

            <div
              className=" px-3 pb-3 shadow-xl mx-auto flex w-full flex-col items-center justify-center shadow-bill-blue/20 transition-shadow rounded-lg overflow-hidden bg-gradient-to-b from-transparent to-bill-light-blue/10 border-b-[2px]  border-bill-blue/30"
            >
              <div className="flex items-center justify-start w-full mb-2 gap-2">
                <span className="text-2xl text-white font-poppins font-bold">Message from Sponsor</span>
                <Link href="/help">
                  <button 
                    className="rounded-full hover:bg-red-800/30 transition-colors"
                    aria-label="Information about sponsorship"
                  >
                    <IoMdInformationCircleOutline className="text-white text-2xl" />
                  </button>
                </Link>
              </div>

              {/* Enhanced Video Container */}
              {videos && (
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    src={videos + "?v=" + Date.now()}
                    controls
                    playsInline
                    muted
                    preload="auto"
                    className="w-full h-full rounded-lg object-cover"
                  ></video>
                </div>
              )}

              {/* Video Title Bar */}              
            </div>
  
        </div>
      )}

      {!loading && videos.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-gray-400">No videos found.</p>
        </div>
      )}
    </div>
  );
};