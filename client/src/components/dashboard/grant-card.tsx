import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Grant } from "@shared/schema";
import { cn } from "@/lib/utils";

interface GrantCardProps {
  grant: Grant;
  onApply: (grantId: number) => void;
}

export default function GrantCard({ grant, onApply }: GrantCardProps) {
  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const formatDeadline = (deadline: Date) => {
    const now = new Date();
    const diffTime = new Date(deadline).getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return "Due now";
    if (diffDays === 1) return "Due tomorrow";
    return `Due in ${diffDays} days`;
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return "bg-energetic-green";
    if (percentage >= 80) return "bg-warm-orange";
    return "bg-vibrant-blue";
  };

  return (
    <Card className="border border-slate-200 hover:border-vibrant-blue transition-colors animate-fade-in">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge 
                className={cn(
                  "text-white text-xs px-2 py-1 rounded-full font-medium",
                  getMatchColor(grant.matchPercentage || 0)
                )}
              >
                {grant.matchPercentage || 0}% Match
              </Badge>
              <span className="text-slate-500 text-sm">
                {formatDeadline(grant.deadline)}
              </span>
            </div>
            <h4 className="font-semibold text-slate-800 mb-1 text-base sm:text-lg">{grant.title}</h4>
            <p className="text-slate-600 text-sm mb-2">
              {grant.funder} • {formatAmount(grant.amount)}
              {grant.maxAmount && ` - ${formatAmount(grant.maxAmount)}`}
            </p>
            <p className="text-slate-600 text-sm line-clamp-2">
              {grant.description}
            </p>
          </div>
          <Button 
            onClick={() => onApply(grant.id)}
            className="bg-vibrant-blue hover:bg-deep-blue text-white w-full sm:w-auto sm:ml-4"
            size="sm"
          >
            Apply Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
