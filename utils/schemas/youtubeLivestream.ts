import mongoose from 'mongoose';

const youtubeLivestreamSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  publishedAt: {
    type: Date,
    required: true,
  },
  isLive: {
    type: Boolean,
    required: true,
  },
  scheduledStartTime: {
    type: Date,
  },
  actualStartTime: {
    type: Date,
  },
  actualEndTime: {
    type: Date,
  },
  concurrentViewers: {
    type: Number,
  },
  viewCount: {
    type: String,
    required: true,
  },
  likeCount: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7200, // TTL of 4 hours in seconds
  },
});

const YoutubeLivestream = mongoose.models?.YoutubeLivestream || mongoose.model('YoutubeLivestream', youtubeLivestreamSchema);

export default YoutubeLivestream;
