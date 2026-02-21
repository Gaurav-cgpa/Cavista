import Vitals from '../schema/vital.js';
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
*/
export const generateAndStoreVitals = async (patientId = "P001") => {
    try {
        const vitals = generateVitals(patientId);

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

        console.log("✅ Cron: Vitals stored for", patientId);

    } catch (error) {
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
                alerts: [],
                hasEmergency: false
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

        return res.status(200).json({
            success: true,
            totalRecords: lastDayData.length,
            data: lastDayData,
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