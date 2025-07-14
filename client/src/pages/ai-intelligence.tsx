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
      // Simulate API response for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        name: data.organizationName,
        fundingTrends: ["STEM Education", "Technology Innovation", "Community Outreach"],
        successFactors: ["Strong research methodology", "Clear impact metrics", "Collaborative partnerships"],
        competitiveAdvantages: ["Established track record", "Innovative approach", "Community support"],
        commonRequirements: ["Detailed budget narrative", "Evaluation plan", "Timeline"],
        applicationTips: ["Emphasize measurable outcomes", "Include letters of support", "Align with funder priorities"],
        averageAmount: "$50,000 - $200,000",
        successRate: "35%",
        reviewProcess: "Peer review with 3-month timeline",
        geographicFocus: ["National", "Regional"],
        preferredPartners: ["Universities", "Non-profits", "Government agencies"],
        pastProjects: ["Science education initiatives", "Technology access programs", "Research collaborations"]
      } as OrganizationIntelligence;
    }
  });

  const documentMutation = useMutation({
    mutationFn: async (data: { documentContent: string; documentType?: string }) => {
      const response = await apiRequest('/api/ai/analyze-grant-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentText: data.documentContent,
          documentName: data.documentType || 'Grant Document'
        })
      });
      
      // Transform the Python analyzer response to match our interface
      const result = await response.json();
      
      return {
        requirements: result.application_requirements?.required_documents || [],
        deadlines: result.deadlines_and_dates?.important_dates?.map((date: string) => ({
          type: 'Important Date',
          date: date,
          description: 'Grant deadline'
        })) || [],
        eligibilityCriteria: result.eligibility_requirements?.eligible_applicants || [],
        fundingAmount: result.funding_details?.funding_amounts?.[0] || 'Not specified',
        keyInformation: result.strategic_insights?.strategic_insights || [],
        applicationSections: result.application_requirements?.required_documents || [],
        evaluationCriteria: result.evaluation_criteria?.evaluation_criteria?.map((criteria: any) => 
          `${criteria.category} (${criteria.weight})`
        ) || []
      } as DocumentAnalysis;
    }
  });

  const sectionMutation = useMutation({
    mutationFn: async (data: any) => {
      // Simulate API response for demo purposes
      await new Promise(resolve => setTimeout(resolve, 2000));
      const sectionTemplates = {
        executive_summary: `Our organization proposes ${data.projectDetails.title}, a comprehensive initiative designed to address critical needs in our community. With ${data.projectDetails.duration} of dedicated effort and a total budget of $${data.projectDetails.budget?.toLocaleString()}, this project will directly impact ${data.projectDetails.targetPopulation}. Our proven track record and innovative approach position us uniquely to deliver measurable outcomes that align with your organization's mission and funding priorities.`,
        project_description: `${data.projectDetails.title} represents a strategic response to identified community needs through evidence-based interventions. Our methodology combines best practices with innovative approaches to ensure maximum impact. The project will be implemented over ${data.projectDetails.duration} with clear milestones and deliverables. We will engage ${data.projectDetails.targetPopulation} through comprehensive outreach and evidence-based programming that addresses root causes while building sustainable capacity.`,
        methodology: `Our approach to ${data.projectDetails.title} employs a multi-faceted methodology grounded in research and community engagement. We will utilize proven frameworks while adapting to local contexts and needs. The implementation strategy includes stakeholder engagement, systematic data collection, continuous monitoring, and adaptive management. Our team will employ both quantitative and qualitative assessment methods to ensure comprehensive evaluation and continuous improvement throughout the project lifecycle.`
      };
      
      const content = sectionTemplates[data.sectionType as keyof typeof sectionTemplates] || sectionTemplates.executive_summary;
      
      return {
        content,
        recommendations: [
          "Strengthen community partnership details",
          "Add specific impact metrics",
          "Include more detailed timeline",
          "Expand on sustainability planning"
        ],
        complianceChecks: [
          "✓ Addresses all RFP requirements",
          "✓ Includes measurable outcomes",
          "✓ Demonstrates organizational capacity",
          "! Consider adding more budget details"
        ],
        wordCount: content.split(' ').length,
        strengthScore: 85
      } as ApplicationSection;
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200">
          AlignIQ Blueprint
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Advanced grant writing intelligence powered by AI analysis
        </p>
      </div>

      <Tabs defaultValue="organization" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 h-auto sm:h-10">
          <TabsTrigger value="organization" className="flex items-center gap-2 justify-center sm:justify-start px-3 py-3 sm:py-2">
            <Users className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium">Organization Intelligence</span>
          </TabsTrigger>
          <TabsTrigger value="document" className="flex items-center gap-2 justify-center sm:justify-start px-3 py-3 sm:py-2">
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium">Grant Instructions</span>
          </TabsTrigger>
          <TabsTrigger value="generation" className="flex items-center gap-2 justify-center sm:justify-start px-3 py-3 sm:py-2">
            <Brain className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium">Content Generation</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <Target className="w-5 h-5 text-vibrant-blue" />
                Funding Mission and Goals
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                AlignIQ Blueprint is an AI-powered intelligence tool that maps the goals, metrics, priorities, and mission of funding organizations to strategically align your project with their core objectives. It ensures each grant proposal is crafted to fully reflect the funder's strategic vision, increasing alignment, relevance, and the likelihood of a successful award.
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
                <CardTitle className="text-energetic-green dark:text-green-400">
                  Intelligence Report: {organizationMutation.data.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Funding Trends</h3>
                      <div className="space-y-1">
                        {organizationMutation.data.fundingTrends.map((trend, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setOrganizationName(trend);
                              setGrantTitle(`${trend} Programs`);
                            }}
                            className="mr-2 mb-2 px-3 py-1 text-sm bg-vibrant-blue/10 dark:bg-vibrant-blue/20 text-vibrant-blue dark:text-blue-300 rounded-full border border-vibrant-blue/30 dark:border-blue-600 hover:bg-vibrant-blue/20 dark:hover:bg-vibrant-blue/30 transition-colors cursor-pointer"
                          >
                            {trend}
                            <span className="ml-2 text-xs opacity-70">↗</span>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                        Click trends to explore specific funding areas
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Success Factors</h3>
                      <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                        {organizationMutation.data.successFactors.map((factor, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-energetic-green dark:text-green-400 mt-0.5 flex-shrink-0" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Application Tips</h3>
                      <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                        {organizationMutation.data.applicationTips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-warm-orange dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">Average Amount</p>
                        <p className="text-energetic-green dark:text-green-400">{organizationMutation.data.averageAmount}</p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">Success Rate</p>
                        <p className="text-vibrant-blue dark:text-blue-400">{organizationMutation.data.successRate}</p>
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
              <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <FileText className="w-5 h-5 text-energetic-green" />
                Application Package Forms & Analysis
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Upload or paste grant RFPs, guidelines, and announcements to automatically extract requirements, deadlines, eligibility criteria, and evaluation metrics. Save hours of manual document review.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-vibrant-blue rounded-full"></div>
                    <span>Paste grant instructions below</span>
                  </div>
                  <div className="text-slate-400 dark:text-slate-500">or</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-energetic-green rounded-full"></div>
                    <span>Upload grant document files</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="docContent">Grant Instructions Content</Label>
                  <Textarea
                    id="docContent"
                    placeholder="Paste your grant RFP, guidelines, or application instructions here..."
                    value={documentContent}
                    onChange={(e) => setDocumentContent(e.target.value)}
                    rows={8}
                    className="min-h-[200px]"
                  />
                </div>
                
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="fileUpload"
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // For now, just show the filename - file processing would be implemented later
                        setDocumentContent(`[File uploaded: ${file.name}]\n\nFile content will be processed automatically...`);
                      }
                    }}
                  />
                  <label htmlFor="fileUpload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-vibrant-blue/10 dark:bg-vibrant-blue/20 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-vibrant-blue" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Upload Grant Instructions</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">PDF, DOC, DOCX, or TXT files</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              
              <Button 
                onClick={handleDocumentAnalysis}
                disabled={!documentContent || documentMutation.isPending}
                className="w-full"
              >
                {documentMutation.isPending ? "Analyzing..." : "Analyze Grant Instructions"}
              </Button>
            </CardContent>
          </Card>

          {documentMutation.data && (
            <Card>
              <CardHeader>
                <CardTitle className="text-energetic-green dark:text-green-400">Document Analysis Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Requirements</h3>
                      <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                        {documentMutation.data.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-warm-orange rounded-full mt-2 flex-shrink-0"></span>
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
                Create professional, tailored application sections using insights from organization intelligence and document analysis. Generate compelling content that aligns with funder priorities.
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