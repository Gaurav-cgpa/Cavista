import { riskPrediction } from "@/data/mockData";
import { ShieldCheck } from "lucide-react";

const RiskMeter = () => {
  const { overall, score, factors } = riskPrediction;
  const rotation = (score / 100) * 180 - 90; // -90 to 90 degrees

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h3 className="font-display font-semibold">Risk Prediction</h3>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="relative w-40 h-20 overflow-hidden">
          <div className="absolute inset-0 rounded-t-full border-[8px] border-b-0 border-muted" />
          <div
            className="absolute bottom-0 left-1/2 w-1 h-16 bg-primary rounded-full origin-bottom transition-transform duration-700"
            style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary" />
        </div>
        <div className="flex justify-between w-40 text-[10px] text-muted-foreground -mt-1">
          <span>Low</span><span>Mod</span><span>High</span>
        </div>
        <p className="mt-2 font-display font-bold text-2xl text-health-green">{overall}</p>
        <p className="text-sm text-muted-foreground">Overall Risk Score: {score}/100</p>
      </div>

      <div className="space-y-3">
        {factors.map((f) => (
          <div key={f.name} className="flex items-center justify-between">
            <span className="text-sm">{f.name}</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${f.score < 30 ? "bg-health-green" : f.score < 60 ? "bg-health-yellow" : "bg-health-red"}`}
                  style={{ width: `${f.score}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8">{f.score}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskMeter;
