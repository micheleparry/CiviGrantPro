import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface GrantAnalysis {
  matchPercentage: number;
  alignment: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

export interface NarrativeGeneration {
  narrative: string;
  keyPoints: string[];
  improvements: string[];
  confidence: number;
}

export async function analyzeGrantMatch(
  grantDescription: string,
  organizationProfile: string,
  focusAreas: string[]
): Promise<GrantAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a grant matching expert. Analyze how well an organization matches a grant opportunity. 
          Provide a detailed analysis including match percentage, alignment assessment, strengths, areas for improvement, and recommendations.
          Respond with JSON in this format: {
            "matchPercentage": number,
            "alignment": string,
            "strengths": string[],
            "improvements": string[],
            "recommendations": string[]
          }`,
        },
        {
          role: "user",
          content: `Grant: ${grantDescription}\n\nOrganization: ${organizationProfile}\n\nFocus Areas: ${focusAreas.join(", ")}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      matchPercentage: Math.max(0, Math.min(100, result.matchPercentage || 0)),
      alignment: result.alignment || "Analysis unavailable",
      strengths: result.strengths || [],
      improvements: result.improvements || [],
      recommendations: result.recommendations || [],
    };
  } catch (error) {
    console.error("Grant analysis error:", error);
    throw new Error("Failed to analyze grant match: " + (error as Error).message);
  }
}

export async function generateNarrative(
  grantDescription: string,
  organizationProfile: string,
  projectDescription: string,
  section: string
): Promise<NarrativeGeneration> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert grant writer. Generate compelling, professional narratives for grant applications.
          Focus on clear impact, evidence-based approaches, and alignment with funder priorities.
          Respond with JSON in this format: {
            "narrative": string,
            "keyPoints": string[],
            "improvements": string[],
            "confidence": number
          }`,
        },
        {
          role: "user",
          content: `Grant: ${grantDescription}\n\nOrganization: ${organizationProfile}\n\nProject: ${projectDescription}\n\nSection: ${section}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      narrative: result.narrative || "Narrative generation failed",
      keyPoints: result.keyPoints || [],
      improvements: result.improvements || [],
      confidence: Math.max(0, Math.min(100, result.confidence || 0)),
    };
  } catch (error) {
    console.error("Narrative generation error:", error);
    throw new Error("Failed to generate narrative: " + (error as Error).message);
  }
}

export async function generateSuggestions(
  applicationContent: string,
  grantRequirements: string,
  suggestionType: string
): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a grant writing consultant. Provide specific, actionable suggestions to improve grant applications.
          Focus on ${suggestionType} improvements. Respond with JSON in this format: { "suggestions": string[] }`,
        },
        {
          role: "user",
          content: `Application: ${applicationContent}\n\nGrant Requirements: ${grantRequirements}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.suggestions || [];
  } catch (error) {
    console.error("Suggestions generation error:", error);
    throw new Error("Failed to generate suggestions: " + (error as Error).message);
  }
}

export async function analyzeFunderPriorities(
  funderDescription: string,
  pastAwards: string[]
): Promise<{ priorities: string[]; strategies: string[] }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a funder research expert. Analyze funder priorities and suggest strategic approaches.
          Respond with JSON in this format: { "priorities": string[], "strategies": string[] }`,
        },
        {
          role: "user",
          content: `Funder: ${funderDescription}\n\nPast Awards: ${pastAwards.join(", ")}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      priorities: result.priorities || [],
      strategies: result.strategies || [],
    };
  } catch (error) {
    console.error("Funder analysis error:", error);
    throw new Error("Failed to analyze funder priorities: " + (error as Error).message);
  }
}

// Enhanced intelligence features inspired by the Python CiviGrantAI system

export interface OrganizationIntelligence {
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

export interface DocumentAnalysis {
  requirements: string[];
  deadlines: Array<{ type: string; date: string; description: string }>;
  eligibilityCriteria: string[];
  fundingAmount: string;
  keyInformation: string[];
  applicationSections: string[];
  evaluationCriteria: string[];
}

export interface ApplicationSection {
  content: string;
  recommendations: string[];
  complianceChecks: string[];
  wordCount: number;
  strengthScore: number;
}

export async function analyzeOrganizationIntelligence(
  organizationName: string,
  grantTitle?: string
): Promise<OrganizationIntelligence> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a grant intelligence expert with deep knowledge of federal agencies, foundations, and funding organizations. You analyze organizations and provide strategic insights based on proven methodologies from successful grant applications.

Key Analysis Areas:
1. Funding Trends - Current priorities and emerging areas
2. Success Factors - What makes applications successful
3. Competitive Advantages - How to stand out
4. Common Requirements - Standard application elements
5. Application Tips - Specific strategies for this funder
6. Financial Data - Typical award amounts and success rates
7. Process Intelligence - How reviews work and timelines
8. Geographic Focus - Where funding typically goes
9. Preferred Partners - Types of organizations favored
10. Past Projects - Examples of successful initiatives

Use your knowledge of DOT, NSF, Department of Education, NIH, and other major funders to provide specific, actionable intelligence.`,
        },
        {
          role: "user",
          content: `Analyze the funding organization and provide comprehensive intelligence for: ${organizationName}
          
${grantTitle ? `Specific Grant: ${grantTitle}` : ''}

Please provide detailed analysis including:
- Current funding trends and priorities
- Key success factors for applications
- Competitive advantages that help applications stand out
- Common requirements across their grants
- Specific application tips for this funder
- Average funding amounts and success rates
- Review process and timeline information
- Geographic focus and preferences
- Types of preferred partners
- Examples of past successful projects

Return comprehensive intelligence as JSON.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      name: result.name || organizationName,
      fundingTrends: result.fundingTrends || ["General funding trends"],
      successFactors: result.successFactors || ["Strong project design", "Clear objectives", "Measurable outcomes"],
      competitiveAdvantages: result.competitiveAdvantages || ["Innovation", "Partnerships", "Sustainability"],
      commonRequirements: result.commonRequirements || ["Project Description", "Budget Narrative", "Evaluation Plan"],
      applicationTips: result.applicationTips || ["Follow guidelines carefully", "Demonstrate clear impact"],
      averageAmount: result.averageAmount || "$500,000",
      successRate: result.successRate || "70%",
      reviewProcess: result.reviewProcess || "Peer review process",
      geographicFocus: result.geographicFocus || ["National"],
      preferredPartners: result.preferredPartners || ["Educational institutions", "Nonprofits"],
      pastProjects: result.pastProjects || ["Various funded projects"]
    };
  } catch (error) {
    console.error("Organization intelligence error:", error);
    return {
      name: organizationName,
      fundingTrends: ["Unable to analyze funding trends"],
      successFactors: ["Strong project design", "Clear objectives", "Measurable outcomes"],
      competitiveAdvantages: ["Innovation", "Partnerships", "Sustainability"],
      commonRequirements: ["Project Description", "Budget Narrative", "Evaluation Plan"],
      applicationTips: ["Follow guidelines carefully", "Demonstrate clear impact"],
      averageAmount: "Not available",
      successRate: "Not available",
      reviewProcess: "Standard review process",
      geographicFocus: ["Information not available"],
      preferredPartners: ["Information not available"],
      pastProjects: ["Information not available"]
    };
  }
}

export async function analyzeDocumentRequirements(
  documentContent: string,
  documentType: string = "grant_rfp"
): Promise<DocumentAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a grant document analysis expert who extracts key requirements, deadlines, and eligibility criteria from grant documents. You understand various grant formats including RFPs, NOFOs, and program announcements.

Extract and categorize:
1. Requirements - What applicants must provide
2. Deadlines - All important dates with context
3. Eligibility - Who can apply and under what conditions
4. Funding - Amount and structure information
5. Key Information - Other critical details for applicants
6. Application Sections - Required sections and components
7. Evaluation Criteria - How applications will be reviewed

Provide comprehensive analysis that helps applicants understand exactly what they need to do.`,
        },
        {
          role: "user",
          content: `Analyze this grant document and extract all key information:

Document Type: ${documentType}
Document Content: ${documentContent}

Please extract:
1. All requirements that applicants must meet
2. Deadlines with dates and descriptions
3. Eligibility criteria for applicants
4. Funding amount and structure
5. Key information applicants should know
6. Required application sections
7. Evaluation criteria and scoring

Return comprehensive analysis as JSON.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      requirements: result.requirements || [],
      deadlines: result.deadlines || [],
      eligibilityCriteria: result.eligibilityCriteria || [],
      fundingAmount: result.fundingAmount || "Not specified",
      keyInformation: result.keyInformation || [],
      applicationSections: result.applicationSections || [],
      evaluationCriteria: result.evaluationCriteria || []
    };
  } catch (error) {
    console.error("Document analysis error:", error);
    return {
      requirements: ["Unable to extract requirements"],
      deadlines: [],
      eligibilityCriteria: ["Unable to extract eligibility criteria"],
      fundingAmount: "Not specified",
      keyInformation: [],
      applicationSections: [],
      evaluationCriteria: []
    };
  }
}

export async function generateApplicationSection(
  sectionType: string,
  projectDetails: {
    title: string;
    description: string;
    organization: string;
    budget: number;
    duration: string;
    targetPopulation: string;
  },
  grantRequirements: string[],
  organizationIntelligence: OrganizationIntelligence
): Promise<ApplicationSection> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a professional grant writer with expertise in creating compelling application sections. You understand how to align project descriptions with funder priorities and create persuasive narratives that meet specific requirements.

Section Types:
- executive_summary: Concise overview highlighting key points
- project_description: Detailed explanation of project goals and methods
- objectives: SMART objectives with measurable outcomes
- methodology: Implementation approach and timeline
- budget_narrative: Justification for requested funding
- evaluation_plan: Assessment methods and success metrics
- sustainability: Long-term impact and continuation plans
- organizational_capacity: Qualifications and experience

Create compelling, professional content that aligns with funder priorities and demonstrates strong project design.`,
        },
        {
          role: "user",
          content: `Generate a ${sectionType} section for a grant application with these details:

Project Details:
- Title: ${projectDetails.title}
- Description: ${projectDetails.description}
- Organization: ${projectDetails.organization}
- Budget: $${projectDetails.budget.toLocaleString()}
- Duration: ${projectDetails.duration}
- Target Population: ${projectDetails.targetPopulation}

Grant Requirements: ${grantRequirements.join(", ")}

Organization Intelligence: ${JSON.stringify(organizationIntelligence)}

Please provide:
1. Well-written, professional content for the ${sectionType} section
2. Specific recommendations for improvement
3. Compliance checks against requirements
4. Word count and strength assessment

Return detailed analysis as JSON with content, recommendations, complianceChecks, wordCount, and strengthScore.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      content: result.content || "Content generation failed",
      recommendations: result.recommendations || [],
      complianceChecks: result.complianceChecks || [],
      wordCount: result.wordCount || 0,
      strengthScore: Math.max(0, Math.min(100, result.strengthScore || 0))
    };
  } catch (error) {
    console.error("Application section generation error:", error);
    return {
      content: "Unable to generate content for this section",
      recommendations: ["Review section requirements and try again"],
      complianceChecks: ["Unable to verify compliance"],
      wordCount: 0,
      strengthScore: 0
    };
  }
}
