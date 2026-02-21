import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface VitalCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit: string;
  trend: string;
  color: "blue" | "red" | "green" | "yellow";
}

const colorMap = {
  blue: { bg: "bg-health-blue-light", text: "text-health-blue", icon: "text-health-blue" },
  red: { bg: "bg-health-red-light", text: "text-health-red", icon: "text-health-red" },
  green: { bg: "bg-health-green-light", text: "text-health-green", icon: "text-health-green" },
  yellow: { bg: "bg-health-yellow-light", text: "text-health-yellow", icon: "text-health-yellow" },
};

const VitalCard = ({ icon: Icon, label, value, unit, trend, color }: VitalCardProps) => {
  const c = colorMap[color];
  const TrendIcon = trend.startsWith("+") ? TrendingUp : trend.startsWith("-") ? TrendingDown : Minus;

  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", c.bg)}>
          <Icon className={cn("h-5 w-5", c.icon)} />
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <TrendIcon className="h-3 w-3" />
          <span>{trend}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className={cn("text-2xl font-bold font-display", c.text)}>{value}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
};

export default VitalCard;
