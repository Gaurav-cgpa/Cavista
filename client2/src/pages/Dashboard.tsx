import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import VitalCard from "@/components/dashboard/VitalCard";
import RiskMeter from "@/components/dashboard/RiskMeter";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import MedicationReminder from "@/components/dashboard/MedicationReminder";
import { API_BASE, getToken, getUser } from "@/lib/auth";
import { Heart, Thermometer, Droplets, Moon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface TimeSeriesPoint {
  time: string;
  timestamp: string;
  heartRate: number | null;
  systolicBP: number | null;
  diastolicBP: number | null;
  glucose: number | null;
  sleepHours: number | null;
}

interface LatestReading {
  data: {
    heartRate?: number;
    systolicBP?: number;
    diastolicBP?: number;
    glucose?: number;
    sleepHours?: number;
  };
  timestamp: string;
}

interface VitalsApiResponse {
  success: boolean;
  data: unknown[];
  timeSeries: TimeSeriesPoint[];
  alerts: unknown[];
  hasEmergency: boolean;
  latestReading: LatestReading | null;
  totalRecords: number;
}

const formatTrend = (current: number, previous: number | undefined): string => {
  if (previous == null) return "—";
  const diff = current - previous;
  if (diff > 0) return `+${diff}`;
  if (diff < 0) return `${diff}`;
  return "—";
};

const Dashboard = () => {
  const [vitalsData, setVitalsData] = useState<VitalsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refetching, setRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = getUser();
  const patientId = user?._id;

  const fetchVitals = async (isRefetch = false) => {
    if (!patientId || !getToken()) return;
    try {
      if (isRefetch) setRefetching(true);
      else setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/realtime/last-day/${patientId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to load vitals");
      }
      setVitalsData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      if (isRefetch) setRefetching(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    if (!patientId || !getToken()) {
      setLoading(false);
      return;
    }
    fetchVitals();
  }, [patientId]);

  const timeSeries = vitalsData?.timeSeries ?? [];
  const latest = vitalsData?.latestReading?.data;
  const prevPoint = timeSeries.length >= 2 ? timeSeries[timeSeries.length - 2] : null;

  const heartRateChartData = timeSeries
    .filter((p) => p.heartRate != null)
    .map((p) => ({ time: p.time, value: p.heartRate }));
  const glucoseChartData = timeSeries
    .filter((p) => p.glucose != null)
    .map((p) => ({ time: p.time, value: p.glucose }));

  const hrDomain = heartRateChartData.length
    ? [Math.max(0, Math.min(...heartRateChartData.map((d) => d.value!)) - 10), Math.max(...heartRateChartData.map((d) => d.value!)) + 10]
    : [60, 100];
  const glucoseDomain = glucoseChartData.length
    ? [Math.max(0, Math.min(...glucoseChartData.map((d) => d.value!)) - 10), Math.max(...glucoseChartData.map((d) => d.value!)) + 10]
    : [70, 150];

  if (!user || !getToken()) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
          Please log in to view your health dashboard.
        </div>
      </DashboardLayout>
    );
  }

  const displayName = (user as { username?: string }).username ?? "there";
  const greeting = new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              {greeting}, {displayName} 👋
            </h1>
            <p className="text-muted-foreground mt-1">Here&apos;s your health overview for the last 24 hours.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchVitals(true)}
            disabled={loading || refetching}
            className="shrink-0"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refetching ? "animate-spin" : ""}`} />
            {refetching ? "Refreshing…" : "Refetch data"}
          </Button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            Loading vitals…
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <VitalCard
                icon={Heart}
                label="Heart Rate"
                value={latest?.heartRate ?? "—"}
                unit="bpm"
                trend={latest?.heartRate != null ? formatTrend(latest.heartRate, prevPoint?.heartRate ?? undefined) : "—"}
                color="red"
              />
              <VitalCard
                icon={Thermometer}
                label="Blood Pressure"
                value={
                  latest?.systolicBP != null && latest?.diastolicBP != null
                    ? `${latest.systolicBP}/${latest.diastolicBP}`
                    : "—"
                }
                unit="mmHg"
                trend="—"
                color="blue"
              />
              <VitalCard
                icon={Droplets}
                label="Glucose Level"
                value={latest?.glucose ?? "—"}
                unit="mg/dL"
                trend={latest?.glucose != null ? formatTrend(latest.glucose, prevPoint?.glucose ?? undefined) : "—"}
                color="green"
              />
              <VitalCard
                icon={Moon}
                label="Sleep Hours"
                value={latest?.sleepHours ?? "—"}
                unit="hrs"
                trend="—"
                color="yellow"
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-semibold mb-4">Heart Rate (last 24h)</h3>
                {heartRateChartData.length === 0 ? (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                    No heart rate data in the last 24 hours
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={heartRateChartData}>
                      <defs>
                        <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
                      <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="hsl(210, 15%, 50%)" />
                      <YAxis domain={hrDomain} tick={{ fontSize: 12 }} stroke="hsl(210, 15%, 50%)" />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(0, 72%, 55%)"
                        fill="url(#hrGrad)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-semibold mb-4">Glucose (last 24h)</h3>
                {glucoseChartData.length === 0 ? (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                    No glucose data in the last 24 hours
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={glucoseChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
                      <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="hsl(210, 15%, 50%)" />
                      <YAxis domain={glucoseDomain} tick={{ fontSize: 12 }} stroke="hsl(210, 15%, 50%)" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(205, 80%, 50%)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name="Glucose (mg/dL)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <RiskMeter />
              <AlertsPanel />
              <MedicationReminder />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
