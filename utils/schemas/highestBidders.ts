import mongoose from 'mongoose';

const highestBidderSchema = new mongoose.Schema({
  fid: {
    type: Number,
    required: true,
  },
  usdcValue: {
    type: Number,
    required: true,
  },
});

const HighestBidder = mongoose.models?.HighestBidder || mongoose.model('HighestBidder', highestBidderSchema);

export default HighestBidder;