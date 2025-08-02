import mongoose from 'mongoose';

const MetaSchema = new mongoose.Schema({
  meta_key: { type: String, required: true },
  meta_value: { type: String, required: true },
});

export default mongoose.models.Meta || mongoose.model('Meta', MetaSchema);