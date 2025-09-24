import mongoose from 'mongoose';

const pastAuctionSchema = new mongoose.Schema({
  auctionName: {
    type: String,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  auctionData: {
    type: [{
      position: {
        type: Number,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      fid: {
        type: String,
        required: false,
      },
      entryAmount: {
        type: Number,
        required: true,
      },
      USDCValue: {
        type: Number,
        required: true,
      }
    }],
    required: true,
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PastAuction = mongoose.models?.PastAuction || mongoose.model('PastAuction', pastAuctionSchema);

export default PastAuction;
