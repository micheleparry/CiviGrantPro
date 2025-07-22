import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Sparkles, Target, TrendingUp, Clock, DollarSign, 
  Award, MessageSquare, Zap, Filter, RefreshCw,
  Star, AlertTriangle, CheckCircle, Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const CURRENT_USER_ID = 1;

interface UserProfile {
  organizationName: string;
  organizationDescription: string;
  focusAreas: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  geographicFocus: string[];
  organizationType: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredAgencies?: string[];
  pastGrants?: Array<{
    title: string;
    amount: number;
    status: 'awarded' | 'pending' | 'rejected';
  }>;
}

interface GrantRecommendation {
  opportunity: any;
  matchScore: number;
  confidence: number;
  reasoning: string[];
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedSuccessRate: number;
  timeToDeadline: number;
  complexity: 'low' | 'medium' | 'high';
}

export default function AiRecommendations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedTab, setSelectedTab] = useState("recommendations");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recommendations, setRecommendations] = useState<GrantRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    minMatchScore: 70,
    budgetPreference: 'any' as 'exact' | 'flexible' | 'any',
    deadlinePreference: 'standard' as 'urgent' | 'standard' | 'flexible',
    maxResults: 10
  });

  // Fetch user profile
  const { data: profileData } = useQuery<UserProfile>({
    queryKey: ["/api/user/profile", CURRENT_USER_ID],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/user/profile/${CURRENT_USER_ID}`);
      return response.json();
    },
    onSuccess: (data) => {
      setUserProfile(data);
    }
  });

  // Generate recommendations mutation
  const generateRecommendationsMutation = useMutation({
    mutationFn: async (requestData: any) => {
      const response = await apiRequest("POST", "/api/ai/recommendations", requestData);
      return response.json();
    },
    onSuccess: (data) => {
      setRecommendations(data.recommendations);
      toast({
        title: "Recommendations Generated! 🎯",
        description: `Found ${data.recommendations.length} personalized grant opportunities.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateRecommendations = () => {
    if (!userProfile) {
      toast({
        title: "Profile Required",
        description: "Please complete your organization profile first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    generateRecommendationsMutation.mutate({
      userProfile,
      ...filters
    }, {
      onSettled: () => setIsLoading(false)
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDeadline = (days: number) => {
    if (days < 0) return 'Expired';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `${days} days`;
    if (days < 30) return `${Math.ceil(days / 7)} weeks`;
    return `${Math.ceil(days / 30)} months`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Grant Recommendations</h1>
          <p className="text-gray-600 mt-2">
            Discover personalized grant opportunities powered by AI analysis
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleGenerateRecommendations}
            disabled={isLoading || !userProfile}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Generate Recommendations
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="filters">Filters & Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-6">
          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Recommendations Yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Generate personalized grant recommendations based on your organization's profile and preferences.
                  </p>
                  <Button
                    onClick={handleGenerateRecommendations}
                    disabled={isLoading || !userProfile}
                    className="bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Started
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recommendations.map((recommendation, index) => (
                <Card key={index} className="border-l-4 border-l-purple-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <CardTitle className="text-lg">
                            {recommendation.opportunity.title}
                          </CardTitle>
                          <Badge className={getPriorityColor(recommendation.priority)}>
                            {recommendation.priority.toUpperCase()} PRIORITY
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Award className="w-4 h-4 mr-1" />
                            {formatCurrency(recommendation.opportunity.awardCeiling)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatDeadline(recommendation.timeToDeadline)}
                          </div>
                          <div className="flex items-center">
                            <Target className="w-4 h-4 mr-1" />
                            {recommendation.opportunity.agencyName}
                          </div>
                          <Badge className={getComplexityColor(recommendation.complexity)}>
                            {recommendation.complexity.toUpperCase()} COMPLEXITY
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">
                          {Math.round(recommendation.matchScore)}%
                        </div>
                        <div className="text-sm text-gray-500">Match Score</div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                          Why This Matches
                        </h4>
                        <ul className="space-y-1">
                          {recommendation.reasoning.slice(0, 3).map((reason, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start">
                              <span className="w-1 h-1 bg-green-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <Star className="w-4 h-4 mr-2 text-yellow-600" />
                          Your Strengths
                        </h4>
                        <ul className="space-y-1">
                          {recommendation.strengths.slice(0, 3).map((strength, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start">
                              <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                          Challenges to Address
                        </h4>
                        <ul className="space-y-1">
                          {recommendation.challenges.slice(0, 2).map((challenge, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start">
                              <span className="w-1 h-1 bg-orange-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {challenge}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <Zap className="w-4 h-4 mr-2 text-blue-600" />
                          AI Recommendations
                        </h4>
                        <ul className="space-y-1">
                          {recommendation.recommendations.slice(0, 2).map((rec, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start">
                              <span className="w-1 h-1 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          {Math.round(recommendation.estimatedSuccessRate)}% success rate
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {Math.round(recommendation.confidence * 100)}% confidence
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Info className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                          Start Application
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="filters" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Recommendation Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Minimum Match Score: {filters.minMatchScore}%
                </label>
                <Slider
                  value={[filters.minMatchScore]}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, minMatchScore: value[0] }))}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Budget Preference
                </label>
                <Select
                  value={filters.budgetPreference}
                  onValueChange={(value: 'exact' | 'flexible' | 'any') => 
                    setFilters(prev => ({ ...prev, budgetPreference: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Budget Range</SelectItem>
                    <SelectItem value="flexible">Flexible Budget</SelectItem>
                    <SelectItem value="exact">Exact Budget Match</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Deadline Preference
                </label>
                <Select
                  value={filters.deadlinePreference}
                  onValueChange={(value: 'urgent' | 'standard' | 'flexible') => 
                    setFilters(prev => ({ ...prev, deadlinePreference: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent (≤30 days)</SelectItem>
                    <SelectItem value="standard">Standard (30-90 days)</SelectItem>
                    <SelectItem value="flexible">Flexible (≥60 days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Maximum Results
                </label>
                <Select
                  value={filters.maxResults.toString()}
                  onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, maxResults: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 recommendations</SelectItem>
                    <SelectItem value="10">10 recommendations</SelectItem>
                    <SelectItem value="15">15 recommendations</SelectItem>
                    <SelectItem value="20">20 recommendations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerateRecommendations}
                disabled={isLoading || !userProfile}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Generate Recommendations
              </Button>
            </CardContent>
          </Card>

          {userProfile && (
            <Card>
              <CardHeader>
                <CardTitle>Your Organization Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Organization Name</label>
                  <p className="text-gray-900">{userProfile.organizationName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Focus Areas</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {userProfile.focusAreas.map((area, index) => (
                      <Badge key={index} variant="secondary">{area}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Budget Range</label>
                  <p className="text-gray-900">
                    {formatCurrency(userProfile.budgetRange.min)} - {formatCurrency(userProfile.budgetRange.max)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Experience Level</label>
                  <p className="text-gray-900 capitalize">{userProfile.experienceLevel}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 