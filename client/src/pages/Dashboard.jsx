import React from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Dummy Data
const timeLabels = [
  "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"
];
const dateLabels = [
  "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
];

const heartRateData = {
  labels: timeLabels,
  datasets: [
    {
      label: "Heart Rate (BPM)",
      data: [72, 78, 85, 90, 76, 70, 68],
      borderColor: "#0ea5e9",
      backgroundColor: "rgba(14,165,233,0.1)",
      tension: 0.4,
      fill: true,
      pointRadius: 4,
    },
  ],
};

const bloodPressureData = {
  labels: timeLabels,
  datasets: [
    {
      label: "Systolic",
      data: [120, 122, 125, 130, 128, 124, 121],
      borderColor: "#f43f5e",
      backgroundColor: "rgba(244,63,94,0.1)",
      tension: 0.4,
      fill: false,
      pointRadius: 4,
    },
    {
      label: "Diastolic",
      data: [80, 82, 85, 88, 84, 81, 79],
      borderColor: "#6366f1",
      backgroundColor: "rgba(99,102,241,0.1)",
      tension: 0.4,
      fill: false,
      pointRadius: 4,
    },
  ],
};

const glucoseData = {
  labels: timeLabels,
  datasets: [
    {
      label: "Glucose (mg/dL)",
      data: [95, 110, 130, 140, 120, 100, 90],
      borderColor: "#10b981",
      backgroundColor: "rgba(16,185,129,0.1)",
      tension: 0.4,
      fill: true,
      pointRadius: 4,
    },
    {
      label: "Normal Range",
      data: [100, 100, 100, 100, 100, 100, 100],
      borderColor: "rgba(59,130,246,0.3)",
      pointRadius: 0,
      fill: false,
    },
    {
      label: "Post-meal Max",
      data: [140, 140, 140, 140, 140, 140, 140],
      borderColor: "rgba(234,179,8,0.3)",
      pointRadius: 0,
      fill: false,
    },
  ],
};

const sleepData = {
  labels: dateLabels,
  datasets: [
    {
      label: "Sleep Hours",
      data: [7, 6.5, 8, 5, 7.5, 9, 6],
      backgroundColor: "#818cf8"
    },
  ],
};

const heartRateOptions = {
  responsive: true,
  plugins: {
    legend: { display: true, position: "top" },
    title: { display: false },
  },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: "#f3f4f6" } },
  },
};

const bloodPressureOptions = {
  responsive: true,
  plugins: {
    legend: { display: true, position: "top" },
    title: { display: false },
  },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: "#f3f4f6" } },
  },
};

const glucoseOptions = {
  responsive: true,
  plugins: {
    legend: { display: true, position: "top" },
    title: { display: false },
  },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: "#f3f4f6" }, min: 60, max: 160 },
  },
};

const sleepOptions = {
  responsive: true,
  plugins: {
    legend: { display: true, position: "top" },
    title: { display: false },
  },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: "#f3f4f6" }, min: 0, max: 10 },
  },
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#111827]">Dashboard</h1>
      <p className="text-[#6B7280]">Your health summary for the week</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold text-cyan-700 mb-2">Heart Rate</h2>
          <Line data={heartRateData} options={heartRateOptions} />
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold text-pink-700 mb-2">Blood Pressure</h2>
          <Line data={bloodPressureData} options={bloodPressureOptions} />
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold text-green-700 mb-2">Glucose</h2>
          <Line data={glucoseData} options={glucoseOptions} />
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold text-indigo-700 mb-2">Sleep Hours</h2>
          <Bar data={sleepData} options={sleepOptions} />
        </div>
      </div>
    </div>
  );
}
