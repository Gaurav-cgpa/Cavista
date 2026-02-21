
export const generateVitals = (patientId) => {
  const heartRate = Math.floor(Math.random() * (110 - 60) + 60);
  const systolicBP = Math.floor(Math.random() * (130 - 110) + 110);
  const diastolicBP = Math.floor(Math.random() * (85 - 70) + 70);
  const glucose = Math.floor(Math.random() * (140 - 80) + 80);
  const sleepHours = Number((Math.random() * (8 - 5) + 5).toFixed(1));

  const now = new Date();

  return {
    patientId,
    heartRate,
    systolicBP,
    diastolicBP,
    glucose,
    sleepHours,
    timestamp: now,
    createdAt: now,
    updatedAt: now
  };
};


export const generateVitalsForPatient = async (patientId = "P001") => {
  const vitals = generateVitals(patientId);

  console.log("🩺 Generated Vitals:", vitals);

  return vitals;
};