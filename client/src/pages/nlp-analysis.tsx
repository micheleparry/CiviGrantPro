import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, Search, TrendingUp, MessageSquare, 
  Building, MapPin, User, FileText, 
  Zap, Target, BarChart3, RefreshCw,
  CheckCircle, AlertTriangle, Info, Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface EntityAnalysis {
  entities: Array<{
    name: string;
    type: string;
    salience: number;
    metadata?: Record<string, string>;
    mentions: Array<{
      text: string;
      type: string;
    }>;
  }>;
  language: string;
}

interface SentimentAnalysis {
  documentSentiment: {
    score: number;
    magnitude: number;
  };
  sentences: Array<{
    text: string;
    sentiment: {
      score: number;
      magnitude: number;
    };
  }>;
  language: string;
}

interface ContentClassification {
  categories: Array<{
    name: string;
    confidence: number;
  }>;
  language: string;
}

interface GrantInsights {
  fundingAgencies: string[];
  eligibleEntities: string[];
  keyRequirements: string[];
  programAreas: string[];
  geographicFocus: string[];
  fundingAmounts: string[];
  deadlines: string[];
  contactInfo: string[];
  documentTone: 'formal' | 'informal' | 'technical' | 'accessible';
  complexityLevel: 'low' | 'medium' | 'high';
  urgencyIndicators: string[];
}

interface ApplicationAnalysis {
  sentiment: SentimentAnalysis;
  entities: EntityAnalysis;
  writingQuality: {
    tone: 'professional' | 'casual' | 'technical' | 'persuasive';
    clarity: 'high' | 'medium' | 'low';
    impact: 'strong' | 'moderate' | 'weak';
    suggestions: string[];
  };
  keyMessages: string[];
  strengths: string[];
  areasForImprovement: string[];
}

const analysisTypes = [
  { value: "comprehensive", label: "Comprehensive Analysis", icon: Brain },
  { value: "entities", label: "Entity Recognition", icon: Search },
  { value: "sentiment", label: "Sentiment Analysis", icon: TrendingUp },
  { value: "classification", label: "Content Classification", icon: FileText },
  { value: "grant", label: "Grant Document Analysis", icon: Target },
  { value: "application", label: "Application Analysis", icon: MessageSquare },
];

export default function NlpAnalysis() {
  const { toast } = useToast();
  
  const [selectedTab, setSelectedTab] = useState("analysis");
  const [analysisType, setAnalysisType] = useState("comprehensive");
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeTextMutation = useMutation({
    mutationFn: async (data: { text: string; type: string }) => {
      const endpoint = `/api/nlp/${data.type === 'comprehensive' ? 'analyze-text' : 
        data.type === 'entities' ? 'analyze-entities' :
        data.type === 'sentiment' ? 'analyze-sentiment' :
        data.type === 'classification' ? 'classify-content' :
        data.type === 'grant' ? 'analyze-grant-document' :
        'analyze-application'}`;
      
      const response = await apiRequest("POST", endpoint, {
        text: data.text,
        ...(data.type === 'application' && { content: data.text })
      });
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data);
      toast({
        title: "Analysis Complete! 🧠",
        description: "NLP analysis has been completed successfully.",
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

  const handleAnalyze = () => {
    if (!inputText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter text to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    analyzeTextMutation.mutate(
      { text: inputText, type: analysisType },
      { onSettled: () => setIsAnalyzing(false) }
    );
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return "text-green-600";
    if (score > -0.3) return "text-yellow-600";
    return "text-red-600";
  };

  const getSentimentLabel = (score: number) => {
    if (score > 0.3) return "Positive";
    if (score > -0.3) return "Neutral";
    return "Negative";
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'persuasive': return 'bg-purple-100 text-purple-800';
      case 'technical': return 'bg-gray-100 text-gray-800';
      case 'casual': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClarityColor = (clarity: string) => {
    switch (clarity) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'strong': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'weak': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getEntityTypeColor = (type: string) => {
    switch (type) {
      case 'ORGANIZATION': return 'bg-blue-100 text-blue-800';
      case 'PERSON': return 'bg-green-100 text-green-800';
      case 'LOCATION': return 'bg-purple-100 text-purple-800';
      case 'EVENT': return 'bg-orange-100 text-orange-800';
      case 'WORK_OF_ART': return 'bg-pink-100 text-pink-800';
      case 'CONSUMER_GOOD': return 'bg-indigo-100 text-indigo-800';
      case 'OTHER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced NLP Analysis</h1>
          <p className="text-gray-600 mt-2">
            Leverage Google's Natural Language API for sophisticated text analysis
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !inputText.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isAnalyzing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Brain className="w-4 h-4 mr-2" />
            )}
            Analyze Text
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analysis">Text Analysis</TabsTrigger>
          <TabsTrigger value="results">Analysis Results</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Text Analysis Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Analysis Type
                </label>
                <Select
                  value={analysisType}
                  onValueChange={setAnalysisType}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {analysisTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center">
                            <Icon className="w-4 h-4 mr-2" />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Input Text
                </label>
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter text to analyze..."
                  rows={10}
                  className="w-full"
                />
                <div className="text-sm text-gray-500 mt-1">
                  {inputText.length} characters
                </div>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !inputText.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4 mr-2" />
                )}
                {isAnalyzing ? "Analyzing..." : "Analyze Text"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {!results ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Analysis Results
                  </h3>
                  <p className="text-gray-600">
                    Run a text analysis to see detailed NLP insights.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Comprehensive Analysis Results */}
              {analysisType === "comprehensive" && results.summary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Analysis Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className={`text-2xl font-bold ${getSentimentColor(results.summary.sentimentScore)}`}>
                          {getSentimentLabel(results.summary.sentimentScore)}
                        </div>
                        <div className="text-sm text-gray-600">Overall Sentiment</div>
                        <div className="text-xs text-gray-500">
                          Score: {results.summary.sentimentScore.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {results.summary.keyEntities.length}
                        </div>
                        <div className="text-sm text-gray-600">Key Entities</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {results.summary.categories.length}
                        </div>
                        <div className="text-sm text-gray-600">Content Categories</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Entity Analysis Results */}
              {(analysisType === "entities" || analysisType === "comprehensive") && results.entities && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Search className="w-5 h-5 mr-2" />
                      Entity Recognition
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {results.entities.entities
                        .sort((a: any, b: any) => b.salience - a.salience)
                        .slice(0, 20)
                        .map((entity: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Badge className={getEntityTypeColor(entity.type)}>
                                {entity.type}
                              </Badge>
                              <span className="font-medium">{entity.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {(entity.salience * 100).toFixed(1)}%
                              </div>
                              <div className="text-xs text-gray-500">Salience</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sentiment Analysis Results */}
              {(analysisType === "sentiment" || analysisType === "comprehensive") && results.sentiment && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Sentiment Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className={`text-2xl font-bold ${getSentimentColor(results.sentiment.documentSentiment.score)}`}>
                          {getSentimentLabel(results.sentiment.documentSentiment.score)}
                        </div>
                        <div className="text-sm text-gray-600">Document Sentiment</div>
                        <div className="text-xs text-gray-500">
                          Score: {results.sentiment.documentSentiment.score.toFixed(3)}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {results.sentiment.documentSentiment.magnitude.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">Magnitude</div>
                        <div className="text-xs text-gray-500">Emotional intensity</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Sentence-level Sentiment</h4>
                      <ScrollArea className="h-64">
                        <div className="space-y-2">
                          {results.sentiment.sentences.slice(0, 10).map((sentence: any, index: number) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                              <div className="text-sm mb-1">{sentence.text}</div>
                              <div className="flex items-center justify-between text-xs">
                                <span className={getSentimentColor(sentence.sentiment.score)}>
                                  {getSentimentLabel(sentence.sentiment.score)}
                                </span>
                                <span className="text-gray-500">
                                  Score: {sentence.sentiment.score.toFixed(3)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Content Classification Results */}
              {(analysisType === "classification" || analysisType === "comprehensive") && results.classification && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Content Classification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {results.classification.categories
                        .sort((a: any, b: any) => b.confidence - a.confidence)
                        .map((category: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">{category.name}</span>
                            <div className="flex items-center space-x-2">
                              <Progress value={category.confidence * 100} className="w-20" />
                              <span className="text-sm font-medium">
                                {(category.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Grant Document Analysis Results */}
              {analysisType === "grant" && results.grantInsights && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Grant Document Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center">
                          <Building className="w-4 h-4 mr-2" />
                          Funding Agencies
                        </h4>
                        <div className="space-y-2">
                          {results.grantInsights.fundingAgencies.map((agency: string, index: number) => (
                            <Badge key={index} variant="outline">{agency}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          Geographic Focus
                        </h4>
                        <div className="space-y-2">
                          {results.grantInsights.geographicFocus.map((location: string, index: number) => (
                            <Badge key={index} variant="outline">{location}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold capitalize">
                          {results.grantInsights.documentTone}
                        </div>
                        <div className="text-sm text-gray-600">Document Tone</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold capitalize">
                          {results.grantInsights.complexityLevel}
                        </div>
                        <div className="text-sm text-gray-600">Complexity Level</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold">
                          {results.grantInsights.urgencyIndicators.length}
                        </div>
                        <div className="text-sm text-gray-600">Urgency Indicators</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Application Analysis Results */}
              {analysisType === "application" && results.writingQuality && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Application Writing Quality
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Badge className={getToneColor(results.writingQuality.tone)}>
                          {results.writingQuality.tone}
                        </Badge>
                        <div className="text-sm text-gray-600 mt-1">Writing Tone</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className={`text-lg font-bold ${getClarityColor(results.writingQuality.clarity)}`}>
                          {results.writingQuality.clarity}
                        </div>
                        <div className="text-sm text-gray-600">Clarity</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className={`text-lg font-bold ${getImpactColor(results.writingQuality.impact)}`}>
                          {results.writingQuality.impact}
                        </div>
                        <div className="text-sm text-gray-600">Impact</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                          Strengths
                        </h4>
                        <div className="space-y-2">
                          {results.strengths.map((strength: string, index: number) => (
                            <div key={index} className="flex items-start">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                              <span className="text-sm">{strength}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                          Areas for Improvement
                        </h4>
                        <div className="space-y-2">
                          {results.areasForImprovement.map((area: string, index: number) => (
                            <div key={index} className="flex items-start">
                              <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 mr-2 flex-shrink-0" />
                              <span className="text-sm">{area}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <Zap className="w-4 h-4 mr-2 text-blue-600" />
                        Suggestions
                      </h4>
                      <div className="space-y-2">
                        {results.writingQuality.suggestions.map((suggestion: string, index: number) => (
                          <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                            <Info className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-sm">{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 