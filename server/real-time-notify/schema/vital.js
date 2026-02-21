import mongoose from "mongoose";

const vitalsSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    heartRate: {
        type: Number,
        required: true,
        min: [0, "Heart rate cannot be negative"]
    },
    systolicBP: {
        type: Number, 
        required: true
    },
    diastolicBP: {
        type: Number,
        required: true
    },
    glucose: {
        type: Number, 
        required: false
    },
    sleepHours: {
        type: Number,
        min: 0,
        max: 24,
        required: false
    },
    timestamp: {
        type: Date,
        default: Date.now 
    }
}, { 
    timestamps: true 
});


vitalsSchema.index({ userId: 1, timestamp: -1 });

const Vitals = mongoose.model("Vitals", vitalsSchema);

export default Vitals;