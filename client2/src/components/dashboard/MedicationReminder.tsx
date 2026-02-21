import { medications } from "@/data/mockData";
import { Pill, Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const MedicationReminder = () => (
  <div className="bg-card rounded-xl border border-border p-6">
    <div className="flex items-center gap-2 mb-4">
      <Pill className="h-5 w-5 text-primary" />
      <h3 className="font-display font-semibold">Medication Reminders</h3>
    </div>
    <div className="space-y-3">
      {medications.map((med) => (
        <div key={med.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
          <div className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
            med.taken ? "bg-health-green-light text-health-green" : "bg-health-yellow-light text-health-yellow"
          )}>
            {med.taken ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{med.name} <span className="text-muted-foreground font-normal">— {med.dosage}</span></p>
            <p className="text-xs text-muted-foreground">{med.time}</p>
          </div>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full font-medium",
            med.taken ? "bg-health-green-light text-health-green" : "bg-muted text-muted-foreground"
          )}>
            {med.taken ? "Taken" : "Pending"}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default MedicationReminder;
