import React, { useState, useEffect } from 'react';
import { Search, Heart, MessageCircle, Repeat, Share, Calendar, MapPin, Link, Verified, Users, Eye } from 'lucide-react';

interface User {
  id: string;
  name: string;
  username: string;
  profile_image_url: string;
  verified: boolean;
  description?: string;
  location?: string;
  url?: string;
  created_at: string;
  public_metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
}

interface Tweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  public_metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    impression_count?: number;
  };
  entities?: {
    urls?: Array<{ url: string; expanded_url: string; display_url: string }>;
    mentions?: Array<{ username: string }>;
    hashtags?: Array<{ tag: string }>;
  };
  attachments?: {
    media_keys?: string[];
  };
  author?: User;
  media?: Array<{
    media_key: string;
    type: string;
    url?: string;
    preview_image_url?: string;
    alt_text?: string;
  }>;
}

const TwitterFetcher = () => {
  const [username, setUsername] = useState('');
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchType, setSearchType] = useState('user'); // 'user' or 'search'
  const [searchQuery, setSearchQuery] = useState('');

  // Replace with your Twitter API Bearer Token
  const BEARER_TOKEN = process.env.NEXT_PUBLIC_X_BEARER_TOKEN;
  console.log('BEARER_TOKEN:', BEARER_TOKEN);
  const BASE_URL = 'https://api.twitter.com/2';

  // Get user information by username
  const getUserInfo = async (username: string): Promise<User> => {
    try {
      const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
      const url = `${BASE_URL}/users/by/username/${cleanUsername}?user.fields=created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,verified_type`;
      console.log('Fetching user info from URL:', url);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.errors) {
        throw new Error(data.errors[0].detail || 'User not found');
      }

      return data.data;
    } catch (error: unknown) {
      console.error('Error fetching user info:', error);
      throw new Error(`Error fetching user info: ${(error as Error).message}`);
    }
  };

  // Get user's tweets
  const getUserTweets = async (userId: string): Promise<{ tweets: Tweet[]; includes: any }> => {
    try {
      const url = `${BASE_URL}/users/${userId}/tweets?max_results=20&tweet.fields=created_at,author_id,conversation_id,in_reply_to_user_id,referenced_tweets,reply_settings,public_metrics,text,withheld,entities,attachments,context_annotations,geo,lang,possibly_sensitive,source&expansions=author_id,referenced_tweets.id,attachments.media_keys&media.fields=duration_ms,height,media_key,preview_image_url,type,url,width,alt_text,variants&user.fields=created_at,description,entities,id,location,name,profile_image_url,protected,public_metrics,url,username,verified`;
      console.log('Fetching user tweets from URL:', url);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.errors) {
        throw new Error(data.errors[0].detail || 'Failed to fetch tweets');
      }

      return {
        tweets: data.data || [],
        includes: data.includes || {}
      };
    } catch (error: unknown) {
      console.error('Error fetching tweets:', error);
      throw new Error(`Error fetching tweets: ${(error as Error).message}`);
    }
  };

  // Search tweets
  const searchTweets = async (query: string): Promise<{ tweets: Tweet[]; includes: any }> => {
    try {
      const url = `${BASE_URL}/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=20&tweet.fields=created_at,author_id,conversation_id,in_reply_to_user_id,referenced_tweets,reply_settings,public_metrics,text,withheld,entities,attachments,context_annotations,geo,lang,possibly_sensitive,source&expansions=author_id,referenced_tweets.id,attachments.media_keys&media.fields=duration_ms,height,media_key,preview_image_url,type,url,width,alt_text,variants&user.fields=created_at,description,entities,id,location,name,profile_image_url,protected,public_metrics,url,username,verified`;
      console.log('Searching tweets with URL:', url);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.errors) {
        throw new Error(data.errors[0].detail || 'Search failed');
      }

      return {
        tweets: data.data || [],
        includes: data.includes || {}
      };
    } catch (error: unknown) {
      console.error('Error searching tweets:', error);
      throw new Error(`Error searching tweets: ${(error as Error).message}`);
    }
  };

  // Process tweets with user data
  const processTweets = (tweetsData: Tweet[], includes: { users?: User[]; media?: any[] }): Tweet[] => {
    const users: Record<string, User> = {};
    const media: Record<string, any> = {};

    // Create lookup objects
    if (includes.users) {
      includes.users.forEach((user: User) => {
        users[user.id] = user;
      });
    }

    if (includes.media) {
      includes.media.forEach((mediaItem: any) => {
        media[mediaItem.media_key] = mediaItem;
      });
    }

    return tweetsData.map((tweet: Tweet) => ({
      ...tweet,
      author: users[tweet.author_id],
      media: tweet.attachments?.media_keys?.map((key: string) => media[key]).filter(Boolean) || []
    }));
  };

  const handleSearch = async () => {
    if (searchType === 'user' && !username.trim()) {
      setError('Please enter a Twitter username');
      return;
    }
    
    if (searchType === 'search' && !searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setTweets([]);
      setUserInfo(null);

      if (searchType === 'user') {
        // Get user info and tweets
        const userInfoData = await getUserInfo(username);
        const tweetsData = await getUserTweets(userInfoData.id);
        
        setUserInfo(userInfoData);
        setTweets(processTweets(tweetsData.tweets, tweetsData.includes));
      } else {
        // Search tweets
        const searchData = await searchTweets(searchQuery);
        setTweets(processTweets(searchData.tweets, searchData.includes));
      }

    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString();
  };

  const formatNumber = (num: number): string => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderTweetText = (text: string, entities?: { urls?: any[]; mentions?: any[]; hashtags?: any[] }): string => {
    if (!entities) return text;

    let processedText = text;

    // Replace URLs
    if (entities.urls) {
      entities.urls.forEach((url: { url: string; expanded_url: string; display_url: string }) => {
        processedText = processedText.replace(
          url.url,
          `<a href="${url.expanded_url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${url.display_url}</a>`
        );
      });
    }

    // Replace mentions
    if (entities.mentions) {
      entities.mentions.forEach((mention: { username: string }) => {
        processedText = processedText.replace(
          `@${mention.username}`,
          `<a href="https://twitter.com/${mention.username}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">@${mention.username}</a>`
        );
      });
    }

    // Replace hashtags
    if (entities.hashtags) {
      entities.hashtags.forEach((hashtag: { tag: string }) => {
        processedText = processedText.replace(
          `#${hashtag.tag}`,
          `<a href="https://twitter.com/hashtag/${hashtag.tag}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">#${hashtag.tag}</a>`
        );
      });
    }

    return processedText;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Twitter/X Content Fetcher
        </h1>
        <p className="text-gray-600">
          Fetch tweets and user information from Twitter/X
        </p>
      </div>

      {/* Search Controls */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="user"
                checked={searchType === 'user'}
                onChange={(e) => setSearchType(e.target.value)}
                className="mr-2"
              />
              User Timeline
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="search"
                checked={searchType === 'search'}
                onChange={(e) => setSearchType(e.target.value)}
                className="mr-2"
              />
              Search Tweets
            </label>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {searchType === 'user' ? (
            <input
              type="text"
              placeholder="Enter Twitter username (e.g., @elonmusk or elonmusk)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <input
              type="text"
              placeholder="Enter search query (e.g., javascript, #AI, from:username)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
          
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Search size={20} />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
            <p className="text-sm text-red-500 mt-1">
              Make sure you have a valid Twitter API Bearer Token configured
            </p>
          </div>
        )}
      </div>

      {/* User Info */}
      {userInfo && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <img
              src={userInfo.profile_image_url}
              alt={userInfo.name}
              className="w-20 h-20 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-bold text-gray-900">{userInfo.name}</h2>
                {userInfo.verified && (
                  <Verified className="w-5 h-5 text-blue-500" fill="currentColor" />
                )}
              </div>
              <p className="text-gray-600 mb-2">@{userInfo.username}</p>
              
              {userInfo.description && (
                <p className="text-gray-800 mb-3">{userInfo.description}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                {userInfo.location && (
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    {userInfo.location}
                  </div>
                )}
                
                {userInfo.url && (
                  <div className="flex items-center gap-1">
                    <Link size={14} />
                    <a href={userInfo.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      Website
                    </a>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  Joined {new Date(userInfo.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>
              
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-bold">{formatNumber(userInfo.public_metrics.following_count)}</span>
                  <span className="text-gray-600 ml-1">Following</span>
                </div>
                <div>
                  <span className="font-bold">{formatNumber(userInfo.public_metrics.followers_count)}</span>
                  <span className="text-gray-600 ml-1">Followers</span>
                </div>
                <div>
                  <span className="font-bold">{formatNumber(userInfo.public_metrics.tweet_count)}</span>
                  <span className="text-gray-600 ml-1">Tweets</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tweets */}
      {tweets.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            {searchType === 'user' ? 'Recent Tweets' : 'Search Results'} ({tweets.length})
          </h2>
          
          <div className="space-y-4">
            {tweets.map((tweet) => (
              <div
                key={tweet.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                {tweet.author && (
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={tweet.author.profile_image_url}
                      alt={tweet.author.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{tweet.author.name}</span>
                        {tweet.author.verified && (
                          <Verified className="w-4 h-4 text-blue-500" fill="currentColor" />
                        )}
                      </div>
                      <span className="text-gray-600 text-sm">@{tweet.author.username}</span>
                    </div>
                    <span className="text-gray-500 text-sm ml-auto">
                      {formatDate(tweet.created_at)}
                    </span>
                  </div>
                )}
                
                <div 
                  className="text-gray-900 mb-4 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: renderTweetText(tweet.text, tweet.entities)
                  }}
                />
                
                {tweet.media && tweet.media.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    {tweet.media.map((mediaItem, index) => (
                      <div key={index} className="rounded-lg overflow-hidden">
                        {mediaItem.type === 'photo' && (
                          <img
                            src={mediaItem.url}
                            alt={mediaItem.alt_text || 'Tweet image'}
                            className="w-full h-auto"
                          />
                        )}
                        {mediaItem.type === 'video' && (
                          <div className="bg-gray-100 p-4 rounded">
                            <p className="text-sm text-gray-600">Video content</p>
                            {mediaItem.preview_image_url && (
                              <img
                                src={mediaItem.preview_image_url}
                                alt="Video preview"
                                className="w-full h-auto mt-2 rounded"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-gray-500 text-sm border-t pt-3">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <MessageCircle size={16} />
                      {formatNumber(tweet.public_metrics.reply_count)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Repeat size={16} />
                      {formatNumber(tweet.public_metrics.retweet_count)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart size={16} />
                      {formatNumber(tweet.public_metrics.like_count)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye size={16} />
                      {formatNumber(tweet.public_metrics.impression_count || 0)}
                    </div>
                  </div>
                  
                  <a
                    href={`https://twitter.com/${tweet.author?.username}/status/${tweet.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline flex items-center gap-1"
                  >
                    <Share size={14} />
                    View on X
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && tweets.length === 0 && (username || searchQuery) && !error && (
        <div className="text-center py-12">
          <p className="text-gray-500">No tweets found.</p>
        </div>
      )}
    </div>
  );
};

export default TwitterFetcher;