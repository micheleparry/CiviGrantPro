import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bot, Sparkles, FileText, Target, Lightbulb, 
  Send, RefreshCw, Download, Copy, CheckCircle,
  TrendingUp, Award, MessageSquare, Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AiSuggestion, Application, Grant } from "@shared/schema";

const CURRENT_ORG_ID = 1;
const CURRENT_USER_ID = 1;

const narrativeSections = [
  { value: "executive_summary", label: "Executive Summary" },
  { value: "project_description", label: "Project Description" },
  { value: "methodology", label: "Methodology" },
  { value: "impact_statement", label: "Impact Statement" },
  { value: "budget_justification", label: "Budget Justification" },
  { value: "sustainability", label: "Sustainability Plan" },
  { value: "evaluation", label: "Evaluation Plan" },
];

const suggestionTypes = [
  { value: "narrative", label: "Narrative Improvement" },
  { value: "budget", label: "Budget Optimization" },
  { value: "timeline", label: "Timeline Enhancement" },
  { value: "impact", label: "Impact Amplification" },
];

export default function AiAssistant() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedTab, setSelectedTab] = useState("generate");
  const [narrativeInput, setNarrativeInput] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedApplication, setSelectedApplication] = useState("");
  const [selectedGrant, setSelectedGrant] = useState("");
  const [generatedNarrative, setGeneratedNarrative] = useState("");
  const [analysisInput, setAnalysisInput] = useState("");
  const [selectedSuggestionType, setSelectedSuggestionType] = useState("");

  const { data: applications } = useQuery<Application[]>({
    queryKey: ["/api/applications/organization", CURRENT_ORG_ID],
  });

  const { data: grants } = useQuery<Grant[]>({
    queryKey: ["/api/grants"],
  });

  const { data: suggestions } = useQuery<AiSuggestion[]>({
    queryKey: ["/api/ai-suggestions/application", selectedApplication],
    enabled: !!selectedApplication,
  });

  const generateNarrativeMutation = useMutation({
    mutationFn: async (data: {
      grantDescription: string;
      organizationProfile: string;
      projectDescription: string;
      section: string;
    }) => {
      const response = await apiRequest("POST", "/api/ai/generate-narrative", data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedNarrative(data.narrative);
      toast({
        title: "Narrative Generated! ✨",
        description: "Your AI-powered narrative is ready for review.",
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

  const generateSuggestionsMutation = useMutation({
    mutationFn: async (data: {
      applicationContent: string;
      grantRequirements: string;
      suggestionType: string;
    }) => {
      const response = await apiRequest("POST", "/api/ai/generate-suggestions", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Suggestions Generated! 💡",
        description: `Generated ${data.suggestions.length} helpful suggestions.`,
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/ai-suggestions/application", selectedApplication] 
      });
    },
    onError: (error) => {
      toast({
        title: "Suggestion Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const analyzeGrantMutation = useMutation({
    mutationFn: async (data: {
      grantDescription: string;
      organizationProfile: string;
      focusAreas: string[];
    }) => {
      const response = await apiRequest("POST", "/api/ai/analyze-grant-match", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis Complete! 🎯",
        description: `Match score: ${data.matchPercentage}% - ${data.alignment}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateNarrative = () => {
    if (!selectedGrant || !selectedSection || !narrativeInput) {
      toast({
        title: "Missing Information",
        description: "Please select a grant, section, and provide project description.",
        variant: "destructive",
      });
      return;
    }

    const selectedGrantData = grants?.find(g => g.id === parseInt(selectedGrant));
    if (!selectedGrantData) return;

    generateNarrativeMutation.mutate({
      grantDescription: selectedGrantData.description,
      organizationProfile: "Community Health Initiative - Supporting community health programs across underserved areas",
      projectDescription: narrativeInput,
      section: selectedSection,
    });
  };

  const handleGenerateSuggestions = () => {
    if (!selectedApplication || !selectedSuggestionType || !analysisInput) {
      toast({
        title: "Missing Information",
        description: "Please select an application, suggestion type, and provide content.",
        variant: "destructive",
      });
      return;
    }

    generateSuggestionsMutation.mutate({
      applicationContent: analysisInput,
      grantRequirements: "Grant requirements will be fetched from selected application",
      suggestionType: selectedSuggestionType,
    });
  };

  const handleCopyNarrative = async () => {
    if (generatedNarrative) {
      await navigator.clipboard.writeText(generatedNarrative);
      toast({
        title: "Copied! 📋",
        description: "Narrative copied to clipboard.",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center">
            <Bot className="mr-3 text-deep-blue" size={32} />
            AI Writing Assistant
          </h1>
          <p className="text-slate-600 mt-2">
            Leverage AI to craft compelling grant narratives and optimize your applications
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="border-deep-blue text-deep-blue">
            <Sparkles className="mr-1" size={14} />
            GPT-4o Powered
          </Badge>
          <Badge variant="outline" className="border-energetic-green text-energetic-green">
            <Zap className="mr-1" size={14} />
            Real-time
          </Badge>
        </div>
      </div>

      {/* AI Assistant Tabs */}
      <Card className="shadow-sm border-t-4 border-deep-blue">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
            <MessageSquare className="mr-2" size={20} />
            AI Writing Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="generate">Generate Narrative</TabsTrigger>
              <TabsTrigger value="suggestions">Get Suggestions</TabsTrigger>
              <TabsTrigger value="analyze">Analyze Match</TabsTrigger>
            </TabsList>

            {/* Generate Narrative Tab */}
            <TabsContent value="generate" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Select Grant Opportunity
                    </label>
                    <Select value={selectedGrant} onValueChange={setSelectedGrant}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a grant..." />
                      </SelectTrigger>
                      <SelectContent>
                        {grants?.map(grant => (
                          <SelectItem key={grant.id} value={grant.id.toString()}>
                            {grant.title} - {grant.funder}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Narrative Section
                    </label>
                    <Select value={selectedSection} onValueChange={setSelectedSection}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose section..." />
                      </SelectTrigger>
                      <SelectContent>
                        {narrativeSections.map(section => (
                          <SelectItem key={section.value} value={section.value}>
                            {section.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Project Description
                    </label>
                    <Textarea
                      placeholder="Describe your project, goals, and approach..."
                      value={narrativeInput}
                      onChange={(e) => setNarrativeInput(e.target.value)}
                      rows={6}
                    />
                  </div>

                  <Button 
                    onClick={handleGenerateNarrative}
                    disabled={generateNarrativeMutation.isPending}
                    className="w-full bg-deep-blue hover:bg-vibrant-blue text-white"
                  >
                    {generateNarrativeMutation.isPending ? (
                      <>
                        <RefreshCw className="mr-2 animate-spin" size={16} />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2" size={16} />
                        Generate Narrative
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800">Generated Narrative</h3>
                    {generatedNarrative && (
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleCopyNarrative}
                        >
                          <Copy size={14} className="mr-1" />
                          Copy
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toast({ title: "Export feature coming soon!" })}
                        >
                          <Download size={14} className="mr-1" />
                          Export
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <Card className="border-2 border-dashed border-slate-200">
                    <CardContent className="p-4">
                      {generatedNarrative ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2 text-energetic-green">
                            <CheckCircle size={16} />
                            <span className="text-sm font-medium">Narrative Generated Successfully!</span>
                          </div>
                          <ScrollArea className="h-64">
                            <p className="text-slate-700 whitespace-pre-wrap">
                              {generatedNarrative}
                            </p>
                          </ScrollArea>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-500">
                          <FileText className="mx-auto mb-2" size={32} />
                          <p>Generated narrative will appear here</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Suggestions Tab */}
            <TabsContent value="suggestions" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Select Application
                    </label>
                    <Select value={selectedApplication} onValueChange={setSelectedApplication}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an application..." />
                      </SelectTrigger>
                      <SelectContent>
                        {applications?.map(app => (
                          <SelectItem key={app.id} value={app.id.toString()}>
                            {app.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Suggestion Type
                    </label>
                    <Select value={selectedSuggestionType} onValueChange={setSelectedSuggestionType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {suggestionTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Content to Analyze
                    </label>
                    <Textarea
                      placeholder="Paste your application content here for AI analysis..."
                      value={analysisInput}
                      onChange={(e) => setAnalysisInput(e.target.value)}
                      rows={8}
                    />
                  </div>

                  <Button 
                    onClick={handleGenerateSuggestions}
                    disabled={generateSuggestionsMutation.isPending}
                    className="w-full bg-warm-orange hover:bg-deep-orange text-white"
                  >
                    {generateSuggestionsMutation.isPending ? (
                      <>
                        <RefreshCw className="mr-2 animate-spin" size={16} />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="mr-2" size={16} />
                        Get AI Suggestions
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800">AI Suggestions</h3>
                  
                  <ScrollArea className="h-96">
                    {suggestions && suggestions.length > 0 ? (
                      <div className="space-y-3">
                        {suggestions.map((suggestion, index) => (
                          <Card key={suggestion.id} className="border-l-4 border-warm-orange">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {suggestion.type}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {suggestion.confidence}% confidence
                                </Badge>
                              </div>
                              <p className="text-slate-700 text-sm">
                                {suggestion.suggestion}
                              </p>
                              <div className="mt-3 flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-energetic-green border-energetic-green hover:bg-energetic-green hover:text-white"
                                >
                                  <CheckCircle size={14} className="mr-1" />
                                  Accept
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => toast({ title: "Feature coming soon!" })}
                                >
                                  <Copy size={14} className="mr-1" />
                                  Copy
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <Lightbulb className="mx-auto mb-2" size={32} />
                        <p>AI suggestions will appear here</p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>

            {/* Analyze Match Tab */}
            <TabsContent value="analyze" className="mt-6">
              <Card className="border-l-4 border-vibrant-blue">
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <Target className="mx-auto mb-4 text-vibrant-blue" size={48} />
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">Grant Match Analysis</h3>
                    <p className="text-slate-600 mb-4">
                      Analyze how well your organization aligns with grant opportunities
                    </p>
                    <Button 
                      onClick={() => toast({ title: "Analysis feature coming soon!" })}
                      className="bg-vibrant-blue hover:bg-deep-blue text-white"
                    >
                      <TrendingUp className="mr-2" size={16} />
                      Start Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="shadow-sm border-t-4 border-energetic-green">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
            <Award className="mr-2" size={20} />
            AI Writing Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-vibrant-blue/10 rounded-full flex items-center justify-center">
                <span className="text-vibrant-blue font-semibold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">Be Specific</h4>
                <p className="text-sm text-slate-600">Provide detailed project descriptions for better AI-generated narratives</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-energetic-green/10 rounded-full flex items-center justify-center">
                <span className="text-energetic-green font-semibold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">Review & Edit</h4>
                <p className="text-sm text-slate-600">Always review AI suggestions and adapt them to your unique voice</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-warm-orange/10 rounded-full flex items-center justify-center">
                <span className="text-warm-orange font-semibold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">Iterate</h4>
                <p className="text-sm text-slate-600">Use multiple AI suggestions to refine and improve your content</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
