import { useAddFrame, useNotification } from '@coinbase/onchainkit/minikit';
import React, { useState, useEffect, useRef } from 'react';

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

  return (
    <div className="max-w-6xl mx-auto text-white animate-rise ">

      {error && (
        <div className="mt-4 px-3 bg-red-800 border border-red-600 rounded-lg">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {!loading && videos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-8 -mx-4">

            <div
              className=" px-3 pb-3 shadow-xl mx-auto flex w-screen flex-col items-start justify-center shadow-red-800/20 transition-shadow rounded-lg overflow-hidden bg-gradient-to-b from-transparent to-red-800/10 border-b-[2px]  border-red-500/30"
            >
              <h2 className="text-xl text-white font-poppins font-bold mb-2">Word from Our Sponsor</h2>

              {/* Enhanced Video Container */}
              {videos && (
                <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
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