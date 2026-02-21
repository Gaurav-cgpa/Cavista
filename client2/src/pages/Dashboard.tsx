import DashboardLayout from "@/components/layout/DashboardLayout";
import VitalCard from "@/components/dashboard/VitalCard";
import RiskMeter from "@/components/dashboard/RiskMeter";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import MedicationReminder from "@/components/dashboard/MedicationReminder";
import { vitals, weeklyHeartRate, glucoseTrends } from "@/data/mockData";
import { Heart, Thermometer, Droplets, Moon } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Greeting */}
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Good Morning, John 👋</h1>
          <p className="text-muted-foreground mt-1">Here's your health overview for today.</p>
        </div>

        {/* Vitals */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <VitalCard icon={Heart} label="Heart Rate" value={vitals.heartRate.value} unit={vitals.heartRate.unit} trend={vitals.heartRate.trend} color="red" />
          <VitalCard icon={Thermometer} label="Blood Pressure" value={vitals.bloodPressure.value} unit={vitals.bloodPressure.unit} trend={vitals.bloodPressure.trend} color="blue" />
          <VitalCard icon={Droplets} label="Glucose Level" value={vitals.glucose.value} unit={vitals.glucose.unit} trend={vitals.glucose.trend} color="green" />
          <VitalCard icon={Moon} label="Sleep Hours" value={vitals.sleep.value} unit={vitals.sleep.unit} trend={vitals.sleep.trend} color="yellow" />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-display font-semibold mb-4">Weekly Heart Rate</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={weeklyHeartRate}>
                <defs>
                  <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(210, 15%, 50%)" />
                <YAxis domain={[60, 85]} tick={{ fontSize: 12 }} stroke="hsl(210, 15%, 50%)" />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="hsl(0, 72%, 55%)" fill="url(#hrGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-display font-semibold mb-4">Glucose Trends</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={glucoseTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(210, 15%, 50%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(210, 15%, 50%)" />
                <Tooltip />
                <Line type="monotone" dataKey="fasting" stroke="hsl(205, 80%, 50%)" strokeWidth={2} dot={{ r: 3 }} name="Fasting" />
                <Line type="monotone" dataKey="postMeal" stroke="hsl(158, 55%, 42%)" strokeWidth={2} dot={{ r: 3 }} name="Post-Meal" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk + Alerts + Meds */}
        <div className="grid lg:grid-cols-3 gap-6">
          <RiskMeter />
          <AlertsPanel />
          <MedicationReminder />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
