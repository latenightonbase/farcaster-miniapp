import { useAddFrame, useNotification } from '@coinbase/onchainkit/minikit';
import React, { useState, useEffect, useRef } from 'react';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';

export default function DailyUpdate({ selected }: { selected: string }) {
  const [videos, setVideos] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const videoNode = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Player | null>(null);

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
    if (videos && videoNode.current) {
      // Initialize Video.js player
      playerRef.current = videojs(videoNode.current, {
        controls: true,
        autoplay: true,
        preload: 'auto',
        sources: [
          {
            src: videos + "?v=" + Date.now(),
            type: 'video/mp4',
          },
        ],
      });

      // Play and pause after 200ms
      playerRef.current.ready(() => {
        playerRef.current?.play();
        setTimeout(() => {
          playerRef.current?.pause();
        }, 200);
      });

      return () => {
        playerRef.current?.dispose(); // Cleanup player instance
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
                    ref={videoNode}
                    className="video-js vjs-default-skin w-full h-full rounded-lg"
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