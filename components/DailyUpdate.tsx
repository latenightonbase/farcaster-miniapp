import React, { useState, useEffect } from 'react';

export default function DailyUpdate({ selected }: { selected: string }) {
  const [videos, setVideos] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // AWS Configuration
  const REGION = 'ap-south-1';
  const BUCKET_NAME = 'billcaster';

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('https://billcaster.s3.ap-south-1.amazonaws.com/videos/billnews');
        if (!response.ok) {
          throw new Error('Failed to fetch video');
        }
        const videoUrl = response.url;
        setVideos([videoUrl]);
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
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading videos...</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-800 border border-red-600 rounded-lg">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {!loading && videos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {videos.map((videoUrl, index) => (
            <div
              key={index}
              className=" w-fit p-3 shadow-sm mx-auto flex flex-col items-center justify-center hover:shadow-md transition-shadow rounded-lg overflow-hidden bg-red-500/20 border border-red-500"
            >
                            <h2 className=" text-xl text-white font-bold mb-2">News of the Day</h2>

              
              {/* Video Container */}
              <div className="">
                <video
                  controls
                  className={`w-full object-cover rounded-lg duration-200 transition-all ${
                    selected === 'youtube' ? 'border-red-500' : selected === 'twitch' ? 'border-purple-500' : ''
                  }`}
                  src={videoUrl}
                />
              </div>

              {/* Video Title Bar */}              
            </div>
          ))}
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

