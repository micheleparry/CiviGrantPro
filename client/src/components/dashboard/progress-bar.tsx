import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
  className?: string;
}

export default function ProgressBar({ 
  label, 
  value, 
  total, 
  color, 
  className 
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <span className="text-slate-600 text-sm">{label}</span>
        <span className="text-slate-800 font-semibold">{value}/{total}</span>
      </div>
      <Progress 
        value={percentage} 
        className="h-2"
        // Custom styling for different colors
        style={{
          '--progress-background': color,
        } as React.CSSProperties}
      />
    </div>
  );
}
