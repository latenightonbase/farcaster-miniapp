import React, { useState, useEffect } from 'react';
import { Search, Radio, Clock, Users, Eye, Calendar, Video } from 'lucide-react';

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
  const [username, setUsername] = useState('');
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
        })
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

  // Main search function
  const handleSearch = async () => {
    if (!username.trim()) {
      setError('Please enter a Twitch username');
      return;
    }

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
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-900 mb-2">
          Twitch Stream Fetcher
        </h1>
        <p className="text-gray-600">
          Fetch live and past stream details from any Twitch channel
        </p>
      </div>

      {/* Search Controls */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Enter Twitch username (e.g., ninja, shroud)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Search size={20} />
            {loading ? 'Searching...' : 'Search Streams'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
            <p className="text-sm text-red-500 mt-1">
              Make sure you have valid Twitch API credentials configured
            </p>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      {(streams.length > 0 || videos.length > 0) && (
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('live')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'live'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Radio size={16} />
                  Live Streams ({streams.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'past'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Video size={16} />
                  Past Streams ({videos.length})
                </div>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Live Streams */}
      {activeTab === 'live' && streams.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-purple-800">
            Currently Live
          </h2>
          {streams.map((stream) => (
            <div key={stream.id} className="mb-6">
              <iframe
                width="100%"
                height="360"
                src={`https://player.twitch.tv/?channel=${stream.userLogin}&parent=localhost`}
                title={stream.title}
                frameBorder="0"
                allowFullScreen
              ></iframe>
              <h3 className="font-semibold text-gray-900 mt-2">{stream.title}</h3>
            </div>
          ))}
        </div>
      )}

      {/* Past Videos */}
      {activeTab === 'past' && videos.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-purple-800">
            Past Streams (VODs)
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={video.thumbnailUrl.replace('%{width}', '320').replace('%{height}', '180')}
                      alt={video.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/320x180/9146ff/white?text=Twitch+VOD';
                      }}
                    />
                  </a>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                    {formatDuration(video.duration)}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <strong className="text-purple-600">{video.userName}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye size={14} />
                      {formatViewCount(video.viewCount)} views
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      {formatDate(video.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && streams.length === 0 && videos.length === 0 && username && !error && (
        <div className="text-center py-12">
          <p className="text-gray-500">No streams or videos found for this channel.</p>
        </div>
      )}
    </div>
  );
};

export default TwitchStreamFetcher;