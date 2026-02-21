import mongoose from 'mongoose';

const VitalsSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  history: {
    type: [
      {
        data: Object,
        timestamp: Date
      }
    ],
    default: []
  },
  updatedAt: Date
});

export default mongoose.model('Vitals', VitalsSchema);