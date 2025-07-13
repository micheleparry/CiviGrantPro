import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/dashboard/stats-card";
import GrantCard from "@/components/dashboard/grant-card";
import ActivityItem from "@/components/dashboard/activity-item";
import ProgressBar from "@/components/dashboard/progress-bar";
import { 
  FileText, Trophy, DollarSign, Sparkles, 
  Bot, Plus, Search, Download, Target,
  TrendingUp, Clock, Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Grant, ActivityLog } from "@shared/schema";

// Mock current user/organization ID - in real app this would come from auth
const CURRENT_ORG_ID = 1;
const CURRENT_USER_ID = 1;

export default function Dashboard() {
  const { toast } = useToast();

  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats", CURRENT_ORG_ID],
  });

  const { data: grantMatches, isLoading: grantsLoading } = useQuery<Grant[]>({
    queryKey: ["/api/grants/matches", CURRENT_ORG_ID],
  });

  const { data: activityLog, isLoading: activityLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/activity", CURRENT_USER_ID],
  });

  const handleApplyToGrant = (grantId: number) => {
    toast({
      title: "Application Started! 🎉",
      description: "Redirecting to application form...",
    });
    // In real app, this would navigate to application form
  };

  const handleQuickAction = (action: string) => {
    toast({
      title: `${action} Started!`,
      description: "Feature coming soon...",
    });
  };

  if (statsLoading || grantsLoading || activityLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vibrant-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Applications"
          value={dashboardStats?.activeApplications || 0}
          icon={FileText}
          trend="↗ +2 this week"
          borderColor="border-l-4 border-vibrant-blue"
          iconColor="bg-vibrant-blue/10 text-vibrant-blue"
        />
        <StatsCard
          title="Success Rate"
          value={`${dashboardStats?.successRate || 0}%`}
          icon={Trophy}
          trend="↗ +5% from last month"
          borderColor="border-l-4 border-energetic-green"
          iconColor="bg-energetic-green/10 text-energetic-green"
        />
        <StatsCard
          title="Funding Secured"
          value={`$${((dashboardStats?.fundingSecured || 0) / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          trend="↗ +$450K this quarter"
          borderColor="border-l-4 border-warm-orange"
          iconColor="bg-warm-orange/10 text-warm-orange"
        />
        <StatsCard
          title="AI Suggestions"
          value={dashboardStats?.aiSuggestions || 0}
          icon={Sparkles}
          trend="5 new today"
          trendColor="text-warm-orange"
          borderColor="border-l-4 border-deep-blue"
          iconColor="bg-deep-blue/10 text-deep-blue"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grant Opportunities */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm border-t-4 border-energetic-green">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
                    <Target className="mr-2" size={20} />
                    Perfect Grant Matches
                  </CardTitle>
                  <p className="text-slate-600 mt-1">AI-powered recommendations just for you</p>
                </div>
                <Button 
                  variant="outline" 
                  className="text-vibrant-blue border-vibrant-blue hover:bg-vibrant-blue hover:text-white"
                  onClick={() => handleQuickAction("View All Grants")}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {grantMatches?.slice(0, 3).map((grant) => (
                <GrantCard 
                  key={grant.id} 
                  grant={grant} 
                  onApply={handleApplyToGrant} 
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* AI Assistant */}
          <Card className="shadow-sm border-t-4 border-deep-blue">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
                <Bot className="mr-2 text-deep-blue" size={20} />
                AI Writing Assistant
              </CardTitle>
              <p className="text-slate-600 text-sm">Get help crafting compelling narratives</p>
            </CardHeader>
            <CardContent>
              <div className="gradient-cool rounded-lg p-4 text-white mb-4">
                <p className="text-sm flex items-start">
                  <span className="mr-2">💡</span>
                  "Your project narrative could be stronger with more specific impact metrics. Would you like me to help?"
                </p>
              </div>
              <Button 
                className="w-full bg-deep-blue hover:bg-vibrant-blue text-white"
                onClick={() => handleQuickAction("AI Writing Session")}
              >
                Start Writing Session
              </Button>
            </CardContent>
          </Card>

          {/* Progress Tracker */}
          <Card className="shadow-sm border-t-4 border-warm-orange">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
                <TrendingUp className="mr-2" size={20} />
                This Month's Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProgressBar
                label="Applications Submitted"
                value={8}
                total={10}
                color="var(--energetic-green)"
              />
              <ProgressBar
                label="Research Completed"
                value={12}
                total={15}
                color="var(--vibrant-blue)"
              />
              <ProgressBar
                label="Follow-ups Sent"
                value={5}
                total={7}
                color="var(--warm-orange)"
              />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-sm border-t-4 border-forest-green">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
                <Clock className="mr-2" size={20} />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full bg-energetic-green hover:bg-forest-green text-white"
                onClick={() => handleQuickAction("New Application")}
              >
                <Plus className="mr-2" size={16} />
                New Application
              </Button>
              <Button 
                className="w-full bg-warm-orange hover:bg-deep-orange text-white"
                onClick={() => handleQuickAction("Find Grants")}
              >
                <Search className="mr-2" size={16} />
                Find Grants
              </Button>
              <Button 
                className="w-full bg-vibrant-blue hover:bg-deep-blue text-white"
                onClick={() => handleQuickAction("Export Reports")}
              >
                <Download className="mr-2" size={16} />
                Export Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-sm border-t-4 border-deep-orange">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
            <Award className="mr-2" size={20} />
            Recent Activity
          </CardTitle>
          <p className="text-slate-600">Stay on top of your grant writing journey</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityLog?.slice(0, 3).map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
