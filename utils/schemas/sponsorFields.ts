import mongoose from 'mongoose';

const sponsorFieldsSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // TTL of 24 hours in seconds
  },
});

const SponsorFields = mongoose.models?.SponsorFields || mongoose.model('SponsorFields', sponsorFieldsSchema);

export default SponsorFields;
