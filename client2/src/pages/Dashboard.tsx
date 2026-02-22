import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import VitalCard from "@/components/dashboard/VitalCard";
import RiskMeter from "@/components/dashboard/RiskMeter";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import MedicationReminder from "@/components/dashboard/MedicationReminder";
import { API_BASE, getToken, getUser } from "@/lib/auth";
import { Heart, Thermometer, Droplets, Moon, RefreshCw, FileDown } from "lucide-react";
import { jsPDF } from "jspdf";
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

const SUMMARY_API = "http://localhost:5002/api/patient-summary";

interface SummaryProfile {
  fullName?: string;
  username?: string;
  email?: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  height?: number;
  weight?: number;
  phoneNumber?: string;
}

const Dashboard = () => {
  const [vitalsData, setVitalsData] = useState<VitalsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refetching, setRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState("");
  const [profile, setProfile] = useState<SummaryProfile | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const user = getUser();
  const patientId = user?._id ?? "P001";

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

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const res = await fetch(SUMMARY_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSummary("No patient data found. This is a short summary report — sign in or ensure the summary server has data for this patient.");
        setProfile(null);
        setSummaryError((data as { error?: string }).error || res.statusText);
        return;
      }
      setSummary((data as { summary?: string }).summary || "No patient data found. This is a short summary report.");
      setProfile((data as { profile?: SummaryProfile }).profile ?? null);
    } catch (err) {
      setSummary("No patient data found. This is a short summary report — the summary service may be unavailable.");
      setProfile(null);
      setSummaryError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSummaryLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const downloadSummaryPDF = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;

    doc.setFontSize(18);
    doc.text("Patient Summary Report", pageW / 2, y, { align: "center" });
    y += 12;

    doc.setFontSize(11);
    doc.text(`Patient ID: ${patientId}`, margin, y);
    y += 7;
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
    y += 10;

    if (profile && typeof profile === "object") {
      doc.setFontSize(13);
      doc.text("Patient Details", margin, y);
      y += 8;
      doc.setFontSize(10);
      const details = [
        profile.fullName && `Name: ${profile.fullName}`,
        profile.username && `Username: ${profile.username}`,
        profile.email && `Email: ${profile.email}`,
        profile.age != null && `Age: ${profile.age}`,
        profile.gender && `Gender: ${profile.gender}`,
        profile.bloodGroup && `Blood Group: ${profile.bloodGroup}`,
        profile.height != null && `Height: ${profile.height} cm`,
        profile.weight != null && `Weight: ${profile.weight} kg`,
        profile.phoneNumber && `Phone: ${profile.phoneNumber}`,
      ].filter(Boolean);
      details.forEach((line) => {
        doc.text(line, margin, y);
        y += 6;
      });
      y += 4;
    }

    doc.setFontSize(13);
    doc.text("Summary", margin, y);
    y += 8;
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(summary || "No summary available.", pageW - 2 * margin);
    doc.text(lines, margin, y);
    doc.save(`patient-summary-${patientId}-${Date.now()}.pdf`);
  };

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

            {/* Patient Summary – from API, downloadable as PDF */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h3 className="font-display text-xl font-semibold">Patient Summary</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchSummary()}
                    disabled={summaryLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${summaryLoading ? "animate-spin" : ""}`} />
                    {summaryLoading ? "Loading…" : "Refresh"}
                  </Button>
                  <Button size="sm" onClick={downloadSummaryPDF}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Patient ID: {String(patientId)}</p>
              {profile && typeof profile === "object" && (
                <div className="mb-4 p-4 rounded-lg border border-border bg-muted/30">
                  <h4 className="text-sm font-semibold mb-2">Patient Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {profile.fullName && <span>Name: {profile.fullName}</span>}
                    {profile.username && <span>Username: {profile.username}</span>}
                    {profile.email && <span>Email: {profile.email}</span>}
                    {profile.age != null && <span>Age: {profile.age}</span>}
                    {profile.gender && <span>Gender: {profile.gender}</span>}
                    {profile.bloodGroup && <span>Blood Group: {profile.bloodGroup}</span>}
                    {profile.height != null && <span>Height: {profile.height} cm</span>}
                    {profile.weight != null && <span>Weight: {profile.weight} kg</span>}
                    {profile.phoneNumber && <span>Phone: {profile.phoneNumber}</span>}
                  </div>
                </div>
              )}
              {summaryError && (
                <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">Note: {summaryError}</p>
              )}
              <div className="min-h-[120px] rounded-lg bg-muted/30 p-4 text-sm whitespace-pre-wrap">
                {summaryLoading ? "Loading summary…" : summary}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
