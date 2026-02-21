import mongoose from "mongoose";

const cronJobLogSchema = new mongoose.Schema({
    jobName: {
        type: String,
        required: true,
        default: "generateAndStoreVitals",
        index: true
    },
    patientId: {
        type: String,
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ["success", "failure"],
        required: true,
        index: true
    },
    runAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    durationMs: {
        type: Number,
        required: false
    },
    errorMessage: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

cronJobLogSchema.index({ runAt: -1 });
cronJobLogSchema.index({ jobName: 1, runAt: -1 });

const CronJobLog = mongoose.model("CronJobLog", cronJobLogSchema);

export default CronJobLog;
