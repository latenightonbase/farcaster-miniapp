import React, { useState, useEffect } from 'react';
import { Radio, Eye, Calendar, Video } from 'lucide-react';

interface Stream {
  id: string;
  userId: string;
  userLogin: string;
  userName: string;
  gameId: string;
  gameName: string;
  title: string;
  viewerCount: number;
  startedAt: string;
  language: string;
  thumbnailUrl: string;
  tagIds: string[];
  isMature: boolean;
  isLive: boolean;
  type: string;
}

interface Video {
  id: string;
  streamId: string;
  userId: string;
  userLogin: string;
  userName: string;
  title: string;
  description: string;
  createdAt: string;
  publishedAt: string;
  url: string;
  thumbnailUrl: string;
  viewable: boolean;
  viewCount: number;
  language: string;
  type: string;
  duration: string;
  mutedSegments: any;
  isLive: boolean;
}

const TwitchStreamFetcher = () => {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [activeTab, setActiveTab] = useState('live'); // 'live' or 'past'

  // Replace with your Twitch app credentials
  const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || 'YOUR_TWITCH_CLIENT_ID';
  const CLIENT_SECRET = process.env.NEXT_PUBLIC_TWITCH_CLIENT_SECRET || 'YOUR_TWITCH_CLIENT_SECRET';
  const BASE_URL = 'https://api.twitch.tv/helix';

  // Get OAuth token for app access
  const getAccessToken = async (): Promise<string> => {
    try {
      const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: 'client_credentials'
        }),
        next:{
          revalidate:3600
        }
      });

      const data = await response.json();
      
      if (data.access_token) {
        setAccessToken(data.access_token);
        return data.access_token;
      } else {
        throw new Error('Failed to get access token');
      }
    } catch (error: unknown) {
      throw new Error(`Token error: ${(error as Error).message}`);
    }
  };

  // Get user ID from username
  const getUserId = async (username: string, token: string): Promise<{ id: string; displayName: string; profileImage: string; description: string }> => {
    try {
      const response = await fetch(`${BASE_URL}/users?login=${username}`, {
        headers: {
          'Client-ID': CLIENT_ID,
          'Authorization': `Bearer ${token}`
        },
        next:{
          revalidate:3600
        }
      });

      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        return {
          id: data.data[0].id,
          displayName: data.data[0].display_name,
          profileImage: data.data[0].profile_image_url,
          description: data.data[0].description
        };
      }
      throw new Error('User not found');
    } catch (error: unknown) {
      throw new Error(`Error fetching user: ${(error as Error).message}`);
    }
  };

  // Fetch current live streams
  const fetchLiveStreams = async (userId: string, token: string): Promise<Stream[]> => {
    try {
      const response = await fetch(`${BASE_URL}/streams?user_id=${userId}`, {
        headers: {
          'Client-ID': CLIENT_ID,
          'Authorization': `Bearer ${token}`
        },
        next:{
          revalidate:3600
        }
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message);
      }

      return data.data.map((stream: any) => ({
        id: stream.id,
        userId: stream.user_id,
        userLogin: stream.user_login,
        userName: stream.user_name,
        gameId: stream.game_id,
        gameName: stream.game_name,
        title: stream.title,
        viewerCount: stream.viewer_count,
        startedAt: stream.started_at,
        language: stream.language,
        thumbnailUrl: stream.thumbnail_url,
        tagIds: stream.tag_ids,
        isMature: stream.is_mature,
        isLive: true,
        type: 'live'
      }));
    } catch (error: unknown) {
      throw new Error(`Error fetching live streams: ${(error as Error).message}`);
    }
  };

  // Fetch past videos/VODs
  const fetchPastVideos = async (userId: string, token: string): Promise<Video[]> => {
    try {
      const response = await fetch(`${BASE_URL}/videos?user_id=${userId}&type=archive&first=20`, {
        headers: {
          'Client-ID': CLIENT_ID,
          'Authorization': `Bearer ${token}`
        },
        next:{
          revalidate:3600
        }
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message);
      }

      return data.data.map((video: any) => ({
        id: video.id,
        streamId: video.stream_id,
        userId: video.user_id,
        userLogin: video.user_login,
        userName: video.user_name,
        title: video.title,
        description: video.description,
        createdAt: video.created_at,
        publishedAt: video.published_at,
        url: video.url,
        thumbnailUrl: video.thumbnail_url,
        viewable: video.viewable,
        viewCount: video.view_count,
        language: video.language,
        type: video.type,
        duration: video.duration,
        mutedSegments: video.muted_segments,
        isLive: false
      }));
    } catch (error: unknown) {
      throw new Error(`Error fetching past videos: ${(error as Error).message}`);
    }
  };

  // Main function to fetch streams and videos
  const fetchStreamsAndVideos = async (username: string) => {
    try {
      setLoading(true);
      setError('');
      setStreams([]);
      setVideos([]);

      // Get access token if not available
      let token = accessToken;
      if (!token) {
        token = await getAccessToken();
      }

      // Get user information
      const userInfo = await getUserId(username.toLowerCase().trim(), token);
      
      // Fetch both live streams and past videos
      const [liveStreams, pastVideos] = await Promise.all([
        fetchLiveStreams(userInfo.id, token),
        fetchPastVideos(userInfo.id, token)
      ]);

      setStreams(liveStreams);
      setVideos(pastVideos);

      // Set active tab based on what we found
      if (liveStreams.length > 0) {
        setActiveTab('live');
      } else if (pastVideos.length > 0) {
        setActiveTab('past');
      }

    } catch (error:any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Get access token if not available
        let token = accessToken;
        if (!token) {
          token = await getAccessToken();
        }

        // Get user information for the channel 'latenightonbase'
        const userInfo = await getUserId('latenightonbase', token);

        // Fetch both live streams and past videos
        const [liveStreams, pastVideos] = await Promise.all([
          fetchLiveStreams(userInfo.id, token),
          fetchPastVideos(userInfo.id, token)
        ]);

        setStreams(liveStreams);
        setVideos(pastVideos);

        // Set active tab based on what we found
        if (liveStreams.length > 0) {
          setActiveTab('live');
        } else if (pastVideos.length > 0) {
          setActiveTab('past');
        }
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (duration: string): string => {
    if (!duration) return 'Unknown';
    
    // Parse duration string like "1h2m3s"
    const hours = duration.match(/(\d+)h/);
    const minutes = duration.match(/(\d+)m/);
    const seconds = duration.match(/(\d+)s/);
    
    let formatted = '';
    if (hours) formatted += `${hours[1]}h `;
    if (minutes) formatted += `${minutes[1]}m `;
    if (seconds) formatted += `${seconds[1]}s`;
    
    return formatted.trim() || duration;
  };

  const formatViewCount = (count: number): string => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getTimeSince = (dateString: string): string => {
    const now = new Date();
    const streamStart = new Date(dateString);
    const diffMs = now.getTime() - streamStart.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 text-white animate-rise">
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading...</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-800 border border-red-600 rounded-lg">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {!loading && streams.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-red-800 mb-4">Currently Live</h2>
          {streams.map((stream) => (
            <div key={stream.id} className="mb-6 bg-red-800/50 w-full aspect-video p-4 rounded-lg">
              <iframe
                width={'100%'}
                src={`https://player.twitch.tv/?channel=${stream.userLogin}&parent=localhost`}
                title={stream.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <h3 className="font-semibold text-white mt-2 text-lg">
                {stream.title}
              </h3>
              <p className="text-sm text-gray-400">
                {stream.viewerCount} viewers
              </p>
            </div>
          ))}
        </div>
      )}

      {!loading && videos.length > 0 && (
        <div className="relative">
          <h2 className="text-xl font-semibold text-white mb-4 text-center">Past Streams</h2>
          <div className="grid gap-4 lg:grid-cols-2 lg:grid-cols-3 p-3 bg-black/40 rounded-xl">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-red-800/20 border p-3 border-red-600 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative rounded-lg overflow-hidden">
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={video.thumbnailUrl.replace('%{width}', '320').replace('%{height}', '180')}
                      alt={video.title}
                      className="w-full h-48 object-cover"
                    />
                  </a>
                </div>
                <div className="p-3 pb-0">
                  <h3 className="font-semibold text-white text-lg mb-1 line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-xs text-right text-bill-blue">
                    {new Date(video.publishedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && streams.length === 0 && videos.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-gray-400">No streams or videos found.</p>
        </div>
      )}
    </div>
  );
};

export default TwitchStreamFetcher;