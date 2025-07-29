import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import { RiLoader5Fill } from 'react-icons/ri';
import moment from 'moment';
import { IoIosArrowBack } from "react-icons/io";
import YoutubeLivestream from '@/utils/schemas/youtubeLivestream';
import { connectToDB } from '@/utils/db';
import { GoDotFill } from 'react-icons/go';


interface Livestream {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string | Date;
  isLive: boolean;
  scheduledStartTime?: string | Date;
  actualStartTime?: string | Date;
  actualEndTime?: string | Date;
  concurrentViewers?: number;
  viewCount: string;
  likeCount: string;
  url: string;
}

const YouTubeLivestreamFetcher: React.FC = () => {
  const [livestreams, setLivestreams] = useState<Livestream[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false); // Set both to false initially
  const [liveVideo, setLiveVideo] = useState<Livestream | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const API_KEY = process.env.NEXT_PUBLIC_YT_API_KEY;
  const BASE_URL = 'https://www.googleapis.com/youtube/v3';
  const CHANNEL_ID = 'UCR0I2Gom-W6BG_a5MYz8p2g';

  const fetchLivestreamsFromDB = async () => {
    try {
      const response = await fetch('/api/youtube-livestreams');
      if (!response.ok) {
        throw new Error('Failed to fetch livestreams from API');
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }
      return data.data;
    } catch (error) {
      console.error('Error fetching livestreams:', error);
      return [];
    }
  };

  const saveLivestreamsToDB = async (livestreams: Livestream[]) => {
    try {
      const response = await fetch('/api/save-youtube-livestreams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(livestreams),
      });
      if (!response.ok) {
        throw new Error('Failed to save livestreams to API');
      }
    } catch (error) {
      console.error('Error saving livestreams:', error);
    }
  };

  // Fetch livestreams for a channel
  const fetchLivestreams = async (): Promise<void> => {
    try {
      setLoading(true);
      const dbLivestreams = await fetchLivestreamsFromDB();

      if (dbLivestreams.length > 0) {
        const formattedLivestreams = dbLivestreams.map((stream: Livestream) => ({
          ...stream,
          publishedAt: typeof stream.publishedAt === 'string' ? stream.publishedAt : stream.publishedAt instanceof Date ? stream.publishedAt.toISOString() : '',
          scheduledStartTime: typeof stream.scheduledStartTime === 'string' ? stream.scheduledStartTime : stream.scheduledStartTime instanceof Date ? stream.scheduledStartTime.toISOString() : '',
          actualStartTime: typeof stream.actualStartTime === 'string' ? stream.actualStartTime : stream.actualStartTime instanceof Date ? stream.actualStartTime.toISOString() : '',
          actualEndTime: typeof stream.actualEndTime === 'string' ? stream.actualEndTime : stream.actualEndTime instanceof Date ? stream.actualEndTime.toISOString() : '',
        }));
        const liveStream = formattedLivestreams.find((stream: Livestream) => stream.isLive);
        setLiveVideo(liveStream || null);
        setLivestreams(formattedLivestreams.filter((stream: Livestream) => !stream.isLive));
        return;
      }

      // Search for the last 5 videos
      const searchResponse = await fetch(
        `${BASE_URL}/search?part=snippet&channelId=${CHANNEL_ID}&type=video&order=date&maxResults=5&key=${API_KEY}`,
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

      if (!searchData.items || searchData.items.length === 0) {
        setLivestreams([]);
        return;
      }

      // Get video IDs for detailed information
      const videoIds = searchData.items.map((video: any) => video.id.videoId).join(',');

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

      // Format data
      const livestreamData: Livestream[] = videosData.items
        .map((video: any) => ({
          id: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          thumbnail: video.snippet.thumbnails.medium.url,
          publishedAt: video.snippet.publishedAt,
          isLive: video.liveStreamingDetails ? !video.liveStreamingDetails.actualEndTime : false,
          scheduledStartTime: video.liveStreamingDetails?.scheduledStartTime,
          actualStartTime: video.liveStreamingDetails?.actualStartTime,
          actualEndTime: video.liveStreamingDetails?.actualEndTime,
          concurrentViewers: video.liveStreamingDetails?.concurrentViewers,
          viewCount: video.statistics.viewCount,
          likeCount: video.statistics.likeCount,
          url: `https://www.youtube.com/watch?v=${video.id}`
        }));

      const liveStream = livestreamData.find((stream: Livestream) => stream.isLive);
      setLiveVideo(liveStream || null);
      setLivestreams(livestreamData.filter((stream: Livestream) => !stream.isLive));
      await saveLivestreamsToDB(livestreamData);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLivestreams();
  }, []);

  const updateScrollButtons = () => {
    const container = carouselRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollLeft + container.clientWidth < container.scrollWidth);
    }
  };

  useEffect(() => {
    const container = carouselRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollButtons);
      updateScrollButtons(); // Ensure buttons are updated on mount
      return () => container.removeEventListener('scroll', updateScrollButtons);
    }
  }, [livestreams]); // Re-run when livestreams change

  return (
    <div className="max-w-6xl mx-auto p-4 text-white animate-rise">
      {liveVideo && (
        <div className="mb-8">
          <h2 className="bg-red-500 px-4 py-1 flex items-center justify-center rounded-lg text-xl font-semibold text-white mb-4 text-center">
          <GoDotFill className='text-2xl animate-pulse'/> Live Now</h2>
          <div className="relative bg-black rounded-lg overflow-hidden shadow-xl ">
            <iframe
              width="100%"
              height="200"
              src={`https://www.youtube.com/embed/${liveVideo.id}`}
              title={liveVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <div className="p-3 bg-red-900">
              <h3 className="font-semibold text-white text-sm mb-1">
                {liveVideo.title}
              </h3>
              <p className="text-xs text-gray-300">
                {moment(liveVideo.publishedAt).fromNow()}
              </p>
            </div>
          </div>
        </div>
      )}

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

      {!loading && livestreams.length > 0 && (
        <div className="relative mb-10">
          <h2 className="text-xl font-semibold text-white mb-4 text-center">Latest Videos</h2>
          {canScrollLeft && (
            <button
              className="absolute -left-4 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full z-10"
              onClick={() => {
                const container = carouselRef.current;
                if (container) {
                  container.scrollBy({ left: -300, behavior: 'smooth' });
                }
              }}
            >
              <IoIosArrowBack className="text-xl" />
            </button>
          )}
          <div
            id="carousel"
            ref={carouselRef}
            className="flex gap-4 overflow-x-scroll bg-black/50 rounded-xl p-3"
          >
            <div className='flex gap-4'>
              {livestreams.map((stream) => (
                <div
                  key={stream.id}
                  className="min-w-[250px] bg-red-800/20 border-x-[2px] border-red-500/30 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative">
                    {playingVideoId === stream.id ? (
                      <iframe
                        width="100%"
                        height="180"
                        src={`https://www.youtube.com/embed/${stream.id}`}
                        title={stream.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <img
                        src={stream.thumbnail}
                        alt={stream.title}
                        className="w-full h-[180px] object-cover cursor-pointer"
                        onClick={() => setPlayingVideoId(stream.id)}
                      />
                    )}
                    {stream.isLive && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                        LIVE
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2">
                      {stream.title}
                    </h3>
                    <p className="text-xs text-gray-300">
                      {moment(stream.publishedAt).fromNow()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {canScrollRight && (
            <button
              className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full z-10"
              onClick={() => {
                const container = carouselRef.current;
                if (container) {
                  container.scrollBy({ left: 300, behavior: 'smooth' });
                }
              }}
            >
              <IoIosArrowBack className="text-xl rotate-180" />
            </button>
          )}
        </div>
      )}

      {!loading && livestreams.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-gray-400">No videos found.</p>
        </div>
      )}
    </div>
  );
};

export default YouTubeLivestreamFetcher;