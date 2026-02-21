import DashboardLayout from "@/components/layout/DashboardLayout";
import { mealPlan, lifestyleMetrics } from "@/data/mockData";
import { Utensils, Footprints, Droplets, Flame, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

const ProgressRing = ({ current, goal, label, icon: Icon, color }: { current: number; goal: number; label: string; icon: any; color: string }) => {
  const pct = Math.min((current / goal) * 100, 100);
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex flex-col items-center text-center">
      <div className="relative w-20 h-20 mb-3">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground">{current} / {goal}</p>
    </div>
  );
};

const DietLifestyle = () => {
  const { steps, water, calories, exercise } = lifestyleMetrics;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Diet & Lifestyle</h1>
          <p className="text-muted-foreground mt-1">Your personalized wellness plan for today.</p>
        </div>

        {/* Trackers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <ProgressRing current={steps.current} goal={steps.goal} label="Steps" icon={Footprints} color="hsl(205, 80%, 50%)" />
          <ProgressRing current={water.current} goal={water.goal} label="Hydration" icon={Droplets} color="hsl(195, 80%, 50%)" />
          <ProgressRing current={calories.consumed} goal={calories.goal} label="Calories" icon={Flame} color="hsl(38, 92%, 55%)" />
          <ProgressRing current={exercise.minutes} goal={exercise.goal} label="Exercise (min)" icon={Dumbbell} color="hsl(158, 55%, 42%)" />
        </div>

        {/* Meal Plan */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Utensils className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Today's Meal Plan</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mealPlan.map((meal) => (
              <div key={meal.meal} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-semibold">{meal.meal}</h3>
                  <span className="text-xs text-muted-foreground">{meal.time}</span>
                </div>
                <ul className="space-y-1.5 mb-3">
                  {meal.items.map((item) => (
                    <li key={item} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="pt-3 border-t border-border">
                  <span className="text-xs font-medium text-accent">{meal.calories} kcal</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DietLifestyle;
