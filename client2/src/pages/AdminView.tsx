import DashboardLayout from "@/components/layout/DashboardLayout";
import { patients } from "@/data/mockData";
import { Users, AlertTriangle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";

const riskColors = {
  Low: "bg-health-green-light text-health-green",
  Moderate: "bg-health-yellow-light text-health-yellow",
  High: "bg-health-red-light text-health-red",
};

const AdminView = () => {
  const [search, setSearch] = useState("");
  const filtered = patients.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Patient Overview</h1>
            <p className="text-muted-foreground mt-1">Monitor patient health status and risk indicators.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-display font-bold text-foreground">{patients.length}</p>
            <p className="text-sm text-muted-foreground">Total Patients</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-display font-bold text-health-red">{patients.filter((p) => p.risk === "High").length}</p>
            <p className="text-sm text-muted-foreground">High Risk</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-display font-bold text-health-yellow">{patients.reduce((a, p) => a + p.alerts, 0)}</p>
            <p className="text-sm text-muted-foreground">Active Alerts</p>
          </div>
        </div>

        {/* Patient Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Patient</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Age</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Risk Level</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Conditions</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Alerts</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Last Visit</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.age}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", riskColors[p.risk])}>
                        {p.risk}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.conditions.length ? p.conditions.join(", ") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {p.alerts > 0 ? (
                        <span className="inline-flex items-center gap-1 text-health-yellow">
                          <AlertTriangle className="h-3.5 w-3.5" /> {p.alerts}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.lastVisit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminView;
