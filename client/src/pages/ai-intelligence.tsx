import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, FileText, Users, Target, Lightbulb, CheckCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface OrganizationIntelligence {
  name: string;
  fundingTrends: string[];
  successFactors: string[];
  competitiveAdvantages: string[];
  commonRequirements: string[];
  applicationTips: string[];
  averageAmount: string;
  successRate: string;
  reviewProcess: string;
  geographicFocus: string[];
  preferredPartners: string[];
  pastProjects: string[];
}

interface DocumentAnalysis {
  requirements: string[];
  deadlines: Array<{ type: string; date: string; description: string }>;
  eligibilityCriteria: string[];
  fundingAmount: string;
  keyInformation: string[];
  applicationSections: string[];
  evaluationCriteria: string[];
}

interface ApplicationSection {
  content: string;
  recommendations: string[];
  complianceChecks: string[];
  wordCount: number;
  strengthScore: number;
}

export default function AiIntelligence() {
  const [organizationName, setOrganizationName] = useState("");
  const [grantTitle, setGrantTitle] = useState("");
  const [documentContent, setDocumentContent] = useState("");
  const [sectionType, setSectionType] = useState("executive_summary");
  const [projectDetails, setProjectDetails] = useState({
    title: "",
    description: "",
    organization: "",
    budget: 0,
    duration: "",
    targetPopulation: ""
  });

  const organizationMutation = useMutation({
    mutationFn: async (data: { organizationName: string; grantTitle?: string }) => {
      const response = await apiRequest("/api/ai/organization-intelligence", {
        method: "POST",
        body: JSON.stringify(data)
      });
      return response.json() as Promise<OrganizationIntelligence>;
    }
  });

  const documentMutation = useMutation({
    mutationFn: async (data: { documentContent: string; documentType?: string }) => {
      const response = await apiRequest("/api/ai/document-analysis", {
        method: "POST",
        body: JSON.stringify(data)
      });
      return response.json() as Promise<DocumentAnalysis>;
    }
  });

  const sectionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("/api/ai/application-section", {
        method: "POST",
        body: JSON.stringify(data)
      });
      return response.json() as Promise<ApplicationSection>;
    }
  });

  const handleOrganizationAnalysis = () => {
    organizationMutation.mutate({ organizationName, grantTitle });
  };

  const handleDocumentAnalysis = () => {
    documentMutation.mutate({ documentContent, documentType: "grant_rfp" });
  };

  const handleSectionGeneration = () => {
    if (organizationMutation.data) {
      sectionMutation.mutate({
        sectionType,
        projectDetails,
        grantRequirements: documentMutation.data?.requirements || [],
        organizationIntelligence: organizationMutation.data
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          AI Intelligence Hub
        </h1>
        <p className="text-muted-foreground">
          Advanced grant writing intelligence powered by AI analysis
        </p>
      </div>

      <Tabs defaultValue="organization" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Organization Intelligence
          </TabsTrigger>
          <TabsTrigger value="document" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Document Analysis
          </TabsTrigger>
          <TabsTrigger value="generation" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Content Generation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Funding Organization Intelligence
              </CardTitle>
              <CardDescription>
                Get comprehensive insights about funding organizations and their priorities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    placeholder="e.g., National Science Foundation"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grantTitle">Grant Title (Optional)</Label>
                  <Input
                    id="grantTitle"
                    placeholder="e.g., CISE Research Grants"
                    value={grantTitle}
                    onChange={(e) => setGrantTitle(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                onClick={handleOrganizationAnalysis}
                disabled={!organizationName || organizationMutation.isPending}
                className="w-full"
              >
                {organizationMutation.isPending ? "Analyzing..." : "Analyze Organization"}
              </Button>
            </CardContent>
          </Card>

          {organizationMutation.data && (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">
                  Intelligence Report: {organizationMutation.data.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-purple-600 mb-2">Funding Trends</h3>
                      <div className="space-y-1">
                        {organizationMutation.data.fundingTrends.map((trend, idx) => (
                          <Badge key={idx} variant="secondary" className="mr-2 mb-2">
                            {trend}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-600 mb-2">Success Factors</h3>
                      <ul className="space-y-1 text-sm">
                        {organizationMutation.data.successFactors.map((factor, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-orange-600 mb-2">Application Tips</h3>
                      <ul className="space-y-1 text-sm">
                        {organizationMutation.data.applicationTips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Average Amount</p>
                        <p className="text-green-600">{organizationMutation.data.averageAmount}</p>
                      </div>
                      <div>
                        <p className="font-medium">Success Rate</p>
                        <p className="text-blue-600">{organizationMutation.data.successRate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="document" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Grant Document Analysis
              </CardTitle>
              <CardDescription>
                Extract requirements, deadlines, and key information from grant documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="docContent">Document Content</Label>
                <Textarea
                  id="docContent"
                  placeholder="Paste grant document content here..."
                  value={documentContent}
                  onChange={(e) => setDocumentContent(e.target.value)}
                  rows={8}
                />
              </div>
              <Button 
                onClick={handleDocumentAnalysis}
                disabled={!documentContent || documentMutation.isPending}
                className="w-full"
              >
                {documentMutation.isPending ? "Analyzing..." : "Analyze Document"}
              </Button>
            </CardContent>
          </Card>

          {documentMutation.data && (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Document Analysis Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-red-600 mb-2">Requirements</h3>
                      <ul className="space-y-1 text-sm">
                        {documentMutation.data.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-600 mb-2">Eligibility Criteria</h3>
                      <ul className="space-y-1 text-sm">
                        {documentMutation.data.eligibilityCriteria.map((criteria, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            {criteria}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-purple-600 mb-2">Application Sections</h3>
                      <div className="space-y-1">
                        {documentMutation.data.applicationSections.map((section, idx) => (
                          <Badge key={idx} variant="outline" className="mr-2 mb-2">
                            {section}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Funding Amount</p>
                      <p className="text-green-600 text-lg">{documentMutation.data.fundingAmount}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="generation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Application Section Generation
              </CardTitle>
              <CardDescription>
                Generate professional application sections using AI intelligence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sectionType">Section Type</Label>
                  <select 
                    id="sectionType"
                    className="w-full p-2 border rounded"
                    value={sectionType}
                    onChange={(e) => setSectionType(e.target.value)}
                  >
                    <option value="executive_summary">Executive Summary</option>
                    <option value="project_description">Project Description</option>
                    <option value="objectives">Objectives</option>
                    <option value="methodology">Methodology</option>
                    <option value="budget_narrative">Budget Narrative</option>
                    <option value="evaluation_plan">Evaluation Plan</option>
                    <option value="sustainability">Sustainability</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectTitle">Project Title</Label>
                  <Input
                    id="projectTitle"
                    placeholder="Your project title"
                    value={projectDetails.title}
                    onChange={(e) => setProjectDetails({...projectDetails, title: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="projectDesc">Project Description</Label>
                <Textarea
                  id="projectDesc"
                  placeholder="Brief description of your project"
                  value={projectDetails.description}
                  onChange={(e) => setProjectDetails({...projectDetails, description: e.target.value})}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Input
                    id="organization"
                    placeholder="Your organization"
                    value={projectDetails.organization}
                    onChange={(e) => setProjectDetails({...projectDetails, organization: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="0"
                    value={projectDetails.budget}
                    onChange={(e) => setProjectDetails({...projectDetails, budget: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    placeholder="e.g., 2 years"
                    value={projectDetails.duration}
                    onChange={(e) => setProjectDetails({...projectDetails, duration: e.target.value})}
                  />
                </div>
              </div>

              <Button 
                onClick={handleSectionGeneration}
                disabled={!projectDetails.title || !organizationMutation.data || sectionMutation.isPending}
                className="w-full"
              >
                {sectionMutation.isPending ? "Generating..." : "Generate Section"}
              </Button>
            </CardContent>
          </Card>

          {sectionMutation.data && (
            <Card>
              <CardHeader>
                <CardTitle className="text-purple-600">
                  Generated {sectionType.replace('_', ' ')} Section
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Word Count: {sectionMutation.data.wordCount}</span>
                  <span>Strength Score: {sectionMutation.data.strengthScore}/100</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{sectionMutation.data.content}</pre>
                </div>
                
                {sectionMutation.data.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-blue-600 mb-2">Recommendations</h4>
                    <ul className="space-y-1 text-sm">
                      {sectionMutation.data.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}