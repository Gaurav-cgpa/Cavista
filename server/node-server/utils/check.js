const THRESHOLDS = {
  heartRate: {
    min: 60,
    max: 100,
    critical_min: 40,
    critical_max: 120
  },
  systolicBP: {
    min: 90,
    max: 120,
    critical_min: 70,
    critical_max: 180
  },
  diastolicBP: {
    min: 60,
    max: 80,
    critical_min: 40,
    critical_max: 120
  },
  glucose: {
    min: 70,
    max: 140,
    critical_min: 50,
    critical_max: 250
  },
  sleepHours: {
    min: 6,
    max: 9,
    critical_min: 3,
    critical_max: 12
  }
};

export const checkVitalsForAlerts = (vitalsArray) => {
  const alerts = [];
  let hasEmergency = false;

  vitalsArray.forEach((vital, index) => {
    const vitalAlerts = checkSingleVital(vital);
    
    if (vitalAlerts.length > 0) {
      alerts.push({
        timestamp: vital.timestamp,
        recordId: vital._id,
        alerts: vitalAlerts,
        isLatest: index === 0
      });

      if (vitalAlerts.some(alert => alert.severity === 'emergency')) {
        hasEmergency = true;
      }
    }
  });

  return {
    alerts,
    hasEmergency,
    totalAlerts: alerts.length
  };
};

const checkSingleVital = (vital) => {
  const alerts = [];

  if (vital.heartRate) {
    if (vital.heartRate < THRESHOLDS.heartRate.critical_min || 
        vital.heartRate > THRESHOLDS.heartRate.critical_max) {
      alerts.push({
        type: 'heartRate',
        value: vital.heartRate,
        severity: 'emergency',
        message: `Critical heart rate: ${vital.heartRate} bpm`
      });
    } else if (vital.heartRate < THRESHOLDS.heartRate.min || 
               vital.heartRate > THRESHOLDS.heartRate.max) {
      alerts.push({
        type: 'heartRate',
        value: vital.heartRate,
        severity: 'warning',
        message: `Abnormal heart rate: ${vital.heartRate} bpm`
      });
    }
  }

  if (vital.systolicBP) {
    if (vital.systolicBP < THRESHOLDS.systolicBP.critical_min || 
        vital.systolicBP > THRESHOLDS.systolicBP.critical_max) {
      alerts.push({
        type: 'systolicBP',
        value: vital.systolicBP,
        severity: 'emergency',
        message: `Critical systolic BP: ${vital.systolicBP} mmHg`
      });
    } else if (vital.systolicBP < THRESHOLDS.systolicBP.min || 
               vital.systolicBP > THRESHOLDS.systolicBP.max) {
      alerts.push({
        type: 'systolicBP',
        value: vital.systolicBP,
        severity: 'warning',
        message: `Elevated systolic BP: ${vital.systolicBP} mmHg`
      });
    }
  }

  if (vital.diastolicBP) {
    if (vital.diastolicBP < THRESHOLDS.diastolicBP.critical_min || 
        vital.diastolicBP > THRESHOLDS.diastolicBP.critical_max) {
      alerts.push({
        type: 'diastolicBP',
        value: vital.diastolicBP,
        severity: 'emergency',
        message: `Critical diastolic BP: ${vital.diastolicBP} mmHg`
      });
    } else if (vital.diastolicBP < THRESHOLDS.diastolicBP.min || 
               vital.diastolicBP > THRESHOLDS.diastolicBP.max) {
      alerts.push({
        type: 'diastolicBP',
        value: vital.diastolicBP,
        severity: 'warning',
        message: `Abnormal diastolic BP: ${vital.diastolicBP} mmHg`
      });
    }
  }

  if (vital.glucose) {
    if (vital.glucose < THRESHOLDS.glucose.critical_min || 
        vital.glucose > THRESHOLDS.glucose.critical_max) {
      alerts.push({
        type: 'glucose',
        value: vital.glucose,
        severity: 'emergency',
        message: `Critical glucose level: ${vital.glucose} mg/dL`
      });
    } else if (vital.glucose < THRESHOLDS.glucose.min || 
               vital.glucose > THRESHOLDS.glucose.max) {
      alerts.push({
        type: 'glucose',
        value: vital.glucose,
        severity: 'warning',
        message: `Abnormal glucose level: ${vital.glucose} mg/dL`
      });
    }
  }

  if (vital.sleepHours !== undefined) {
    if (vital.sleepHours < THRESHOLDS.sleepHours.critical_min) {
      alerts.push({
        type: 'sleepHours',
        value: vital.sleepHours,
        severity: 'emergency',
        message: `Critically low sleep: ${vital.sleepHours} hours`
      });
    } else if (vital.sleepHours < THRESHOLDS.sleepHours.min || 
               vital.sleepHours > THRESHOLDS.sleepHours.max) {
      alerts.push({
        type: 'sleepHours',
        value: vital.sleepHours,
        severity: 'warning',
        message: `Unusual sleep duration: ${vital.sleepHours} hours`
      });
    }
  }

  return alerts;
};