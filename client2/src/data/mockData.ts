export const vitals = {
  heartRate: { value: 72, unit: "bpm", status: "normal" as const, trend: "+2" },
  bloodPressure: { value: "120/80", unit: "mmHg", status: "normal" as const, trend: "stable" },
  glucose: { value: 95, unit: "mg/dL", status: "normal" as const, trend: "-3" },
  sleep: { value: 7.5, unit: "hrs", status: "good" as const, trend: "+0.5" },
};

export const weeklyHeartRate = [
  { day: "Mon", value: 70 }, { day: "Tue", value: 74 }, { day: "Wed", value: 68 },
  { day: "Thu", value: 72 }, { day: "Fri", value: 76 }, { day: "Sat", value: 71 },
  { day: "Sun", value: 69 },
];

export const glucoseTrends = [
  { day: "Mon", fasting: 92, postMeal: 130 }, { day: "Tue", fasting: 88, postMeal: 125 },
  { day: "Wed", fasting: 95, postMeal: 140 }, { day: "Thu", fasting: 90, postMeal: 128 },
  { day: "Fri", fasting: 93, postMeal: 135 }, { day: "Sat", fasting: 87, postMeal: 122 },
  { day: "Sun", fasting: 91, postMeal: 130 },
];

export const riskPrediction = {
  overall: "Low" as const,
  score: 22,
  factors: [
    { name: "Cardiovascular", level: "Low", score: 15 },
    { name: "Diabetes", level: "Low", score: 20 },
    { name: "Hypertension", level: "Moderate", score: 35 },
  ],
};

export const alerts = [
  { id: 1, type: "warning" as const, message: "Elevated heart rate detected during sleep", time: "2h ago", read: false },
  { id: 2, type: "info" as const, message: "Blood pressure trending slightly higher this week", time: "5h ago", read: false },
  { id: 3, type: "success" as const, message: "Glucose levels stable for 7 consecutive days", time: "1d ago", read: true },
  { id: 4, type: "warning" as const, message: "Sleep duration below recommended 8 hours", time: "1d ago", read: true },
];

export const medications = [
  { id: 1, name: "Metformin", dosage: "500mg", time: "8:00 AM", taken: true },
  { id: 2, name: "Lisinopril", dosage: "10mg", time: "9:00 AM", taken: true },
  { id: 3, name: "Vitamin D3", dosage: "2000 IU", time: "12:00 PM", taken: false },
  { id: 4, name: "Omega-3", dosage: "1000mg", time: "6:00 PM", taken: false },
];

export const chatMessages = [
  { id: 1, sender: "bot" as const, message: "Hello! I'm your AI Health Assistant. How can I help you today?" }
];

export const mealPlan = [
  { meal: "Breakfast", items: ["Oatmeal with berries", "Green tea", "Boiled eggs"], calories: 380, time: "7:30 AM" },
  { meal: "Lunch", items: ["Grilled chicken salad", "Quinoa", "Lemon water"], calories: 520, time: "12:30 PM" },
  { meal: "Snack", items: ["Mixed nuts", "Apple slices"], calories: 180, time: "3:30 PM" },
  { meal: "Dinner", items: ["Baked salmon", "Steamed vegetables", "Brown rice"], calories: 480, time: "7:00 PM" },
];

export const lifestyleMetrics = {
  steps: { current: 6840, goal: 10000 },
  water: { current: 5, goal: 8, unit: "glasses" },
  calories: { consumed: 1560, goal: 2000 },
  exercise: { minutes: 25, goal: 45 },
};

export const patients = [
  { id: 1, name: "John Doe", age: 45, risk: "Low" as const, lastVisit: "2024-01-15", alerts: 1, conditions: ["Hypertension"] },
  { id: 2, name: "Sarah Smith", age: 62, risk: "High" as const, lastVisit: "2024-01-14", alerts: 3, conditions: ["Diabetes", "Heart Disease"] },
  { id: 3, name: "Mike Johnson", age: 38, risk: "Low" as const, lastVisit: "2024-01-13", alerts: 0, conditions: [] },
  { id: 4, name: "Emily Davis", age: 55, risk: "Moderate" as const, lastVisit: "2024-01-12", alerts: 2, conditions: ["Diabetes"] },
  { id: 5, name: "Robert Wilson", age: 70, risk: "High" as const, lastVisit: "2024-01-11", alerts: 4, conditions: ["COPD", "Hypertension", "Obesity"] },
  { id: 6, name: "Lisa Anderson", age: 42, risk: "Low" as const, lastVisit: "2024-01-10", alerts: 0, conditions: ["Asthma"] },
];
