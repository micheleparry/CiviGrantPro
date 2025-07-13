import { ActivityLog } from "@shared/schema";
import { CheckCircle, Lightbulb, Star, FileText, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItemProps {
  activity: ActivityLog;
}

export default function ActivityItem({ activity }: ActivityItemProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "application_submitted":
        return { Icon: CheckCircle, color: "bg-energetic-green/10 text-energetic-green" };
      case "ai_suggestion":
        return { Icon: Lightbulb, color: "bg-vibrant-blue/10 text-vibrant-blue" };
      case "grant_match":
        return { Icon: Star, color: "bg-warm-orange/10 text-warm-orange" };
      case "application_created":
        return { Icon: FileText, color: "bg-deep-blue/10 text-deep-blue" };
      case "application_approved":
        return { Icon: Award, color: "bg-forest-green/10 text-forest-green" };
      default:
        return { Icon: FileText, color: "bg-slate-100 text-slate-500" };
    }
  };

  const { Icon, color } = getIcon(activity.type);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - new Date(date).getTime();
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  const getEncouragingMessage = (type: string) => {
    switch (type) {
      case "application_submitted":
        return "You're one step closer to making an impact! 🎉";
      case "ai_suggestion":
        return "Check out the improved suggestions";
      case "grant_match":
        return "This looks like a great opportunity!";
      default:
        return "";
    }
  };

  return (
    <div className="flex items-start space-x-4 animate-fade-in">
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", color)}>
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <p className="text-slate-800 font-medium">{activity.description}</p>
        <p className="text-slate-500 text-sm">
          {formatTimeAgo(activity.createdAt)}
          {getEncouragingMessage(activity.type) && (
            <span className="ml-1">• {getEncouragingMessage(activity.type)}</span>
          )}
        </p>
      </div>
    </div>
  );
}
