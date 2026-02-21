import { alerts } from "@/data/mockData";
import { AlertTriangle, Info, CheckCircle2, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
};

const styleMap = {
  warning: "bg-health-yellow-light text-health-yellow",
  info: "bg-health-blue-light text-health-blue",
  success: "bg-health-green-light text-health-green",
};

const AlertsPanel = () => (
  <div className="bg-card rounded-xl border border-border p-6">
    <div className="flex items-center gap-2 mb-4">
      <Bell className="h-5 w-5 text-primary" />
      <h3 className="font-display font-semibold">Smart Alerts</h3>
    </div>
    <div className="space-y-3">
      {alerts.map((a) => {
        const Icon = iconMap[a.type];
        return (
          <div
            key={a.id}
            className={cn("flex items-start gap-3 p-3 rounded-lg border border-border", !a.read && "bg-muted/50")}
          >
            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", styleMap[a.type])}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">{a.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{a.time}</p>
            </div>
            {!a.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />}
          </div>
        );
      })}
    </div>
  </div>
);

export default AlertsPanel;
