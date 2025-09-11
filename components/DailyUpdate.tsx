import { useAddFrame, useNotification } from '@coinbase/onchainkit/minikit';
import React, { useState, useEffect, useRef } from 'react';
import { IoMdInformationCircleOutline } from 'react-icons/io';

export default function DailyUpdate({ selected }: { selected: string }) {
  const [videos, setVideos] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

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

  // Handle clicks outside the modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
              <div className="flex items-center justify-start w-full mb-2 gap-2">
                <span className="text-2xl text-white font-poppins font-bold">Message from Sponsor</span>
                <button 
                  onClick={() => setShowModal(true)}
                  className=" rounded-full hover:bg-red-800/30 transition-colors"
                  aria-label="Information about sponsorship"
                >
                  <IoMdInformationCircleOutline className="text-white text-2xl" />
                </button>
              </div>

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

      {/* Sponsorship Information Modal */}
      <div 
        className={`fixed inset-0 z-50 bg-black/80 flex items-center justify-center transition-opacity duration-200 ${showModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div 
          ref={modalRef}
          className="bg-gradient-to-b from-red-950 to-black p-6 rounded-lg max-w-lg w-full m-4 border border-red-500/50"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-red-400"><span className='mr-2'>🧨</span> How the LNOB Sponsorship Auction Works</h3>

          </div>
          
          <div className="text-white">
            <p className="mb-4">Every week, we run a 48-hour live auction for one golden prize:</p>
            <p className="text-xl font-semibold text-red-300 mb-4">The Official LNOB Sponsorship Slot of the Week</p>
            
            <p className="mb-2 font-semibold">What you win:</p>
            <ul className="space-y-1 mb-4">
              <li><span className='mr-2'>🎤</span> Guest appearance on the LNOB show (10K+ impressions weekly)</li>
              <li><span className='mr-2'>📱</span> Sponsored shoutouts in every stream</li>
              <li><span className='mr-2'>🧠</span> BNKR blitz campaign for engagement</li>
              <li><span className='mr-2'>📢</span> Featured banner in-app + clickable link</li>
              <li><span className='mr-2'>🎞️</span> Zora clip to memorialize your moment</li>
              <li><span className='mr-2'>🔁</span> Exposure across Base + Farcaster</li>
              <li><span className='mr-2'>🔥</span> All powered by your LNOB token or USDC bid</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};