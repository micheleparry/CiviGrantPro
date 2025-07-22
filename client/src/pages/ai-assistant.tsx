import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Brain, Search, TrendingUp, MessageSquare, 
  Building, MapPin, User, FileText, 
  Zap, Target, BarChart3, RefreshCw,
  CheckCircle, AlertTriangle, Info, Star,
  Globe, Database, Clock, Award,
  Lightbulb, BookOpen, Users, Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface MCPResponse {
  content: string;
  tools_used: string[];
  data_sources: string[];
  timestamp: string;
  confidence: number;
}

interface RealTimeData {
  grants_found: number;
  current_deadlines: string[];
  funding_trends: string[];
  recent_awards: Array<{
    organization: string;
    amount: string;
    project_type: string;
  }>;
}

export default function AIAssistant() {
  const { toast } = useToast();
  
  const [selectedTab, setSelectedTab] = useState("chat");
  const [userQuery, setUserQuery] = useState("");
  const [conversation, setConversation] = useState<Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
    tools_used?: string[];
    data_sources?: string[];
  }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);

  // MCP-enhanced AI assistant mutation
  const mcpAssistantMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("POST", "/api/ai/mcp-assistant", {
        query,
        context: {
          organizationProfile: "Sample Nonprofit Organization",
          focusAreas: ["Education", "Community Development", "Youth Programs"],
          currentApplication: null
        }
      });
      return response.json();
    },
    onSuccess: (data: MCPResponse) => {
      const newMessage = {
        role: "assistant" as const,
        content: data.content,
        timestamp: new Date().toISOString(),
        tools_used: data.tools_used,
        data_sources: data.data_sources
      };
      
      setConversation(prev => [...prev, newMessage]);
      
      toast({
        title: "AI Response Generated! 🤖",
        description: `Used ${data.tools_used.length} tools and ${data.data_sources.length} data sources.`,
      });
    },
    onError: (error) => {
      toast({
        title: "AI Assistant Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });

  // Real-time data fetch mutation
  const realTimeDataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/ai/real-time-data");
      return response.json();
    },
    onSuccess: (data: RealTimeData) => {
      setRealTimeData(data);
      toast({
        title: "Real-time Data Updated! 📊",
        description: `Found ${data.grants_found} current opportunities.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Data Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;

    const userMessage = {
      role: "user" as const,
      content: userQuery,
      timestamp: new Date().toISOString()
    };

    setConversation(prev => [...prev, userMessage]);
    setIsProcessing(true);
    setUserQuery("");

    await mcpAssistantMutation.mutateAsync(userQuery);
  };

  const handleRealTimeUpdate = () => {
    realTimeDataMutation.mutate();
  };

  const exampleQueries = [
    "What are the latest grant opportunities for education programs?",
    "Analyze this RFP document for key requirements and deadlines",
    "What are the current funding trends in healthcare?",
    "Help me validate my application against funder requirements",
    "Find recent successful applications in my sector",
    "What are the eligibility criteria for Department of Education grants?"
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Assistant with MCP</h1>
          <p className="text-muted-foreground">
            Enhanced AI assistant with real-time data access and intelligent tools
          </p>
        </div>
        <Button 
          onClick={handleRealTimeUpdate}
          disabled={realTimeDataMutation.isPending}
          variant="outline"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${realTimeDataMutation.isPending ? 'animate-spin' : ''}`} />
          Update Real-time Data
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Available Tools
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Real-time Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI Assistant Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96 w-full border rounded-md p-4">
                    {conversation.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Start a conversation with your AI assistant</p>
                        <p className="text-sm">Ask about grants, analyze documents, or get real-time insights</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {conversation.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                message.role === "user"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              {message.tools_used && message.tools_used.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {message.tools_used.map((tool, toolIndex) => (
                                    <Badge key={toolIndex} variant="secondary" className="text-xs">
                                      {tool}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {message.data_sources && message.data_sources.length > 0 && (
                                <div className="mt-1 text-xs text-muted-foreground">
                                  Sources: {message.data_sources.join(", ")}
                                </div>
                              )}
                              <div className="mt-1 text-xs opacity-70">
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        ))}
                        {isProcessing && (
                          <div className="flex justify-start">
                            <div className="bg-muted rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                <span className="text-sm">AI is thinking...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              <form onSubmit={handleSubmit} className="space-y-2">
                <Textarea
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Ask your AI assistant anything about grants, funding, or application requirements..."
                  className="min-h-[100px]"
                  disabled={isProcessing}
                />
                <div className="flex justify-between items-center">
                  <Button type="submit" disabled={isProcessing || !userQuery.trim()}>
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setConversation([])}
                    disabled={conversation.length === 0}
                  >
                    Clear Chat
                  </Button>
                </div>
              </form>
            </div>

            {/* Example Queries */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Example Queries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {exampleQueries.map((query, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start text-left h-auto p-3"
                        onClick={() => setUserQuery(query)}
                        disabled={isProcessing}
                      >
                        <span className="text-sm">{query}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* MCP Capabilities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    MCP Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Real-time Grants.gov data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Live document analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">Current funding trends</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">Application validation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-red-500" />
                      <span className="text-sm">Competitor analysis</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Grant Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Search real-time grant opportunities with advanced filters
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Live Grants.gov integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Advanced filtering options</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Real-time deadline tracking</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Document Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  AI-powered analysis of grant documents and requirements
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Requirement extraction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Deadline identification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Eligibility analysis</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Trend Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Current funding trends and policy updates
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Real-time policy updates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Funding trend analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Market intelligence</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Validation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Validate applications against current requirements
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Requirement compliance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Format validation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Completeness check</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Competitor Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Analyze recent successful applications
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Recent award data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Success patterns</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Competitive insights</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Strategic intelligence and recommendations
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Funder analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Strategic positioning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Success optimization</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Grants</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {realTimeData?.grants_found || "..."}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current opportunities
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {realTimeData?.current_deadlines?.length || "..."}
                </div>
                <p className="text-xs text-muted-foreground">
                  This week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Awards</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {realTimeData?.recent_awards?.length || "..."}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trending Topics</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {realTimeData?.funding_trends?.length || "..."}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current trends
                </p>
              </CardContent>
            </Card>
          </div>

          {realTimeData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Upcoming Deadlines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {realTimeData.current_deadlines?.map((deadline, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{deadline}</span>
                        <Badge variant="secondary">Urgent</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Recent Awards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {realTimeData.recent_awards?.map((award, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div>
                          <p className="font-medium text-sm">{award.organization}</p>
                          <p className="text-xs text-muted-foreground">{award.project_type}</p>
                        </div>
                        <Badge variant="outline">{award.amount}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
