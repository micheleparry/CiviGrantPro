import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendColor?: string;
  borderColor: string;
  iconColor: string;
}

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendColor = "text-energetic-green", 
  borderColor,
  iconColor
}: StatsCardProps) {
  return (
    <Card className={cn("shadow-sm", borderColor)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
          </div>
          <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", iconColor)}>
            <Icon size={20} />
          </div>
        </div>
        {trend && (
          <div className="mt-4">
            <span className={cn("text-sm font-medium", trendColor)}>{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
