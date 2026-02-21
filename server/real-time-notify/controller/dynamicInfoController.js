import Vitals from '../schema/vital.js';
import { checkVitalsForAlerts } from '../utils/check.js'; // Ensure this is imported
import { sendAlertEmail } from '../utils/email.js';

export const updatePatientDynamicDetails = async (req, res) => {
    try {
        const { patientId, responseData } = req.body;

        if (!patientId || !responseData) {
            return res.status(400).json({ success: false, message: "Missing Patient ID or data payload." });
        }

        const updatedRecord = await Vitals.findOneAndUpdate(
            { patientId: patientId },
            { 
                $push: { 
                    history: { 
                        data: responseData, 
                        timestamp: new Date() 
                    } 
                },
                $set: { updatedAt: new Date() }
            },
            { new: true, runValidators: true } 
        ).lean();

        if (!updatedRecord) {
            return res.status(404).json({ success: false, message: "Patient record not found." });
        }

        const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
        const recentHistory = updatedRecord.history
            .filter(log => new Date(log.timestamp) >= threeHoursAgo)
            .reverse(); 

        const alertResults = checkVitalsForAlerts(recentHistory);

        if (alertResults.hasEmergency) {
            sendAlertEmail(req.user.email, req.user.fullName, alertResults.alerts)
                .catch(err => console.error('Background Email Failed:', err));
        }


        return res.status(200).json({
            success: true,
            message: "Data synchronized and analyzed.",
            isEmergency: alertResults.hasEmergency, 
            alerts: alertResults.alerts,
            latestData: responseData,
            historyCount: updatedRecord.history.length
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

export const getRecentVitals = async (req, res) => {
    try {
        const { patientId } = req.params; 
        const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);

        const record = await Vitals.findOne({ patientId }).lean();

        if (!record || !record.history) {
            return res.status(200).json({ success: true, data: [], alerts: [] });
        }

        const recentVitals = record.history
            .filter(v => new Date(v.timestamp) >= threeHoursAgo)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        const alertResults = checkVitalsForAlerts(recentVitals);

        res.status(200).json({
            success: true,
            data: recentVitals,
            alerts: alertResults.alerts,
            hasEmergency: alertResults.hasEmergency,
            summary: {
                totalRecords: recentVitals.length,
                latestReading: recentVitals[0]
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};