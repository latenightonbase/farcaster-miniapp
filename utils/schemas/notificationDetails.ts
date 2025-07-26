import mongoose from 'mongoose';

const notificationDetailsSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  fid: {
    type: String,
    required: true,
    unique: true,
  },
});

const NotificationDetails = mongoose.model('NotificationDetails', notificationDetailsSchema);

export default NotificationDetails;