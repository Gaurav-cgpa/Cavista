import Vitals from '../schema/vital.js';
import CronJobLog from '../schema/cronJobLog.js';
import { generateVitals } from '../utils/automaticCall.js';
import { checkVitalsForAlerts } from '../utils/check.js';
import { sendAlertEmail } from '../utils/email.js';

/*
|--------------------------------------------------------------------------
| CRON FUNCTION
|--------------------------------------------------------------------------
| Only generate + store
| NO email
| NO alert checking
| Logs each run to CronJobLog collection
*/
export const generateAndStoreVitals = async (patientId = "6999eb5370efa3e840b7ba71") => {
    const runAt = new Date();
    const start = Date.now();

    try {
        const vitals = generateVitals(patientId);
        console.log("Generated vitals for", patientId, ":", vitals);

        await Vitals.findOneAndUpdate(
            { patientId },
            {
                $push: {
                    history: {
                        data: vitals,
                        timestamp: new Date()
                    }
                },
                $set: { updatedAt: new Date() }
            },
            { upsert: true }
        );

        const durationMs = Date.now() - start;
        await CronJobLog.create({
            jobName: "generateAndStoreVitals",
            patientId,
            status: "success",
            runAt,
            durationMs
        });

        console.log("✅ Cron: Vitals stored for", patientId);

    } catch (error) {
        const durationMs = Date.now() - start;
        await CronJobLog.create({
            jobName: "generateAndStoreVitals",
            patientId,
            status: "failure",
            runAt,
            durationMs,
            errorMessage: error.message
        }).catch(logErr => console.error("Failed to log cron failure:", logErr.message));

        console.error("❌ Cron Error:", error.message);
    }
};


/*
|--------------------------------------------------------------------------
| FRONTEND API
|--------------------------------------------------------------------------
| Returns last 1 day data
| Runs check
| Sends email if emergency
*/
export const getLastOneDayVitals = async (req, res) => {
    try {
        const { patientId } = req.params;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: "Patient ID required"
            });
        }

        const record = await Vitals.findOne({ patientId }).lean();

        if (!record || !record.history.length) {
            return res.status(200).json({
                success: true,
                data: [],
                timeSeries: [],
                alerts: [],
                hasEmergency: false,
                latestReading: null,
                totalRecords: 0
            });
        }

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const lastDayData = record.history
            .filter(log => new Date(log.timestamp) >= oneDayAgo)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        const alertResults = checkVitalsForAlerts(lastDayData);

        if (alertResults.hasEmergency) {
            await sendAlertEmail(
                req.user?.email || "doctor@email.com",
                req.user?.fullName || "Doctor",
                alertResults.alerts
            );
        }

        const sortedByTime = [...lastDayData].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const timeSeries = sortedByTime.map((log) => {
            const d = new Date(log.timestamp);
            const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
            return {
                time,
                timestamp: log.timestamp,
                heartRate: log.data?.heartRate ?? null,
                systolicBP: log.data?.systolicBP ?? null,
                diastolicBP: log.data?.diastolicBP ?? null,
                glucose: log.data?.glucose ?? null,
                sleepHours: log.data?.sleepHours ?? null
            };
        });

        return res.status(200).json({
            success: true,
            record,
            totalRecords: lastDayData.length,
            data: lastDayData,
            timeSeries,
            alerts: alertResults.alerts,
            hasEmergency: alertResults.hasEmergency,
            latestReading: lastDayData[0] || null
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};