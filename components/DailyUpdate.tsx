import React, { useState, useEffect } from 'react';

const DailyUpdate: React.FC = () => {
  const [videos, setVideos] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // AWS Configuration
  const REGION = 'ap-south-1';
  const BUCKET_NAME = 'billcaster';

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('https://billcaster.s3.ap-south-1.amazonaws.com/videos/1753354185956-billnight');
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
    <div className="max-w-6xl mx-auto p-4 text-white">
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((videoUrl, index) => (
            <div className="mt-8  rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-5">Daily Updates</h2>
              <video
                controls
                className="w-full h-48 object-cover"
                src={videoUrl}
              />
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

export default DailyUpdate;
