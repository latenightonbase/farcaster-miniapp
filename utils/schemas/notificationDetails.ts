import mongoose from 'mongoose';

const notificationDetailsSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  fid: {
    type: Number,
    required: true,
  },
  wallet: {
    type: String,
    required: true,
  },
});

const NotificationDetails = mongoose.models?.NotificationDetails || mongoose.model('NotificationDetails', notificationDetailsSchema);

export default NotificationDetails;