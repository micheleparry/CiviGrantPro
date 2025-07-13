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
