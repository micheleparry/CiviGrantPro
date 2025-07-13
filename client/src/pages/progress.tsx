import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProgressBar from "@/components/dashboard/progress-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, Calendar, Target, Award, 
  BarChart3, PieChart, Activity, Clock,
  CheckCircle, XCircle, AlertCircle, DollarSign,
  Users, FileText, Sparkles
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell
} from "recharts";
import { Application, Grant } from "@shared/schema";

const CURRENT_ORG_ID = 1;
const CURRENT_USER_ID = 1;

// Mock data for charts - in real app this would come from APIs
const applicationTrends = [
  { month: "Jan", submitted: 2, approved: 1, rejected: 0 },
  { month: "Feb", submitted: 3, approved: 2, rejected: 1 },
  { month: "Mar", submitted: 4, approved: 2, rejected: 1 },
  { month: "Apr", submitted: 5, approved: 3, rejected: 1 },
  { month: "May", submitted: 3, approved: 2, rejected: 1 },
  { month: "Jun", submitted: 6, approved: 4, rejected: 1 },
];

const fundingData = [
  { category: "Health", amount: 750000, count: 3 },
  { category: "Education", amount: 450000, count: 2 },
  { category: "Environment", amount: 300000, count: 2 },
  { category: "Technology", amount: 200000, count: 1 },
];

const statusDistribution = [
  { name: "Approved", value: 8, color: "var(--energetic-green)" },
  { name: "Under Review", value: 5, color: "var(--vibrant-blue)" },
  { name: "Draft", value: 3, color: "var(--warm-orange)" },
  { name: "Rejected", value: 2, color: "#ef4444" },
];

const monthlyGoals = [
  { metric: "Applications Submitted", current: 8, target: 10, unit: "" },
  { metric: "Success Rate", current: 75, target: 80, unit: "%" },
  { metric: "Funding Secured", current: 1200000, target: 1500000, unit: "$" },
  { metric: "Response Time", current: 12, target: 10, unit: " days" },
];

export default function Progress() {
  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/dashboard/stats", CURRENT_ORG_ID],
  });

  const { data: applications } = useQuery<Application[]>({
    queryKey: ["/api/applications/organization", CURRENT_ORG_ID],
  });

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "var(--energetic-green)";
    if (percentage >= 70) return "var(--vibrant-blue)";
    if (percentage >= 50) return "var(--warm-orange)";
    return "#ef4444";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center">
            <TrendingUp className="mr-3 text-vibrant-blue" size={32} />
            Progress & Analytics
          </h1>
          <p className="text-slate-600 mt-2">
            Track your grant writing success and optimize your strategy
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="border-energetic-green text-energetic-green">
            <Award className="mr-1" size={14} />
            78% Success Rate
          </Badge>
          <Button variant="outline" className="border-vibrant-blue text-vibrant-blue">
            <BarChart3 className="mr-2" size={16} />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-l-4 border-energetic-green">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Applications</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">
                  {applications?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-energetic-green/10 rounded-lg flex items-center justify-center">
                <FileText className="text-energetic-green" size={20} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-energetic-green text-sm font-medium">↗ +3 this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-vibrant-blue">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Success Rate</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">78%</p>
              </div>
              <div className="w-12 h-12 bg-vibrant-blue/10 rounded-lg flex items-center justify-center">
                <Target className="text-vibrant-blue" size={20} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-energetic-green text-sm font-medium">↗ +5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-warm-orange">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Funding Secured</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">$2.4M</p>
              </div>
              <div className="w-12 h-12 bg-warm-orange/10 rounded-lg flex items-center justify-center">
                <DollarSign className="text-warm-orange" size={20} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-energetic-green text-sm font-medium">↗ +$450K this quarter</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-deep-blue">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Avg. Response Time</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">12d</p>
              </div>
              <div className="w-12 h-12 bg-deep-blue/10 rounded-lg flex items-center justify-center">
                <Clock className="text-deep-blue" size={20} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-energetic-green text-sm font-medium">↗ 2 days faster</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Tabs */}
      <Card className="shadow-sm border-t-4 border-vibrant-blue">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
            <Activity className="mr-2" size={20} />
            Detailed Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Application Status Distribution */}
                <Card className="border-l-4 border-energetic-green">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800">
                      Application Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={statusDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {statusDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Funding by Category */}
                <Card className="border-l-4 border-warm-orange">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800">
                      Funding by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={fundingData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="category" />
                          <YAxis />
                          <Tooltip formatter={(value) => [formatCurrency(value as number), "Amount"]} />
                          <Bar dataKey="amount" fill="var(--warm-orange)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="mt-6">
              <Card className="border-l-4 border-vibrant-blue">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-800">
                    Application Trends (6 Months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={applicationTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="submitted" 
                          stroke="var(--vibrant-blue)" 
                          strokeWidth={2}
                          name="Submitted"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="approved" 
                          stroke="var(--energetic-green)" 
                          strokeWidth={2}
                          name="Approved"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="rejected" 
                          stroke="#ef4444" 
                          strokeWidth={2}
                          name="Rejected"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="goals" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Monthly Goals Progress</h3>
                {monthlyGoals.map((goal, index) => {
                  const percentage = goal.unit === "$" 
                    ? Math.round((goal.current / goal.target) * 100)
                    : goal.unit === "%"
                      ? Math.round((goal.current / goal.target) * 100)
                      : Math.round((goal.current / goal.target) * 100);
                  
                  return (
                    <Card key={index} className="border-l-4 border-deep-blue">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-slate-800">{goal.metric}</h4>
                          <Badge 
                            variant="outline" 
                            className={`${percentage >= 100 ? 'border-energetic-green text-energetic-green' : 'border-warm-orange text-warm-orange'}`}
                          >
                            {percentage}%
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                          <span>
                            {goal.unit === "$" ? formatCurrency(goal.current) : `${goal.current}${goal.unit}`}
                          </span>
                          <span>
                            Target: {goal.unit === "$" ? formatCurrency(goal.target) : `${goal.target}${goal.unit}`}
                          </span>
                        </div>
                        <ProgressBar 
                          label={goal.metric}
                          value={goal.current}
                          total={goal.target}
                          color={getProgressColor(percentage)}
                          className="h-2"
                        />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-l-4 border-energetic-green">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                      <CheckCircle className="mr-2 text-energetic-green" size={20} />
                      Key Wins
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-energetic-green rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-slate-800">Health Initiative Success</p>
                        <p className="text-sm text-slate-600">Secured $750K in health-focused grants this quarter</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-energetic-green rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-slate-800">Improved Response Time</p>
                        <p className="text-sm text-slate-600">Reduced average response time by 2 days</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-energetic-green rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-slate-800">AI Integration Impact</p>
                        <p className="text-sm text-slate-600">30% improvement in narrative quality with AI assistance</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-warm-orange">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                      <Sparkles className="mr-2 text-warm-orange" size={20} />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-warm-orange rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-slate-800">Diversify Portfolio</p>
                        <p className="text-sm text-slate-600">Consider applying to more technology-focused grants</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-warm-orange rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-slate-800">Early Applications</p>
                        <p className="text-sm text-slate-600">Submit applications 2-3 weeks before deadline for better results</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-warm-orange rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-slate-800">Follow-up Strategy</p>
                        <p className="text-sm text-slate-600">Implement systematic follow-up process for pending applications</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
