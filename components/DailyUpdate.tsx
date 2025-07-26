import { useAddFrame, useNotification } from '@coinbase/onchainkit/minikit';
import React, { useState, useEffect } from 'react';

export default function DailyUpdate({ selected }: { selected: string }) {
  const [videos, setVideos] = useState<string>("");
  const [posters, setPosters] = useState<string[]>([]); // State for posters
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [info, setInfo] = useState<string>('');
  const sendNotification = useNotification();
  const addFrame = useAddFrame();

// Usage
const handleAddFrame = async () => {
  const result = await addFrame();
  if (result) {
    console.log('Frame added:', result.url, result.token);
    setInfo('Frame added: ' + result.url + ', ' + result.token);
  }
};

// Usage
const handleSendNotification = async () => {
  const res = await sendNotification({
    title: 'New High Score!',
    body: 'Congratulations on your new high score!'
  });

  setInfo('Notification sent: ' + res);
};

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('https://billcaster.s3.ap-south-1.amazonaws.com/videos/billnews');
        if (!response.ok) {
          throw new Error('Failed to fetch video');
        }
        const videoUrl = response.url;
        setVideos(videoUrl);

        // Generate posters for videos
        // const videoElement = document.createElement('video');
        // videoElement.src = videoUrl;
        // videoElement.crossOrigin = 'anonymous';

        // videoElement.addEventListener('loadeddata', () => {
        //   const canvas = document.createElement('canvas');
        //   canvas.width = videoElement.videoWidth;
        //   canvas.height = videoElement.videoHeight;
        //   const context = canvas.getContext('2d');
        //   if (context) {
        //     context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        //     const posterUrl = canvas.toDataURL('image/jpeg');
        //     setPosters((prev) => [...prev, posterUrl]);
        //   }
        // });
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 text-white animate-rise">

      {error && (
        <div className="mt-4 p-4 bg-red-800 border border-red-600 rounded-lg">
          <p className="text-red-300">{error}</p>
        </div>
      )}
      <button className='bg-blue-600 w-40 h-20' onClick={handleAddFrame}>ADD FRAME</button>
      {info && (
        <div className="mt-4 p-4 bg-green-800 border border-green-600 rounded-lg">
          <p className="text-green-300">{info}</p>
        </div>
      )}
      <button className='bg-purple-600 w-40 h-20' onClick={handleSendNotification}>TIDING!</button>

      {!loading && videos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-8">

            <div
              className=" w-fit p-3 shadow-xl mx-auto flex flex-col items-center justify-center shadow-red-800/20 transition-shadow rounded-lg overflow-hidden bg-red-800/10 border-x-[2px]  border-red-500/30"
            >
              <h2 className=" text-xl text-white font-poppins font-bold mb-2">Daily Base Report</h2>

              {/* Video Container */}
              <div className="">
                <video
                  controls
                  // poster={posters[index]} // Set poster dynamically
                  className={`w-full object-cover rounded-lg duration-200 transition-all ${
                    selected === 'youtube' ? 'border-red-500' : selected === 'twitch' ? 'border-purple-500' : ''
                  }`}
                  src={videos}
                />
              </div>

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

