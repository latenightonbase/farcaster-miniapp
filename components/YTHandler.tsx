import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { RiLoader5Fill } from 'react-icons/ri';

interface Livestream {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  isLive: boolean;
  scheduledStartTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  concurrentViewers?: number;
  viewCount: string;
  likeCount: string;
  url: string;
}

const YouTubeLivestreamFetcher: React.FC = () => {
  const [livestreams, setLivestreams] = useState<Livestream[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Replace with your YouTube Data API key
  const API_KEY = process.env.NEXT_PUBLIC_YT_API_KEY;
  const BASE_URL = 'https://www.googleapis.com/youtube/v3';

  // Get channel ID from handle/username
  const getChannelIdFromHandle = async (handle: string): Promise<string> => {
    try {
      const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle;
      const response = await fetch(
        `${BASE_URL}/search?part=snippet&q=${cleanHandle}&type=channel&key=${API_KEY}`,
        {
          headers: {
            'Cache-Control': 'max-age=3600'
          }
        }
      );
      const data = await response.json();

      console.log('Search Data:', data);

      if (data.items && data.items.length > 0) {
        return data.items[0].id.channelId;
      }
      throw new Error('Channel not found');
    } catch (error: any) {
      throw new Error(`Error fetching channel: ${error.message}`);
    }
  };

  // Fetch livestreams for a channel
  const fetchLivestreams = async (targetChannelId: string): Promise<void> => {
    try {
      setLoading(true);
      setError('');

      // Search for livestreams (both live and completed)
      const searchResponse = await fetch(
        `${BASE_URL}/search?part=snippet&channelId=${targetChannelId}&eventType=completed&type=video&order=date&maxResults=50&key=${API_KEY}`,
        {
          headers: {
            'Cache-Control': 'max-age=3600'
          }
        }
      );
      const searchData = await searchResponse.json();

      if (searchData.error) {
        throw new Error(searchData.error.message);
      }

      // Also search for currently live streams
      const liveResponse = await fetch(
        `${BASE_URL}/search?part=snippet&channelId=${targetChannelId}&eventType=live&type=video&key=${API_KEY}`,
        {
          headers: {
            'Cache-Control': 'max-age=3600'
          }
        }
      );
      const liveData = await liveResponse.json();

      // Combine results
      const allVideos = [
        ...(liveData.items || []),
        ...(searchData.items || [])
      ];

      if (allVideos.length === 0) {
        setLivestreams([]);
        return;
      }

      // Get video IDs for detailed information
      const videoIds = allVideos.map((video: any) => video.id.videoId).join(',');

      // Fetch detailed video information
      const videosResponse = await fetch(
        `${BASE_URL}/videos?part=snippet,liveStreamingDetails,statistics&id=${videoIds}&key=${API_KEY}`,
        {
          next: {
            revalidate: 3600 // Cache for 1 hour
          }
          
        }
      );
      const videosData = await videosResponse.json();

      if (videosData.error) {
        throw new Error(videosData.error.message);
      }

      // Filter only livestreams and format data
      const livestreamData: Livestream[] = videosData.items
        .filter((video: any) => video.liveStreamingDetails)
        .map((video: any) => ({
          id: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          thumbnail: video.snippet.thumbnails.medium.url,
          publishedAt: video.snippet.publishedAt,
          isLive: !video.liveStreamingDetails.actualEndTime,
          scheduledStartTime: video.liveStreamingDetails.scheduledStartTime,
          actualStartTime: video.liveStreamingDetails.actualStartTime,
          actualEndTime: video.liveStreamingDetails.actualEndTime,
          concurrentViewers: video.liveStreamingDetails.concurrentViewers,
          viewCount: video.statistics.viewCount,
          likeCount: video.statistics.likeCount,
          url: `https://www.youtube.com/watch?v=${video.id}`
        }))
        .sort((a: Livestream, b: Livestream) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).slice(0, 5); // Limit to 50 results

      setLivestreams(livestreamData);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const channelId = await getChannelIdFromHandle('@LateNightOnBase');
        await fetchLivestreams(channelId);
      } catch (error: any) {
        setError(error.message);
      }
    };

    fetchData();
  }, []);

  const liveStreams = livestreams.filter((stream) => stream.isLive);
  const pastStreams = livestreams.filter((stream) => !stream.isLive);

  return (
    <div className="max-w-6xl mx-auto p-4 text-white animate-rise">
      
      {loading && !error && (
        <div className="text-center py-12">
          <p className="text-gray-400"><RiLoader5Fill className='animate-spin text-white mx-auto text-[40px]' /></p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-800 border border-red-600 rounded-lg">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {!loading && liveStreams.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Currently Live</h2>
          {liveStreams.map((stream) => (
            <div key={stream.id} className="mb-6 bg-red-800/50 w-full aspect-video p-4 rounded-lg">
              <iframe
              width={'100%'}
                src={`https://www.youtube.com/embed/${stream.id}`}
                title={stream.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <h3 className="font-semibold text-white mt-2 text-lg">
                {stream.title}
              </h3>
              <p className="text-sm text-gray-400">
                {stream.description.slice(0, 100)}
              </p>
            </div>
          ))}
        </div>
      )}

      {!loading && pastStreams.length > 0 && (
        <div className="relative">
          <h2 className="text-xl font-semibold text-white mb-4">Past Livestreams</h2>
          <button
            className="absolute -left-4 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full z-10"
            onClick={() => {
              const container = document.getElementById('carousel');
              if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
            }}
          >
            ◀
          </button>
          <div
            id="carousel"
            className="flex gap-4 overflow-x-auto scrollbar-hide"
          >
            {pastStreams.map((stream) => (
              <div
                key={stream.id}
                className="min-w-[250px] bg-red-800/20 border border-red-600 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <a
                    href={stream.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={stream.thumbnail}
                      alt={stream.title}
                      className="w-full h-32 object-cover"
                    />
                  </a>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2">
                    {stream.title}
                  </h3>
                  <p className="text-xs text-gray-300">
                    {new Date(stream.publishedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button
            className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full z-10"
            onClick={() => {
              const container = document.getElementById('carousel');
              if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
            }}
          >
            ▶
          </button>
        </div>
      )}

      {!loading && livestreams.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-gray-400">No livestreams found.</p>
        </div>
      )}
    </div>
  );
};

export default YouTubeLivestreamFetcher;